package repository

import (
	"credential-store/internal/models"
	"database/sql"
)

type CredentialRepository struct {
	db *sql.DB
}

func NewCredentialRepository(db *sql.DB) *CredentialRepository {
	return &CredentialRepository{db: db}
}

func (r *CredentialRepository) Create(cred *models.Credential) error {
	query := `INSERT INTO credentials (user_id, folder_id, service_name, username, password, notes) 
			  VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at, updated_at`
	return r.db.QueryRow(query, cred.UserID, cred.FolderID, cred.ServiceName, cred.Username, cred.Password, cred.Notes).
		Scan(&cred.ID, &cred.CreatedAt, &cred.UpdatedAt)
}

func (r *CredentialRepository) FindByUserID(userID int) ([]models.Credential, error) {
	query := `SELECT id, user_id, folder_id, service_name, username, password, notes, created_at, updated_at 
			  FROM credentials WHERE user_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var credentials []models.Credential
	for rows.Next() {
		var cred models.Credential
		if err := rows.Scan(&cred.ID, &cred.UserID, &cred.FolderID, &cred.ServiceName, &cred.Username, 
			&cred.Password, &cred.Notes, &cred.CreatedAt, &cred.UpdatedAt); err != nil {
			return nil, err
		}
		credentials = append(credentials, cred)
	}
	return credentials, nil
}

func (r *CredentialRepository) FindAll() ([]models.Credential, error) {
	query := `SELECT id, user_id, folder_id, service_name, username, password, notes, created_at, updated_at 
			  FROM credentials ORDER BY created_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var credentials []models.Credential
	for rows.Next() {
		var cred models.Credential
		if err := rows.Scan(&cred.ID, &cred.UserID, &cred.FolderID, &cred.ServiceName, &cred.Username, 
			&cred.Password, &cred.Notes, &cred.CreatedAt, &cred.UpdatedAt); err != nil {
			return nil, err
		}
		credentials = append(credentials, cred)
	}
	return credentials, nil
}

func (r *CredentialRepository) FindByID(id int) (*models.Credential, error) {
	cred := &models.Credential{}
	query := `SELECT id, user_id, folder_id, service_name, username, password, notes, created_at, updated_at 
			  FROM credentials WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&cred.ID, &cred.UserID, &cred.FolderID, &cred.ServiceName, 
		&cred.Username, &cred.Password, &cred.Notes, &cred.CreatedAt, &cred.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return cred, nil
}

func (r *CredentialRepository) Update(cred *models.Credential) error {
	query := `UPDATE credentials SET folder_id = $1, service_name = $2, username = $3, password = $4, 
			  notes = $5, updated_at = NOW() WHERE id = $6 RETURNING updated_at`
	return r.db.QueryRow(query, cred.FolderID, cred.ServiceName, cred.Username, cred.Password, 
		cred.Notes, cred.ID).Scan(&cred.UpdatedAt)
}

func (r *CredentialRepository) Delete(id int) error {
	query := `DELETE FROM credentials WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *CredentialRepository) FindByUserGroup(userGroup string) ([]models.Credential, error) {
	query := `
		SELECT DISTINCT c.id, c.user_id, c.folder_id, c.service_name, c.username, c.password, c.notes, c.created_at, c.updated_at 
		FROM credentials c
		LEFT JOIN folders f ON c.folder_id = f.id
		LEFT JOIN folder_permissions fp ON f.id = fp.folder_id
		WHERE c.folder_id IS NULL 
		   OR (fp.user_group = $1 AND fp.can_read = true)
		ORDER BY c.created_at DESC`
	
	rows, err := r.db.Query(query, userGroup)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var credentials []models.Credential
	for rows.Next() {
		var cred models.Credential
		if err := rows.Scan(&cred.ID, &cred.UserID, &cred.FolderID, &cred.ServiceName, &cred.Username, 
			&cred.Password, &cred.Notes, &cred.CreatedAt, &cred.UpdatedAt); err != nil {
			return nil, err
		}
		credentials = append(credentials, cred)
	}
	return credentials, nil
}
