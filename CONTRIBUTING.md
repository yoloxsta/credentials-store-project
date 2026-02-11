# Contributing to Credential Store

Thank you for your interest in contributing to Credential Store! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/credential-store.git
   cd credential-store
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/credential-store.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Go 1.21+ (for backend development)
- Node.js 18+ and npm (for frontend development)
- Git

### Local Development

#### Full Stack (Docker)

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Backend Only

```bash
cd backend

# Install dependencies
go mod download

# Run migrations manually (if needed)
# Connect to postgres and run migration files

# Start backend
go run cmd/server/main.go
```

#### Frontend Only

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the [existing issues](https://github.com/yourusername/credential-store/issues)
2. Verify the bug exists in the latest version

When creating a bug report, include:
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Docker version)
- Relevant logs

**Bug Report Template:**
```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., Ubuntu 20.04]
- Browser: [e.g., Chrome 120]
- Docker Version: [e.g., 24.0.0]

**Logs**
```
Paste relevant logs here
```

**Screenshots**
If applicable, add screenshots.
```

### Suggesting Features

Before suggesting a feature:
1. Check if it's already been suggested
2. Consider if it fits the project's scope

When suggesting a feature, include:
- Clear, descriptive title
- Detailed description of the feature
- Use cases and benefits
- Possible implementation approach
- Mockups or examples (if applicable)

**Feature Request Template:**
```markdown
**Feature Description**
A clear description of the feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
What other solutions have you considered?

**Additional Context**
Any other context, mockups, or examples.
```

### Contributing Code

1. **Find or create an issue** to work on
2. **Comment on the issue** to let others know you're working on it
3. **Fork and clone** the repository
4. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/issue-123-add-feature
   ```
5. **Make your changes** following our coding standards
6. **Test your changes** thoroughly
7. **Commit your changes** with clear messages
8. **Push to your fork**:
   ```bash
   git push origin feature/issue-123-add-feature
   ```
9. **Create a Pull Request** on GitHub

## Coding Standards

### Go (Backend)

- Follow [Effective Go](https://golang.org/doc/effective_go.html)
- Use `gofmt` for formatting
- Use meaningful variable and function names
- Add comments for exported functions
- Handle errors explicitly
- Use structured logging

**Example:**
```go
// GetUserByID retrieves a user by their ID
func (r *UserRepository) GetUserByID(id int) (*models.User, error) {
    var user models.User
    err := r.db.QueryRow(
        "SELECT id, email, role FROM users WHERE id = $1",
        id,
    ).Scan(&user.ID, &user.Email, &user.Role)
    
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %w", err)
    }
    
    return &user, nil
}
```

### JavaScript/React (Frontend)

- Use functional components with hooks
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful component and variable names
- Add PropTypes or TypeScript types
- Keep components small and focused
- Use consistent formatting (Prettier recommended)

**Example:**
```jsx
const CredentialList = ({ credentials, onEdit, onDelete, isAdmin }) => {
  const [showPassword, setShowPassword] = useState({})

  const togglePassword = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="space-y-4">
      {credentials.map(cred => (
        <CredentialCard
          key={cred.id}
          credential={cred}
          showPassword={showPassword[cred.id]}
          onTogglePassword={() => togglePassword(cred.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
```

### SQL

- Use lowercase for SQL keywords
- Use snake_case for table and column names
- Add indexes for frequently queried columns
- Use foreign key constraints
- Include comments for complex queries

**Example:**
```sql
-- Create documents table with permissions
create table if not exists documents (
    id serial primary key,
    filename varchar(255) not null,
    original_filename varchar(255) not null,
    file_size bigint not null,
    mime_type varchar(100),
    uploaded_by integer references users(id) on delete set null,
    description text,
    created_at timestamp default current_timestamp
);

-- Add index for faster lookups
create index idx_documents_uploaded_by on documents(uploaded_by);
```

### General Guidelines

- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Follow DRY (Don't Repeat Yourself)
- Use meaningful names
- Handle errors gracefully
- Write tests for new features

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(auth): add two-factor authentication

Implement 2FA using TOTP tokens. Users can enable 2FA in their
profile settings and must enter a code from their authenticator
app when logging in.

Closes #123
```

```
fix(documents): resolve file upload size limit issue

Increase Nginx client_max_body_size to 50MB to match backend
file upload limit. Previously, large files would fail silently.

Fixes #456
```

```
docs(readme): update installation instructions

Add troubleshooting section for common Docker issues and
clarify environment variable configuration.
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated (if needed)
- [ ] Tests added/updated (if applicable)
- [ ] All tests pass
- [ ] No merge conflicts with main branch

### PR Description Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #(issue number)

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe how you tested your changes.

## Screenshots (if applicable)
Add screenshots to demonstrate changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in the changelog

## Testing

### Backend Tests

```bash
cd backend
go test ./...
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Start all services
docker-compose up -d

# Run integration tests
# (Add your test commands here)
```

### Manual Testing Checklist

- [ ] Login/logout works
- [ ] User creation works (admin)
- [ ] Credential CRUD operations work
- [ ] Folder permissions work correctly
- [ ] Document upload/download works
- [ ] Document permissions work correctly
- [ ] Theme toggle works
- [ ] All tabs accessible
- [ ] Error messages display correctly
- [ ] Toast notifications appear

## Documentation

### When to Update Documentation

- Adding new features
- Changing existing functionality
- Fixing bugs that affect usage
- Adding new API endpoints
- Changing configuration options

### Documentation Files

- **README.md**: Overview, features, quick start
- **DEPLOYMENT.md**: Deployment instructions
- **CHANGELOG.md**: Version history and changes
- **CONTRIBUTING.md**: This file
- **API.md**: API documentation (if created)

### Code Comments

- Add comments for complex logic
- Document exported functions
- Explain "why" not "what"
- Keep comments up to date

## Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Ask in a new issue with the "question" label

## Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Credited in release notes
- Mentioned in README.md (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Credential Store! 🎉
