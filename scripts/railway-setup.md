# Railway Database Setup (Easiest Option)

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with your GitHub account
3. Click "New Project"
4. Select "Provision PostgreSQL"

## Step 2: Get Connection String
1. Click on your PostgreSQL service
2. Go to "Connect" tab
3. Copy the "Connection String" (it looks like: `postgresql://postgres:password@host:port/railway`)

## Step 3: Update .env File
Replace your database configuration with the Railway connection string:

```env
# Replace this line in your .env file:
DATABASE_URL=postgresql://postgres:your_password@your_host:your_port/railway

# You can remove these individual DB settings:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=aipply_crawler
# DB_USER=postgres
# DB_PASSWORD=password
```

## Step 4: Run Migration
```bash
npm run migrate
```

## Benefits of Railway:
- ✅ Free tier available
- ✅ No local setup required
- ✅ Automatic backups
- ✅ Easy to scale
- ✅ Works from anywhere

## Alternative: Use Supabase
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Update .env file
