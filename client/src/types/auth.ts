export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "INDUSTRIALIST" | "FARMER";
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}