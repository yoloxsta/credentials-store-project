# Credential Store

A full-stack enterprise credential management application with advanced folder-based permissions, user group access control, and document management system.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.21-00ADD8?logo=go)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)

## ✨ Features

### Security & Authentication
- 🔐 JWT-based authentication with secure token management
- 🔒 AES-256 encryption for credential storage
- 🔑 bcrypt password hashing (cost 10)
- 🔄 User password change functionality with current password verification
- 👥 Role-based access control (Admin/User)
- 🛡️ Folder-based permission system with granular access control

### User Management
- 👨‍💼 Admin-only user creation and management
- 📊 Dynamic user groups (fully customizable - add DevOps, QA, Intern, etc.)
- 🎯 Groups Management tab for creating/editing/deleting groups
- 🚫 Public signup disabled for security
- ✏️ Full CRUD operations for user accounts
- 🎯 Group-based folder access permissions

### Credential Management
- 📝 Secure credential storage with encryption
- 📁 Folder organization (UAT, Production, Development, QA)
- 👁️ View-only access for non-admin users
- ✍️ Admin-only create/edit/delete operations
- 🔍 Folder-based filtering and organization
- 📋 Username and password display with show/hide toggle
- 📋 One-click copy to clipboard for usernames and passwords
- 🔎 Real-time search by service name or username

### Services/Infrastructure Management
- 🖥️ Track servers, databases, APIs, and infrastructure
- 🌐 Store hostname, IP address, port, and description
- 📋 One-click copy to clipboard for hostnames and IPs
- 📁 Optional folder assignment for organization
- 🔎 Real-time search by name, hostname, IP, or description
- 👥 Permission-based access using folder permissions
- ✍️ Admin-only create/edit/delete operations

### Document Management System
- 📄 File upload and storage (admin-only upload)
- ☁️ AWS S3 integration with automatic fallback to local storage
- 👁️ View documents directly in browser (PDF, images, text files)
- ⬇️ Download with permission control
- 🔐 Granular permissions per user group (view/download)
- 📊 File metadata tracking (size, uploader, date)
- 💾 Persistent storage with Docker volumes or S3
- 🔗 Presigned URLs for secure temporary access (S3)

### User Interface
- 🎨 Professional dark mode (default)
- ☀️ Light mode toggle
- 🌓 Theme preference persistence
- 💫 Modern gradient design with smooth animations
- 📱 Responsive layout
- 🎯 Intuitive navigation with tab-based interface
- 👤 Dropdown profile menu with user info and quick actions
- ✅ Toast notifications for user actions
- 🔎 Real-time search functionality for credentials and services
- 🎭 Enterprise-grade professional design

### Technical Features
- 🚀 RESTful API backend in Go
- ⚡ Fast React frontend with Vite
- 🐳 Docker Compose for easy deployment
- 🗄️ PostgreSQL database with migrations
- 🔄 Automatic database initialization
- 📦 Persistent data volumes

## 🎯 Tech Stack

### Backend
- **Language**: Go 1.21
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL 15
- **Authentication**: JWT (golang-jwt/jwt)
- **Password Hashing**: bcrypt
- **Encryption**: AES-256-GCM
- **File Storage**: Local filesystem with Docker volumes

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start (5 minutes)

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/credential-store.git
cd credential-store
```

2. **Setup environment**:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env and change JWT_SECRET and ENCRYPTION_KEY
```

3. **Start the application**:
```bash
docker-compose up --build -d
```

4. **Access the app**:
- Frontend: http://localhost:5173
- Login: admin@credstore.com / admin123

📖 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

### Quick Start (Local Development)

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/credential-store.git
cd credential-store
```

2. **Create environment files**:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. **(Optional) Update environment variables** in `backend/.env`:
   - Change `JWT_SECRET` to a secure random string
   - Change `ENCRYPTION_KEY` to a secure 32-character string

4. **Build and start all services**:
```bash
docker-compose build
docker-compose up -d
```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

### Quick Deployment (AWS EC2)

**Minimum steps:**
```bash
# 1. Install Docker and Docker Compose on EC2
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER

# 2. Clone and configure
git clone https://github.com/yourusername/credential-store.git
cd credential-store
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Update frontend/.env with your EC2 IP
nano frontend/.env
# Change: VITE_API_URL=http://YOUR_EC2_IP:8080/api

# 4. Deploy
chmod +x deploy.sh
./deploy.sh
```

**That's it!** Access at `http://YOUR_EC2_IP:5173`

📖 For detailed deployment guide including Nginx, SSL, and security hardening, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 👤 Default User Accounts

All default passwords are: **admin123**

| Email | Role | Group | Access Level |
|-------|------|-------|--------------|
| admin@credstore.com | admin | admin | Full access to everything |
| senior@credstore.com | user | senior | UAT, Production folders |
| junior@credstore.com | user | junior | UAT, Development folders |

⚠️ **Important**: Change these passwords immediately in production!

## 🔐 User Groups & Permissions

### User Groups

| Group | Credential Access | Document Access | User Management |
|-------|------------------|-----------------|-----------------|
| **Admin** | Full CRUD on all folders | Upload, view, download all | Create/edit/delete users |
| **Senior** | View UAT, Production | Configurable per document | View only |
| **Junior** | View UAT, Development | Configurable per document | View only |

### Default Folder Permissions

| Folder | Admin | Senior | Junior |
|--------|-------|--------|--------|
| **UAT** | Read/Write/Delete | Read/Write | Read/Write |
| **Production** | Read/Write/Delete | Read/Write | No access |
| **Development** | Read/Write/Delete | No access | Read/Write |
| **QA** | Read/Write/Delete | Read | Read |

### Document Permissions

Admins can configure per-document permissions for each user group:
- **Can View**: User can see and view the document in browser
- **Can Download**: User can download the document to their device

Default permissions when uploading:
- Admin: View ✓, Download ✓
- Senior: View ✓, Download ✓
- Junior: View ✓, Download ✗

## 📚 User Guide

### For Administrators

1. **Login** with admin@credstore.com / admin123
2. **Manage Users**: Create, edit, or delete user accounts
3. **Manage Folders**: Create folders and set group permissions
4. **Manage Credentials**: Add, edit, or delete credentials in any folder
5. **Upload Documents**: Upload files and set view/download permissions
6. **Configure Permissions**: Control who can access each document

### For Regular Users (Senior/Junior)

1. **Login** with your credentials
2. **View Credentials**: Browse credentials in folders you have access to
3. **View Documents**: Access documents based on your permissions
4. **Download Documents**: Download files if you have download permission
5. **Toggle Theme**: Switch between dark and light mode

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (public)
- `POST /api/auth/signup` - Register new user (admin only)

### User Management (Admin Only)
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Folders (Authenticated)
- `GET /api/folders` - Get all folders with permissions
- `POST /api/folders` - Create folder (admin only)
- `PUT /api/folders/:id/permissions` - Update folder permissions (admin only)

### Credentials
- `POST /api/credentials` - Create credential (admin only)
- `GET /api/credentials` - Get all accessible credentials
- `GET /api/credentials/:id` - Get credential by ID
- `PUT /api/credentials/:id` - Update credential (admin only)
- `DELETE /api/credentials/:id` - Delete credential (admin only)

### Documents
- `POST /api/documents` - Upload document (admin only)
- `GET /api/documents` - Get all accessible documents
- `GET /api/documents/:id/view` - View document in browser
- `GET /api/documents/:id/download` - Download document
- `PUT /api/documents/:id/permissions` - Update document permissions (admin only)
- `DELETE /api/documents/:id` - Delete document (admin only)

## 💻 Development

### Backend

```bash
cd backend
go mod download
go run cmd/server/main.go
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=credstore
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=12345678901234567890123456789012
PORT=8080

# AWS S3 Configuration (Optional - if not set, uses local storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=your-bucket-name
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8080/api
```

## 🗄️ Database Migrations

Migrations are automatically applied on container startup from the `backend/migrations` folder:

| Migration | Description |
|-----------|-------------|
| `001_init.sql` | Initial schema (users, credentials) |
| `002_add_folders_and_groups.sql` | Folder permissions system |
| `003_default_users.sql` | Default user accounts |
| `004_add_documents.sql` | Document management tables |
| `005_add_document_permissions.sql` | Document permission system |

## 📁 Project Structure

```
credential-store/
├── backend/
│   ├── cmd/server/              # Application entry point
│   ├── internal/
│   │   ├── handlers/            # HTTP request handlers
│   │   │   ├── auth_handler.go
│   │   │   ├── credential_handler.go
│   │   │   ├── folder_handler.go
│   │   │   └── document_handler.go
│   │   ├── middleware/          # Auth & authorization
│   │   ├── models/              # Data models
│   │   ├── repository/          # Database operations
│   │   └── services/            # Business logic
│   ├── migrations/              # SQL migration files
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── CredentialList.jsx
│   │   │   ├── CredentialForm.jsx
│   │   │   ├── FolderManager.jsx
│   │   │   ├── UserManager.jsx
│   │   │   ├── DocumentManager.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/            # API services
│   │   ├── context/             # React context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   └── App.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── deploy.sh
├── README.md
└── DEPLOYMENT.md
```

## 🛑 Stopping the Application

```bash
# Stop containers
docker-compose down

# Stop and remove all data including database
docker-compose down -v
```

## 🔒 Security Considerations

- ✅ All passwords hashed with bcrypt (cost 10)
- ✅ Credentials encrypted with AES-256-GCM
- ✅ JWT tokens expire after 24 hours
- ✅ CORS configured for specific origins
- ✅ SQL injection protection via parameterized queries
- ✅ Admin-only endpoints protected with middleware
- ✅ File upload size limits (50MB)
- ✅ Permission checks on all document operations
- ✅ Secure file storage with access control

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with Go and React
- Uses Gin web framework
- Styled with Tailwind CSS
- Containerized with Docker
- Inspired by enterprise security requirements
