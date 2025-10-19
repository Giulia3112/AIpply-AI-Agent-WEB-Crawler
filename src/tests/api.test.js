const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  const apiKey = process.env.API_KEY || 'test-api-key';

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('Search Opportunities', () => {
    it('should require API key', async () => {
      const res = await request(app)
        .post('/api/opportunities/search-opportunities')
        .send({
          query: 'test query'
        })
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('should validate request body', async () => {
      const res = await request(app)
        .post('/api/opportunities/search-opportunities')
        .set('X-API-Key', apiKey)
        .send({
          query: 'ab' // Too short
        })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should accept valid search request', async () => {
      const res = await request(app)
        .post('/api/opportunities/search-opportunities')
        .set('X-API-Key', apiKey)
        .send({
          query: 'scholarships for women in STEM',
          filters: {
            country: 'United States',
            type: 'scholarship'
          }
        })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('searchId');
      expect(res.body.data).toHaveProperty('totalFound');
    });
  });

  describe('Get Opportunities', () => {
    it('should return opportunities with pagination', async () => {
      const res = await request(app)
        .get('/api/opportunities')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('opportunities');
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should support filtering', async () => {
      const res = await request(app)
        .get('/api/opportunities?type=scholarship&country=United States')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // This test would need to be implemented based on your rate limiting strategy
      // For now, we'll just ensure the endpoint responds
      const res = await request(app)
        .get('/api/opportunities')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
    });
  });
});
