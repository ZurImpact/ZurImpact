import {describe, it, expect, vi, beforeEach} from 'vitest';
import {configureStore} from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  verifyEmailToken,
  resendVerification,
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
  resetAuthOp,
} from './AuthSlice';

vi.mock('../../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

vi.mock('../../api/userApi', () => ({
  changePassword: vi.fn(),
}));

import * as authApi from '../../api/authApi';
import * as userApi from '../../api/userApi';

const createTestStore = () =>
  configureStore({
    reducer: {auth: authReducer},
  });

describe('AuthSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has all ops as idle with null errors', () => {
      const store = createTestStore();
      const state = store.getState().auth;
      const ops = [
        'login',
        'register',
        'logout',
        'verifyEmail',
        'resendVerification',
        'requestPasswordReset',
        'confirmPasswordReset',
        'changePassword',
      ] as const;
      for (const op of ops) {
        expect(state[op].status).toBe('idle');
        expect(state[op].error).toBeNull();
      }
    });
  });

  describe('resetAuthOp', () => {
    it('resets a specific op back to idle with null error', async () => {
      const store = createTestStore();
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(loginUser({username: 'alice', password: 'wrong'}));
      expect(store.getState().auth.login.status).toBe('rejected');

      store.dispatch(resetAuthOp('login'));
      expect(store.getState().auth.login.status).toBe('idle');
      expect(store.getState().auth.login.error).toBeNull();
    });
  });

  describe('loginUser', () => {
    it('transitions pending → fulfilled on success', async () => {
      const store = createTestStore();
      const statuses: string[] = [];
      store.subscribe(() => statuses.push(store.getState().auth.login.status));

      vi.mocked(authApi.login).mockResolvedValueOnce({username: 'alice', role: 'USER'});
      await store.dispatch(loginUser({username: 'alice', password: 'secret'}));

      expect(statuses).toContain('pending');
      expect(store.getState().auth.login.status).toBe('fulfilled');
      expect(store.getState().auth.login.error).toBeNull();
    });

    it('transitions pending → rejected with "invalid_credentials" on 401', async () => {
      const store = createTestStore();
      vi.mocked(authApi.login).mockRejectedValueOnce({response: {status: 401}});
      await store.dispatch(loginUser({username: 'alice', password: 'wrong'}));

      const loginState = store.getState().auth.login;
      expect(loginState.status).toBe('rejected');
      expect(loginState.error).toBe('invalid_credentials');
    });

    it('sets error "email_not_verified" on 403 with detail email_not_verified', async () => {
      const store = createTestStore();
      vi.mocked(authApi.login).mockRejectedValueOnce({
        response: {
          status: 403,
          data: {
            type: 'https://zurimpact.ch/problems/forbidden',
            title: 'Forbidden',
            status: 403,
            detail: 'email_not_verified',
          },
        },
      });
      await store.dispatch(loginUser({username: 'alice', password: 'secret'}));

      const loginState = store.getState().auth.login;
      expect(loginState.status).toBe('rejected');
      expect(loginState.error).toBe('email_not_verified');
    });

    it('sets generic error on other failures', async () => {
      const store = createTestStore();
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error('Network down'));
      await store.dispatch(loginUser({username: 'alice', password: 'secret'}));

      expect(store.getState().auth.login.status).toBe('rejected');
      expect(store.getState().auth.login.error).toBe('login_failed');
    });
  });

  describe('registerUser', () => {
    it('transitions pending → fulfilled on success', async () => {
      const store = createTestStore();
      vi.mocked(authApi.register).mockResolvedValueOnce(undefined);
      await store.dispatch(registerUser({username: 'alice', email: 'alice@example.com', password: 'Password1!'}));

      expect(store.getState().auth.register.status).toBe('fulfilled');
      expect(store.getState().auth.register.error).toBeNull();
    });

    it('transitions pending → rejected on failure', async () => {
      const store = createTestStore();
      vi.mocked(authApi.register).mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(registerUser({username: 'alice', email: 'alice@example.com', password: 'Password1!'}));

      expect(store.getState().auth.register.status).toBe('rejected');
      expect(store.getState().auth.register.error).toBe('register_failed');
    });

    it('does not surface login-specific codes on 401 (scoped error mapping)', async () => {
      const store = createTestStore();
      vi.mocked(authApi.register).mockRejectedValueOnce({response: {status: 401}});
      await store.dispatch(registerUser({username: 'alice', email: 'alice@example.com', password: 'Password1!'}));

      expect(store.getState().auth.register.error).toBe('register_failed');
    });
  });

  describe('logoutUser', () => {
    it('transitions pending → fulfilled on success', async () => {
      const store = createTestStore();
      vi.mocked(authApi.logout).mockResolvedValueOnce(undefined);
      await store.dispatch(logoutUser());

      expect(store.getState().auth.logout.status).toBe('fulfilled');
    });

    it('transitions pending → rejected on failure', async () => {
      const store = createTestStore();
      vi.mocked(authApi.logout).mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(logoutUser());

      expect(store.getState().auth.logout.status).toBe('rejected');
      expect(store.getState().auth.logout.error).toBe('logout_failed');
    });
  });

  describe('verifyEmailToken', () => {
    it('transitions pending → fulfilled on success', async () => {
      const store = createTestStore();
      vi.mocked(authApi.verifyEmail).mockResolvedValueOnce(undefined);
      await store.dispatch(verifyEmailToken({token: 'tok123'}));

      expect(store.getState().auth.verifyEmail.status).toBe('fulfilled');
    });

    it('transitions pending → rejected on failure', async () => {
      const store = createTestStore();
      vi.mocked(authApi.verifyEmail).mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(verifyEmailToken({token: 'bad'}));

      expect(store.getState().auth.verifyEmail.status).toBe('rejected');
      expect(store.getState().auth.verifyEmail.error).toBe('verify_email_failed');
    });
  });

  describe('resendVerification', () => {
    it('transitions pending → fulfilled on success', async () => {
      const store = createTestStore();
      vi.mocked(authApi.resendVerification).mockResolvedValueOnce(undefined);
      await store.dispatch(resendVerification({email: 'alice@example.com'}));

      expect(store.getState().auth.resendVerification.status).toBe('fulfilled');
    });

    it('transitions pending → rejected on failure', async () => {
      const store = createTestStore();
      vi.mocked(authApi.resendVerification).mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(resendVerification({email: 'alice@example.com'}));

      expect(store.getState().auth.resendVerification.status).toBe('rejected');
      expect(store.getState().auth.resendVerification.error).toBe('resend_verification_failed');
    });
  });

  describe('requestPasswordReset', () => {
    it('transitions pending → fulfilled on success', async () => {
      const store = createTestStore();
      vi.mocked(authApi.requestPasswordReset).mockResolvedValueOnce(undefined);
      await store.dispatch(requestPasswordReset({email: 'alice@example.com'}));

      expect(store.getState().auth.requestPasswordReset.status).toBe('fulfilled');
    });

    it('transitions pending → rejected on failure', async () => {
      const store = createTestStore();
      vi.mocked(authApi.requestPasswordReset).mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(requestPasswordReset({email: 'alice@example.com'}));

      expect(store.getState().auth.requestPasswordReset.status).toBe('rejected');
      expect(store.getState().auth.requestPasswordReset.error).toBe('request_password_reset_failed');
    });
  });

  describe('confirmPasswordReset', () => {
    it('transitions pending → fulfilled on success', async () => {
      const store = createTestStore();
      vi.mocked(authApi.confirmPasswordReset).mockResolvedValueOnce(undefined);
      await store.dispatch(confirmPasswordReset({token: 'tok', newPassword: 'NewPass1!'}));

      expect(store.getState().auth.confirmPasswordReset.status).toBe('fulfilled');
    });

    it('transitions pending → rejected on failure', async () => {
      const store = createTestStore();
      vi.mocked(authApi.confirmPasswordReset).mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(confirmPasswordReset({token: 'bad', newPassword: 'NewPass1!'}));

      expect(store.getState().auth.confirmPasswordReset.status).toBe('rejected');
      expect(store.getState().auth.confirmPasswordReset.error).toBe('confirm_password_reset_failed');
    });
  });

  describe('changePassword', () => {
    it('transitions pending → fulfilled on success', async () => {
      const store = createTestStore();
      vi.mocked(userApi.changePassword).mockResolvedValueOnce(undefined);
      await store.dispatch(changePassword({currentPassword: 'OldPass1!', newPassword: 'NewPass1!'}));

      expect(store.getState().auth.changePassword.status).toBe('fulfilled');
      expect(store.getState().auth.changePassword.error).toBeNull();
    });

    it('transitions pending → rejected on failure', async () => {
      const store = createTestStore();
      vi.mocked(userApi.changePassword).mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(changePassword({currentPassword: 'OldPass1!', newPassword: 'NewPass1!'}));

      expect(store.getState().auth.changePassword.status).toBe('rejected');
      expect(store.getState().auth.changePassword.error).toBe('change_password_failed');
    });

    it('sets error "wrong_current_password" on 400 with that detail', async () => {
      const store = createTestStore();
      vi.mocked(userApi.changePassword).mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            type: 'https://zurimpact.ch/problems/bad-request',
            title: 'Bad Request',
            status: 400,
            detail: 'wrong_current_password',
          },
        },
      });
      await store.dispatch(changePassword({currentPassword: 'wrong', newPassword: 'NewPass1!'}));

      expect(store.getState().auth.changePassword.error).toBe('wrong_current_password');
    });

    it('does not surface login-specific codes on 401 (scoped error mapping)', async () => {
      const store = createTestStore();
      vi.mocked(userApi.changePassword).mockRejectedValueOnce({response: {status: 401}});
      await store.dispatch(changePassword({currentPassword: 'OldPass1!', newPassword: 'NewPass1!'}));

      expect(store.getState().auth.changePassword.error).toBe('change_password_failed');
    });
  });
});
