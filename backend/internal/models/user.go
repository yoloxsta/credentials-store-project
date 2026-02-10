package models

import "time"

type User struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Role      string    `json:"role"`
	UserGroup string    `json:"user_group"`
	CreatedAt time.Time `json:"created_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type SignupRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	Role      string `json:"role"`
	UserGroup string `json:"user_group"`
}

type UpdateUserRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	Role      string `json:"role"`
	UserGroup string `json:"user_group"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
