import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('./apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import apiClient from './apiClient';
import {
  register,
  login,
  logout,
  whoami,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  confirmPasswordReset,
} from './authApi';

const mockedPost = vi.mocked(apiClient.post);
const mockedGet = vi.mocked(apiClient.get);

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register posts to /auth/register with correct body', async () => {
    mockedPost.mockResolvedValueOnce({data: {}});
    await register({username: 'alice', email: 'alice@example.com', password: 'Password1!'});
    expect(mockedPost).toHaveBeenCalledWith('/auth/register', {
      username: 'alice',
      email: 'alice@example.com',
      password: 'Password1!',
    });
  });

  it('login posts to /auth/login and returns username + role', async () => {
    mockedPost.mockResolvedValueOnce({data: {username: 'alice', role: 'USER'}});
    const result = await login({username: 'alice', password: 'secret'});
    expect(mockedPost).toHaveBeenCalledWith('/auth/login', {username: 'alice', password: 'secret'});
    expect(result).toEqual({username: 'alice', role: 'USER'});
  });

  it('logout posts to /auth/logout', async () => {
    mockedPost.mockResolvedValueOnce({data: {}});
    await logout();
    expect(mockedPost).toHaveBeenCalledWith('/auth/logout');
  });

  it('whoami gets /auth/whoami and returns user info', async () => {
    const payload = {id: 1, username: 'alice', roles: ['USER'], emailVerified: true};
    mockedGet.mockResolvedValueOnce({data: payload});
    const result = await whoami();
    expect(mockedGet).toHaveBeenCalledWith('/auth/whoami');
    expect(result).toEqual(payload);
  });

  it('verifyEmail posts to /auth/verify-email with token', async () => {
    mockedPost.mockResolvedValueOnce({data: {}});
    await verifyEmail({token: 'tok123'});
    expect(mockedPost).toHaveBeenCalledWith('/auth/verify-email', {token: 'tok123'});
  });

  it('resendVerification posts to /auth/resend-verification with email', async () => {
    mockedPost.mockResolvedValueOnce({data: {}});
    await resendVerification({email: 'alice@example.com'});
    expect(mockedPost).toHaveBeenCalledWith('/auth/resend-verification', {email: 'alice@example.com'});
  });

  it('requestPasswordReset posts to /auth/password-reset/request with email', async () => {
    mockedPost.mockResolvedValueOnce({data: {}});
    await requestPasswordReset({email: 'alice@example.com'});
    expect(mockedPost).toHaveBeenCalledWith('/auth/password-reset/request', {email: 'alice@example.com'});
  });

  it('confirmPasswordReset posts to /auth/password-reset/confirm with token and newPassword', async () => {
    mockedPost.mockResolvedValueOnce({data: {}});
    await confirmPasswordReset({token: 'tok123', newPassword: 'NewPass1!'});
    expect(mockedPost).toHaveBeenCalledWith('/auth/password-reset/confirm', {token: 'tok123', newPassword: 'NewPass1!'});
  });
});
