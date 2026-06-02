import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {type DeepPartial, type RootState} from '../../store/store';
import {LoginPage} from './LoginPage';

// Mock authApi so real reducer logic still runs through the store
vi.mock('../../api/authApi', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

// Mock apiClient for fetchCurrentUser (UserSlice)
const mockApiGet = vi.hoisted(() => vi.fn());
vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: vi.fn(),
  },
}));

vi.mock('../../utility/i18n', () => ({
  __esModule: true,
  default: {changeLanguage: vi.fn(), language: 'en'},
}));

import * as authApi from '../../api/authApi';
import {resolveT} from '../../test/setup';

function renderLoginPage(initialEntries = ['/login'], preloadedState?: DeepPartial<RootState>) {
  return renderWithProviders(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
        <Route path="/verify-email" element={<div data-testid="verify-email">Verify Email</div>} />
        <Route path="/some-from" element={<div data-testid="from-page">From Page</div>} />
      </Routes>
    </MemoryRouter>,
    {preloadedState},
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue({data: {id: 1}});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders username input, password input, and submit button', () => {
      renderLoginPage();

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /sign in/i})).toBeInTheDocument();
    });

    it('renders the Sign in heading in AuthFormCard', () => {
      renderLoginPage();

      // Use heading role to distinguish from the submit button which also says "Sign in"
      expect(screen.getByRole('heading', {name: resolveT('rootLayout.signIn')})).toBeInTheDocument();
    });

    it('renders a link to /register', () => {
      renderLoginPage();

      const registerLink = screen.getByRole('link', {name: /register/i});
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('renders a link to /forgot-password', () => {
      renderLoginPage();

      const forgotLink = screen.getByRole('link', {name: /forgot/i});
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('client-side validation', () => {
    it('shows FormMessage error when username is empty and form is submitted', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });

      expect(vi.mocked(authApi.login)).not.toHaveBeenCalled();
    });

    it('shows FormMessage error when password is empty and form is submitted', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });

      expect(vi.mocked(authApi.login)).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('dispatches loginUser with the typed username and password on valid submit', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.login).mockResolvedValueOnce({username: 'alice', role: 'USER'});
      mockApiGet.mockResolvedValueOnce({data: {id: 1}}).mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'alice',
          email: 'alice@example.com',
          role: 'USER',
          emailVerified: true,
          points: 0,
          address: null,
          createdAt: null,
        },
      });

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'secret');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(vi.mocked(authApi.login)).toHaveBeenCalledWith({username: 'alice', password: 'secret'});
      });
    });

    it('disables submit button while login is pending', async () => {
      const user = userEvent.setup();
      let resolveLogin!: (value: {username: string; role: string}) => void;
      vi.mocked(authApi.login).mockReturnValueOnce(
        new Promise<{username: string; role: string}>((res) => {
          resolveLogin = res;
        }),
      );

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'secret');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      // While pending the button text changes to "Signing in…" and is disabled
      await waitFor(() => {
        const signingInBtn = screen.getByRole('button', {name: /signing in/i});
        expect(signingInBtn).toBeDisabled();
      });

      // Resolve so tests clean up properly
      resolveLogin({username: 'alice', role: 'USER'});
    });
  });

  describe('error handling', () => {
    it('shows inline error alert with "Invalid" text on 401 (invalid_credentials)', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.login).mockRejectedValueOnce({response: {status: 401}});

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'wrongpass');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });
    });

    it('shows a generic error alert when the backend is unreachable (e.g. 404 / network)', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.login).mockRejectedValueOnce({response: {status: 404}});

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'secret');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('navigates to /verify-email?pending=1 on 403 email_not_verified', async () => {
      const user = userEvent.setup();
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

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'secret');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(screen.getByTestId('verify-email')).toBeInTheDocument();
      });
    });
  });

  describe('post-login navigation', () => {
    it('navigates to /dashboard on successful login when no from state', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.login).mockResolvedValueOnce({username: 'alice', role: 'USER'});
      mockApiGet.mockResolvedValueOnce({data: {id: 1}}).mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'alice',
          email: 'alice@example.com',
          role: 'USER',
          emailVerified: true,
          points: 0,
          address: null,
          createdAt: null,
        },
      });

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'secret');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('navigates to from route when location.state.from is set', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.login).mockResolvedValueOnce({username: 'alice', role: 'USER'});
      mockApiGet.mockResolvedValueOnce({data: {id: 1}}).mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'alice',
          email: 'alice@example.com',
          role: 'USER',
          emailVerified: true,
          points: 0,
          address: null,
          createdAt: null,
        },
      });

      renderWithProviders(
        <MemoryRouter initialEntries={[{pathname: '/login', state: {from: '/some-from'}}]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/some-from" element={<div data-testid="from-page">From Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'secret');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(screen.getByTestId('from-page')).toBeInTheDocument();
      });
    });
  });

  describe('password changed banner', () => {
    it('renders a success banner when location.state.reason is password_changed', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={[{pathname: '/login', state: {reason: 'password_changed'}}]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText(/your password has been changed/i)).toBeInTheDocument();
      expect(screen.getByText(/please sign in again/i)).toBeInTheDocument();
    });

    it('does not render the banner when no reason is set', () => {
      renderLoginPage();

      expect(screen.queryByText(/your password has been changed/i)).not.toBeInTheDocument();
    });
  });

  describe('cleanup on unmount', () => {
    it('does not show stale error after unmount and remount', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.login).mockRejectedValueOnce({response: {status: 401}});

      const {unmount} = renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'wrong');
      await user.click(screen.getByRole('button', {name: /sign in/i}));

      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });

      unmount();

      // Remount — stale error should be cleared by resetAuthOp on unmount
      renderLoginPage();
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });
});
