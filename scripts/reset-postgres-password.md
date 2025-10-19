# Reset PostgreSQL Password on Windows

## Method 1: Using pgAdmin (GUI)

1. Open **pgAdmin** (if installed)
2. Connect to your PostgreSQL server
3. Right-click on "Login/Group Roles" → "Create" → "Login/Group Role"
4. Set username: `aipply_user`
5. Set password: `aipply123`
6. Grant all privileges
7. Create database: `aipply_crawler`

## Method 2: Using Command Line

1. Open **Command Prompt as Administrator**
2. Navigate to PostgreSQL bin directory:
   ```cmd
   cd "C:\Program Files\PostgreSQL\15\bin"
   ```
3. Reset password for postgres user:
   ```cmd
   psql -U postgres -c "ALTER USER postgres PASSWORD 'aipply123';"
   ```

## Method 3: Edit pg_hba.conf (Advanced)

1. Find your PostgreSQL data directory (usually `C:\Program Files\PostgreSQL\15\data`)
2. Open `pg_hba.conf` in a text editor
3. Find the line with `local all postgres peer` or `local all postgres md5`
4. Change it to: `local all postgres trust`
5. Restart PostgreSQL service
6. Connect without password: `psql -U postgres`
7. Set new password: `ALTER USER postgres PASSWORD 'aipply123';`
8. Change `pg_hba.conf` back to: `local all postgres md5`
9. Restart PostgreSQL service

## Method 4: Use Railway (Cloud Database)

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Add PostgreSQL database
5. Copy the connection string
6. Update your .env file with the Railway connection string

## Method 5: Reinstall PostgreSQL

1. Uninstall current PostgreSQL
2. Download from https://www.postgresql.org/download/windows/
3. During installation, set password to `aipply123`
4. Create database `aipply_crawler`

---

## After fixing the password, update your .env file:

```env
DATABASE_URL=postgresql://postgres:aipply123@localhost:5432/aipply_crawler
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aipply_crawler
DB_USER=postgres
DB_PASSWORD=aipply123
```

Then run: `npm run migrate`
