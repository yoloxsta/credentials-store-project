package repository

import (
	"credential-store/internal/models"
	"database/sql"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	query := `INSERT INTO users (email, password, role, user_group) VALUES ($1, $2, $3, $4) RETURNING id, created_at`
	return r.db.QueryRow(query, user.Email, user.Password, user.Role, user.UserGroup).Scan(&user.ID, &user.CreatedAt)
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, email, password, role, user_group, created_at FROM users WHERE email = $1`
	err := r.db.QueryRow(query, email).Scan(&user.ID, &user.Email, &user.Password, &user.Role, &user.UserGroup, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) FindByID(id int) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, email, password, role, user_group, created_at FROM users WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&user.ID, &user.Email, &user.Password, &user.Role, &user.UserGroup, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) FindAll() ([]models.User, error) {
	query := `SELECT id, email, password, role, user_group, created_at FROM users ORDER BY created_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Email, &user.Password, &user.Role, &user.UserGroup, &user.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (r *UserRepository) Update(user *models.User) error {
	query := `UPDATE users SET email = $1, password = $2, role = $3, user_group = $4 WHERE id = $5`
	_, err := r.db.Exec(query, user.Email, user.Password, user.Role, user.UserGroup, user.ID)
	return err
}

func (r *UserRepository) Delete(id int) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
