# 🚀 Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Repository Setup
- [x] Code pushed to GitHub repository
- [x] Railway configuration files added (`railway.toml`, `Procfile`)
- [x] Production startup script created
- [x] Package.json updated with Railway scripts
- [x] Documentation updated

### 2. Required Environment Variables
Before deploying, ensure you have these values ready:

- [ ] **EXA_API_KEY**: Get from [exa.ai](https://exa.ai)
- [ ] **API_KEY**: Create a secure API key for authentication
- [ ] **JWT_SECRET**: Generate a secure JWT secret
- [ ] **DATABASE_URL**: Will be auto-provided by Railway

## 🚀 Deployment Steps

### Option 1: One-Click Deployment
1. Go to the GitHub repository: https://github.com/Giulia3112/AIpply-AI-Agent-WEB-Crawler
2. Click the "Deploy on Railway" button in the README
3. Sign in with GitHub
4. Set environment variables (see below)
5. Deploy!

### Option 2: Manual Railway Deployment
1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `Giulia3112/AIpply-AI-Agent-WEB-Crawler`
5. Add PostgreSQL database service
6. Set environment variables
7. Deploy!

## 🔧 Environment Variables Setup

In your Railway project settings, add these variables:

```env
EXA_API_KEY=your_exa_api_key_here
API_KEY=your_secure_api_key_here
JWT_SECRET=your_jwt_secret_here
```

**Note**: `DATABASE_URL` and `PORT` are automatically provided by Railway.

## 🎯 Post-Deployment Testing

After deployment, test your API:

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

### 2. Test Search Endpoint
```bash
curl -X POST https://your-app.railway.app/api/opportunities/search-opportunities \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"query": "scholarships for women in STEM 2025"}'
```

### 3. Test Get Opportunities
```bash
curl -X GET "https://your-app.railway.app/api/opportunities" \
  -H "X-API-Key: your_api_key"
```

## 🔍 Monitoring & Troubleshooting

### Railway Dashboard
- Monitor logs in real-time
- Check resource usage (CPU, Memory)
- View deployment status
- Manage environment variables

### Common Issues
1. **Database Connection**: Ensure PostgreSQL service is running
2. **Exa API**: Verify API key and quota
3. **Environment Variables**: Double-check all required variables are set
4. **Build Failures**: Check logs for dependency issues

## 📊 Production Features

Your deployed API includes:
- ✅ Automatic database migrations
- ✅ Health check endpoint (`/health`)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ API key authentication
- ✅ Comprehensive error handling
- ✅ Real-time logging
- ✅ Automatic SSL/HTTPS
- ✅ Auto-scaling

## 🔄 Updates

To update your deployment:
1. Push changes to GitHub
2. Railway automatically redeploys
3. Database migrations run automatically

## 📚 Documentation

- **Full API Docs**: [README.md](README.md)
- **Deployment Guide**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
- **GitHub Repository**: [AIpply-AI-Agent-WEB-Crawler](https://github.com/Giulia3112/AIpply-AI-Agent-WEB-Crawler)

---

**🎉 Your AIpply Web Crawler API is ready for production!**
