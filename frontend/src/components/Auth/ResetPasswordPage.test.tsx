import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {type DeepPartial, type RootState} from '../../store/store';
import {ResetPasswordPage} from './ResetPasswordPage';

vi.mock('../../api/authApi', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({data: {}}),
    post: vi.fn().mockResolvedValue({data: {}}),
  },
}));

vi.mock('../../utility/i18n', () => ({
  __esModule: true,
  default: {changeLanguage: vi.fn(), language: 'en'},
}));

import * as authApi from '../../api/authApi';

function renderResetPasswordPage(url: string, preloadedState?: DeepPartial<RootState>) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/forgot-password" element={<div data-testid="forgot-password-page">Forgot Password</div>} />
      </Routes>
    </MemoryRouter>,
    {preloadedState},
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('missing-token mode (no ?token=)', () => {
    it('renders the missing-token error card and a link to /forgot-password without rendering the form', () => {
      renderResetPasswordPage('/reset-password');

      expect(screen.getByText(/this reset link is invalid/i)).toBeInTheDocument();
      const requestLink = screen.getByRole('link', {name: /request a new one/i});
      expect(requestLink).toBeInTheDocument();
      expect(requestLink).toHaveAttribute('href', '/forgot-password');

      // Form must NOT be present
      expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/confirm/i)).not.toBeInTheDocument();
    });
  });

  describe('form mode (?token=...)', () => {
    it('renders newPassword and confirmPassword fields and submit button', () => {
      renderResetPasswordPage('/reset-password?token=abc123');

      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm/i)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /reset password/i})).toBeInTheDocument();
    });

    it('calls window.history.replaceState on mount to strip the token from the URL', async () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      renderResetPasswordPage('/reset-password?token=abc123');

      await waitFor(() => {
        expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(), '/reset-password');
      });

      replaceStateSpy.mockRestore();
    });

    it('does not call replaceState again on re-render when token was already captured', async () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      const {rerender} = renderResetPasswordPage('/reset-password?token=abc123');

      await waitFor(() => {
        expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      });

      // Re-render with same route — replaceState should NOT be called again
      rerender(
        <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
            <Route path="/forgot-password" element={<div data-testid="forgot-password-page">Forgot Password</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(replaceStateSpy).toHaveBeenCalledTimes(1);

      replaceStateSpy.mockRestore();
    });
  });

  describe('client-side validation', () => {
    it('shows FormMessage when newPassword is shorter than 8 chars and does not dispatch', async () => {
      const user = userEvent.setup();
      renderResetPasswordPage('/reset-password?token=abc123');

      await user.type(screen.getByLabelText(/new password/i), 'short');
      await user.type(screen.getByLabelText(/confirm/i), 'short');
      await user.click(screen.getByRole('button', {name: /reset password/i}));

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });

      expect(vi.mocked(authApi.confirmPasswordReset)).not.toHaveBeenCalled();
    });

    it('shows FormMessage on confirmPassword when passwords do not match and does not dispatch', async () => {
      const user = userEvent.setup();
      renderResetPasswordPage('/reset-password?token=abc123');

      await user.type(screen.getByLabelText(/new password/i), 'Password1!');
      await user.type(screen.getByLabelText(/confirm/i), 'DifferentPass!');
      await user.click(screen.getByRole('button', {name: /reset password/i}));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      expect(vi.mocked(authApi.confirmPasswordReset)).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('dispatches confirmPasswordReset with {token, newPassword} (no confirmPassword) using the captured token', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.confirmPasswordReset).mockResolvedValueOnce(undefined);

      renderResetPasswordPage('/reset-password?token=abc123');

      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /reset password/i}));

      await waitFor(() => {
        expect(vi.mocked(authApi.confirmPasswordReset)).toHaveBeenCalledWith({
          token: 'abc123',
          newPassword: 'NewPassword1!',
        });
      });

      // confirmPassword must NOT be in the payload
      const callArg = vi.mocked(authApi.confirmPasswordReset).mock.calls[0][0];
      expect(callArg).not.toHaveProperty('confirmPassword');
    });

    it('disables submit button and shows loading state while pending', async () => {
      const user = userEvent.setup();
      let resolveConfirm!: (value: undefined) => void;
      vi.mocked(authApi.confirmPasswordReset).mockReturnValueOnce(
        new Promise<undefined>((res) => {
          resolveConfirm = res;
        }),
      );

      renderResetPasswordPage('/reset-password?token=abc123');

      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /reset password/i}));

      await waitFor(() => {
        const btn = screen.getByRole('button', {name: /resetting/i});
        expect(btn).toBeDisabled();
      });

      resolveConfirm(undefined);
    });
  });

  describe('success mode', () => {
    it('renders the success card with a Sign in link after fulfilled', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.confirmPasswordReset).mockResolvedValueOnce(undefined);

      renderResetPasswordPage('/reset-password?token=abc123');

      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /reset password/i}));

      await waitFor(() => {
        expect(screen.getByText(/your password has been reset/i)).toBeInTheDocument();
      });

      const signInLink = screen.getByRole('link', {name: /sign in/i});
      expect(signInLink).toHaveAttribute('href', '/login');

      // Form should no longer be rendered
      expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument();
    });
  });

  describe('form-with-error mode (rejected)', () => {
    it('renders form with error alert and link to /forgot-password on rejected', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.confirmPasswordReset).mockRejectedValueOnce(new Error('Token expired'));

      renderResetPasswordPage('/reset-password?token=abc123');

      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /reset password/i}));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();

      // Form is still visible
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();

      // Link to request a new one
      const requestNewLink = screen.getByRole('link', {name: /request a new one/i});
      expect(requestNewLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('cleanup on unmount', () => {
    it('resets confirmPasswordReset auth op on unmount', async () => {
      vi.mocked(authApi.confirmPasswordReset).mockResolvedValueOnce(undefined);

      const {store, unmount} = renderResetPasswordPage('/reset-password?token=abc123');

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/new password/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /reset password/i}));

      await waitFor(() => {
        expect(store.getState().auth.confirmPasswordReset.status).toBe('fulfilled');
      });

      unmount();

      expect(store.getState().auth.confirmPasswordReset.status).toBe('idle');
    });
  });
});
