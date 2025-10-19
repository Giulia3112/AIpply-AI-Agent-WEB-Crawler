# AIpply Web Crawler API

A powerful Node.js backend service that automatically discovers and stores development opportunities (scholarships, grants, fellowships, accelerators, etc.) from across the web using the Exa API.

## 🚀 Features

- **Intelligent Web Crawling**: Uses Exa API to search and extract content from relevant websites
- **Smart Data Parsing**: Automatically extracts structured data from web pages
- **PostgreSQL Database**: Robust data storage with full-text search capabilities
- **RESTful API**: Clean, well-documented API endpoints
- **Rate Limiting**: Built-in protection against abuse
- **Authentication**: API key-based security
- **Comprehensive Logging**: Detailed logging for monitoring and debugging
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Graceful error handling with meaningful responses

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Search API**: Exa API
- **Parsing**: Cheerio (HTML parsing)
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- Exa API key
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd aipply-webscraper-exaapi
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/aipply_crawler
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aipply_crawler
DB_USER=username
DB_PASSWORD=password

# Exa API Configuration
EXA_API_KEY=your_exa_api_key_here
EXA_BASE_URL=https://api.exa.ai

# Security
API_KEY=your_secure_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

Create your PostgreSQL database and run migrations:

```bash
# Create database
createdb aipply_crawler

# Run migrations
npm run migrate
```

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All endpoints require an API key in the request header:

```bash
X-API-Key: your_api_key_here
# OR
Authorization: Bearer your_api_key_here
```

### Endpoints

#### 1. Search Opportunities
**POST** `/api/opportunities/search-opportunities`

Search for opportunities using Exa API and automatically save them to the database.

**Request Body:**
```json
{
  "query": "scholarships for women in STEM 2025",
  "filters": {
    "country": "United States",
    "type": "scholarship",
    "amount_min": 1000,
    "amount_max": 10000,
    "currency": "USD",
    "deadline_after": "2025-01-01",
    "tags": ["women", "stem", "technology"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Opportunities search completed successfully",
  "data": {
    "searchId": "uuid",
    "totalFound": 25,
    "newOpportunities": 18,
    "duplicates": 7,
    "errors": 0
  }
}
```

#### 2. Get Opportunities
**GET** `/api/opportunities`

Retrieve opportunities with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sort_by` (string): Sort field (created_at, updated_at, application_deadline, title, amount_min, amount_max)
- `sort_order` (string): Sort direction (asc, desc)
- `type` (string): Opportunity type filter
- `country` (string): Country filter
- `status` (string): Status filter (active, expired, closed, duplicate)
- `amount_min` (number): Minimum amount filter
- `amount_max` (number): Maximum amount filter
- `deadline_after` (date): Deadline after date (YYYY-MM-DD)
- `deadline_before` (date): Deadline before date (YYYY-MM-DD)
- `tags` (array): Tag filters
- `search` (string): Full-text search query

**Example:**
```bash
GET /api/opportunities?type=scholarship&country=United States&page=1&limit=10&sort_by=application_deadline&sort_order=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "id": "uuid",
        "title": "Women in STEM Scholarship 2025",
        "description": "A comprehensive scholarship program...",
        "organization": "STEM Foundation",
        "url": "https://example.com/scholarship",
        "opportunity_type": "scholarship",
        "country": "United States",
        "application_deadline": "2025-03-15",
        "amount": {
          "min": 5000,
          "max": 10000,
          "currency": "USD"
        },
        "tags": ["women", "stem", "scholarship", "2025"],
        "status": "active",
        "is_expired": false,
        "days_until_deadline": 45,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

#### 3. Get Opportunity by ID
**GET** `/api/opportunities/:id`

Retrieve a specific opportunity by its ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Women in STEM Scholarship 2025",
    "description": "A comprehensive scholarship program...",
    // ... full opportunity details
  }
}
```

#### 4. Update Opportunity Status
**PATCH** `/api/opportunities/:id/status`

Update the status of an opportunity.

**Request Body:**
```json
{
  "status": "expired"
}
```

**Valid Statuses:** `active`, `expired`, `closed`, `duplicate`

#### 5. Delete Opportunity
**DELETE** `/api/opportunities/:id`

Delete an opportunity from the database.

#### 6. Get Statistics
**GET** `/api/opportunities/stats/summary`

Get summary statistics about opportunities.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_opportunities": 1250,
      "active_opportunities": 1100,
      "expired_opportunities": 100,
      "closed_opportunities": 50,
      "unique_types": 8,
      "unique_countries": 25,
      "avg_min_amount": 2500.50,
      "avg_max_amount": 7500.75,
      "upcoming_deadlines": 200
    },
    "type_distribution": [
      { "opportunity_type": "scholarship", "count": 500 },
      { "opportunity_type": "fellowship", "count": 300 }
    ],
    "country_distribution": [
      { "country": "United States", "count": 400 },
      { "country": "Canada", "count": 150 }
    ]
  }
}
```

#### 7. Health Check
**GET** `/health`

Check the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "uptime": 3600,
  "environment": "production"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment | development | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `EXA_API_KEY` | Exa API key | - | Yes |
| `API_KEY` | API authentication key | - | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |
| `LOG_LEVEL` | Logging level | info | No |

### Database Schema

The API uses the following main tables:

- **opportunities**: Stores opportunity data
- **search_queries**: Tracks search history
- **opportunity_searches**: Links opportunities to searches

See `src/database/schema.sql` for the complete schema.

## 🚀 Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically deploy and provide a PostgreSQL database

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run migrate
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup

Make sure to set all required environment variables in your deployment platform.

## 🔍 Monitoring and Logging

The API includes comprehensive logging:

- **Error Logs**: `logs/error.log`
- **Combined Logs**: `logs/combined.log`
- **Console Output**: Development mode only

Log levels: `error`, `warn`, `info`, `debug`

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the logs for error details
- Verify your environment variables
- Ensure your Exa API key is valid

## 🔄 Changelog

### v1.0.0
- Initial release
- Exa API integration
- PostgreSQL database
- RESTful API endpoints
- Authentication and rate limiting
- Comprehensive logging
