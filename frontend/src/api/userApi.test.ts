import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('./apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from './apiClient';
import {getUserById, updateCurrentUserEmail, changePassword, deleteCurrentUser} from './userApi';

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);
const mockedDelete = vi.mocked(apiClient.delete);

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserById gets /users/{id} and returns UserDto', async () => {
    const payload = {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      role: 'USER',
      emailVerified: true,
      points: 50,
      address: null,
      createdAt: '2024-01-01T00:00:00Z',
    };
    mockedGet.mockResolvedValueOnce({data: payload});
    const result = await getUserById(1);
    expect(mockedGet).toHaveBeenCalledWith('/users/1');
    expect(result).toEqual(payload);
  });

  it('changePassword posts to /users/me/password-change with body', async () => {
    mockedPost.mockResolvedValueOnce({data: {}});
    await changePassword({currentPassword: 'OldPass1!', newPassword: 'NewPass1!'});
    expect(mockedPost).toHaveBeenCalledWith('/users/me/password-change', {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
    });
  });

  it('updateCurrentUserEmail posts to /users/me/email-change with body and returns UserDto', async () => {
    const payload = {
      id: 1,
      username: 'alice',
      email: 'new@example.com',
      role: 'USER',
      emailVerified: false,
      points: 50,
      address: null,
      createdAt: '2024-01-01T00:00:00Z',
    };
    mockedPost.mockResolvedValueOnce({data: payload});

    const result = await updateCurrentUserEmail({email: 'new@example.com'});

    expect(mockedPost).toHaveBeenCalledWith('/users/me/email-change', {email: 'new@example.com'});
    expect(result).toEqual(payload);
  });

  it('deleteCurrentUser deletes /users/me', async () => {
    mockedDelete.mockResolvedValueOnce({data: {}});

    await deleteCurrentUser();

    expect(mockedDelete).toHaveBeenCalledWith('/users/me');
  });
});
