# Setup Guide

Complete guide to set up and run the Credential Store project.

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- (Optional) AWS account for S3 storage

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/credential-store.git
cd credential-store
```

### 2. Configure Environment Variables

```bash
# Copy example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Edit Backend Configuration

Open `backend/.env` and update:

```env
# REQUIRED: Change these for production
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
ENCRYPTION_KEY=change-this-to-32-character-key

# Database (default values work for Docker)
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=credstore

# Server
PORT=8080

# OPTIONAL: AWS S3 Configuration
# Leave empty to use local file storage
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

**Important Security Notes:**
- `JWT_SECRET`: Use a strong random string (minimum 32 characters)
- `ENCRYPTION_KEY`: Must be exactly 32 characters for AES-256
- Generate secure keys: `openssl rand -base64 32`

### 4. Start the Application

```bash
docker-compose up --build -d
```

This will:
- Build and start PostgreSQL database
- Run all database migrations automatically
- Build and start the Go backend (port 8080)
- Build and start the React frontend (port 5173)

### 5. Access the Application

Open your browser and go to:
```
http://localhost:5173
```

### 6. Login with Default Credentials

**Admin Account:**
- Email: `admin@credstore.com`
- Password: `admin123`

**Other Test Accounts:**
- Senior: `senior@credstore.com` / `admin123`
- Junior: `junior@credstore.com` / `admin123`

**⚠️ IMPORTANT: Change these passwords immediately after first login!**

## Optional: AWS S3 Setup

If you want to use AWS S3 for document storage instead of local storage:

### 1. Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://your-bucket-name --region us-east-1
```

Or create via AWS Console: https://s3.console.aws.amazon.com/

### 2. Create IAM User

1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/
2. Create new user with programmatic access
3. Attach policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Save the Access Key ID and Secret Access Key

### 3. Update .env File

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=your-bucket-name
```

### 4. Restart Application

```bash
docker-compose restart backend
```

See [AWS_S3_SETUP.md](AWS_S3_SETUP.md) for detailed instructions.

## Production Deployment

For production deployment on EC2 or other servers, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Key Production Changes:

1. **Change all default passwords**
2. **Generate strong JWT_SECRET and ENCRYPTION_KEY**
3. **Use environment-specific .env files**
4. **Set up SSL/HTTPS with Let's Encrypt**
5. **Configure firewall rules**
6. **Set up regular backups**
7. **Enable AWS CloudWatch/logging**

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Application

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Access Database

```bash
docker exec -it credential-store-postgres-1 psql -U postgres -d credstore
```

### Rebuild After Code Changes

```bash
docker-compose up --build -d
```

## Troubleshooting

### Port Already in Use

If ports 5173, 8080, or 5432 are already in use:

1. Stop conflicting services
2. Or change ports in `docker-compose.yml`

### Database Connection Failed

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres
```

### Frontend Can't Connect to Backend

Check `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

For production, change to your domain:
```env
VITE_API_URL=https://yourdomain.com/api
```

### Migrations Not Running

Migrations only run on fresh database. If you need to re-run:

```bash
# Delete database volume and restart
docker-compose down -v
docker-compose up --build -d
```

## Default Data

The application comes with:

**Default Users:**
- Admin: admin@credstore.com
- Senior: senior@credstore.com  
- Junior: junior@credstore.com
- All passwords: `admin123`

**Default Groups:**
- admin (full access)
- senior (limited access)
- junior (restricted access)

**Default Folders:**
- UAT (User Acceptance Testing)
- Production
- Development
- QA (Quality Assurance)

## Features

- ✅ Secure credential storage with AES-256 encryption
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/User)
- ✅ Dynamic user groups (create custom teams)
- ✅ Folder-based permissions
- ✅ Document management with S3 or local storage
- ✅ Password change functionality
- ✅ Dark/Light mode
- ✅ Responsive design

## Architecture

```
Frontend (React)  →  Backend (Go)  →  PostgreSQL
     ↓                    ↓
  Port 5173          Port 8080
                          ↓
                    AWS S3 (optional)
```

## Support

For issues or questions:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Check [AWS_S3_SETUP.md](AWS_S3_SETUP.md) for S3 configuration
- Open an issue on GitHub

## Security Best Practices

1. **Never commit .env files to Git**
2. **Change all default passwords**
3. **Use strong JWT_SECRET (32+ characters)**
4. **Rotate AWS credentials regularly**
5. **Enable HTTPS in production**
6. **Set up regular database backups**
7. **Monitor access logs**
8. **Keep Docker images updated**

## License

MIT License - see [LICENSE](LICENSE) file
