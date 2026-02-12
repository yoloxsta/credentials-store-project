package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"credential-store/internal/models"
	"credential-store/internal/repository"
	"credential-store/internal/services"

	"github.com/gin-gonic/gin"
)

type DocumentHandler struct {
	repo      *repository.DocumentRepository
	s3Service *services.S3Service
	useS3     bool
}

func NewDocumentHandler(repo *repository.DocumentRepository) *DocumentHandler {
	// Try to initialize S3 service
	s3Service, err := services.NewS3Service()
	useS3 := err == nil && s3Service != nil

	if !useS3 {
		// Fallback to local storage
		uploadPath := "./uploads"
		os.MkdirAll(uploadPath, 0755)
		fmt.Println("Using local file storage (S3 not configured)")
	} else {
		fmt.Println("Using AWS S3 for file storage")
	}

	return &DocumentHandler{
		repo:      repo,
		s3Service: s3Service,
		useS3:     useS3,
	}
}

func (h *DocumentHandler) Upload(c *gin.Context) {
	// Parse multipart form (max 50MB)
	err := c.Request.ParseMultipartForm(50 << 20)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get file"})
		return
	}
	defer file.Close()

	description := c.Request.FormValue("description")

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), strconv.Itoa(int(time.Now().UnixNano())), ext)

	var fileSize int64

	if h.useS3 {
		// Upload to S3
		fileBytes, err := io.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
			return
		}
		fileSize = int64(len(fileBytes))

		err = h.s3Service.UploadFromBytes(filename, fileBytes, header.Header.Get("Content-Type"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload to S3"})
			return
		}
	} else {
		// Upload to local storage
		uploadPath := "./uploads"
		filePath := filepath.Join(uploadPath, filename)

		dst, err := os.Create(filePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
		defer dst.Close()

		fileSize, err = io.Copy(dst, file)
		if err != nil {
			os.Remove(filePath)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
	}

	// Get user ID from context
	userID, _ := c.Get("user_id")

	// Save to database
	doc := &models.Document{
		Filename:         filename,
		OriginalFilename: header.Filename,
		FileSize:         fileSize,
		MimeType:         header.Header.Get("Content-Type"),
		UploadedBy:       userID.(int),
		Description:      description,
	}

	err = h.repo.Create(doc)
	if err != nil {
		// Cleanup on database error
		if h.useS3 {
			h.s3Service.Delete(filename)
		} else {
			os.Remove(filepath.Join("./uploads", filename))
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save document info"})
		return
	}

	c.JSON(http.StatusOK, doc)
}

func (h *DocumentHandler) GetAll(c *gin.Context) {
	documents, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch documents"})
		return
	}

	// Filter documents based on user permissions
	userGroup, exists := c.Get("user_group")
	role, _ := c.Get("role")
	
	// Admin sees all documents
	if role == "admin" {
		c.JSON(http.StatusOK, documents)
		return
	}

	// Filter for non-admin users
	if exists {
		var filteredDocs []models.Document
		for _, doc := range documents {
			canView, _ := h.repo.CheckPermission(doc.ID, userGroup.(string), "view")
			if canView {
				filteredDocs = append(filteredDocs, doc)
			}
		}
		c.JSON(http.StatusOK, filteredDocs)
		return
	}

	c.JSON(http.StatusOK, documents)
}

func (h *DocumentHandler) View(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	doc, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Check view permission
	role, _ := c.Get("role")
	if role != "admin" {
		userGroup, exists := c.Get("user_group")
		if exists {
			canView, _ := h.repo.CheckPermission(doc.ID, userGroup.(string), "view")
			if !canView {
				c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to view this document"})
				return
			}
		}
	}

	if h.useS3 {
		// Stream file from S3 through backend (hides AWS credentials)
		fileBytes, err := h.s3Service.Download(doc.Filename)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve file"})
			return
		}
		
		c.Header("Content-Type", doc.MimeType)
		c.Header("Content-Disposition", fmt.Sprintf("inline; filename=%s", doc.OriginalFilename))
		c.Header("Content-Length", strconv.FormatInt(int64(len(fileBytes)), 10))
		c.Data(http.StatusOK, doc.MimeType, fileBytes)
	} else {
		// Serve from local storage
		filePath := filepath.Join("./uploads", doc.Filename)
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}
		c.Header("Content-Type", doc.MimeType)
		c.Header("Content-Disposition", fmt.Sprintf("inline; filename=%s", doc.OriginalFilename))
		c.File(filePath)
	}
}

func (h *DocumentHandler) Download(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	doc, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Check download permission
	role, _ := c.Get("role")
	if role != "admin" {
		userGroup, exists := c.Get("user_group")
		if exists {
			canDownload, _ := h.repo.CheckPermission(doc.ID, userGroup.(string), "download")
			if !canDownload {
				c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to download this document"})
				return
			}
		}
	}

	if h.useS3 {
		// Stream file from S3 through backend (hides AWS credentials)
		fileBytes, err := h.s3Service.Download(doc.Filename)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve file"})
			return
		}
		
		c.Header("Content-Type", doc.MimeType)
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", doc.OriginalFilename))
		c.Header("Content-Length", strconv.FormatInt(int64(len(fileBytes)), 10))
		c.Data(http.StatusOK, doc.MimeType, fileBytes)
	} else {
		// Serve from local storage
		filePath := filepath.Join("./uploads", doc.Filename)
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", doc.OriginalFilename))
		c.Header("Content-Type", doc.MimeType)
		c.File(filePath)
	}
}

func (h *DocumentHandler) UpdatePermission(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	var req models.DocumentPermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	err = h.repo.UpdatePermission(id, req.UserGroup, req.CanView, req.CanDownload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update permission"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Permission updated successfully"})
}

func (h *DocumentHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	doc, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Delete file from storage
	if h.useS3 {
		h.s3Service.Delete(doc.Filename)
	} else {
		filePath := filepath.Join("./uploads", doc.Filename)
		os.Remove(filePath)
	}

	// Delete from database
	err = h.repo.Delete(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete document"})
		return
	}

	c.Status(http.StatusNoContent)
}
