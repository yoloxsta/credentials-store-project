-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    hostname VARCHAR(255),
    ip_address VARCHAR(45),
    port INTEGER,
    description TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_folder_id ON services(folder_id);
