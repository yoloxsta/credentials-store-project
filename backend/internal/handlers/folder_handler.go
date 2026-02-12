package handlers

import (
	"credential-store/internal/models"
	"credential-store/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FolderHandler struct {
	folderService *services.FolderService
}

func NewFolderHandler(folderService *services.FolderService) *FolderHandler {
	return &FolderHandler{folderService: folderService}
}

func (h *FolderHandler) GetAll(c *gin.Context) {
	userGroup := c.GetString("user_group")
	role := c.GetString("role")

	folders, err := h.folderService.GetAllWithPermissions(userGroup, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch folders"})
		return
	}

	c.JSON(http.StatusOK, folders)
}

func (h *FolderHandler) Create(c *gin.Context) {
	var req models.CreateFolderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	folder, err := h.folderService.Create(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create folder"})
		return
	}

	c.JSON(http.StatusCreated, folder)
}

func (h *FolderHandler) UpdatePermission(c *gin.Context) {
	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid folder id"})
		return
	}

	var req models.UpdatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	perm := &models.FolderPermission{
		FolderID:  folderID,
		UserGroup: req.UserGroup,
		CanRead:   req.CanRead,
		CanWrite:  req.CanWrite,
		CanDelete: req.CanDelete,
	}

	if err := h.folderService.UpdatePermission(perm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update permission"})
		return
	}

	c.JSON(http.StatusOK, perm)
}

func (h *FolderHandler) Delete(c *gin.Context) {
	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid folder id"})
		return
	}

	if err := h.folderService.Delete(folderID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete folder"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "folder deleted successfully"})
}
