const express = require('express');
const path = require('path');
const ScraperService = require('../services/scraperService');
const logger = require('../utils/logger');

const router = express.Router();
const scraperService = new ScraperService();

// Serve the admin scraper HTML page
router.get('/scraper', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/admin/scraper.html'));
});

// POST /admin/api/scrape - Trigger scraping process
router.post('/api/scrape', async (req, res) => {
  try {
    const { activated_by } = req.body;
    
    if (!activated_by) {
      return res.status(400).json({
        success: false,
        error: 'activated_by email is required'
      });
    }

    logger.info('Admin triggered scraping', { activated_by });
    
    // Run scraping (this will take time)
    const results = await scraperService.scrapeAllWebsites(activated_by);
    
    res.status(200).json({
      success: true,
      message: 'Scraping completed successfully',
      data: results
    });
  } catch (error) {
    logger.error('Admin scraping error:', error);
    res.status(error.message.includes('restricted') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /admin/api/pending - Get pending opportunities for review
router.get('/api/pending', async (req, res) => {
  try {
    const opportunities = await scraperService.getPendingOpportunities();
    res.status(200).json({
      success: true,
      data: opportunities,
      count: opportunities.length
    });
  } catch (error) {
    logger.error('Get pending opportunities error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /admin/api/approve/:id - Approve an opportunity
router.post('/api/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    await scraperService.approveOpportunity(id, notes);
    
    res.status(200).json({
      success: true,
      message: 'Opportunity approved and added to database'
    });
  } catch (error) {
    logger.error('Approve opportunity error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /admin/api/reject/:id - Reject an opportunity
router.post('/api/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    await scraperService.rejectOpportunity(id, notes);
    
    res.status(200).json({
      success: true,
      message: 'Opportunity rejected'
    });
  } catch (error) {
    logger.error('Reject opportunity error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /admin/api/stats - Get statistics
router.get('/api/stats', async (req, res) => {
  try {
    const stats = await scraperService.getStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
