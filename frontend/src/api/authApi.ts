import apiClient from './apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface WhoamiResponse {
  id: number;
  username: string;
  roles: string[];
  emailVerified: boolean;
}

export async function register(req: RegisterRequest): Promise<void> {
  await apiClient.post('/auth/register', req);
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', req);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function whoami(): Promise<WhoamiResponse> {
  const response = await apiClient.get<WhoamiResponse>('/auth/whoami');
  return response.data;
}

export async function verifyEmail(req: {token: string}): Promise<void> {
  await apiClient.post('/auth/verify-email', req);
}

export async function resendVerification(req: {email: string}): Promise<void> {
  await apiClient.post('/auth/resend-verification', req);
}

export async function requestPasswordReset(req: {email: string}): Promise<void> {
  await apiClient.post('/auth/password-reset/request', req);
}

export async function confirmPasswordReset(req: {token: string; newPassword: string}): Promise<void> {
  await apiClient.post('/auth/password-reset/confirm', req);
}
