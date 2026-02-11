package models

import "time"

type Folder struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type FolderPermission struct {
	ID        int    `json:"id"`
	FolderID  int    `json:"folder_id"`
	UserGroup string `json:"user_group"`
	CanRead   bool   `json:"can_read"`
	CanWrite  bool   `json:"can_write"`
	CanDelete bool   `json:"can_delete"`
}

type FolderWithPermissions struct {
	Folder
	Permissions []FolderPermission  `json:"permissions"`
	UserAccess  *FolderPermission   `json:"user_access,omitempty"`
}

type CreateFolderRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdatePermissionRequest struct {
	UserGroup string `json:"user_group" binding:"required"`
	CanRead   bool   `json:"can_read"`
	CanWrite  bool   `json:"can_write"`
	CanDelete bool   `json:"can_delete"`
}
