package services

import (
	"credential-store/internal/models"
	"credential-store/internal/repository"
	"strconv"
)

type ServiceService struct {
	serviceRepo *repository.ServiceRepository
}

func NewServiceService(serviceRepo *repository.ServiceRepository) *ServiceService {
	return &ServiceService{serviceRepo: serviceRepo}
}

func (s *ServiceService) CreateService(req *models.CreateServiceRequest, userID int) (*models.Service, error) {
	service := &models.Service{
		ServiceName: req.ServiceName,
		Hostname:    req.Hostname,
		IPAddress:   req.IPAddress,
		Port:        req.Port,
		Description: req.Description,
		UserID:      userID,
		FolderID:    req.FolderID,
	}

	if err := s.serviceRepo.Create(service); err != nil {
		return nil, err
	}

	return service, nil
}

func (s *ServiceService) GetAllServices(userID int, userGroup string) ([]models.Service, error) {
	return s.serviceRepo.FindAll(userID, userGroup)
}

func (s *ServiceService) GetServiceByID(id string) (*models.Service, error) {
	serviceID, err := strconv.Atoi(id)
	if err != nil {
		return nil, err
	}
	return s.serviceRepo.FindByID(serviceID)
}

func (s *ServiceService) UpdateService(id string, req *models.UpdateServiceRequest) (*models.Service, error) {
	serviceID, err := strconv.Atoi(id)
	if err != nil {
		return nil, err
	}

	service, err := s.serviceRepo.FindByID(serviceID)
	if err != nil {
		return nil, err
	}

	if req.ServiceName != "" {
		service.ServiceName = req.ServiceName
	}
	service.Hostname = req.Hostname
	service.IPAddress = req.IPAddress
	service.Port = req.Port
	service.Description = req.Description
	service.FolderID = req.FolderID

	if err := s.serviceRepo.Update(service); err != nil {
		return nil, err
	}

	return service, nil
}

func (s *ServiceService) DeleteService(id string) error {
	serviceID, err := strconv.Atoi(id)
	if err != nil {
		return err
	}
	return s.serviceRepo.Delete(serviceID)
}
