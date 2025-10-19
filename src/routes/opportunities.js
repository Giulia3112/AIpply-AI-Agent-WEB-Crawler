const express = require('express');
const OpportunityService = require('../services/opportunityService');
const { validate, searchOpportunitiesSchema, opportunityIdSchema, paginationSchema, opportunityFiltersSchema } = require('../utils/validation');
const logger = require('../utils/logger');

const router = express.Router();
const opportunityService = new OpportunityService();

// POST /api/opportunities/search-opportunities
router.post('/search-opportunities', 
  validate(searchOpportunitiesSchema),
  async (req, res) => {
    try {
      const { query, filters = {} } = req.body;
      
      logger.info('Search opportunities request', { query, filters });

      const result = await opportunityService.searchAndSaveOpportunities(query, filters);

      res.status(200).json({
        success: true,
        message: 'Opportunities search completed successfully',
        data: {
          searchId: result.searchId,
          totalFound: result.totalFound,
          newOpportunities: result.newOpportunities,
          duplicates: result.duplicates,
          errors: result.errors
        }
      });

    } catch (error) {
      logger.error('Search opportunities error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search opportunities',
        message: error.message
      });
    }
  }
);

// GET /api/opportunities
router.get('/',
  validate(paginationSchema, 'query'),
  validate(opportunityFiltersSchema, 'query'),
  async (req, res) => {
    try {
      const { page, limit, sort_by, sort_order, ...filters } = req.query;
      
      logger.info('Get opportunities request', { filters, pagination: { page, limit, sort_by, sort_order } });

      const result = await opportunityService.getOpportunities(filters, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort_by,
        sort_order
      });

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Get opportunities error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get opportunities',
        message: error.message
      });
    }
  }
);

// GET /api/opportunities/:id
router.get('/:id',
  validate(opportunityIdSchema, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      logger.info('Get opportunity by ID request', { id });

      const opportunity = await opportunityService.getOpportunityById(id);

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          error: 'Opportunity not found',
          message: `No opportunity found with ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        data: opportunity
      });

    } catch (error) {
      logger.error('Get opportunity by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get opportunity',
        message: error.message
      });
    }
  }
);

// PATCH /api/opportunities/:id/status
router.patch('/:id/status',
  validate(opportunityIdSchema, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'expired', 'closed', 'duplicate'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status',
          message: 'Status must be one of: active, expired, closed, duplicate'
        });
      }

      logger.info('Update opportunity status request', { id, status });

      await opportunityService.updateOpportunityStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Opportunity status updated successfully'
      });

    } catch (error) {
      logger.error('Update opportunity status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update opportunity status',
        message: error.message
      });
    }
  }
);

// DELETE /api/opportunities/:id
router.delete('/:id',
  validate(opportunityIdSchema, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      logger.info('Delete opportunity request', { id });

      await opportunityService.deleteOpportunity(id);

      res.status(200).json({
        success: true,
        message: 'Opportunity deleted successfully'
      });

    } catch (error) {
      logger.error('Delete opportunity error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete opportunity',
        message: error.message
      });
    }
  }
);

// GET /api/opportunities/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    logger.info('Get opportunities summary stats request');

    // Get basic statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_opportunities,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_opportunities,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_opportunities,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_opportunities,
        COUNT(DISTINCT opportunity_type) as unique_types,
        COUNT(DISTINCT country) as unique_countries,
        AVG(amount_min) as avg_min_amount,
        AVG(amount_max) as avg_max_amount,
        COUNT(CASE WHEN application_deadline > CURRENT_DATE THEN 1 END) as upcoming_deadlines
      FROM opportunities
    `;

    const { query: dbQuery } = require('../database/connection');
    
    const result = await dbQuery(statsQuery);
    const stats = result.rows[0];

    // Get type distribution
    const typeQuery = `
      SELECT opportunity_type, COUNT(*) as count
      FROM opportunities 
      WHERE status = 'active'
      GROUP BY opportunity_type
      ORDER BY count DESC
    `;

    const typeResult = await dbQuery(typeQuery);
    const typeDistribution = typeResult.rows;

    // Get country distribution
    const countryQuery = `
      SELECT country, COUNT(*) as count
      FROM opportunities 
      WHERE status = 'active' AND country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `;

    const countryResult = await dbQuery(countryQuery);
    const countryDistribution = countryResult.rows;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_opportunities: parseInt(stats.total_opportunities),
          active_opportunities: parseInt(stats.active_opportunities),
          expired_opportunities: parseInt(stats.expired_opportunities),
          closed_opportunities: parseInt(stats.closed_opportunities),
          unique_types: parseInt(stats.unique_types),
          unique_countries: parseInt(stats.unique_countries),
          avg_min_amount: parseFloat(stats.avg_min_amount) || 0,
          avg_max_amount: parseFloat(stats.avg_max_amount) || 0,
          upcoming_deadlines: parseInt(stats.upcoming_deadlines)
        },
        type_distribution: typeDistribution,
        country_distribution: countryDistribution
      }
    });

  } catch (error) {
    logger.error('Get opportunities summary stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get opportunities summary stats',
      message: error.message
    });
  }
});

module.exports = router;
