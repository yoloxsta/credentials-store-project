# Quick Start Guide

Get Credential Store up and running in 5 minutes!

## 🚀 Local Development (Docker)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/credential-store.git
cd credential-store

# 2. Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start everything
docker-compose up -d

# 4. Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
```

**Default Login:** admin@credstore.com / admin123

## 🌐 AWS EC2 Deployment

```bash
# 1. Install Docker
sudo apt update && sudo apt install -y docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone and configure
git clone https://github.com/yourusername/credential-store.git
cd credential-store
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Update frontend API URL
nano frontend/.env
# Change: VITE_API_URL=http://YOUR_EC2_IP:8080/api

# 5. Deploy
chmod +x deploy.sh
./deploy.sh
```

**Access:** http://YOUR_EC2_IP:5173

## 📝 Common Commands

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose down
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
```

### Database Commands

```bash
# Backup database
docker exec credential-store-postgres-1 pg_dump -U postgres credstore > backup.sql

# Restore database
docker exec -i credential-store-postgres-1 psql -U postgres credstore < backup.sql

# Access database shell
docker exec -it credential-store-postgres-1 psql -U postgres credstore

# Run migration manually
docker exec -i credential-store-postgres-1 psql -U postgres credstore < backend/migrations/001_init.sql
```

### Development Commands

```bash
# Backend development (without Docker)
cd backend
go mod download
go run cmd/server/main.go

# Frontend development (without Docker)
cd frontend
npm install
npm run dev

# Build frontend for production
cd frontend
npm run build
```

## 🔐 First Steps After Installation

1. **Login as admin**
   - Email: admin@credstore.com
   - Password: admin123

2. **Change default passwords**
   - Go to Users tab
   - Edit each user and set new password
   - Or delete default users and create new ones

3. **Update environment secrets**
   ```bash
   # Generate new JWT secret
   openssl rand -base64 48
   
   # Generate new encryption key (32 chars)
   openssl rand -base64 24
   
   # Update backend/.env
   nano backend/.env
   
   # Restart
   docker-compose restart backend
   ```

4. **Test all features**
   - Create a credential
   - Upload a document
   - Set document permissions
   - Test with different user roles

## 🎯 User Roles & Access

| User | Email | Password | Role | Access |
|------|-------|----------|------|--------|
| Admin | admin@credstore.com | admin123 | admin | Everything |
| Senior | senior@credstore.com | admin123 | user | UAT, Production |
| Junior | junior@credstore.com | admin123 | user | UAT, Development |

## 📚 Features Overview

### For Admins
- ✅ Create/edit/delete users
- ✅ Create/edit/delete credentials
- ✅ Manage folders and permissions
- ✅ Upload documents
- ✅ Set document permissions
- ✅ View all data

### For Regular Users
- ✅ View credentials (based on folder access)
- ✅ View documents (based on permissions)
- ✅ Download documents (if permitted)
- ✅ Toggle dark/light mode

## 🔧 Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs

# Check ports
sudo netstat -tulpn | grep -E '5173|8080|5432'

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

### Can't connect to frontend
```bash
# Check if running
docker ps | grep frontend

# Check frontend logs
docker-compose logs frontend

# Verify API URL
cat frontend/.env
```

### Database errors
```bash
# Check postgres
docker ps | grep postgres

# Check postgres logs
docker-compose logs postgres

# Recreate database (WARNING: deletes data!)
docker-compose down -v
docker-compose up -d
```

### File upload fails
```bash
# Check backend logs
docker-compose logs backend | grep -i upload

# Verify uploads volume
docker volume inspect credential-store_uploads

# Check permissions
docker exec credential-store-backend-1 ls -la /root/uploads
```

## 📖 Next Steps

- Read [README.md](README.md) for detailed features
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Review [CHANGELOG.md](CHANGELOG.md) for version history

## 🆘 Need Help?

- Check documentation files
- Search [GitHub Issues](https://github.com/yourusername/credential-store/issues)
- Create a new issue with details

## 🎉 You're Ready!

Your Credential Store is now running. Start by:
1. Logging in as admin
2. Changing default passwords
3. Creating your first credential
4. Uploading your first document

Happy credential managing! 🔐
