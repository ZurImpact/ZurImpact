import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {type DeepPartial, type RootState} from '../../store/store';
import {ForgotPasswordPage} from './ForgotPasswordPage';

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

function renderForgotPasswordPage(preloadedState?: DeepPartial<RootState>) {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
    {preloadedState},
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders email field, submit button, and Sign in footer link', () => {
      renderForgotPasswordPage();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /send reset link/i})).toBeInTheDocument();
      const signInLink = screen.getByRole('link', {name: /sign in/i});
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('renders the page heading in AuthFormCard', () => {
      renderForgotPasswordPage();

      expect(screen.getByRole('heading', {name: /forgot your password/i})).toBeInTheDocument();
    });
  });

  describe('client-side validation', () => {
    it('shows FormMessage when email is empty and does not dispatch', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      await user.click(screen.getByRole('button', {name: /send reset link/i}));

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });

      expect(vi.mocked(authApi.requestPasswordReset)).not.toHaveBeenCalled();
    });

    // Note: client-side "invalid email format" rendering is not tested here because
    // jsdom enforces HTML5 email validation on `type="email"` inputs and blocks
    // userEvent.type from entering invalid strings. Zod email validation itself
    // is covered by lib/validation/authSchemas.test.ts.
  });

  describe('form submission', () => {
    it('dispatches requestPasswordReset with {email} on valid submit', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.requestPasswordReset).mockResolvedValueOnce(undefined);

      renderForgotPasswordPage();

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
      await user.click(screen.getByRole('button', {name: /send reset link/i}));

      await waitFor(() => {
        expect(vi.mocked(authApi.requestPasswordReset)).toHaveBeenCalledWith({email: 'alice@example.com'});
      });
    });

    it('disables submit button and shows loading state while pending', async () => {
      const user = userEvent.setup();
      let resolveReset!: (value: undefined) => void;
      vi.mocked(authApi.requestPasswordReset).mockReturnValueOnce(
        new Promise<undefined>((res) => {
          resolveReset = res;
        }),
      );

      renderForgotPasswordPage();

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
      await user.click(screen.getByRole('button', {name: /send reset link/i}));

      await waitFor(() => {
        const btn = screen.getByRole('button', {name: /sending/i});
        expect(btn).toBeDisabled();
      });

      resolveReset(undefined);
    });
  });

  describe('anti-enumeration success state', () => {
    it('hides the form and shows generic success message after fulfilled', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.requestPasswordReset).mockResolvedValueOnce(undefined);

      renderForgotPasswordPage();

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
      await user.click(screen.getByRole('button', {name: /send reset link/i}));

      await waitFor(() => {
        expect(screen.getByText(/if an account with that address exists/i)).toBeInTheDocument();
      });

      // Form should be hidden — email input no longer present
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });

    it('restores the form when "Send to a different address" is clicked after success', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.requestPasswordReset).mockResolvedValueOnce(undefined);

      renderForgotPasswordPage();

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
      await user.click(screen.getByRole('button', {name: /send reset link/i}));

      await waitFor(() => {
        expect(screen.getByText(/if an account with that address exists/i)).toBeInTheDocument();
      });

      const differentAddressBtn = screen.getByRole('button', {name: /send to a different address/i});
      await user.click(differentAddressBtn);

      // Form should be visible again
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('shows error alert on network error and keeps form visible', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.requestPasswordReset).mockRejectedValueOnce(new Error('Network Error'));

      renderForgotPasswordPage();

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
      await user.click(screen.getByRole('button', {name: /send reset link/i}));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/couldn't reach the server/i)).toBeInTheDocument();
      // Form should still be visible
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  describe('cleanup on unmount', () => {
    it('resets requestPasswordReset auth op on unmount', async () => {
      vi.mocked(authApi.requestPasswordReset).mockResolvedValueOnce(undefined);

      const {store, unmount} = renderForgotPasswordPage();

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
      await user.click(screen.getByRole('button', {name: /send reset link/i}));

      await waitFor(() => {
        expect(store.getState().auth.requestPasswordReset.status).toBe('fulfilled');
      });

      unmount();

      expect(store.getState().auth.requestPasswordReset.status).toBe('idle');
    });
  });
});
