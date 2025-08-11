export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  DRIVER = 'Driver'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}