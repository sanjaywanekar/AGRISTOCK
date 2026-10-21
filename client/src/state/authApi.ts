import axios from "axios";
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
} from "@/types/auth";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export const loginUser = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await axios.post(`${API}/auth/login`, data);
  return response.data;
};

export const signupUser = async (
  data: SignupRequest
): Promise<AuthResponse> => {
  const response = await axios.post(`${API}/auth/signup`, data);
  return response.data;
};