# Changelog

All notable changes to the Credential Store project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-02-17

### Added

#### Services/Infrastructure Management
- **Services Tab** - Track and manage servers and infrastructure
  - Service name, hostname, IP address, port, and description
  - Optional folder assignment for organization
  - Copy-to-clipboard for hostname and IP address
  - Admin-only create/edit/delete operations
  - All users can view services based on folder permissions
- **Backend Implementation**
  - New `services` table with migration `008_add_services.sql`
  - Full CRUD API: POST/GET/PUT/DELETE `/api/services`
  - `ServiceRepository` with optimized queries (no duplicate results)
  - `ServiceService` for business logic
  - `ServiceHandler` for HTTP endpoints
  - Permission-based access using folder permissions
- **Frontend Implementation**
  - New `ServiceList.jsx` component with modern card design
  - New `ServiceForm.jsx` for creating/editing services
  - Services tab in Dashboard
  - Copy buttons for hostname and IP address
  - Visual feedback on copy (green checkmark + "Copied!")
  - Dark mode support
  - Server icon with green gradient theme
- **Query Optimization**
  - Fixed duplicate service results from JOIN queries
  - Changed from LEFT JOIN to EXISTS subquery for better performance
  - Ensures each service appears only once in results

#### Search Functionality
- **Credentials Search**
  - Real-time search bar in Credentials tab
  - Filters by service name or username
  - Case-insensitive search
  - Magnifying glass icon
  - Blue focus ring
- **Services Search**
  - Real-time search bar in Services tab
  - Filters by service name, hostname, IP address, or description
  - Case-insensitive search
  - Magnifying glass icon
  - Green focus ring
- **User Experience**
  - Instant filtering as you type
  - Search persists while navigating within tab
  - Clear visual design with icons
  - Responsive layout
  - Dark mode support

### Changed
- **Profile Menu Enhancement**
  - Moved from inline display to dropdown menu
  - Avatar circle shows first letter of username
  - Click avatar to open dropdown menu
  - Dropdown shows: full email, role badge, group badge
  - "Change Password" option in dropdown
  - "Sign Out" button in dropdown
  - Click outside to close menu
  - Smooth animations and transitions
  - Better use of header space

### Fixed
- **Service Query Duplicates**
  - Fixed duplicate services appearing when folder has multiple permissions
  - Changed from `LEFT JOIN folder_permissions` to `EXISTS` subquery
  - Ensures each service appears exactly once
  - Improved query performance
- **Docker Build Caching**
  - Fixed frontend not rebuilding with code changes
  - Added `--no-cache` flag for clean builds
  - Improved deployment reliability

### Technical Details
- Services table: id, service_name, hostname, ip_address, port, description, user_id, folder_id, created_at, updated_at
- Search uses JavaScript `.filter()` with `.toLowerCase().includes()`
- Service queries use `EXISTS` instead of `JOIN` to prevent duplicates
- Copy functionality uses `navigator.clipboard.writeText()` API
- Search state managed with React `useState` hooks
- Profile dropdown uses click-outside detection

### Migration Notes
- **For Existing Databases**: Run migration 008 manually:
  ```sql
  CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      service_name VARCHAR(255) NOT NULL,
      hostname VARCHAR(255),
      ip_address VARCHAR(45),
      port INTEGER DEFAULT 0,
      description TEXT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **For New Deployments**: Migration runs automatically on first startup

### Use Cases
- **Services Management**: Track production servers, databases, APIs, microservices
- **Infrastructure Documentation**: Maintain inventory of all infrastructure
- **Quick Access**: Copy hostnames and IPs for SSH, database connections, API calls
- **Team Collaboration**: Share server information with team based on folder permissions
- **Search**: Quickly find servers by name, hostname, IP, or description

## [1.3.1] - 2026-02-16

### Added

#### Copy to Clipboard Feature
- **One-Click Copy Buttons**
  - Copy username with single click
  - Copy password with single click
  - Visual feedback when copied (green checkmark + "Copied!" text)
  - Auto-reset after 2 seconds
  - Works with browser's native clipboard API
- **User Experience**
  - Copy icon buttons next to username and password fields
  - Smooth transition animations
  - Dark mode support
  - Accessible with keyboard navigation
- **Security**
  - Clipboard cleared automatically after 2 seconds
  - No server-side changes required
  - Works entirely in browser

### Technical Details
- Uses `navigator.clipboard.writeText()` API
- State management for visual feedback
- Unique field IDs for tracking copied state
- Fallback error handling for clipboard failures

## [1.3.0] - 2026-02-12

### Added

#### Custom Favicon
- **Brand Identity**
  - Replaced default Vite logo with custom lock icon favicon
  - Blue-purple gradient design matching application theme
  - SVG format for crisp display at all sizes
  - Professional branding for browser tabs and bookmarks

#### Dynamic Groups System
- **Groups Management Tab** (Admin only)
  - Create, edit, and delete user groups dynamically
  - No more hardcoded groups - fully database-driven
  - Add custom groups like DevOps, QA, Intern, etc.
  - Real-time group management without code changes
- **Backend Implementation**
  - New `groups` table with migration `006_create_groups_table.sql`
  - Full CRUD API for groups: POST/GET/PUT/DELETE `/api/groups`
  - `GroupRepository` for database operations
  - `GroupService` for business logic
  - `GroupHandler` for HTTP endpoints
  - Default groups seeded: admin, senior, junior
- **Frontend Implementation**
  - New `GroupManager.jsx` component with full CRUD UI
  - Groups tab in Dashboard (admin only)
  - Create/Edit/Delete group operations
  - Dark mode support
  - Toast notifications for operations
- **Integration**
  - FolderManager fetches groups dynamically from API
  - DocumentManager fetches groups dynamically from API
  - UserManager fetches groups dynamically from API
  - All components now fully synchronized with Groups table
  - Groups API requires admin authentication

#### Automatic Permission Cleanup
- **Cascade Delete for Groups**
  - When a group is deleted, all associated permissions are automatically removed
  - Cleans up folder permissions for deleted groups
  - Cleans up document permissions for deleted groups
  - Prevents orphaned permissions in database
  - No manual cleanup required
- **Smart Permission Display**
  - Document list only shows permissions with actual access granted
  - Hides permissions where both can_view and can_download are false
  - Keeps UI clean and focused on meaningful permissions

#### Folder Delete Functionality
- **Delete Folders**
  - Red trash icon button on each folder
  - Confirmation dialog before deletion
  - Safety check: prevents deletion if folder contains credentials
  - Admin-only operation
- **Backend Implementation**
  - `Delete` method in FolderRepository
  - `DeleteFolder` method in FolderService with safety checks
  - `DELETE /api/folders/:id` endpoint
- **Frontend Implementation**
  - Delete button with trash icon
  - Confirmation dialog
  - Error handling for folders with credentials
  - Success/error toast notifications

### Changed
- **Document Security Enhancement**
  - Changed from presigned S3 URLs to backend proxy streaming
  - AWS credentials no longer exposed in URLs
  - Documents now served through: `http://localhost:8080/api/documents/:id/view?token=JWT`
  - Backend downloads from S3 and streams directly to user
  - JWT tokens in URLs are temporary (24-hour expiry) and signed
- **UserManager Fully Dynamic**
  - Now fetches groups from API instead of hardcoded list
  - Automatically syncs with Groups table
  - Shows only groups that exist in database
  - When group is deleted, it disappears from user creation dropdown
- **DocumentManager Fully Dynamic**
  - Fetches groups from API for permission management
  - Shows all existing groups in permission editor
  - Filters out permissions with no access in display
- **FolderManager Fully Dynamic**
  - Fetches groups from API for permission management
  - Shows all existing groups in permission editor

### Fixed
- Fixed `.gitignore` to properly exclude compiled binaries while including source files
- Removed AWS credentials from `.env` file in repository
- Fixed file caching issues in Docker builds
- Fixed UserManager to properly handle dynamic groups without white screen
- Fixed orphaned permissions showing in document list
- Fixed permission display to hide groups with no access

### Security
- **AWS Credentials Protection**
  - AWS Access Key ID no longer exposed in document URLs
  - All S3 operations now proxied through backend
  - JWT tokens used for document access (temporary, signed, expire in 24 hours)
  - Credentials stored only in backend `.env` file (not in repository)
- **Permission Integrity**
  - Automatic cleanup prevents orphaned permissions
  - Groups cannot be deleted if users exist in that group
  - Cascade delete ensures referential integrity

### Documentation
- Updated SETUP.md with comprehensive setup instructions
- Updated README.md with quick start guide
- Created AWS_S3_SETUP.md for S3 configuration
- Added PUSH_TO_GITHUB.md with GitHub push checklist
- Added GITHUB_PUSH_CHECKLIST.md for pre-push verification

### Technical Details
- Groups table with id, name, description, created_at columns
- Migration 006 creates groups table and seeds default groups
- Groups API endpoints require admin role
- Document streaming uses `io.Copy` for efficient file transfer
- JWT tokens in document URLs provide temporary access control
- Cascade delete implemented in GroupService.Delete method
- Permission cleanup methods: DeleteFolderPermissions, DeleteDocumentPermissions
- Frontend filter: `.filter(perm => perm.can_view || perm.can_download)`

### Migration Notes
- **For Existing Databases**: Run migration 006 manually:
  ```sql
  CREATE TABLE IF NOT EXISTS groups (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  INSERT INTO groups (name, description) VALUES 
    ('admin', 'Administrator group with full access'),
    ('senior', 'Senior team members'),
    ('junior', 'Junior team members')
  ON CONFLICT (name) DO NOTHING;
  ```
- **Clean up orphaned permissions** (one-time):
  ```sql
  DELETE FROM document_permissions WHERE user_group NOT IN (SELECT name FROM groups);
  DELETE FROM folder_permissions WHERE user_group NOT IN (SELECT name FROM groups);
  ```
- **For New Deployments**: Migration runs automatically on first startup

### Known Limitations
- Groups cannot be deleted if users exist in that group (safety check)
- Group names must be unique
- No group rename functionality (would require updating all user records)

## [1.2.0] - 2026-02-12

### Added

#### Change Password Feature
- **User Password Management**
  - Users can now change their own password from the dashboard
  - Secure password change with current password verification
  - New password must be at least 6 characters
  - Password confirmation validation
  - Real-time error feedback
- **Backend Implementation**
  - New `ChangePasswordRequest` model with validation
  - `UpdatePassword` repository method for secure password updates
  - `ChangePassword` service method with bcrypt verification
  - `ChangePassword` handler with authentication check
  - New API endpoint: `PUT /api/auth/change-password` (authenticated users only)
- **Frontend Implementation**
  - New `ChangePassword.jsx` modal component
  - Key icon button in dashboard header for easy access
  - Form validation for password matching and minimum length
  - Toast notifications for success/error feedback
  - Dark mode support
- **Security**
  - Current password verification before allowing change
  - bcrypt hashing for new passwords
  - JWT authentication required
  - No admin privileges needed (users can change their own password)

### Fixed
- Fixed `.gitignore` issue that was excluding `main.go` file
  - Changed `main` to `/main` to only ignore compiled binary in root
  - Added `backend/cmd/server/main.go` to repository
- Fixed authentication context key mismatch
  - Middleware uses `user_id` (with underscore)
  - Handler now correctly retrieves `user_id` instead of `userID`

### Technical Details
- Password validation: minimum 6 characters
- Current password verification using bcrypt.CompareHashAndPassword
- New password hashing using bcrypt.GenerateFromPassword with DefaultCost
- Modal UI with responsive design and accessibility support

## [1.1.0] - 2026-02-11

### Added

#### AWS S3 Integration
- **S3 Service** (`backend/internal/services/s3_service.go`)
  - Upload files to AWS S3
  - Download files from S3
  - Delete files from S3
  - Generate presigned URLs for secure temporary access (15-minute expiry)
- **Automatic Storage Detection**
  - Application automatically detects if S3 is configured
  - Falls back to local filesystem if S3 credentials not provided
  - No code changes needed to switch between storage modes
- **Environment Configuration**
  - Added AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
  - Optional configuration - works without S3
- **Documentation**
  - Comprehensive AWS_S3_SETUP.md guide
  - S3 bucket creation instructions
  - IAM user setup
  - Security best practices
  - Cost estimation
  - Troubleshooting guide

### Changed
- **Document Handler** updated to support both S3 and local storage
- **Docker Compose** now uses `env_file` directive for cleaner configuration
- **Frontend Download** simplified to work with S3 presigned URLs
- Removed obsolete `version` attribute from docker-compose.yml

### Fixed
- Presigned URL expiration issue (was expiring immediately)
- Document download with S3 storage
- Document view with S3 storage

### Technical Details
- Added `github.com/aws/aws-sdk-go` dependency
- Presigned URLs valid for 15 minutes
- Supports unlimited file storage with S3
- 99.999999999% durability with S3
- Cost-effective storage (~$0.50/month for 1000 documents)

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
