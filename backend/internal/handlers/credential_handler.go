package handlers

import (
	"credential-store/internal/models"
	"credential-store/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CredentialHandler struct {
	credService *services.CredentialService
}

func NewCredentialHandler(credService *services.CredentialService) *CredentialHandler {
	return &CredentialHandler{credService: credService}
}

func (h *CredentialHandler) Create(c *gin.Context) {
	var req models.CreateCredentialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetInt("user_id")
	cred, err := h.credService.Create(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create credential: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, cred)
}

func (h *CredentialHandler) GetAll(c *gin.Context) {
	userID := c.GetInt("user_id")
	role := c.GetString("role")
	userGroup := c.GetString("user_group")
	isAdmin := role == "admin"

	credentials, err := h.credService.GetAll(userID, isAdmin, userGroup)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch credentials"})
		return
	}

	c.JSON(http.StatusOK, credentials)
}

func (h *CredentialHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userID := c.GetInt("user_id")
	role := c.GetString("role")
	isAdmin := role == "admin"

	cred, err := h.credService.GetByID(id, userID, isAdmin)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cred)
}

func (h *CredentialHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req models.UpdateCredentialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetInt("user_id")
	role := c.GetString("role")
	isAdmin := role == "admin"

	cred, err := h.credService.Update(id, userID, isAdmin, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cred)
}

func (h *CredentialHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userID := c.GetInt("user_id")
	role := c.GetString("role")
	isAdmin := role == "admin"

	if err := h.credService.Delete(id, userID, isAdmin); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "credential deleted"})
}
