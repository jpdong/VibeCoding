# Vibe Coding - Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying the Vibe Coding platform to various environments including Vercel, Docker, and traditional hosting platforms.

## 📋 Prerequisites

### Required Services
- **Database**: PostgreSQL 12+ 
- **AI Service**: OpenAI API or OpenRouter account
- **Authentication**: Google OAuth credentials (optional)
- **Security**: Cloudflare Turnstile keys (optional)
- **Hosting**: Vercel, Docker, or Node.js hosting

### Environment Setup
- Node.js 18+
- npm/yarn/pnpm
- Git

## 🔧 Environment Configuration

### Environment Variables

Create the following environment files:

#### `.env.local` (Development)
```bash
#--------------------------------------------------------------------------------------------------------
# Database Configuration
#--------------------------------------------------------------------------------------------------------
POSTGRES_URL="postgresql://username:password@localhost:5432/vibecoding"

#--------------------------------------------------------------------------------------------------------
# AI Service Configuration
#--------------------------------------------------------------------------------------------------------
OPENAI_API_KEY="your_openai_api_key"
OPENAI_API_BASE_URL="https://openrouter.ai/api"
OPENAI_API_MODEL="openai/gpt-4o"

#--------------------------------------------------------------------------------------------------------
# Authentication (Optional)
#--------------------------------------------------------------------------------------------------------
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_key"
NEXT_PUBLIC_CHECK_GOOGLE_LOGIN=0
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_SECRET_ID="your_google_secret"

#--------------------------------------------------------------------------------------------------------
# Security (Optional)
#--------------------------------------------------------------------------------------------------------
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_turnstile_site_key"
TURNSTILE_SECRET_KEY="your_turnstile_secret_key"

#--------------------------------------------------------------------------------------------------------
# Site Configuration
#--------------------------------------------------------------------------------------------------------
NEXT_PUBLIC_WEBSITE_NAME="Vibe Coding"
NEXT_PUBLIC_A_TITLE_TEXT="Vibe Coding"
NEXT_PUBLIC_DOMAIN_NAME="Vibe Coding"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_RESOURCE_VERSION="1.0.0"

#--------------------------------------------------------------------------------------------------------
# Feature Flags
#--------------------------------------------------------------------------------------------------------
NEXT_PUBLIC_SHOW_LANGUAGE=1
NEXT_PUBLIC_PRIVACY_POLICY_OPEN=1
NEXT_PUBLIC_TERMS_OF_SERVICE_OPEN=1
NEXT_PUBLIC_DISCOVER_OPEN=0
```

#### `.env.production` (Production)
```bash
# Same as above but with production values
POSTGRES_URL="postgresql://prod_user:prod_pass@prod_host:5432/vibecoding_prod"
NEXT_PUBLIC_SITE_URL="https://vibecoding.com"
NEXTAUTH_URL="https://vibecoding.com"
# ... other production values
```

## 🗄 Database Setup

### PostgreSQL Schema

```sql
-- Create database
CREATE DATABASE vibecoding;

-- Connect to database
\c vibecoding;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_record table
CREATE TABLE chat_record (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    input_text TEXT NOT NULL,
    output_text TEXT,
    title VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table (NextAuth)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create accounts table (NextAuth)
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

-- Create indexes for performance
CREATE INDEX idx_chat_record_user_id ON chat_record(user_id);
CREATE INDEX idx_chat_record_created_at ON chat_record(created_at);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires);
```

### Database Migration Script

```bash
#!/bin/bash
# migrate.sh

echo "Running database migrations..."

# Check if database exists
psql $POSTGRES_URL -c "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to database"
    exit 1
fi

# Run migrations
psql $POSTGRES_URL -f migrations/001_initial_schema.sql
psql $POSTGRES_URL -f migrations/002_add_indexes.sql

echo "Database migration completed successfully"
```

## ☁️ Vercel Deployment

### Step 1: Prepare for Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### Step 2: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all production environment variables
3. Set appropriate environments (Production, Preview, Development)

### Step 3: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 4: Configure Domain

1. Add custom domain in Vercel Dashboard
2. Configure DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### Vercel Configuration (`vercel.json`)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 300
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vibecoding
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Deploy

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## 🌐 Traditional Hosting (VPS/Dedicated Server)

### Prerequisites

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2 for process management
npm install -g pm2
```

### Deployment Steps

```bash
# Clone repository
git clone <repository-url>
cd vibe-coding

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### PM2 Configuration (`ecosystem.config.js`)

```javascript
module.exports = {
  apps: [
    {
      name: 'vibe-coding',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/vibe-coding',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_file: '.env.production',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/vibecoding.com
server {
    listen 80;
    server_name vibecoding.com www.vibecoding.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vibecoding.com www.vibecoding.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 SSL/TLS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d vibecoding.com -d www.vibecoding.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring and Logging

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs vibe-coding

# Restart application
pm2 restart vibe-coding
```

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

### Log Configuration

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues
```bash
# Test database connection
psql $POSTGRES_URL -c "SELECT version();"

# Check environment variables
echo $POSTGRES_URL
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Performance Optimization

#### Enable Compression
```nginx
# In nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

#### Database Optimization
```sql
-- Add database indexes
CREATE INDEX CONCURRENTLY idx_chat_record_user_created ON chat_record(user_id, created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM chat_record WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;
```

## 📋 Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test database connectivity and run migrations
- [ ] Verify SSL certificate is properly configured
- [ ] Test authentication flow (if enabled)
- [ ] Verify Turnstile integration (if enabled)
- [ ] Test AI response generation
- [ ] Check all API endpoints are responding
- [ ] Verify internationalization is working
- [ ] Test responsive design on mobile devices
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy for database
- [ ] Test error handling and logging
- [ ] Verify SEO meta tags and structured data
- [ ] Test performance and loading times

## 🆘 Support

For deployment issues:
- Check the troubleshooting section above
- Review application logs
- Verify environment configuration
- Contact the development team

---

This deployment guide provides comprehensive instructions for deploying Vibe Coding to various environments. Choose the deployment method that best fits your infrastructure and requirements.