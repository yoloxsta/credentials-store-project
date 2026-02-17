package models

import "time"

type Service struct {
	ID          int       `json:"id"`
	ServiceName string    `json:"service_name"`
	Hostname    string    `json:"hostname"`
	IPAddress   string    `json:"ip_address"`
	Port        int       `json:"port"`
	Description string    `json:"description"`
	UserID      int       `json:"user_id"`
	FolderID    *int      `json:"folder_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateServiceRequest struct {
	ServiceName string `json:"service_name" binding:"required"`
	Hostname    string `json:"hostname"`
	IPAddress   string `json:"ip_address"`
	Port        int    `json:"port"`
	Description string `json:"description"`
	FolderID    *int   `json:"folder_id"`
}

type UpdateServiceRequest struct {
	ServiceName string `json:"service_name"`
	Hostname    string `json:"hostname"`
	IPAddress   string `json:"ip_address"`
	Port        int    `json:"port"`
	Description string `json:"description"`
	FolderID    *int   `json:"folder_id"`
}
