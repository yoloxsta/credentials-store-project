package handlers

import (
	"credential-store/internal/models"
	"credential-store/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ServiceHandler struct {
	serviceService *services.ServiceService
}

func NewServiceHandler(serviceService *services.ServiceService) *ServiceHandler {
	return &ServiceHandler{serviceService: serviceService}
}

func (h *ServiceHandler) Create(c *gin.Context) {
	var req models.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	service, err := h.serviceService.CreateService(&req, userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create service"})
		return
	}

	c.JSON(http.StatusCreated, service)
}

func (h *ServiceHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userGroup, _ := c.Get("user_group")

	services, err := h.serviceService.GetAllServices(userID.(int), userGroup.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch services"})
		return
	}

	c.JSON(http.StatusOK, services)
}

func (h *ServiceHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	service, err := h.serviceService.GetServiceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "service not found"})
		return
	}

	c.JSON(http.StatusOK, service)
}

func (h *ServiceHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service, err := h.serviceService.UpdateService(id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update service"})
		return
	}

	c.JSON(http.StatusOK, service)
}

func (h *ServiceHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.serviceService.DeleteService(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "service deleted"})
}
