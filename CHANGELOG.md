# Changelog

All notable changes to the Credential Store project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-11

### Added

#### Core Features
- JWT-based authentication system with secure token management
- User registration and login functionality
- Role-based access control (Admin/User roles)
- User group system (Admin, Senior, Junior groups)
- Folder-based permission system for credentials
- AES-256-GCM encryption for credential storage
- bcrypt password hashing (cost 10)

#### Credential Management
- Create, read, update, delete (CRUD) operations for credentials
- Folder organization (UAT, Production, Development, QA)
- Folder-based filtering and access control
- Username and password fields with show/hide toggle
- Notes field for additional information
- Admin-only create/edit/delete operations
- View-only access for non-admin users

#### User Management
- Admin-only user creation and management
- Full CRUD operations for user accounts
- User group assignment (admin, senior, junior)
- Role assignment (admin, user)
- Public signup disabled for security
- Default user accounts for testing

#### Document Management System
- File upload functionality (admin-only)
- Document storage with persistent Docker volumes
- View documents directly in browser (inline viewing)
- Download documents with permission control
- Granular permissions per user group:
  - Can View: See and view document in browser
  - Can Download: Download document to device
- File metadata tracking (size, uploader, upload date, description)
- Support for various file types (PDF, images, text files, etc.)
- Maximum file size: 50MB

#### User Interface
- Professional dark mode (default theme)
- Light mode with theme toggle
- Theme preference persistence in localStorage
- Modern gradient design with smooth animations
- Responsive layout for all screen sizes
- Tab-based navigation (Credentials, Documents, Folders, Users)
- Toast notifications for user actions
- Enterprise-grade professional design
- SVG icons throughout the interface
- Loading states and spinners
- Form validation and error handling

#### Backend Architecture
- RESTful API design
- Gin web framework for HTTP routing
- PostgreSQL database with connection pooling
- Repository pattern for data access
- Service layer for business logic
- Middleware for authentication and authorization
- CORS configuration for cross-origin requests
- Structured logging
- Error handling and validation

#### Frontend Architecture
- React 18 with functional components
- React Router v6 for navigation
- Context API for state management (Auth, Theme)
- Axios for HTTP requests with interceptors
- Tailwind CSS for styling
- Vite for fast development and building
- Component-based architecture
- Protected routes with authentication

#### Database
- PostgreSQL 15 database
- Automated migrations on startup
- Five migration files:
  1. Initial schema (users, credentials)
  2. Folders and permissions system
  3. Default user accounts
  4. Document management tables
  5. Document permissions system
- Foreign key constraints
- Indexes for performance
- Default data seeding

#### Deployment
- Docker Compose for orchestration
- Multi-stage Docker builds for optimization
- Persistent volumes for database and uploads
- Environment variable configuration
- Automated deployment script (deploy.sh)
- Comprehensive deployment documentation
- Nginx reverse proxy configuration
- SSL/HTTPS setup with Let's Encrypt
- Firewall configuration guide
- Backup and restore procedures

#### Security Features
- JWT token expiration (24 hours)
- Secure password hashing with bcrypt
- AES-256-GCM encryption for sensitive data
- SQL injection protection via parameterized queries
- CORS restrictions
- Admin-only endpoint protection
- File upload validation and size limits
- Permission checks on all operations
- Secure file storage with access control
- Environment variable for secrets

#### Documentation
- Comprehensive README.md
- Detailed DEPLOYMENT.md guide
- API endpoint documentation
- User guide for admins and regular users
- Troubleshooting section
- Maintenance commands
- Security best practices
- Project structure overview

### Technical Details

#### Backend Stack
- Go 1.21
- Gin Web Framework
- PostgreSQL 15
- golang-jwt/jwt v5
- bcrypt
- lib/pq (PostgreSQL driver)
- godotenv for environment variables

#### Frontend Stack
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Vite
- Context API

#### Infrastructure
- Docker
- Docker Compose
- Nginx (optional, for production)
- Let's Encrypt (optional, for SSL)

### Default Configuration

#### Default Users
- Admin: admin@credstore.com / admin123 (admin role, admin group)
- Senior: senior@credstore.com / admin123 (user role, senior group)
- Junior: junior@credstore.com / admin123 (user role, junior group)

#### Default Folders
- UAT (User Acceptance Testing)
- Production
- Development
- QA (Quality Assurance)

#### Default Folder Permissions
- Admin group: Full access to all folders
- Senior group: Read/Write access to UAT and Production
- Junior group: Read/Write access to UAT and Development

#### Default Document Permissions (on upload)
- Admin: View ✓, Download ✓
- Senior: View ✓, Download ✓
- Junior: View ✓, Download ✗

### Known Limitations
- Maximum file upload size: 50MB
- JWT tokens expire after 24 hours (requires re-login)
- No password reset functionality (admin must reset)
- No email notifications
- No audit logging
- No two-factor authentication (2FA)

### Future Enhancements (Planned)
- Password reset via email
- Two-factor authentication (2FA)
- Audit logging for all operations
- Email notifications for important events
- Credential sharing between users
- Credential history and versioning
- Advanced search and filtering
- Bulk operations
- Export/import functionality
- API rate limiting
- Session management
- Password strength requirements
- Account lockout after failed attempts

## [0.1.0] - Initial Development

### Added
- Basic project structure
- Initial database schema
- Basic authentication
- Simple credential CRUD

---

## Version History

- **v1.0.0** (2026-02-11): First stable release with full feature set
- **v0.1.0**: Initial development version

## Upgrade Guide

### From Development to v1.0.0

If you have an existing development installation:

1. Backup your database:
```bash
docker exec credential-store-postgres-1 pg_dump -U postgres credstore > backup.sql
```

2. Pull latest changes:
```bash
git pull origin main
```

3. Rebuild containers:
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

4. New migrations will run automatically

5. Update default passwords immediately

## Support

For issues, questions, or contributions, please visit:
- GitHub Issues: https://github.com/yourusername/credential-store/issues
- Documentation: See README.md and DEPLOYMENT.md

## Contributors

Thank you to all contributors who helped build this project!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
