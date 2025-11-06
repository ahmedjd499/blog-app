export enum UserRole {
  ADMIN = 'Admin',
  EDITOR = 'Éditeur',
  WRITER = 'Rédacteur',
  READER = 'Lecteur'
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}
