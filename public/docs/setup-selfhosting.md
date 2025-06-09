# Self-Hosting Taski Setup Guide

This comprehensive guide will help you deploy Taski on your own infrastructure, giving you complete control over your data and customization options.

## Overview

Taski is a modern web application built with Next.js, TypeScript, and PostgreSQL. You can deploy it on various platforms including:

- Docker (recommended)
- VPS/Dedicated servers
- Cloud platforms (AWS, Google Cloud, Azure, DigitalOcean)
- Kubernetes clusters

## Prerequisites

- Basic command line knowledge
- Understanding of environment variables
- Access to a server or cloud platform
- Domain name (optional but recommended)

## System Requirements

### Minimum Requirements
- **CPU**: 1 vCPU
- **RAM**: 1GB
- **Storage**: 10GB SSD
- **Network**: 1Mbps bandwidth

### Recommended Requirements
- **CPU**: 2+ vCPUs
- **RAM**: 2GB+
- **Storage**: 20GB+ SSD
- **Network**: 10Mbps+ bandwidth

## Option 1: Docker Deployment (Recommended)

Docker is the easiest way to deploy Taski with all dependencies included.

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### Step 1: Create Project Directory

```bash
mkdir taski-selfhosted
cd taski-selfhosted
```

### Step 2: Create Docker Compose File

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    image: taski/taski:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://taski:your_secure_password@db:5432/taski
      - AUTH_SECRET=your_very_long_random_secret_key_here
      - AUTH_URL=https://your-domain.com
      - NEXTAUTH_URL=https://your-domain.com
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=taski
      - POSTGRES_USER=taski
      - POSTGRES_PASSWORD=your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
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
  uploads:
```

### Step 3: Create Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        client_max_body_size 50M;

        location / {
            proxy_pass http://app;
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
}
```

### Step 4: Set Up SSL Certificates

#### Option A: Let's Encrypt (Free, Automated)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Get certificates
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
```

#### Option B: Self-Signed Certificates (For Testing)

```bash
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/privkey.pem \
    -out ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"
```

### Step 5: Configure Environment Variables

Create `.env` file:

```bash
# Generate a secure AUTH_SECRET (32+ characters)
AUTH_SECRET=your_32_character_random_string_here

# Database Configuration
DATABASE_URL=postgresql://taski:your_secure_password@db:5432/taski

# Application URLs
AUTH_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com

# Optional: OAuth Configuration (see Klaud.me guide)
# AUTH_OIDC_ID=your_oauth_client_id
# AUTH_OIDC_SECRET=your_oauth_client_secret
# AUTH_OIDC_ISSUER=https://your-org.klaud.me

# Optional: Email Configuration
# EMAIL_SERVER_HOST=smtp.gmail.com
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=your-email@gmail.com
# EMAIL_SERVER_PASSWORD=your-app-password
# EMAIL_FROM=noreply@your-domain.com
```

### Step 6: Deploy

```bash
# Start the services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Verify everything is running
docker-compose ps
```

## Option 2: VPS/Server Manual Installation

For manual installation on Ubuntu/Debian servers.

### Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Dependencies

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Git
sudo apt install git

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 3: Set Up Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE taski;
CREATE USER taski WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE taski TO taski;
\q
```

### Step 4: Clone and Build Application

```bash
# Clone repository
git clone https://github.com/your-repo/taski.git
cd taski

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### Step 5: Configure Environment

Edit `.env.local`:

```bash
DATABASE_URL=postgresql://taski:your_secure_password@localhost:5432/taski
AUTH_SECRET=your_32_character_random_string_here
AUTH_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
```

### Step 6: Build and Deploy

```bash
# Build the application
npm run build

# Run database migrations
npm run db:migrate

# Start with PM2
pm2 start npm --name "taski" -- start
pm2 save
pm2 startup
```

## Option 3: Cloud Platform Deployment

### Vercel (Easiest for Hosting)

1. Fork the Taski repository
2. Connect your GitHub account to Vercel
3. Import the Taski project
4. Set environment variables in Vercel dashboard
5. Deploy

### DigitalOcean App Platform

1. Create a new app in DigitalOcean
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm start`
4. Add a PostgreSQL database
5. Configure environment variables
6. Deploy

### AWS EC2 with RDS

1. Launch an EC2 instance (t2.micro for testing)
2. Create an RDS PostgreSQL instance
3. Follow the VPS manual installation steps
4. Configure security groups for proper access

## Configuration Options

### Environment Variables Reference

```bash
# Required
DATABASE_URL=postgresql://user:password@host:port/database
AUTH_SECRET=your_random_secret_key

# Authentication URLs
AUTH_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com

# OAuth OIDC (Optional)
AUTH_OIDC_ID=your_client_id
AUTH_OIDC_SECRET=your_client_secret
AUTH_OIDC_ISSUER=https://your-provider.com

# Email Configuration (Optional)
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=user@example.com
EMAIL_SERVER_PASSWORD=password
EMAIL_FROM=noreply@your-domain.com

# File Upload Configuration
UPLOAD_MAX_SIZE=50MB
UPLOAD_ALLOWED_TYPES=image/*,application/pdf,text/*

# Security
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ORIGIN=https://your-domain.com
```

## Backup and Maintenance

### Database Backups

Create automated backup script `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
DB_NAME="taski"

# Create backup
pg_dump $DB_NAME > "$BACKUP_DIR/taski_backup_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "taski_backup_*.sql" -mtime +7 -delete
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Application Updates

```bash
# For Docker deployment
docker-compose pull
docker-compose up -d

# For manual installation
git pull origin main
npm install
npm run build
pm2 restart taski
```

### SSL Certificate Renewal

For Let's Encrypt certificates:
```bash
# Auto-renewal (add to cron)
0 3 * * * certbot renew --quiet && docker-compose restart nginx
```

## Monitoring and Logs

### Docker Logs
```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f db
```

### PM2 Monitoring
```bash
# View process status
pm2 status

# View logs
pm2 logs taski

# Monitor resources
pm2 monit
```

## Troubleshooting

### Common Issues

**Application won't start**
- Check environment variables are set correctly
- Verify database connection
- Check logs for specific error messages

**Database connection failed**
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists

**SSL/HTTPS issues**
- Verify certificate files exist and are readable
- Check domain DNS configuration
- Ensure firewall allows ports 80 and 443

**Performance issues**
- Monitor CPU and memory usage
- Check database query performance
- Consider adding a CDN for static assets

### Getting Help

- **Documentation**: Check the `/docs` folder in the repository
- **Community**: Join our GitHub Discussions
- **Issues**: Report bugs on GitHub Issues
- **Security**: Email security@taski.dev for security issues

## Security Considerations

1. **Use HTTPS**: Always use SSL certificates in production
2. **Secure Environment Variables**: Never commit secrets to version control
3. **Database Security**: Use strong passwords and restrict access
4. **Firewall**: Configure firewall to only allow necessary ports
5. **Updates**: Keep the system and dependencies updated
6. **Backups**: Implement regular automated backups
7. **Monitoring**: Set up monitoring and alerting

## Performance Optimization

1. **Database Optimization**: Configure PostgreSQL settings for your workload
2. **Caching**: Enable Redis for session storage (optional)
3. **CDN**: Use a CDN for static assets
4. **Load Balancing**: Use multiple app instances behind a load balancer
5. **Database Connection Pooling**: Configure connection pooling for high traffic

---

This guide provides a solid foundation for self-hosting Taski. For specific questions or advanced configurations, please refer to our community resources or documentation. 