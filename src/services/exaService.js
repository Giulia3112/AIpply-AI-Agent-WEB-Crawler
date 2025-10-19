const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

class ExaService {
  constructor() {
    this.apiKey = process.env.EXA_API_KEY;
    this.baseUrl = process.env.EXA_BASE_URL || 'https://api.exa.ai';
    this.client = null;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) {
      return;
    }

    if (!this.apiKey) {
      throw new Error('EXA_API_KEY environment variable is required');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    this.initialized = true;
  }

  // Search for opportunities using Exa API
  async searchOpportunities(query, filters = {}) {
    this.initialize();
    try {
      logger.info('Searching opportunities with Exa API', { query, filters });

      const searchParams = {
        query: this.buildSearchQuery(query, filters),
        type: 'neural',
        numResults: 50,
        useAutoprompt: true,
        includeDomains: this.getRelevantDomains(),
        startCrawlDate: this.getStartCrawlDate(),
        endCrawlDate: new Date().toISOString().split('T')[0]
      };

      const response = await this.client.post('/search', searchParams);
      
      if (!response.data || !response.data.results) {
        logger.warn('No results returned from Exa API');
        return [];
      }

      logger.info(`Found ${response.data.results.length} results from Exa API`);
      return response.data.results;

    } catch (error) {
      logger.error('Exa API search failed:', error);
      throw new Error(`Exa API search failed: ${error.message}`);
    }
  }

  // Get detailed content for a specific URL
  async getContent(url) {
    try {
      logger.info('Fetching content from Exa API', { url });

      const response = await this.client.post('/contents', {
        urls: [url],
        text: true,
        html: true
      });

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        logger.warn('No content returned from Exa API', { url });
        return null;
      }

      return response.data.results[0];

    } catch (error) {
      logger.error('Exa API content fetch failed:', { url, error: error.message });
      throw new Error(`Failed to fetch content: ${error.message}`);
    }
  }

  // Build search query with filters
  buildSearchQuery(query, filters) {
    let searchQuery = query;

    // Add opportunity type filters
    if (filters.type) {
      const typeKeywords = {
        'scholarship': 'scholarship financial aid tuition',
        'fellowship': 'fellowship research program',
        'grant': 'grant funding research',
        'accelerator': 'accelerator startup incubator',
        'internship': 'internship training program',
        'competition': 'competition contest challenge',
        'award': 'award recognition prize'
      };
      
      if (typeKeywords[filters.type]) {
        searchQuery += ` ${typeKeywords[filters.type]}`;
      }
    }

    // Add country/region filters
    if (filters.country && filters.country !== 'global') {
      searchQuery += ` ${filters.country}`;
    }

    // Add amount filters
    if (filters.amount_min || filters.amount_max) {
      if (filters.amount_min && filters.amount_max) {
        searchQuery += ` $${filters.amount_min} to $${filters.amount_max}`;
      } else if (filters.amount_min) {
        searchQuery += ` minimum $${filters.amount_min}`;
      } else if (filters.amount_max) {
        searchQuery += ` maximum $${filters.amount_max}`;
      }
    }

    // Add deadline filters
    if (filters.deadline_after) {
      const year = new Date(filters.deadline_after).getFullYear();
      searchQuery += ` ${year}`;
    }

    // Add tag filters
    if (filters.tags && filters.tags.length > 0) {
      searchQuery += ` ${filters.tags.join(' ')}`;
    }

    return searchQuery.trim();
  }

  // Get relevant domains for opportunity searches
  getRelevantDomains() {
    return [
      'scholarships.com',
      'fastweb.com',
      'unigo.com',
      'collegeboard.org',
      'studentaid.gov',
      'foundationcenter.org',
      'grantspace.org',
      'grants.gov',
      'ycombinator.com',
      'techstars.com',
      '500.co',
      'university.edu',
      'foundation.org',
      'institute.org',
      'association.org',
      'government.gov',
      'nonprofit.org'
    ];
  }

  // Get domains to exclude
  getExcludedDomains() {
    return [
      'facebook.com',
      'twitter.com',
      'linkedin.com',
      'instagram.com',
      'youtube.com',
      'tiktok.com',
      'reddit.com',
      'wikipedia.org',
      'google.com',
      'bing.com',
      'yahoo.com'
    ];
  }

  // Get start date for crawling (last 6 months)
  getStartCrawlDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split('T')[0];
  }

  // Parse opportunity data from Exa content
  parseOpportunityData(exaResult) {
    try {
      const data = {
        title: exaResult.title || '',
        description: exaResult.text || '',
        url: exaResult.url || '',
        source_domain: this.extractDomain(exaResult.url),
        raw_content: exaResult.html || '',
        extracted_data: this.extractStructuredData(exaResult)
      };

      // Extract additional information using cheerio if HTML is available
      if (exaResult.html) {
        const $ = cheerio.load(exaResult.html);
        const additionalData = this.extractAdditionalData($);
        Object.assign(data, additionalData);
      }

      return data;

    } catch (error) {
      logger.error('Failed to parse opportunity data:', error);
      return null;
    }
  }

  // Extract domain from URL
  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return '';
    }
  }

  // Extract structured data from content
  extractStructuredData(exaResult) {
    const data = {};

    // Extract dates
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g;
    const dates = exaResult.text?.match(datePattern) || [];
    data.dates = dates;

    // Extract amounts
    const amountPattern = /\$[\d,]+(?:\.\d{2})?|\d+,\d+|\d+\.\d{2}/g;
    const amounts = exaResult.text?.match(amountPattern) || [];
    data.amounts = amounts;

    // Extract email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = exaResult.text?.match(emailPattern) || [];
    data.emails = emails;

    // Extract phone numbers
    const phonePattern = /\(?[\d\s\-\(\)]{10,}/g;
    const phones = exaResult.text?.match(phonePattern) || [];
    data.phones = phones;

    return data;
  }

  // Extract additional data using cheerio
  extractAdditionalData($) {
    const data = {};

    // Extract meta description
    data.meta_description = $('meta[name="description"]').attr('content') || '';

    // Extract organization from various sources
    data.organization = $('meta[property="og:site_name"]').attr('content') ||
                       $('.organization, .org, .company').first().text().trim() ||
                       $('h1, h2, h3').first().text().trim();

    // Extract application deadline
    const deadlineText = $('*:contains("deadline"), *:contains("due date"), *:contains("application")').text();
    data.deadline_text = deadlineText;

    // Extract eligibility criteria
    const eligibilityText = $('*:contains("eligibility"), *:contains("requirements"), *:contains("criteria")').text();
    data.eligibility_text = eligibilityText;

    return data;
  }

  // Test API connection
  async testConnection() {
    this.initialize();
    try {
      const response = await this.client.post('/search', {
        query: 'test',
        numResults: 1
      });
      return response.status === 200;
    } catch (error) {
      logger.error('Exa API connection test failed:', error);
      return false;
    }
  }
}

module.exports = ExaService;
