package repository

import (
	"credential-store/internal/models"
	"database/sql"
)

type FolderRepository struct {
	db *sql.DB
}

func NewFolderRepository(db *sql.DB) *FolderRepository {
	return &FolderRepository{db: db}
}

func (r *FolderRepository) Create(folder *models.Folder) error {
	query := `INSERT INTO folders (name, description) VALUES ($1, $2) RETURNING id, created_at`
	return r.db.QueryRow(query, folder.Name, folder.Description).Scan(&folder.ID, &folder.CreatedAt)
}

func (r *FolderRepository) FindAll() ([]models.Folder, error) {
	query := `SELECT id, name, description, created_at FROM folders ORDER BY name`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var folders []models.Folder
	for rows.Next() {
		var folder models.Folder
		if err := rows.Scan(&folder.ID, &folder.Name, &folder.Description, &folder.CreatedAt); err != nil {
			return nil, err
		}
		folders = append(folders, folder)
	}
	return folders, nil
}

func (r *FolderRepository) FindByID(id int) (*models.Folder, error) {
	folder := &models.Folder{}
	query := `SELECT id, name, description, created_at FROM folders WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&folder.ID, &folder.Name, &folder.Description, &folder.CreatedAt)
	if err != nil {
		return nil, err
	}
	return folder, nil
}

func (r *FolderRepository) GetPermission(folderID int, userGroup string) (*models.FolderPermission, error) {
	perm := &models.FolderPermission{}
	query := `SELECT id, folder_id, user_group, can_read, can_write, can_delete 
			  FROM folder_permissions WHERE folder_id = $1 AND user_group = $2`
	err := r.db.QueryRow(query, folderID, userGroup).Scan(
		&perm.ID, &perm.FolderID, &perm.UserGroup, &perm.CanRead, &perm.CanWrite, &perm.CanDelete)
	if err != nil {
		return nil, err
	}
	return perm, nil
}

func (r *FolderRepository) GetAllPermissions(folderID int) ([]models.FolderPermission, error) {
	query := `SELECT id, folder_id, user_group, can_read, can_write, can_delete 
			  FROM folder_permissions WHERE folder_id = $1`
	rows, err := r.db.Query(query, folderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var perms []models.FolderPermission
	for rows.Next() {
		var perm models.FolderPermission
		if err := rows.Scan(&perm.ID, &perm.FolderID, &perm.UserGroup, 
			&perm.CanRead, &perm.CanWrite, &perm.CanDelete); err != nil {
			return nil, err
		}
		perms = append(perms, perm)
	}
	return perms, nil
}

func (r *FolderRepository) SetPermission(perm *models.FolderPermission) error {
	query := `INSERT INTO folder_permissions (folder_id, user_group, can_read, can_write, can_delete)
			  VALUES ($1, $2, $3, $4, $5)
			  ON CONFLICT (folder_id, user_group) 
			  DO UPDATE SET can_read = $3, can_write = $4, can_delete = $5
			  RETURNING id`
	return r.db.QueryRow(query, perm.FolderID, perm.UserGroup, 
		perm.CanRead, perm.CanWrite, perm.CanDelete).Scan(&perm.ID)
}

func (r *FolderRepository) Delete(folderID int) error {
	query := `DELETE FROM folders WHERE id = $1`
	_, err := r.db.Exec(query, folderID)
	return err
}
