package main

import (
	"credential-store/internal/handlers"
	"credential-store/internal/middleware"
	"credential-store/internal/repository"
	"credential-store/internal/services"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	db := initDB()
	defer db.Close()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	userRepo := repository.NewUserRepository(db)
	credRepo := repository.NewCredentialRepository(db)
	folderRepo := repository.NewFolderRepository(db)
	documentRepo := repository.NewDocumentRepository(db)
	groupRepo := repository.NewGroupRepository(db)
	serviceRepo := repository.NewServiceRepository(db)

	authService := services.NewAuthService(userRepo)
	encryptionService := services.NewEncryptionService()
	credService := services.NewCredentialService(credRepo, encryptionService)
	folderService := services.NewFolderService(folderRepo)
	groupService := services.NewGroupService(groupRepo)
	serviceService := services.NewServiceService(serviceRepo)

	authHandler := handlers.NewAuthHandler(authService)
	credHandler := handlers.NewCredentialHandler(credService)
	folderHandler := handlers.NewFolderHandler(folderService)
	documentHandler := handlers.NewDocumentHandler(documentRepo)
	groupHandler := handlers.NewGroupHandler(groupService)
	serviceHandler := handlers.NewServiceHandler(serviceService)

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			// Signup only for admins
			auth.POST("/signup", middleware.AuthMiddleware(), middleware.AdminMiddleware(), authHandler.Signup)
			auth.PUT("/change-password", middleware.AuthMiddleware(), authHandler.ChangePassword)
		}

		// User management (admin only)
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			users.POST("", authHandler.CreateUser)
			users.GET("", authHandler.GetAllUsers)
			users.PUT("/:id", authHandler.UpdateUser)
			users.DELETE("/:id", authHandler.DeleteUser)
		}

		// Group management (admin only)
		groups := api.Group("/groups")
		groups.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			groups.POST("", groupHandler.Create)
			groups.GET("", groupHandler.GetAll)
			groups.GET("/:id", groupHandler.GetByID)
			groups.PUT("/:id", groupHandler.Update)
			groups.DELETE("/:id", groupHandler.Delete)
		}

		folders := api.Group("/folders")
		folders.Use(middleware.AuthMiddleware())
		{
			folders.GET("", folderHandler.GetAll)
			folders.POST("", middleware.AdminMiddleware(), folderHandler.Create)
			folders.PUT("/:id/permissions", middleware.AdminMiddleware(), folderHandler.UpdatePermission)
			folders.DELETE("/:id", middleware.AdminMiddleware(), folderHandler.Delete)
		}

		credentials := api.Group("/credentials")
		credentials.Use(middleware.AuthMiddleware())
		{
			credentials.POST("", middleware.AdminMiddleware(), credHandler.Create)
			credentials.GET("", credHandler.GetAll)
			credentials.GET("/:id", credHandler.GetByID)
			credentials.PUT("/:id", middleware.AdminMiddleware(), credHandler.Update)
			credentials.DELETE("/:id", middleware.AdminMiddleware(), credHandler.Delete)
		}

		documents := api.Group("/documents")
		documents.Use(middleware.AuthMiddleware())
		{
			documents.POST("", middleware.AdminMiddleware(), documentHandler.Upload)
			documents.GET("", documentHandler.GetAll)
			documents.GET("/:id/view", documentHandler.View)
			documents.GET("/:id/download", documentHandler.Download)
			documents.PUT("/:id/permissions", middleware.AdminMiddleware(), documentHandler.UpdatePermission)
			documents.DELETE("/:id", middleware.AdminMiddleware(), documentHandler.Delete)
		}

		servicesGroup := api.Group("/services")
		servicesGroup.Use(middleware.AuthMiddleware())
		{
			servicesGroup.POST("", middleware.AdminMiddleware(), serviceHandler.Create)
			servicesGroup.GET("", serviceHandler.GetAll)
			servicesGroup.GET("/:id", serviceHandler.GetByID)
			servicesGroup.PUT("/:id", middleware.AdminMiddleware(), serviceHandler.Update)
			servicesGroup.DELETE("/:id", middleware.AdminMiddleware(), serviceHandler.Delete)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}

func initDB() *sql.DB {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("Database connected successfully")
	return db
}
