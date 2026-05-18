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
}

export async function getUserById(id: number): Promise<UserDto> {
  const response = await apiClient.get<UserDto>(`/users/${id}`);
  return response.data;
}

export async function changePassword(req: {currentPassword: string; newPassword: string}): Promise<void> {
  await apiClient.post('/users/me/password-change', req);
}
