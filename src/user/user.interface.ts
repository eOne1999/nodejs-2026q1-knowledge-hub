export interface User {
  id: string;
  login: string;
  password: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface CreateUserDto {
  login: string;
  password: string;
  role?: UserRole;
}

export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
}
