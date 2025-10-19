const logger = require('../utils/logger');

// Simple API key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'API key is required in X-API-Key header or Authorization header'
    });
  }

  const validApiKey = process.env.API_KEY;
  
  if (!validApiKey) {
    logger.error('API_KEY environment variable not set');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'API key validation not configured'
    });
  }

  if (apiKey !== validApiKey) {
    logger.warn('Invalid API key attempt', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent'),
      providedKey: apiKey.substring(0, 8) + '...'
    });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is invalid'
    });
  }

  // Add API key info to request for logging
  req.apiKey = apiKey.substring(0, 8) + '...';
  next();
};

// Optional authentication - doesn't fail if no API key provided
const optionalAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (apiKey) {
    const validApiKey = process.env.API_KEY;
    
    if (validApiKey && apiKey === validApiKey) {
      req.authenticated = true;
      req.apiKey = apiKey.substring(0, 8) + '...';
    } else {
      req.authenticated = false;
    }
  } else {
    req.authenticated = false;
  }
  
  next();
};

// Rate limiting by API key
const rateLimitByApiKey = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const key = apiKey || req.ip; // Fallback to IP if no API key
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [k, v] of requests.entries()) {
      if (v.timestamp < windowStart) {
        requests.delete(k);
      }
    }
    
    const keyData = requests.get(key) || { count: 0, timestamp: now };
    
    if (keyData.timestamp < windowStart) {
      keyData.count = 0;
      keyData.timestamp = now;
    }
    
    keyData.count++;
    requests.set(key, keyData);
    
    if (keyData.count > maxRequests) {
      logger.warn('Rate limit exceeded', { 
        key: key.substring(0, 8) + '...', 
        count: keyData.count,
        ip: req.ip
      });
      
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000 / 60} minutes`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add rate limit info to response headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - keyData.count),
      'X-RateLimit-Reset': new Date(keyData.timestamp + windowMs).toISOString()
    });
    
    next();
  };
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://aipply.com',
      'https://www.aipply.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin, ip: origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

module.exports = {
  authenticateApiKey,
  optionalAuth,
  rateLimitByApiKey,
  corsOptions
};
