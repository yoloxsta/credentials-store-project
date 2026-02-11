package models

import "time"

type Document struct {
	ID               int                    `json:"id"`
	Filename         string                 `json:"filename"`
	OriginalFilename string                 `json:"original_filename"`
	FileSize         int64                  `json:"file_size"`
	MimeType         string                 `json:"mime_type"`
	UploadedBy       int                    `json:"uploaded_by"`
	UploaderEmail    string                 `json:"uploader_email,omitempty"`
	Description      string                 `json:"description"`
	Permissions      []DocumentPermission   `json:"permissions,omitempty"`
	CreatedAt        time.Time              `json:"created_at"`
	UpdatedAt        time.Time              `json:"updated_at"`
}

type DocumentPermission struct {
	ID          int    `json:"id"`
	DocumentID  int    `json:"document_id"`
	UserGroup   string `json:"user_group"`
	CanView     bool   `json:"can_view"`
	CanDownload bool   `json:"can_download"`
}

type DocumentUploadRequest struct {
	Description string `json:"description"`
}

type DocumentPermissionRequest struct {
	UserGroup   string `json:"user_group"`
	CanView     bool   `json:"can_view"`
	CanDownload bool   `json:"can_download"`
}
