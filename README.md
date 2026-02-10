# Credential Store

A full-stack credential management application with folder-based permissions and user group access control.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.21-00ADD8?logo=go)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)

## Features

- 🔐 User authentication with JWT
- 👥 Role-based access control (Admin/User)
- 📁 User group management (Admin, Senior, Junior)
- 🗂️ Folder-based permissions system
- 🔒 Secure credential storage with AES-256 encryption
- 👨‍💼 Admin-only user management
- ✨ CRUD operations for credentials and folders
- 🎨 Modern React frontend with Tailwind CSS
- 🚀 RESTful API backend in Go

## Tech Stack

### Backend
- Go 1.21
- Gin Web Framework
- PostgreSQL 15
- JWT Authentication
- bcrypt for password hashing
- AES-256 for credential encryption

### Frontend
- React 18
- React Router
- Axios
- Tailwind CSS
- Vite

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/credential-store.git
cd credential-store
```

2. Create environment files:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. (Optional) Update environment variables in `backend/.env`:
   - Change `JWT_SECRET` to a secure random string
   - Change `ENCRYPTION_KEY` to a secure 32-character string

4. Build and start all services:
```bash
docker-compose build
docker-compose up -d
```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

### Default User Accounts

All default passwords are: **admin123**

- **Admin**: admin@credstore.com (admin role, admin group)
- **Senior**: senior@credstore.com (user role, senior group)
- **Junior**: junior@credstore.com (user role, junior group)

⚠️ **Important**: Change these passwords immediately in production!

## User Groups & Permissions

The system has three user groups with different folder access levels:

- **Admin Group**: Full access to all folders and credentials
- **Senior Group**: Access to UAT and Production folders
- **Junior Group**: Access to UAT and Development folders

### Default Folders

- **UAT**: All groups can read/write, only admin/senior can delete
- **Production**: Only admin and senior groups can access
- **Development**: All groups can read/write, only admin/senior can delete

## User Management

Only administrators can create and manage users:

1. Login as admin (admin@credstore.com / admin123)
2. Navigate to "Manage Users" tab
3. Create new users with specific roles and groups
4. Edit or delete existing users

**Note**: Public signup is disabled. All users must be created by administrators.

## API Endpoints

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

### Credentials (Admin Only for Create/Update/Delete)
- `POST /api/credentials` - Create credential (admin only)
- `GET /api/credentials` - Get all accessible credentials
- `GET /api/credentials/:id` - Get credential by ID
- `PUT /api/credentials/:id` - Update credential (admin only)
- `DELETE /api/credentials/:id` - Delete credential (admin only)

## Development

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

## Environment Variables

### Backend
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=credstore
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=12345678901234567890123456789012
PORT=8080
```

### Frontend
```env
VITE_API_URL=http://localhost:8080/api
```

## Database Migrations

Migrations are automatically applied on container startup from the `backend/migrations` folder:
- `001_init.sql` - Initial schema
- `002_add_folders_and_groups.sql` - Folder permissions system
- `003_default_users.sql` - Default user accounts

## Project Structure

```
credential-store/
├── backend/
│   ├── cmd/server/          # Application entry point
│   ├── internal/
│   │   ├── handlers/        # HTTP request handlers
│   │   ├── middleware/      # Authentication & authorization
│   │   ├── models/          # Data models
│   │   ├── repository/      # Database operations
│   │   └── services/        # Business logic
│   ├── migrations/          # SQL migration files
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── App.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## Stopping the Application

```bash
docker-compose down
```

To remove all data including the database:
```bash
docker-compose down -v
```

## Security Considerations

- All passwords are hashed with bcrypt (cost 10)
- Credentials are encrypted with AES-256
- JWT tokens expire after 24 hours
- CORS is configured for specific origins
- SQL injection protection via parameterized queries
- Admin-only endpoints are protected with middleware

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with Go and React
- Uses Gin web framework
- Styled with Tailwind CSS
- Containerized with Docker
