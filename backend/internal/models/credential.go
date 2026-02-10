package models

import "time"

type Credential struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	FolderID    *int      `json:"folder_id"`
	ServiceName string    `json:"service_name"`
	Username    string    `json:"username"`
	Password    string    `json:"password"`
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateCredentialRequest struct {
	FolderID    *int   `json:"folder_id"`
	ServiceName string `json:"service_name" binding:"required"`
	Username    string `json:"username" binding:"required"`
	Password    string `json:"password" binding:"required"`
	Notes       string `json:"notes"`
}

type UpdateCredentialRequest struct {
	FolderID    *int   `json:"folder_id"`
	ServiceName string `json:"service_name"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	Notes       string `json:"notes"`
}
