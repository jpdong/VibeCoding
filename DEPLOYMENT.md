# Deployment Guide

## Pre-deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are configured:

```bash
# Database
DATABASE_URL=postgresql://...

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

# BetterAuth
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=https://yourdomain.com

# Turnstile (Cloudflare)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret

# OpenAI/AI Provider
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE_URL=https://api.openai.com
OPENAI_API_MODEL=gpt-4

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_CHECK_GOOGLE_LOGIN=1
```

### 2. Database Setup
Run the following commands to set up your database:

```bash
# Run migrations and seed data
npm run db:setup

# Test the system
npm run test:system
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add callback URLs:
   - `https://yourdomain.com/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/google/callback`

### 4. Cloudflare Turnstile Setup
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Turnstile
3. Create a new site
4. Get site key and secret key
5. Configure allowed domains

### 5. Build and Test
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the build
npm start
```

## Deployment Steps

### Option 1: Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Option 2: Docker Deployment
```bash
# Build Docker image
docker build -t vibe-coding .

# Run container
docker run -p 3000:3000 --env-file .env.production vibe-coding
```

### Option 3: Traditional Server
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Post-deployment Verification

### 1. Health Checks
- [ ] Application loads successfully
- [ ] Database connection works
- [ ] Google OAuth login works
- [ ] Model selection works
- [ ] Chat functionality works
- [ ] Pricing page loads
- [ ] Turnstile verification works

### 2. Performance Checks
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Database queries optimized
- [ ] Static assets cached properly

### 3. Security Checks
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Authentication secure

## Monitoring and Maintenance

### 1. Logging
Monitor the following logs:
- Application errors
- Authentication failures
- API rate limiting
- Database performance
- Turnstile verification failures

### 2. Database Maintenance
```bash
# Create regular backups
npm run db:backup

# Monitor database size and performance
# Clean up old sessions periodically
```

### 3. Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging environment
- Deploy updates during low-traffic periods

## Troubleshooting

### Common Issues

1. **Google OAuth not working**
   - Check redirect URLs in Google Console
   - Verify environment variables
   - Check domain configuration

2. **Database connection issues**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Verify SSL settings

3. **Turnstile verification failing**
   - Check site key and secret key
   - Verify domain configuration
   - Check network connectivity to Cloudflare

4. **Model selection not working**
   - Run database migrations
   - Check models table has data
   - Verify API endpoints

### Support
For technical support, check:
- Application logs
- Database logs
- Network connectivity
- Environment variable configuration

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to version control
   - Use secure secret management
   - Rotate secrets regularly

2. **Database Security**
   - Use SSL connections
   - Implement proper access controls
   - Regular security updates

3. **API Security**
   - Rate limiting enabled
   - Input validation active
   - Authentication required
   - CORS properly configured

4. **User Data**
   - Encrypt sensitive data
   - Implement data retention policies
   - Comply with privacy regulations
   - Secure user sessions