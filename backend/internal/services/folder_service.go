package services

import (
	"credential-store/internal/models"
	"credential-store/internal/repository"
)

type FolderService struct {
	folderRepo *repository.FolderRepository
}

func NewFolderService(folderRepo *repository.FolderRepository) *FolderService {
	return &FolderService{folderRepo: folderRepo}
}

func (s *FolderService) Create(req *models.CreateFolderRequest) (*models.Folder, error) {
	folder := &models.Folder{
		Name:        req.Name,
		Description: req.Description,
	}

	if err := s.folderRepo.Create(folder); err != nil {
		return nil, err
	}

	return folder, nil
}

func (s *FolderService) GetAllWithPermissions(userGroup, role string) ([]models.FolderWithPermissions, error) {
	folders, err := s.folderRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var result []models.FolderWithPermissions
	for _, folder := range folders {
		folderWithPerms := models.FolderWithPermissions{
			Folder:      folder,
			Permissions: []models.FolderPermission{},
		}

		// Get all permissions for this folder
		perms, err := s.folderRepo.GetAllPermissions(folder.ID)
		if err == nil {
			folderWithPerms.Permissions = perms
		}

		// Get user's specific access
		if role != "admin" {
			userPerm, err := s.folderRepo.GetPermission(folder.ID, userGroup)
			if err == nil {
				folderWithPerms.UserAccess = userPerm
			}
		} else {
			// Admin has full access
			folderWithPerms.UserAccess = &models.FolderPermission{
				FolderID:  folder.ID,
				UserGroup: userGroup,
				CanRead:   true,
				CanWrite:  true,
				CanDelete: true,
			}
		}

		result = append(result, folderWithPerms)
	}

	return result, nil
}

func (s *FolderService) UpdatePermission(perm *models.FolderPermission) error {
	return s.folderRepo.SetPermission(perm)
}

func (s *FolderService) CheckPermission(folderID int, userGroup, role, action string) (bool, error) {
	// Admin always has access
	if role == "admin" {
		return true, nil
	}

	perm, err := s.folderRepo.GetPermission(folderID, userGroup)
	if err != nil {
		return false, err
	}

	switch action {
	case "read":
		return perm.CanRead, nil
	case "write":
		return perm.CanWrite, nil
	case "delete":
		return perm.CanDelete, nil
	default:
		return false, nil
	}
}
