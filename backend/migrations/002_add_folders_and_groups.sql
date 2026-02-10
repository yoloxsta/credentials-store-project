-- Add group column to users table
ALTER TABLE users ADD COLUMN user_group VARCHAR(50) NOT NULL DEFAULT 'junior';

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create folder_permissions table
CREATE TABLE IF NOT EXISTS folder_permissions (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    user_group VARCHAR(50) NOT NULL,
    can_read BOOLEAN DEFAULT FALSE,
    can_write BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    UNIQUE(folder_id, user_group)
);

-- Add folder_id to credentials table
ALTER TABLE credentials ADD COLUMN folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL;

-- Insert default folders
INSERT INTO folders (name, description) VALUES 
    ('UAT', 'UAT environment credentials'),
    ('Production', 'Production environment credentials'),
    ('Development', 'Development environment credentials');

-- Set default permissions
-- UAT: All groups can read/write
INSERT INTO folder_permissions (folder_id, user_group, can_read, can_write, can_delete) VALUES
    ((SELECT id FROM folders WHERE name = 'UAT'), 'admin', true, true, true),
    ((SELECT id FROM folders WHERE name = 'UAT'), 'senior', true, true, true),
    ((SELECT id FROM folders WHERE name = 'UAT'), 'junior', true, true, false);

-- Production: Only admin and senior
INSERT INTO folder_permissions (folder_id, user_group, can_read, can_write, can_delete) VALUES
    ((SELECT id FROM folders WHERE name = 'Production'), 'admin', true, true, true),
    ((SELECT id FROM folders WHERE name = 'Production'), 'senior', true, true, false);

-- Development: All groups
INSERT INTO folder_permissions (folder_id, user_group, can_read, can_write, can_delete) VALUES
    ((SELECT id FROM folders WHERE name = 'Development'), 'admin', true, true, true),
    ((SELECT id FROM folders WHERE name = 'Development'), 'senior', true, true, true),
    ((SELECT id FROM folders WHERE name = 'Development'), 'junior', true, true, false);

CREATE INDEX idx_folder_permissions_folder_group ON folder_permissions(folder_id, user_group);
CREATE INDEX idx_credentials_folder_id ON credentials(folder_id);

-- Create default users (password is 'admin123' for all)
-- Password hash generated with bcrypt cost 10
INSERT INTO users (email, password, role, user_group) VALUES
    ('admin@example.com', '$2a$10$rQ8K8WJxGxVYxGxGxGxGxOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'admin', 'admin'),
    ('senior@example.com', '$2a$10$rQ8K8WJxGxVYxGxGxGxGxOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'user', 'senior'),
    ('junior@example.com', '$2a$10$rQ8K8WJxGxVYxGxGxGxGxOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'user', 'junior')
ON CONFLICT (email) DO NOTHING;
