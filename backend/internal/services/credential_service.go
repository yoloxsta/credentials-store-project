package services

import (
	"credential-store/internal/models"
	"credential-store/internal/repository"
	"errors"
	"log"
)

type CredentialService struct {
	credRepo   *repository.CredentialRepository
	encryption *EncryptionService
}

func NewCredentialService(credRepo *repository.CredentialRepository, encryption *EncryptionService) *CredentialService {
	return &CredentialService{
		credRepo:   credRepo,
		encryption: encryption,
	}
}

func (s *CredentialService) Create(userID int, req *models.CreateCredentialRequest) (*models.Credential, error) {
	encryptedPassword, err := s.encryption.Encrypt(req.Password)
	if err != nil {
		log.Printf("Encryption error: %v", err)
		return nil, err
	}

	cred := &models.Credential{
		UserID:      userID,
		FolderID:    req.FolderID,
		ServiceName: req.ServiceName,
		Username:    req.Username,
		Password:    encryptedPassword,
		Notes:       req.Notes,
	}

	if err := s.credRepo.Create(cred); err != nil {
		log.Printf("Database error: %v", err)
		return nil, err
	}

	decryptedPassword, _ := s.encryption.Decrypt(cred.Password)
	cred.Password = decryptedPassword

	return cred, nil
}

func (s *CredentialService) GetAll(userID int, isAdmin bool, userGroup string) ([]models.Credential, error) {
	var credentials []models.Credential
	var err error

	if isAdmin {
		credentials, err = s.credRepo.FindAll()
	} else {
		// Get credentials based on folder permissions for user group
		credentials, err = s.credRepo.FindByUserGroup(userGroup)
	}

	if err != nil {
		return nil, err
	}

	for i := range credentials {
		decrypted, err := s.encryption.Decrypt(credentials[i].Password)
		if err == nil {
			credentials[i].Password = decrypted
		}
	}

	return credentials, nil
}

func (s *CredentialService) GetByID(id, userID int, isAdmin bool) (*models.Credential, error) {
	cred, err := s.credRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if !isAdmin && cred.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	decrypted, err := s.encryption.Decrypt(cred.Password)
	if err == nil {
		cred.Password = decrypted
	}

	return cred, nil
}

func (s *CredentialService) Update(id, userID int, isAdmin bool, req *models.UpdateCredentialRequest) (*models.Credential, error) {
	cred, err := s.credRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if !isAdmin && cred.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	if req.FolderID != nil {
		cred.FolderID = req.FolderID
	}
	if req.ServiceName != "" {
		cred.ServiceName = req.ServiceName
	}
	if req.Username != "" {
		cred.Username = req.Username
	}
	if req.Password != "" {
		encryptedPassword, err := s.encryption.Encrypt(req.Password)
		if err != nil {
			return nil, err
		}
		cred.Password = encryptedPassword
	}
	if req.Notes != "" {
		cred.Notes = req.Notes
	}

	if err := s.credRepo.Update(cred); err != nil {
		return nil, err
	}

	decrypted, _ := s.encryption.Decrypt(cred.Password)
	cred.Password = decrypted

	return cred, nil
}

func (s *CredentialService) Delete(id, userID int, isAdmin bool) error {
	cred, err := s.credRepo.FindByID(id)
	if err != nil {
		return err
	}

	if !isAdmin && cred.UserID != userID {
		return errors.New("unauthorized")
	}

	return s.credRepo.Delete(id)
}
