import apiClient from './apiClient';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
  points: number;
  address: number | null;
  createdAt: string | null;
  hasPendingEmailChange: boolean;
}

export async function getUserById(id: number): Promise<UserDto> {
  const response = await apiClient.get<UserDto>(`/users/${id}`);
  return response.data;
}

export async function updateCurrentUserName(req: {newUsername: string}): Promise<UserDto> {
  const response = await apiClient.post<UserDto>('/users/me/name-change', req);
  return response.data;
}

export async function updateCurrentUserEmail(req: {newEmail: string}): Promise<UserDto> {
  const response = await apiClient.post<UserDto>('/users/me/email-change', req);
  return response.data;
}

export async function changePassword(req: {currentPassword: string; newPassword: string}): Promise<void> {
  await apiClient.post('/users/me/password-change', req);
}

export async function deleteCurrentUser(): Promise<void> {
  await apiClient.post('/users/me/delete-account');
}
