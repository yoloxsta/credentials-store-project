-- Create default users
-- All passwords are: admin123
-- Hashed with bcrypt cost 10

-- Admin user
INSERT INTO users (email, password, role, user_group) VALUES
    ('admin@credstore.com', '$2a$10$0fM7jzHOqZ8u3CJUsfBrd.Z0f271s3x7VJI4ict3suEH3eLElpYHC', 'admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Senior user  
INSERT INTO users (email, password, role, user_group) VALUES
    ('senior@credstore.com', '$2a$10$0fM7jzHOqZ8u3CJUsfBrd.Z0f271s3x7VJI4ict3suEH3eLElpYHC', 'user', 'senior')
ON CONFLICT (email) DO NOTHING;

-- Junior user
INSERT INTO users (email, password, role, user_group) VALUES
    ('junior@credstore.com', '$2a$10$0fM7jzHOqZ8u3CJUsfBrd.Z0f271s3x7VJI4ict3suEH3eLElpYHC', 'user', 'junior')
ON CONFLICT (email) DO NOTHING;
