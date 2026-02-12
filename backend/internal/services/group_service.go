package services

import (
	"credential-store/internal/models"
	"credential-store/internal/repository"
	"errors"
	"strconv"
)

type GroupService struct {
	groupRepo *repository.GroupRepository
}

func NewGroupService(groupRepo *repository.GroupRepository) *GroupService {
	return &GroupService{groupRepo: groupRepo}
}

func (s *GroupService) Create(req *models.CreateGroupRequest) (*models.Group, error) {
	// Check if group already exists
	existing, _ := s.groupRepo.FindByName(req.Name)
	if existing != nil {
		return nil, errors.New("group already exists")
	}

	group := &models.Group{
		Name:        req.Name,
		Description: req.Description,
	}

	if err := s.groupRepo.Create(group); err != nil {
		return nil, err
	}

	return group, nil
}

func (s *GroupService) GetAll() ([]models.Group, error) {
	return s.groupRepo.FindAll()
}

func (s *GroupService) GetByID(id string) (*models.Group, error) {
	groupID, err := strconv.Atoi(id)
	if err != nil {
		return nil, err
	}
	return s.groupRepo.FindByID(groupID)
}

func (s *GroupService) Update(id string, req *models.UpdateGroupRequest) (*models.Group, error) {
	groupID, err := strconv.Atoi(id)
	if err != nil {
		return nil, err
	}

	group, err := s.groupRepo.FindByID(groupID)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		group.Name = req.Name
	}
	if req.Description != "" {
		group.Description = req.Description
	}

	if err := s.groupRepo.Update(group); err != nil {
		return nil, err
	}

	return group, nil
}

func (s *GroupService) Delete(id string) error {
	groupID, err := strconv.Atoi(id)
	if err != nil {
		return err
	}

	// Get group to check if it's in use
	group, err := s.groupRepo.FindByID(groupID)
	if err != nil {
		return err
	}

	// Check if any users are in this group
	count, err := s.groupRepo.CountUsers(group.Name)
	if err != nil {
		return err
	}

	if count > 0 {
		return errors.New("cannot delete group with existing users")
	}

	return s.groupRepo.Delete(groupID)
}
