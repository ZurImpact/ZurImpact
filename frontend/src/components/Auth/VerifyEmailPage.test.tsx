import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {type DeepPartial, type RootState} from '../../store/store';
import {VerifyEmailPage} from './VerifyEmailPage';

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

function renderVerifyEmailPage(
  entry: string | {pathname: string; search?: string; state?: unknown},
  preloadedState?: DeepPartial<RootState>,
) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
    {preloadedState},
  );
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('pending mode (?pending=1)', () => {
    it('renders check-your-email message and ResendVerificationForm with ?pending=1', () => {
      renderVerifyEmailPage('/verify-email?pending=1');

      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      // ResendVerificationForm renders an email field
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('passes pendingEmail from location.state to ResendVerificationForm as defaultEmail', () => {
      renderVerifyEmailPage({pathname: '/verify-email', state: {pendingEmail: 'foo@bar.com'}});

      expect(screen.getByLabelText(/email/i)).toHaveValue('foo@bar.com');
    });
  });

  describe('idle / fallback mode (no params)', () => {
    it('renders check-your-email message and ResendVerificationForm with no query params', () => {
      renderVerifyEmailPage('/verify-email');

      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  describe('verifying mode (?token=...)', () => {
    it('dispatches verifyEmailToken with the token on mount', async () => {
      vi.mocked(authApi.verifyEmail).mockResolvedValueOnce(undefined);

      renderVerifyEmailPage('/verify-email?token=abc123');

      await waitFor(() => {
        expect(vi.mocked(authApi.verifyEmail)).toHaveBeenCalledWith({token: 'abc123'});
      });
    });

    it('calls window.history.replaceState to strip the token from the URL', async () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      vi.mocked(authApi.verifyEmail).mockResolvedValueOnce(undefined);

      renderVerifyEmailPage('/verify-email?token=abc123');

      await waitFor(() => {
        expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(), '/verify-email');
      });

      replaceStateSpy.mockRestore();
    });

    it('renders loading state while verification is pending', () => {
      let resolveVerify!: (value: undefined) => void;
      vi.mocked(authApi.verifyEmail).mockReturnValueOnce(
        new Promise<undefined>((res) => {
          resolveVerify = res;
        }),
      );

      renderVerifyEmailPage('/verify-email?token=abc123');

      expect(screen.getAllByText(/verifying/i).length).toBeGreaterThan(0);
      // The heading specifically confirms loading mode
      expect(screen.getByRole('heading', {name: /verifying your email/i})).toBeInTheDocument();

      resolveVerify(undefined);
    });

    it('renders success message and "Continue to sign in" button on verify success', async () => {
      vi.mocked(authApi.verifyEmail).mockResolvedValueOnce(undefined);

      renderVerifyEmailPage('/verify-email?token=abc123');

      await waitFor(() => {
        expect(screen.getByText(/email verified/i)).toBeInTheDocument();
      });

      const continueLink = screen.getByRole('link', {name: /continue to sign in/i});
      expect(continueLink).toHaveAttribute('href', '/login');
    });

    it('renders error alert and ResendVerificationForm on verify failure', async () => {
      vi.mocked(authApi.verifyEmail).mockRejectedValueOnce(new Error('Token expired'));

      renderVerifyEmailPage('/verify-email?token=badtoken');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
      // ResendVerificationForm should appear
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('dispatches verifyEmailToken only once even if the component re-renders', async () => {
      vi.mocked(authApi.verifyEmail).mockResolvedValue(undefined);

      const {rerender} = renderVerifyEmailPage('/verify-email?token=abc123');

      await waitFor(() => {
        expect(vi.mocked(authApi.verifyEmail)).toHaveBeenCalledTimes(1);
      });

      // Trigger a re-render by re-rendering with same route
      rerender(
        <MemoryRouter initialEntries={['/verify-email?token=abc123']}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>,
      );

      // Still only called once — no additional dispatch on re-render
      expect(vi.mocked(authApi.verifyEmail)).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup on unmount', () => {
    it('resets verifyEmail auth op on unmount', async () => {
      vi.mocked(authApi.verifyEmail).mockResolvedValueOnce(undefined);

      const {store, unmount} = renderVerifyEmailPage('/verify-email?token=abc123');

      await waitFor(() => {
        expect(store.getState().auth.verifyEmail.status).toBe('fulfilled');
      });

      unmount();

      expect(store.getState().auth.verifyEmail.status).toBe('idle');
    });
  });
});
