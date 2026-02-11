package repository

import (
	"database/sql"
	"credential-store/internal/models"
)

type DocumentRepository struct {
	db *sql.DB
}

func NewDocumentRepository(db *sql.DB) *DocumentRepository {
	return &DocumentRepository{db: db}
}

func (r *DocumentRepository) Create(doc *models.Document) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO documents (filename, original_filename, file_size, mime_type, uploaded_by, description)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	err = tx.QueryRow(
		query,
		doc.Filename,
		doc.OriginalFilename,
		doc.FileSize,
		doc.MimeType,
		doc.UploadedBy,
		doc.Description,
	).Scan(&doc.ID, &doc.CreatedAt, &doc.UpdatedAt)
	if err != nil {
		return err
	}

	// Create default permissions for all groups
	permQuery := `
		INSERT INTO document_permissions (document_id, user_group, can_view, can_download)
		VALUES 
			($1, 'admin', true, true),
			($1, 'senior', true, true),
			($1, 'junior', true, false)
	`
	_, err = tx.Exec(permQuery, doc.ID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *DocumentRepository) GetAll() ([]models.Document, error) {
	query := `
		SELECT d.id, d.filename, d.original_filename, d.file_size, d.mime_type, 
		       d.uploaded_by, u.email as uploader_email, d.description, d.created_at, d.updated_at
		FROM documents d
		LEFT JOIN users u ON d.uploaded_by = u.id
		ORDER BY d.created_at DESC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var documents []models.Document
	for rows.Next() {
		var doc models.Document
		err := rows.Scan(
			&doc.ID,
			&doc.Filename,
			&doc.OriginalFilename,
			&doc.FileSize,
			&doc.MimeType,
			&doc.UploadedBy,
			&doc.UploaderEmail,
			&doc.Description,
			&doc.CreatedAt,
			&doc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Get permissions for this document
		doc.Permissions, _ = r.GetPermissions(doc.ID)
		documents = append(documents, doc)
	}

	return documents, nil
}

func (r *DocumentRepository) GetPermissions(documentID int) ([]models.DocumentPermission, error) {
	query := `
		SELECT id, document_id, user_group, can_view, can_download
		FROM document_permissions
		WHERE document_id = $1
		ORDER BY user_group
	`
	rows, err := r.db.Query(query, documentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []models.DocumentPermission
	for rows.Next() {
		var perm models.DocumentPermission
		err := rows.Scan(&perm.ID, &perm.DocumentID, &perm.UserGroup, &perm.CanView, &perm.CanDownload)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, perm)
	}

	return permissions, nil
}

func (r *DocumentRepository) UpdatePermission(documentID int, userGroup string, canView, canDownload bool) error {
	query := `
		INSERT INTO document_permissions (document_id, user_group, can_view, can_download)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (document_id, user_group) 
		DO UPDATE SET can_view = $3, can_download = $4
	`
	_, err := r.db.Exec(query, documentID, userGroup, canView, canDownload)
	return err
}

func (r *DocumentRepository) CheckPermission(documentID int, userGroup string, permission string) (bool, error) {
	var hasPermission bool
	query := `
		SELECT CASE 
			WHEN $3 = 'view' THEN can_view
			WHEN $3 = 'download' THEN can_download
			ELSE false
		END
		FROM document_permissions
		WHERE document_id = $1 AND user_group = $2
	`
	err := r.db.QueryRow(query, documentID, userGroup, permission).Scan(&hasPermission)
	if err != nil {
		return false, err
	}
	return hasPermission, nil
}

func (r *DocumentRepository) GetByID(id int) (*models.Document, error) {
	query := `
		SELECT d.id, d.filename, d.original_filename, d.file_size, d.mime_type, 
		       d.uploaded_by, u.email as uploader_email, d.description, d.created_at, d.updated_at
		FROM documents d
		LEFT JOIN users u ON d.uploaded_by = u.id
		WHERE d.id = $1
	`
	var doc models.Document
	err := r.db.QueryRow(query, id).Scan(
		&doc.ID,
		&doc.Filename,
		&doc.OriginalFilename,
		&doc.FileSize,
		&doc.MimeType,
		&doc.UploadedBy,
		&doc.UploaderEmail,
		&doc.Description,
		&doc.CreatedAt,
		&doc.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Get permissions
	doc.Permissions, _ = r.GetPermissions(doc.ID)
	return &doc, nil
}

func (r *DocumentRepository) Delete(id int) error {
	query := `DELETE FROM documents WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
