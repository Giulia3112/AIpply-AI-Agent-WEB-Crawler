# Railway deployment guide for AIpply Web Crawler API

## 🚀 Quick Deploy to Railway

### Step 1: Connect Repository
1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `Giulia3112/AIpply-AI-Agent-WEB-Crawler`

### Step 2: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service

### Step 3: Set Environment Variables
In your Railway project settings, add these environment variables:

```env
# Database (Railway will provide this automatically)
DATABASE_URL=postgresql://postgres:password@host:port/railway

# Exa API Configuration
EXA_API_KEY=your_exa_api_key_here
EXA_BASE_URL=https://api.exa.ai

# Security
API_KEY=your_secure_api_key_here
JWT_SECRET=your_jwt_secret_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Step 4: Deploy
1. Railway will automatically detect the Node.js project
2. It will run `npm install` and `npm start`
3. The database migration will run automatically on first deploy
4. Your API will be available at the provided Railway URL

## 🔧 Manual Deployment Steps

If you prefer manual setup:

1. **Create Railway Project**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Add PostgreSQL**:
   ```bash
   railway add postgresql
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set EXA_API_KEY=your_key_here
   railway variables set API_KEY=your_api_key_here
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

## 📋 Environment Variables Required

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | Auto-provided by Railway |
| `EXA_API_KEY` | Exa API key for web crawling | ✅ | `d82c7c02-b899-4493-8276-e06e0d48df2f` |
| `API_KEY` | API authentication key | ✅ | `your_secure_api_key` |
| `JWT_SECRET` | JWT signing secret | ✅ | `your_jwt_secret` |
| `NODE_ENV` | Environment | ❌ | `production` (auto-set) |
| `PORT` | Server port | ❌ | Auto-provided by Railway |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | ❌ | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | ❌ | `100` |
| `LOG_LEVEL` | Logging level | ❌ | `info` |

## 🎯 Post-Deployment

After deployment:

1. **Test Health Check**:
   ```bash
   curl https://your-app.railway.app/health
   ```

2. **Test API Endpoints**:
   ```bash
   # Search opportunities
   curl -X POST https://your-app.railway.app/api/opportunities/search-opportunities \
     -H "X-API-Key: your_api_key" \
     -H "Content-Type: application/json" \
     -d '{"query": "scholarships for women in STEM 2025"}'
   
   # Get opportunities
   curl -X GET "https://your-app.railway.app/api/opportunities" \
     -H "X-API-Key: your_api_key"
   ```

3. **Monitor Logs**:
   - Use Railway dashboard to view logs
   - Check for any errors or issues

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection Failed**:
   - Ensure `DATABASE_URL` is set correctly
   - Check if PostgreSQL service is running

2. **Exa API Errors**:
   - Verify `EXA_API_KEY` is correct
   - Check Exa API quota/limits

3. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`

4. **Environment Variables**:
   - Double-check all required variables are set
   - Use Railway dashboard to verify values

## 📊 Monitoring

Railway provides built-in monitoring:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Health Checks**: Automatic health monitoring
- **Alerts**: Email notifications for issues

## 🔄 Updates

To update your deployment:
1. Push changes to GitHub
2. Railway will automatically redeploy
3. Database migrations run automatically

## 📚 API Documentation

Once deployed, your API will be available at:
- **Base URL**: `https://your-app.railway.app`
- **Health Check**: `https://your-app.railway.app/health`
- **API Docs**: See README.md for full API documentation
