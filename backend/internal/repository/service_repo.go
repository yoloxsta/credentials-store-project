package repository

import (
	"credential-store/internal/models"
	"database/sql"
)

type ServiceRepository struct {
	db *sql.DB
}

func NewServiceRepository(db *sql.DB) *ServiceRepository {
	return &ServiceRepository{db: db}
}

func (r *ServiceRepository) Create(service *models.Service) error {
	query := `INSERT INTO services (service_name, hostname, ip_address, port, description, user_id, folder_id) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7) 
			  RETURNING id, created_at, updated_at`
	return r.db.QueryRow(query, service.ServiceName, service.Hostname, service.IPAddress, 
		service.Port, service.Description, service.UserID, service.FolderID).
		Scan(&service.ID, &service.CreatedAt, &service.UpdatedAt)
}

func (r *ServiceRepository) FindAll(userID int, userGroup string) ([]models.Service, error) {
	query := `SELECT s.id, s.service_name, s.hostname, s.ip_address, s.port, s.description, 
			  s.user_id, s.folder_id, s.created_at, s.updated_at
			  FROM services s
			  WHERE s.user_id = $1 
			     OR s.folder_id IS NULL
			     OR EXISTS (
			         SELECT 1 FROM folder_permissions fp 
			         WHERE fp.folder_id = s.folder_id 
			         AND fp.user_group = $2
			     )
			  ORDER BY s.created_at DESC`
	
	rows, err := r.db.Query(query, userID, userGroup)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var services []models.Service
	for rows.Next() {
		var service models.Service
		err := rows.Scan(&service.ID, &service.ServiceName, &service.Hostname, &service.IPAddress,
			&service.Port, &service.Description, &service.UserID, &service.FolderID,
			&service.CreatedAt, &service.UpdatedAt)
		if err != nil {
			return nil, err
		}
		services = append(services, service)
	}
	return services, nil
}

func (r *ServiceRepository) FindByID(id int) (*models.Service, error) {
	service := &models.Service{}
	query := `SELECT id, service_name, hostname, ip_address, port, description, user_id, folder_id, created_at, updated_at 
			  FROM services WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&service.ID, &service.ServiceName, &service.Hostname,
		&service.IPAddress, &service.Port, &service.Description, &service.UserID, &service.FolderID,
		&service.CreatedAt, &service.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return service, nil
}

func (r *ServiceRepository) Update(service *models.Service) error {
	query := `UPDATE services SET service_name = $1, hostname = $2, ip_address = $3, port = $4, 
			  description = $5, folder_id = $6, updated_at = CURRENT_TIMESTAMP 
			  WHERE id = $7`
	_, err := r.db.Exec(query, service.ServiceName, service.Hostname, service.IPAddress,
		service.Port, service.Description, service.FolderID, service.ID)
	return err
}

func (r *ServiceRepository) Delete(id int) error {
	query := `DELETE FROM services WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
