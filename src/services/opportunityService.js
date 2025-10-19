const Opportunity = require('../models/Opportunity');
const ExaService = require('./exaService');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class OpportunityService {
  constructor() {
    this.exaService = new ExaService();
  }

  // Search for opportunities using Exa API and save to database
  async searchAndSaveOpportunities(searchQuery, filters = {}) {
    try {
      logger.info('Starting opportunity search and save process', { searchQuery, filters });

      // Search using Exa API
      const exaResults = await this.exaService.searchOpportunities(searchQuery, filters);
      
      if (!exaResults || exaResults.length === 0) {
        logger.info('No opportunities found from Exa API');
        return {
          searchId: uuidv4(),
          totalFound: 0,
          newOpportunities: 0,
          duplicates: 0,
          errors: 0
        };
      }

      // Save search query
      const searchId = await this.saveSearchQuery(searchQuery, filters, exaResults.length);

      let newOpportunities = 0;
      let duplicates = 0;
      let errors = 0;

      // Process each result
      for (const exaResult of exaResults) {
        try {
          const opportunityData = this.exaService.parseOpportunityData(exaResult);
          
          if (!opportunityData) {
            errors++;
            continue;
          }

          // Enhance opportunity data
          const enhancedData = await this.enhanceOpportunityData(opportunityData, filters);
          
          // Create opportunity instance
          const opportunity = new Opportunity(enhancedData);
          
          // Validate opportunity
          const validation = opportunity.validate();
          if (!validation.isValid) {
            logger.warn('Invalid opportunity data:', validation.errors);
            errors++;
            continue;
          }

          // Check for duplicates
          const existingOpportunity = await this.findByUrl(opportunity.url);
          if (existingOpportunity) {
            duplicates++;
            continue;
          }

          // Save to database
          await this.saveOpportunity(opportunity);
          newOpportunities++;

          // Link to search
          await this.linkOpportunityToSearch(searchId, opportunity.id);

        } catch (error) {
          logger.error('Error processing opportunity:', error);
          errors++;
        }
      }

      logger.info('Opportunity search and save completed', {
        searchId,
        totalFound: exaResults.length,
        newOpportunities,
        duplicates,
        errors
      });

      return {
        searchId,
        totalFound: exaResults.length,
        newOpportunities,
        duplicates,
        errors
      };

    } catch (error) {
      logger.error('Opportunity search and save failed:', error);
      throw error;
    }
  }

  // Enhance opportunity data with additional processing
  async enhanceOpportunityData(data, filters) {
    const enhanced = { ...data };

    // Determine opportunity type
    enhanced.opportunity_type = this.determineOpportunityType(data.title, data.description);

    // Extract country/region
    if (filters.country && filters.country !== 'global') {
      enhanced.country = filters.country;
    } else {
      enhanced.country = this.extractCountry(data.title, data.description);
    }

    // Extract dates
    const dates = this.extractDates(data.title, data.description, data.raw_content);
    Object.assign(enhanced, dates);

    // Extract amounts
    const amounts = this.extractAmounts(data.title, data.description, data.raw_content);
    Object.assign(enhanced, amounts);

    // Generate tags
    enhanced.tags = this.generateTags(data.title, data.description, enhanced.opportunity_type);

    // Set default values
    enhanced.status = 'active';
    enhanced.currency = enhanced.currency || 'USD';

    return enhanced;
  }

  // Determine opportunity type from content
  determineOpportunityType(title, description) {
    const content = `${title} ${description}`.toLowerCase();

    if (content.includes('scholarship') || content.includes('financial aid')) {
      return 'scholarship';
    } else if (content.includes('fellowship') || content.includes('research program')) {
      return 'fellowship';
    } else if (content.includes('grant') || content.includes('funding')) {
      return 'grant';
    } else if (content.includes('accelerator') || content.includes('incubator')) {
      return 'accelerator';
    } else if (content.includes('internship') || content.includes('training program')) {
      return 'internship';
    } else if (content.includes('competition') || content.includes('contest')) {
      return 'competition';
    } else if (content.includes('award') || content.includes('recognition')) {
      return 'award';
    } else {
      return 'other';
    }
  }

  // Extract country from content
  extractCountry(title, description) {
    const content = `${title} ${description}`.toLowerCase();
    
    const countries = [
      'united states', 'usa', 'us', 'america',
      'canada', 'mexico', 'brazil', 'argentina',
      'united kingdom', 'uk', 'england', 'scotland',
      'germany', 'france', 'spain', 'italy',
      'australia', 'new zealand', 'japan', 'china',
      'india', 'south korea', 'singapore', 'global'
    ];

    for (const country of countries) {
      if (content.includes(country)) {
        return country === 'usa' || country === 'us' ? 'United States' :
               country === 'uk' ? 'United Kingdom' :
               country.charAt(0).toUpperCase() + country.slice(1);
      }
    }

    return 'Global';
  }

  // Extract dates from content
  extractDates(title, description, rawContent) {
    const content = `${title} ${description} ${rawContent}`;
    const dates = {};

    // Common date patterns
    const patterns = [
      /(?:deadline|due|closes?|ends?)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /(?:application|apply by)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const dateStr = matches[0].replace(/[^\d\/\-]/g, '');
        const parsedDate = this.parseDate(dateStr);
        if (parsedDate) {
          dates.application_deadline = parsedDate;
          break;
        }
      }
    }

    return dates;
  }

  // Parse date string
  parseDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      
      // If year is 2 digits, assume 20xx
      if (date.getFullYear() < 2000) {
        date.setFullYear(date.getFullYear() + 2000);
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      return null;
    }
  }

  // Extract amounts from content
  extractAmounts(title, description, rawContent) {
    const content = `${title} ${description} ${rawContent}`;
    const amounts = {};

    // Amount patterns
    const patterns = [
      /\$([\d,]+(?:\.\d{2})?)\s*-\s*\$([\d,]+(?:\.\d{2})?)/g,
      /\$([\d,]+(?:\.\d{2})?)\s*to\s*\$([\d,]+(?:\.\d{2})?)/g,
      /up to \$([\d,]+(?:\.\d{2})?)/gi,
      /\$([\d,]+(?:\.\d{2})?)/g
    ];

    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        if (match[2]) {
          // Range found
          amounts.amount_min = parseFloat(match[1].replace(/,/g, ''));
          amounts.amount_max = parseFloat(match[2].replace(/,/g, ''));
        } else {
          // Single amount found
          const amount = parseFloat(match[1].replace(/,/g, ''));
          if (!amounts.amount_min || amount > amounts.amount_min) {
            amounts.amount_min = amount;
          }
        }
        break;
      }
    }

    return amounts;
  }

  // Generate tags from content
  generateTags(title, description, opportunityType) {
    const content = `${title} ${description}`.toLowerCase();
    const tags = [opportunityType];

    const tagKeywords = {
      'women': ['women', 'female', 'girls'],
      'minority': ['minority', 'diverse', 'underrepresented'],
      'stem': ['stem', 'science', 'technology', 'engineering', 'mathematics'],
      'research': ['research', 'study', 'academic'],
      'entrepreneurship': ['entrepreneur', 'startup', 'business'],
      'international': ['international', 'global', 'worldwide'],
      'graduate': ['graduate', 'masters', 'phd', 'doctoral'],
      'undergraduate': ['undergraduate', 'bachelor', 'college'],
      'merit': ['merit', 'academic', 'gpa'],
      'need': ['need-based', 'financial need', 'low income']
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  // Save search query to database
  async saveSearchQuery(queryText, filters, resultsCount) {
    const searchId = uuidv4();
    
    await query(
      'INSERT INTO search_queries (id, query_text, filters, results_count) VALUES ($1, $2, $3, $4)',
      [searchId, queryText, JSON.stringify(filters), resultsCount]
    );

    return searchId;
  }

  // Link opportunity to search
  async linkOpportunityToSearch(searchId, opportunityId, relevanceScore = 0.8) {
    await query(
      'INSERT INTO opportunity_searches (search_id, opportunity_id, relevance_score) VALUES ($1, $2, $3)',
      [searchId, opportunityId, relevanceScore]
    );
  }

  // Save opportunity to database
  async saveOpportunity(opportunity) {
    const data = opportunity.toDatabaseFormat();
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');

    await query(
      `INSERT INTO opportunities (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );
  }

  // Find opportunity by URL
  async findByUrl(url) {
    const result = await query('SELECT * FROM opportunities WHERE url = $1', [url]);
    return result.rows.length > 0 ? Opportunity.fromDatabaseRow(result.rows[0]) : null;
  }

  // Get opportunities with filters and pagination
  async getOpportunities(filters = {}, pagination = {}) {
    const {
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = pagination;

    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    // Apply filters
    if (filters.type) {
      paramCount++;
      whereClause += ` AND opportunity_type = $${paramCount}`;
      queryParams.push(filters.type);
    }

    if (filters.country) {
      paramCount++;
      whereClause += ` AND country = $${paramCount}`;
      queryParams.push(filters.country);
    }

    if (filters.status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      queryParams.push(filters.status);
    }

    if (filters.amount_min) {
      paramCount++;
      whereClause += ` AND amount_min >= $${paramCount}`;
      queryParams.push(filters.amount_min);
    }

    if (filters.amount_max) {
      paramCount++;
      whereClause += ` AND amount_max <= $${paramCount}`;
      queryParams.push(filters.amount_max);
    }

    if (filters.deadline_after) {
      paramCount++;
      whereClause += ` AND application_deadline >= $${paramCount}`;
      queryParams.push(filters.deadline_after);
    }

    if (filters.deadline_before) {
      paramCount++;
      whereClause += ` AND application_deadline <= $${paramCount}`;
      queryParams.push(filters.deadline_before);
    }

    if (filters.tags && filters.tags.length > 0) {
      paramCount++;
      whereClause += ` AND tags && $${paramCount}`;
      queryParams.push(filters.tags);
    }

    if (filters.search) {
      paramCount++;
      whereClause += ` AND to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(organization, '')) @@ plainto_tsquery('english', $${paramCount})`;
      queryParams.push(filters.search);
    }

    // Build query
    const countQuery = `SELECT COUNT(*) FROM opportunities ${whereClause}`;
    const dataQuery = `
      SELECT * FROM opportunities 
      ${whereClause} 
      ORDER BY ${sort_by} ${sort_order.toUpperCase()} 
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    // Execute queries
    const [countResult, dataResult] = await Promise.all([
      query(countQuery, queryParams.slice(0, -2)),
      query(dataQuery, queryParams)
    ]);

    const total = parseInt(countResult.rows[0].count);
    const opportunities = dataResult.rows.map(row => Opportunity.fromDatabaseRow(row));

    return {
      opportunities: opportunities.map(opp => opp.toApiResponse()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get opportunity by ID
  async getOpportunityById(id) {
    const result = await query('SELECT * FROM opportunities WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const opportunity = Opportunity.fromDatabaseRow(result.rows[0]);
    return opportunity.toApiResponse();
  }

  // Update opportunity status
  async updateOpportunityStatus(id, status) {
    await query(
      'UPDATE opportunities SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
  }

  // Delete opportunity
  async deleteOpportunity(id) {
    await query('DELETE FROM opportunities WHERE id = $1', [id]);
  }
}

module.exports = OpportunityService;
