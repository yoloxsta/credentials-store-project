package repository

import (
	"credential-store/internal/models"
	"database/sql"
)

type GroupRepository struct {
	db *sql.DB
}

func NewGroupRepository(db *sql.DB) *GroupRepository {
	return &GroupRepository{db: db}
}

func (r *GroupRepository) Create(group *models.Group) error {
	query := `INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING id, created_at`
	return r.db.QueryRow(query, group.Name, group.Description).Scan(&group.ID, &group.CreatedAt)
}

func (r *GroupRepository) FindAll() ([]models.Group, error) {
	query := `SELECT id, name, description, created_at FROM groups ORDER BY name`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []models.Group
	for rows.Next() {
		var group models.Group
		if err := rows.Scan(&group.ID, &group.Name, &group.Description, &group.CreatedAt); err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func (r *GroupRepository) FindByID(id int) (*models.Group, error) {
	group := &models.Group{}
	query := `SELECT id, name, description, created_at FROM groups WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&group.ID, &group.Name, &group.Description, &group.CreatedAt)
	if err != nil {
		return nil, err
	}
	return group, nil
}

func (r *GroupRepository) FindByName(name string) (*models.Group, error) {
	group := &models.Group{}
	query := `SELECT id, name, description, created_at FROM groups WHERE name = $1`
	err := r.db.QueryRow(query, name).Scan(&group.ID, &group.Name, &group.Description, &group.CreatedAt)
	if err != nil {
		return nil, err
	}
	return group, nil
}

func (r *GroupRepository) Update(group *models.Group) error {
	query := `UPDATE groups SET name = $1, description = $2 WHERE id = $3`
	_, err := r.db.Exec(query, group.Name, group.Description, group.ID)
	return err
}

func (r *GroupRepository) Delete(id int) error {
	query := `DELETE FROM groups WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *GroupRepository) CountUsers(groupName string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM users WHERE user_group = $1`
	err := r.db.QueryRow(query, groupName).Scan(&count)
	return count, err
}

func (r *GroupRepository) DeleteFolderPermissions(groupName string) error {
	query := `DELETE FROM folder_permissions WHERE user_group = $1`
	_, err := r.db.Exec(query, groupName)
	return err
}

func (r *GroupRepository) DeleteDocumentPermissions(groupName string) error {
	query := `DELETE FROM document_permissions WHERE user_group = $1`
	_, err := r.db.Exec(query, groupName)
	return err
}
