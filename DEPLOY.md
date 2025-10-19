# AIpply Web Crawler API - Railway Deployment

A powerful Node.js backend service that automatically discovers and stores development opportunities (scholarships, grants, fellowships, accelerators, etc.) from across the web using the Exa API.

## 🚀 Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https://github.com/Giulia3112/AIpply-AI-Agent-WEB-Crawler)

### Manual Deployment Steps:

1. **Go to [Railway](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select `Giulia3112/AIpply-AI-Agent-WEB-Crawler`**
5. **Add PostgreSQL database** (Railway will auto-detect)
6. **Set environment variables** (see below)
7. **Deploy!**

## 🔧 Required Environment Variables

Set these in your Railway project settings:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `EXA_API_KEY` | Exa API key for web crawling | ✅ | Get from [exa.ai](https://exa.ai) |
| `API_KEY` | API authentication key | ✅ | `your_secure_api_key` |
| `JWT_SECRET` | JWT signing secret | ✅ | `your_jwt_secret` |
| `DATABASE_URL` | PostgreSQL connection | ✅ | Auto-provided by Railway |

## 📋 Features

- **Intelligent Web Crawling**: Uses Exa API to search and extract content
- **Smart Data Parsing**: Automatically extracts structured data from web pages
- **PostgreSQL Database**: Robust data storage with full-text search
- **RESTful API**: Clean, well-documented API endpoints
- **Rate Limiting**: Built-in protection against abuse
- **Authentication**: API key-based security
- **Comprehensive Logging**: Detailed logging for monitoring

## 🔗 API Endpoints

- **Health Check**: `GET /health`
- **Search Opportunities**: `POST /api/opportunities/search-opportunities`
- **Get Opportunities**: `GET /api/opportunities`
- **Get by ID**: `GET /api/opportunities/:id`
- **Statistics**: `GET /api/opportunities/stats/summary`

## 📚 Documentation

- **Full API Docs**: See [README.md](README.md)
- **Deployment Guide**: See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
- **GitHub Repository**: [AIpply-AI-Agent-WEB-Crawler](https://github.com/Giulia3112/AIpply-AI-Agent-WEB-Crawler)

## 🎯 Getting Started

1. **Deploy to Railway** (see steps above)
2. **Get your Exa API key** from [exa.ai](https://exa.ai)
3. **Set environment variables** in Railway dashboard
4. **Test your API**:
   ```bash
   curl https://your-app.railway.app/health
   ```

## 🔍 Support

- **Issues**: [GitHub Issues](https://github.com/Giulia3112/AIpply-AI-Agent-WEB-Crawler/issues)
- **Documentation**: [README.md](README.md)
- **Railway Support**: [Railway Docs](https://docs.railway.app)

---

**Built with ❤️ for the AIpply platform**
