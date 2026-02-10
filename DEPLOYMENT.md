# Deployment Guide - AWS EC2

This guide will help you deploy the Credential Store application on AWS EC2.

## Prerequisites

- AWS EC2 instance (Ubuntu 20.04 or later recommended)
- Docker and Docker Compose installed on EC2
- Security group configured to allow:
  - Port 22 (SSH)
  - Port 80 (HTTP) or 443 (HTTPS)
  - Port 5173 (Frontend - for testing, use nginx in production)
  - Port 8080 (Backend API)

## Step 1: Install Docker on EC2

```bash
# Update package list
sudo apt update

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

## Step 2: Clone the Repository

```bash
# SSH back into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone the repository
git clone https://github.com/yourusername/credential-store.git
cd credential-store
```

## Step 3: Configure Environment Variables

```bash
# Copy example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend environment (IMPORTANT: Change these in production!)
nano backend/.env
```

Update the following in `backend/.env`:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
DB_NAME=credstore
JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECURE_STRING
ENCRYPTION_KEY=CHANGE_THIS_TO_32_CHAR_STRING
PORT=8080
```

```bash
# Edit frontend environment
nano frontend/.env
```

Update `frontend/.env` with your EC2 public IP or domain:
```env
# Replace with your EC2 public IP or domain
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:8080/api
# Or if using domain:
# VITE_API_URL=https://api.yourdomain.com/api
```

## Step 4: Update CORS Settings

Edit `backend/cmd/server/main.go` to allow your EC2 IP:

```bash
nano backend/cmd/server/main.go
```

Update the CORS configuration:
```go
r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{
        "http://YOUR_EC2_PUBLIC_IP:5173",
        "http://YOUR_EC2_PUBLIC_IP",
        "http://localhost:5173",
    },
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    ExposeHeaders:    []string{"Content-Length"},
    AllowCredentials: true,
}))
```

## Step 5: Build and Run

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# Check if containers are running
docker ps

# Check logs if needed
docker-compose logs -f
```

## Step 6: Verify Deployment

1. **Check Backend API**:
```bash
curl http://localhost:8080/api/folders
# Should return 401 (unauthorized) - this is correct
```

2. **Access Frontend**:
   - Open browser: `http://YOUR_EC2_PUBLIC_IP:5173`
   - Login with: `admin@credstore.com` / `admin123`

## Step 7: Security Hardening (IMPORTANT!)

### Change Default Passwords
1. Login as admin
2. Go to "Manage Users"
3. Change passwords for all default users
4. Or delete default users and create new ones

### Update Environment Variables
```bash
# Generate secure JWT secret
openssl rand -base64 32

# Generate secure encryption key (exactly 32 characters)
openssl rand -base64 24

# Update backend/.env with these values
nano backend/.env

# Restart containers
docker-compose down
docker-compose up -d
```

### Configure Firewall (UFW)
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application ports
sudo ufw allow 5173
sudo ufw allow 8080

# Check status
sudo ufw status
```

## Step 8: Production Setup with Nginx (Recommended)

For production, use Nginx as reverse proxy:

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/credential-store
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
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
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/credential-store /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

Now access via: `http://YOUR_EC2_PUBLIC_IP` (port 80)

## Step 9: SSL/HTTPS with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

## Maintenance Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```bash
docker-compose down
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Backup Database
```bash
# Create backup
docker exec credential-store-postgres-1 pg_dump -U postgres credstore > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i credential-store-postgres-1 psql -U postgres credstore < backup_20260210.sql
```

## Troubleshooting

### Containers not starting
```bash
# Check logs
docker-compose logs

# Check if ports are in use
sudo netstat -tulpn | grep -E '5173|8080|5432'
```

### Cannot connect to frontend
- Check EC2 security group allows port 5173
- Verify VITE_API_URL in frontend/.env
- Check CORS settings in backend

### Database connection errors
```bash
# Check if postgres is running
docker ps | grep postgres

# Check postgres logs
docker-compose logs postgres
```

### Permission denied errors
```bash
# Make sure you're in docker group
sudo usermod -aG docker $USER
# Log out and back in
```

## Quick Deployment Script

Save this as `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying Credential Store..."

# Pull latest changes
git pull origin main

# Stop existing containers
docker-compose down

# Build new images
docker-compose build

# Start services
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
docker-compose ps

echo "✅ Deployment complete!"
echo "Frontend: http://$(curl -s ifconfig.me):5173"
echo "Backend: http://$(curl -s ifconfig.me):8080"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Summary

**Minimum steps to deploy:**
1. Install Docker and Docker Compose
2. Clone repository
3. Update `frontend/.env` with your EC2 IP
4. Run `docker-compose build && docker-compose up -d`
5. Access at `http://YOUR_EC2_IP:5173`

**For production:**
- Change all default passwords
- Update JWT_SECRET and ENCRYPTION_KEY
- Set up Nginx reverse proxy
- Configure SSL with Let's Encrypt
- Set up automated backups
