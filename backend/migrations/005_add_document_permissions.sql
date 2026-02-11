-- Create document_permissions table
CREATE TABLE IF NOT EXISTS document_permissions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_group VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_download BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, user_group)
);

-- Create index for faster queries
CREATE INDEX idx_document_permissions_document_id ON document_permissions(document_id);
CREATE INDEX idx_document_permissions_user_group ON document_permissions(user_group);

-- Add default permissions for existing documents (if any)
-- Admin group gets full access to all documents
INSERT INTO document_permissions (document_id, user_group, can_view, can_download)
SELECT id, 'admin', true, true FROM documents
ON CONFLICT (document_id, user_group) DO NOTHING;

-- Senior group gets view and download access to all documents
INSERT INTO document_permissions (document_id, user_group, can_view, can_download)
SELECT id, 'senior', true, true FROM documents
ON CONFLICT (document_id, user_group) DO NOTHING;

-- Junior group gets view access only to all documents
INSERT INTO document_permissions (document_id, user_group, can_view, can_download)
SELECT id, 'junior', true, false FROM documents
ON CONFLICT (document_id, user_group) DO NOTHING;
