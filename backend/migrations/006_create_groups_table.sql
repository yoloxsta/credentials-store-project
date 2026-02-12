-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default groups (migrate existing hardcoded groups)
INSERT INTO groups (name, description) VALUES
    ('admin', 'Administrator group with full access'),
    ('senior', 'Senior team members'),
    ('junior', 'Junior team members')
ON CONFLICT (name) DO NOTHING;

-- Note: We keep user_group as VARCHAR in users table for backward compatibility
-- The user_group field will reference groups.name
