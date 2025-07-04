# Sebenza Construction - Deployment Guide

## Document Information

- **Product**: Sebenza Construction Management Platform
- **Version**: 1.0
- **Date**: July 2025
- **Audience**: DevOps, System Administrators, Deployment Engineers
- **Dependencies**: Docker, PostgreSQL, Node.js

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Preparation](#environment-preparation)
4. [Local Development Deployment](#local-development-deployment)
5. [Staging Environment](#staging-environment)
6. [Production Deployment](#production-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Cloud Deployment Options](#cloud-deployment-options)
9. [Monitoring & Health Checks](#monitoring--health-checks)
10. [Backup & Recovery](#backup--recovery)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides comprehensive instructions for deploying the Sebenza Construction Management Platform across different environments. The application supports multiple deployment strategies including traditional server deployment, containerized deployment with Docker, and cloud platform deployment.

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Web Server    │────│    Database     │
│   (Nginx/ALB)   │    │   (Next.js)     │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │  File Storage   │
                       │  (Local/S3)     │
                       └─────────────────┘
```

---

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **Memory**: 4GB RAM
- **Storage**: 20GB available space
- **Network**: 1Gbps internet connection

#### Recommended Requirements
- **CPU**: 4+ cores
- **Memory**: 8GB+ RAM
- **Storage**: 100GB+ SSD
- **Network**: 1Gbps+ internet connection

### Software Dependencies

```bash
# Core Dependencies
Node.js 18.x or higher
PostgreSQL 14.x or higher
npm 9.x or higher
Git 2.30+

# Optional Dependencies
Docker 24.x+ (for containerized deployment)
Nginx 1.20+ (for reverse proxy)
Redis 7.x+ (for caching - future enhancement)
```

### Domain & SSL Requirements

- **Domain**: Registered domain name
- **SSL Certificate**: Valid SSL certificate (Let's Encrypt recommended)
- **DNS**: Properly configured DNS records

---

## Environment Preparation

### 1. Server Setup

#### Ubuntu/Debian Setup
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx (optional)
sudo apt install nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### CentOS/RHEL Setup
```bash
# Update system packages
sudo yum update -y

# Install Node.js
sudo yum install -y nodejs npm

# Install PostgreSQL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Install Nginx (optional)
sudo yum install -y nginx

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup

#### PostgreSQL Configuration
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE sebenza_construction;
CREATE USER sebenza_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sebenza_construction TO sebenza_user;

# Configure PostgreSQL for remote connections (if needed)
# Edit /etc/postgresql/14/main/postgresql.conf
listen_addresses = '*'

# Edit /etc/postgresql/14/main/pg_hba.conf
host    all             all             0.0.0.0/0               md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. User & Permissions Setup

```bash
# Create application user
sudo useradd -m -s /bin/bash sebenza
sudo usermod -aG sudo sebenza

# Set up SSH key access (if deploying remotely)
sudo mkdir -p /home/sebenza/.ssh
sudo chown sebenza:sebenza /home/sebenza/.ssh
sudo chmod 700 /home/sebenza/.ssh
```

---

## Local Development Deployment

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd sebenza-construction

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure environment variables
nano .env.local
```

### Environment Configuration (.env.local)

```bash
# Application Configuration
NODE_ENV=development
PORT=9002
APP_URL=http://localhost:9002

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sebenza_construction"
SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/sebenza_construction_shadow"

# Authentication
JWT_SECRET="your-dev-jwt-secret"
NEXTAUTH_SECRET="your-dev-nextauth-secret"
NEXTAUTH_URL="http://localhost:9002"

# Email Configuration (Development)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""

# File Upload Configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"  # 10MB

# Development Features
DEBUG=true
ENABLE_MOCK_DATA=true
```

### Database Migration & Seeding

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database with sample data
npx prisma db seed

# Verify database setup
npx prisma studio
```

### Start Development Server

```bash
# Start development server
npm run dev

# Verify application is running
curl http://localhost:9002/api/health
```

---

## Staging Environment

### Environment Setup

```bash
# Staging environment variables (.env.staging)
NODE_ENV=staging
PORT=9002
APP_URL=https://staging.sebenza-construction.com

# Database Configuration
DATABASE_URL="postgresql://sebenza_user:password@staging-db:5432/sebenza_construction_staging"

# Authentication
JWT_SECRET="staging-jwt-secret-change-me"
NEXTAUTH_SECRET="staging-nextauth-secret"
NEXTAUTH_URL="https://staging.sebenza-construction.com"

# Email Configuration
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"

# File Storage
UPLOAD_DIR="/var/uploads"
AWS_BUCKET_NAME="sebenza-staging-uploads"
AWS_REGION="us-east-1"

# Monitoring
LOG_LEVEL="info"
ENABLE_MONITORING=true
```

### Deployment Script

```bash
#!/bin/bash
# deploy-staging.sh

set -e

echo "🚀 Deploying to Staging Environment..."

# Pull latest code
git pull origin develop

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Run database migrations
npx prisma migrate deploy

# Restart application
pm2 restart sebenza-staging

# Health check
sleep 10
curl -f https://staging.sebenza-construction.com/api/health || exit 1

echo "✅ Staging deployment completed successfully"
```

---

## Production Deployment

### Environment Configuration

```bash
# Production environment variables (.env.production)
NODE_ENV=production
PORT=9002
APP_URL=https://sebenza-construction.com

# Database Configuration
DATABASE_URL="postgresql://sebenza_user:secure_password@prod-db:5432/sebenza_construction"

# Authentication (Use strong secrets)
JWT_SECRET="super-secure-jwt-secret-256-bit"
NEXTAUTH_SECRET="super-secure-nextauth-secret-256-bit"
NEXTAUTH_URL="https://sebenza-construction.com"

# Email Configuration
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-production-sendgrid-api-key"

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_BUCKET_NAME="sebenza-production-uploads"
AWS_REGION="us-east-1"

# Security
CORS_ORIGIN="https://sebenza-construction.com"
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring & Logging
LOG_LEVEL="warn"
ENABLE_MONITORING=true
SENTRY_DSN="your-sentry-dsn"
```

### Production Deployment Steps

#### 1. Prepare Production Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Configure swap (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### 2. Deploy Application

```bash
# Clone repository to production server
git clone <repository-url> /opt/sebenza-construction
cd /opt/sebenza-construction

# Checkout production branch
git checkout main

# Install dependencies
npm ci --only=production

# Set up environment
cp .env.example .env.production
# Configure .env.production with production values

# Build application
npm run build

# Set up PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'sebenza-construction',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 9002
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: '/var/log/sebenza/combined.log',
    out_file: '/var/log/sebenza/out.log',
    error_file: '/var/log/sebenza/error.log',
    time: true
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/sebenza
sudo chown sebenza:sebenza /var/log/sebenza

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 3. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/sebenza-construction
server {
    listen 80;
    server_name sebenza-construction.com www.sebenza-construction.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sebenza-construction.com www.sebenza-construction.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/sebenza-construction.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sebenza-construction.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Client upload size
    client_max_body_size 10M;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # Static file caching
    location /static/ {
        alias /opt/sebenza-construction/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:9002/api/health;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/sebenza-construction /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL Certificate Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d sebenza-construction.com -d www.sebenza-construction.com

# Test auto-renewal
sudo certbot renew --dry-run

# Set up auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 9002

ENV PORT 9002
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "9002:9002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://sebenza:password@db:5432/sebenza_construction
    depends_on:
      - db
      - redis
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: sebenza_construction
      POSTGRES_USER: sebenza
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  uploads:
```

### Docker Deployment Commands

```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3

# Update deployment
docker-compose pull
docker-compose up -d --force-recreate
```

---

## Cloud Deployment Options

### AWS Deployment

#### Using AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
eb init sebenza-construction

# Create environment
eb create production

# Deploy application
eb deploy

# Configure environment variables
eb setenv NODE_ENV=production DATABASE_URL=your-rds-url
```

#### Using AWS ECS with Fargate

```yaml
# ecs-task-definition.json
{
  "family": "sebenza-construction",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/sebenza-construction:latest",
      "portMappings": [
        {
          "containerPort": 9002,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "9002"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sebenza-construction",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Azure Deployment

#### Using Azure App Service

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name sebenza-rg --location "East US"

# Create App Service plan
az appservice plan create --name sebenza-plan --resource-group sebenza-rg --sku P1V2 --is-linux

# Create web app
az webapp create --resource-group sebenza-rg --plan sebenza-plan --name sebenza-construction --runtime "NODE|18-lts"

# Configure environment variables
az webapp config appsettings set --resource-group sebenza-rg --name sebenza-construction --settings NODE_ENV=production

# Deploy from GitHub
az webapp deployment source config --name sebenza-construction --resource-group sebenza-rg --repo-url https://github.com/your-org/sebenza-construction --branch main
```

### Google Cloud Platform

#### Using Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/your-project/sebenza-construction

# Deploy to Cloud Run
gcloud run deploy sebenza-construction \
  --image gcr.io/your-project/sebenza-construction \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

---

## Monitoring & Health Checks

### Health Check Implementation

```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check application status
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    };

    res.status(200).json(status);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
}
```

### Monitoring Setup

#### Prometheus & Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

#### Application Monitoring

```bash
# Install monitoring dependencies
npm install prom-client express-prom-bundle

# Set up monitoring middleware
npm install @sentry/nextjs
```

### Log Management

```bash
# Configure log rotation
sudo tee /etc/logrotate.d/sebenza << EOF
/var/log/sebenza/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 sebenza sebenza
    postrotate
        pm2 reload sebenza-construction
    endscript
}
EOF
```

---

## Backup & Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/opt/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="sebenza_construction"
DB_USER="sebenza_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME \
  --no-password --verbose \
  --format=custom \
  --file="$BACKUP_DIR/sebenza_db_$TIMESTAMP.backup"

# Compress old backups
find $BACKUP_DIR -name "*.backup" -mtime +1 -exec gzip {} \;

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.backup.gz" -mtime +30 -delete

echo "Database backup completed: sebenza_db_$TIMESTAMP.backup"
```

### File Backup Strategy

```bash
#!/bin/bash
# backup-files.sh

BACKUP_DIR="/opt/backups/files"
UPLOAD_DIR="/opt/sebenza-construction/uploads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup upload files
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C "$UPLOAD_DIR" .

# Remove backups older than 7 days
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete

echo "File backup completed: uploads_$TIMESTAMP.tar.gz"
```

### Automated Backup Setup

```bash
# Add to crontab
crontab -e

# Daily database backup at 2 AM
0 2 * * * /opt/scripts/backup-database.sh

# Daily file backup at 3 AM
0 3 * * * /opt/scripts/backup-files.sh

# Weekly full system backup at 4 AM on Sundays
0 4 * * 0 /opt/scripts/backup-full-system.sh
```

### Recovery Procedures

#### Database Recovery

```bash
# Stop application
pm2 stop sebenza-construction

# Restore database from backup
pg_restore -h localhost -U sebenza_user -d sebenza_construction \
  --clean --if-exists \
  /opt/backups/database/sebenza_db_20250101_020000.backup

# Start application
pm2 start sebenza-construction

# Verify recovery
curl http://localhost:9002/api/health
```

#### File Recovery

```bash
# Stop application
pm2 stop sebenza-construction

# Restore files from backup
cd /opt/sebenza-construction
rm -rf uploads/*
tar -xzf /opt/backups/files/uploads_20250101_030000.tar.gz -C uploads/

# Set proper permissions
chown -R sebenza:sebenza uploads/
chmod -R 755 uploads/

# Start application
pm2 start sebenza-construction
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
pm2 logs sebenza-construction

# Check environment variables
pm2 env 0

# Check port availability
netstat -tlnp | grep :9002

# Check disk space
df -h

# Check memory usage
free -h
```

#### Database Connection Issues

```bash
# Test database connectivity
psql -h localhost -U sebenza_user -d sebenza_construction -c "SELECT version();"

# Check database status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Restart database
sudo systemctl restart postgresql
```

#### Performance Issues

```bash
# Check system resources
htop

# Check application metrics
curl http://localhost:9002/api/health

# Check database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Check slow queries
sudo -u postgres psql -d sebenza_construction -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

#### SSL/TLS Issues

```bash
# Test SSL certificate
openssl s_client -connect sebenza-construction.com:443

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/sebenza-construction.com/cert.pem -text -noout

# Renew certificate
sudo certbot renew --force-renewal
```

### Emergency Procedures

#### Service Recovery

```bash
#!/bin/bash
# emergency-restart.sh

echo "🚨 Emergency service recovery initiated..."

# Stop all services
pm2 stop all
sudo systemctl stop nginx

# Check system health
df -h
free -h
netstat -tlnp

# Restart database
sudo systemctl restart postgresql

# Wait for database
sleep 10

# Start application
pm2 start ecosystem.config.js

# Start web server
sudo systemctl start nginx

# Health check
sleep 5
curl -f http://localhost:9002/api/health

if [ $? -eq 0 ]; then
    echo "✅ Services recovered successfully"
else
    echo "❌ Recovery failed - manual intervention required"
    exit 1
fi
```

#### Rollback Procedure

```bash
#!/bin/bash
# rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "Usage: $0 <previous_version>"
    exit 1
fi

echo "🔄 Rolling back to version $PREVIOUS_VERSION..."

# Stop application
pm2 stop sebenza-construction

# Checkout previous version
git checkout $PREVIOUS_VERSION

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Restart application
pm2 start sebenza-construction

echo "✅ Rollback completed"
```

### Monitoring Commands

```bash
# Real-time monitoring
watch -n 5 'curl -s http://localhost:9002/api/health | jq'

# Performance monitoring
top -p $(pgrep -f "sebenza-construction")

# Log monitoring
tail -f /var/log/sebenza/combined.log | grep ERROR

# Database monitoring
sudo -u postgres psql -d sebenza_construction -c "SELECT datname, numbackends, xact_commit, xact_rollback FROM pg_stat_database WHERE datname='sebenza_construction';"
```

---

## Security Considerations

### Server Hardening

```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Change default SSH port
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Enable firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Install fail2ban
sudo apt install fail2ban

# Configure automatic updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

### Application Security

```bash
# Set proper file permissions
chmod 600 .env.production
chown sebenza:sebenza .env.production

# Secure upload directory
chmod 755 uploads/
chown -R sebenza:sebenza uploads/

# Set up log file permissions
chmod 644 /var/log/sebenza/*.log
chown sebenza:sebenza /var/log/sebenza/*.log
```

---

This deployment guide provides comprehensive instructions for deploying the Sebenza Construction Management Platform across different environments and scenarios. Follow the appropriate section based on your deployment requirements, and refer to the troubleshooting section for resolving common issues.

For additional support, refer to the `technical_specification.md` and `development_workflow.md` documents for more detailed technical information.
