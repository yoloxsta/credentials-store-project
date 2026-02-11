# Deployment Guide - AWS EC2

This comprehensive guide will help you deploy the Credential Store application on AWS EC2 with production-ready configuration.

## 📋 Prerequisites

- AWS EC2 instance (Ubuntu 20.04 or later recommended)
  - Minimum: t2.small (2 GB RAM)
  - Recommended: t2.medium (4 GB RAM) for production
- Docker and Docker Compose installed on EC2
- Security group configured to allow:
  - Port 22 (SSH)
  - Port 80 (HTTP) or 443 (HTTPS)
  - Port 5173 (Frontend - for testing, use nginx in production)
  - Port 8080 (Backend API)
- Domain name (optional, for SSL/HTTPS)

## 🚀 Quick Deployment (5 Minutes)

For a quick test deployment, follow these minimal steps:

```bash
# 1. Install Docker
sudo apt update && sudo apt install -y docker.io
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker $USER

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone and deploy
git clone https://github.com/yourusername/credential-store.git
cd credential-store
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Update frontend API URL
sed -i "s|http://localhost:8080|http://$(curl -s ifconfig.me):8080|g" frontend/.env

# 5. Deploy
chmod +x deploy.sh && ./deploy.sh
```

Access at: `http://YOUR_EC2_IP:5173`

## 📖 Detailed Deployment Steps

### Step 1: Prepare EC2 Instance

#### 1.1 Launch EC2 Instance
- AMI: Ubuntu Server 20.04 LTS or later
- Instance Type: t2.small minimum (t2.medium recommended)
- Storage: 20 GB minimum (30 GB recommended)
- Security Group: Configure as shown below

#### 1.2 Configure Security Group

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web access |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web access |
| Custom TCP | TCP | 5173 | 0.0.0.0/0 | Frontend (dev) |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Backend API |

⚠️ **Production Note**: Restrict port 5173 and 8080 after setting up Nginx reverse proxy.

### Step 2: Install Docker on EC2

```bash
# Update package list
sudo apt update
sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and log back in for group changes to take effect
exit
```

### Step 3: Clone the Repository

```bash
# SSH back into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone the repository
git clone https://github.com/yourusername/credential-store.git
cd credential-store
```

### Step 4: Configure Environment Variables

#### 4.1 Backend Configuration

```bash
# Copy example environment file
cp backend/.env.example backend/.env

# Edit backend environment
nano backend/.env
```

Update `backend/.env` with secure values:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD_123!@#
DB_NAME=credstore
JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECURE_STRING_MIN_32_CHARS
ENCRYPTION_KEY=CHANGE_THIS_TO_EXACTLY_32_CHARS
PORT=8080
```

**Generate secure values:**
```bash
# Generate JWT secret (copy output)
openssl rand -base64 48

# Generate encryption key (must be exactly 32 characters)
openssl rand -base64 24
```

#### 4.2 Frontend Configuration

```bash
# Copy example environment file
cp frontend/.env.example frontend/.env

# Edit frontend environment
nano frontend/.env
```

Update `frontend/.env` with your EC2 public IP or domain:
```env
# For EC2 public IP:
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:8080/api

# Or if using domain with Nginx:
# VITE_API_URL=https://yourdomain.com/api
```

**Quick way to get your EC2 IP:**
```bash
curl ifconfig.me
```

### Step 5: Update CORS Settings

Edit `backend/cmd/server/main.go` to allow your EC2 IP or domain:

```bash
nano backend/cmd/server/main.go
```

Update the CORS configuration:
```go
r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{
        "http://YOUR_EC2_PUBLIC_IP:5173",
        "http://YOUR_EC2_PUBLIC_IP",
        "https://yourdomain.com",
        "http://localhost:5173", // Keep for local dev
    },
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    ExposeHeaders:    []string{"Content-Length"},
    AllowCredentials: true,
}))
```

### Step 6: Build and Run

```bash
# Build all containers
docker-compose build

# Start all services in detached mode
docker-compose up -d

# Check if containers are running
docker ps

# Expected output: 3 containers running
# - credential-store-backend-1
# - credential-store-frontend-1
# - credential-store-postgres-1

# Check logs if needed
docker-compose logs -f
```

### Step 7: Verify Deployment

#### 7.1 Check Backend API
```bash
# Should return 401 (unauthorized) - this is correct
curl http://localhost:8080/api/folders

# Test login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@credstore.com","password":"admin123"}'
```

#### 7.2 Access Frontend
1. Open browser: `http://YOUR_EC2_PUBLIC_IP:5173`
2. Login with: `admin@credstore.com` / `admin123`
3. Verify all tabs work: Credentials, Documents, Folders, Users

#### 7.3 Test Document Upload
1. Login as admin
2. Go to Documents tab
3. Upload a test file
4. Verify file appears in list
5. Test View and Download buttons

### Step 8: Security Hardening (CRITICAL!)

#### 8.1 Change Default Passwords
```bash
# Login to application as admin
# Navigate to Users tab
# Change passwords for all default users:
# - admin@credstore.com
# - senior@credstore.com
# - junior@credstore.com
```

Or delete default users and create new ones with secure passwords.

#### 8.2 Update Environment Variables

Already done in Step 4, but verify:
```bash
# Check that you changed these:
grep JWT_SECRET backend/.env
grep ENCRYPTION_KEY backend/.env
grep DB_PASSWORD backend/.env

# If still using defaults, update them now!
nano backend/.env

# Restart containers after changes
docker-compose down && docker-compose up -d
```

#### 8.3 Configure Firewall (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application ports (temporary, remove after Nginx setup)
sudo ufw allow 5173/tcp
sudo ufw allow 8080/tcp

# Check status
sudo ufw status verbose

# Reload firewall
sudo ufw reload
```

### Step 9: Production Setup with Nginx (Recommended)

For production, use Nginx as reverse proxy to:
- Serve frontend and backend on standard ports (80/443)
- Add SSL/TLS encryption
- Improve security and performance
- Enable caching and compression

#### 9.1 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Check if running
sudo systemctl status nginx
```

#### 9.2 Create Nginx Configuration

```bash
# Create configuration file
sudo nano /etc/nginx/sites-available/credential-store
```

Add this configuration:
```nginx
# Credential Store - Nginx Configuration

# Redirect HTTP to HTTPS (uncomment after SSL setup)
# server {
#     listen 80;
#     server_name yourdomain.com www.yourdomain.com;
#     return 301 https://$server_name$request_uri;
# }

server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - React App
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for file uploads
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        
        # Increase max body size for file uploads (50MB)
        client_max_body_size 50M;
    }

    # Logs
    access_log /var/log/nginx/credential-store-access.log;
    error_log /var/log/nginx/credential-store-error.log;
}
```

#### 9.3 Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/credential-store /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

Now access via: `http://YOUR_EC2_PUBLIC_IP` (port 80)

#### 9.4 Update Frontend Environment

After Nginx setup, update frontend to use port 80:
```bash
nano frontend/.env
# Change to: VITE_API_URL=http://YOUR_EC2_IP/api

# Rebuild frontend
docker-compose down
docker-compose build frontend
docker-compose up -d
```

### Step 10: SSL/HTTPS with Let's Encrypt (Highly Recommended)

#### 10.1 Prerequisites
- Domain name pointing to your EC2 IP
- Ports 80 and 443 open in security group

#### 10.2 Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

#### 10.3 Update Frontend for HTTPS

```bash
nano frontend/.env
# Change to: VITE_API_URL=https://yourdomain.com/api

# Update CORS in backend
nano backend/cmd/server/main.go
# Add: "https://yourdomain.com" to AllowOrigins

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

#### 10.4 Test Auto-Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Auto-renewal is configured automatically via systemd timer
# Check timer status
sudo systemctl status certbot.timer
```

Certificates will auto-renew before expiration.

## 🔧 Maintenance Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend

# Nginx logs
sudo tail -f /var/log/nginx/credential-store-access.log
sudo tail -f /var/log/nginx/credential-store-error.log
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Restart Nginx
sudo systemctl restart nginx
```

### Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes all data!)
docker-compose down -v
```

### Update Application

```bash
# Pull latest changes
cd credential-store
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
```

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Create backup
docker exec credential-store-postgres-1 pg_dump -U postgres credstore > ~/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh ~/backups/

# Automated daily backup (add to crontab)
crontab -e
# Add: 0 2 * * * docker exec credential-store-postgres-1 pg_dump -U postgres credstore > ~/backups/backup_$(date +\%Y\%m\%d).sql
```

### Restore Database

```bash
# Stop backend to prevent conflicts
docker-compose stop backend

# Restore from backup
docker exec -i credential-store-postgres-1 psql -U postgres credstore < ~/backups/backup_20260210_020000.sql

# Restart backend
docker-compose start backend
```

### Backup Uploaded Documents

```bash
# Documents are stored in Docker volume
# Create backup
docker run --rm -v credential-store_uploads:/data -v ~/backups:/backup ubuntu tar czf /backup/documents_$(date +%Y%m%d).tar.gz /data

# Restore documents
docker run --rm -v credential-store_uploads:/data -v ~/backups:/backup ubuntu tar xzf /backup/documents_20260210.tar.gz -C /
```

## 🐛 Troubleshooting

### Containers Not Starting

```bash
# Check logs
docker-compose logs

# Check if ports are in use
sudo netstat -tulpn | grep -E '5173|8080|5432'

# Kill processes using ports
sudo kill -9 $(sudo lsof -t -i:5173)
sudo kill -9 $(sudo lsof -t -i:8080)

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

### Cannot Connect to Frontend

**Symptoms**: Browser shows "Cannot connect" or timeout

**Solutions**:
1. Check EC2 security group allows port 5173 (or 80 with Nginx)
2. Verify VITE_API_URL in frontend/.env matches your EC2 IP
3. Check CORS settings in backend/cmd/server/main.go
4. Verify containers are running: `docker ps`

```bash
# Test from EC2 instance
curl http://localhost:5173

# Test from your computer
curl http://YOUR_EC2_IP:5173
```

### Database Connection Errors

**Symptoms**: Backend logs show "Failed to connect to database"

**Solutions**:
```bash
# Check if postgres is running
docker ps | grep postgres

# Check postgres logs
docker-compose logs postgres

# Verify database credentials in backend/.env
cat backend/.env | grep DB_

# Restart postgres
docker-compose restart postgres

# If database is corrupted, recreate it (WARNING: deletes data!)
docker-compose down -v
docker-compose up -d
```

### File Upload Fails

**Symptoms**: "Failed to upload document" error

**Solutions**:
1. Check file size (max 50MB)
2. Verify uploads directory exists and has permissions
3. Check backend logs for errors

```bash
# Check uploads volume
docker volume inspect credential-store_uploads

# Check backend logs
docker-compose logs backend | grep -i upload

# Verify volume mount
docker exec credential-store-backend-1 ls -la /root/uploads
```

### Permission Denied Errors

```bash
# Make sure you're in docker group
sudo usermod -aG docker $USER

# Log out and back in
exit
# SSH back in

# Verify group membership
groups | grep docker
```

### Nginx Configuration Errors

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

## 📊 Monitoring

### Check System Resources

```bash
# CPU and memory usage
docker stats

# Disk usage
df -h
docker system df

# Clean up unused Docker resources
docker system prune -a
```

### Application Health Checks

```bash
# Check if services are responding
curl http://localhost:8080/api/folders  # Should return 401
curl http://localhost:5173  # Should return HTML

# Check database
docker exec credential-store-postgres-1 psql -U postgres -c "SELECT version();"
```

## 🚀 Quick Deployment Script

Save this as `deploy.sh` (already included in repo):

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Credential Store..."

# Pull latest changes
git pull origin main

# Stop existing containers
docker-compose down

# Build new images
docker-compose build --no-cache

# Start services
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check status
docker-compose ps

# Show logs
docker-compose logs --tail=50

echo ""
echo "✅ Deployment complete!"
echo "📍 Frontend: http://$(curl -s ifconfig.me):5173"
echo "📍 Backend: http://$(curl -s ifconfig.me):8080"
echo ""
echo "🔐 Default login: admin@credstore.com / admin123"
echo "⚠️  Remember to change default passwords!"
```

Make it executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 Post-Deployment Checklist

- [ ] Changed all default passwords
- [ ] Updated JWT_SECRET and ENCRYPTION_KEY
- [ ] Configured firewall (UFW)
- [ ] Set up Nginx reverse proxy
- [ ] Configured SSL/HTTPS with Let's Encrypt
- [ ] Tested all features (login, credentials, documents, users)
- [ ] Set up automated database backups
- [ ] Configured monitoring/alerts
- [ ] Documented custom configurations
- [ ] Restricted security group ports (close 5173, 8080 after Nginx setup)

## 🎯 Summary

**Quick Test Deployment (5 min):**
1. Install Docker and Docker Compose
2. Clone repository
3. Update `frontend/.env` with EC2 IP
4. Run `docker-compose build && docker-compose up -d`
5. Access at `http://YOUR_EC2_IP:5173`

**Production Deployment (30 min):**
1. Follow all steps above
2. Change all default passwords and secrets
3. Set up Nginx reverse proxy
4. Configure SSL with Let's Encrypt
5. Set up automated backups
6. Configure monitoring

**Access URLs:**
- Development: `http://YOUR_EC2_IP:5173`
- Production (Nginx): `http://YOUR_EC2_IP` or `https://yourdomain.com`

**Default Credentials:**
- Admin: admin@credstore.com / admin123
- Senior: senior@credstore.com / admin123
- Junior: junior@credstore.com / admin123

⚠️ **Change these immediately in production!**
