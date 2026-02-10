#!/bin/bash
set -e

echo "🚀 Deploying Credential Store..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration!"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found. Creating from example..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please edit frontend/.env with your EC2 IP or domain!"
    exit 1
fi

# Pull latest changes if in git repo
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main || echo "⚠️  Could not pull changes (not a git repo or no remote)"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build new images
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo "▶️  Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP'):5173"
echo "   Backend:  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP'):8080"
echo ""
echo "👤 Default login:"
echo "   Email: admin@credstore.com"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change default passwords in production!"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
