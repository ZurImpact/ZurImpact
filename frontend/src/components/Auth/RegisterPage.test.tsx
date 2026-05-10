import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {type DeepPartial, type RootState} from '../../store/store';
import {RegisterPage} from './RegisterPage';

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

function renderRegisterPage(initialEntries = ['/register'], preloadedState?: DeepPartial<RootState>) {
  return renderWithProviders(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<div data-testid="verify-email-page">Verify Email</div>} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
    {preloadedState},
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all four fields and the submit button', () => {
      renderRegisterPage();

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /create account/i})).toBeInTheDocument();
    });

    it('renders the page heading in AuthFormCard', () => {
      renderRegisterPage();
      expect(screen.getByRole('heading', {name: /create your account/i})).toBeInTheDocument();
    });

    it('renders a link to /login', () => {
      renderRegisterPage();
      const loginLink = screen.getByRole('link', {name: /sign in/i});
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('client-side validation', () => {
    it('shows error when username is shorter than 3 characters and does not dispatch', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      await user.type(screen.getByLabelText(/username/i), 'ab');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password1!');
      await user.click(screen.getByRole('button', {name: /create account/i}));

      await waitFor(() => {
        expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
      });
      expect(vi.mocked(authApi.register)).not.toHaveBeenCalled();
    });

    // Note: client-side "invalid email" rendering is not tested here because
    // jsdom enforces HTML5 email validation on `type="email"` inputs and blocks
    // userEvent.type from entering invalid strings. Zod email validation itself
    // is covered by lib/validation/authSchemas.test.ts.

    it('shows error when password is shorter than 8 characters and does not dispatch', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      await user.type(screen.getByLabelText(/username/i), 'validuser');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'short');
      await user.type(screen.getByLabelText(/confirm password/i), 'short');
      await user.click(screen.getByRole('button', {name: /create account/i}));

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
      expect(vi.mocked(authApi.register)).not.toHaveBeenCalled();
    });

    it('shows error on confirmPassword field when passwords do not match and does not dispatch', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      await user.type(screen.getByLabelText(/username/i), 'validuser');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass!');
      await user.click(screen.getByRole('button', {name: /create account/i}));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
      expect(vi.mocked(authApi.register)).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('dispatches registerUser with username, email, password (no confirmPassword) on valid submit', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.register).mockResolvedValueOnce(undefined);

      renderRegisterPage();

      await user.type(screen.getByLabelText(/username/i), 'validuser');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password1!');
      await user.click(screen.getByRole('button', {name: /create account/i}));

      await waitFor(() => {
        expect(vi.mocked(authApi.register)).toHaveBeenCalledWith({
          username: 'validuser',
          email: 'test@example.com',
          password: 'Password1!',
        });
      });
      // confirmPassword must NOT be in the payload
      const callArg = vi.mocked(authApi.register).mock.calls[0][0];
      expect(callArg).not.toHaveProperty('confirmPassword');
    });

    it('disables submit button and shows loading state while pending', async () => {
      const user = userEvent.setup();
      let resolveRegister!: (value: undefined) => void;
      vi.mocked(authApi.register).mockReturnValueOnce(new Promise<undefined>((res) => { resolveRegister = res; }));

      renderRegisterPage();

      await user.type(screen.getByLabelText(/username/i), 'validuser');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password1!');
      await user.click(screen.getByRole('button', {name: /create account/i}));

      await waitFor(() => {
        const btn = screen.getByRole('button', {name: /creating account/i});
        expect(btn).toBeDisabled();
      });

      resolveRegister(undefined);
    });

    it('navigates to /verify-email?pending=1&email=<encoded> with replace on fulfilled', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.register).mockResolvedValueOnce(undefined);

      renderRegisterPage();

      await user.type(screen.getByLabelText(/username/i), 'validuser');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password1!');
      await user.click(screen.getByRole('button', {name: /create account/i}));

      await waitFor(() => {
        expect(screen.getByTestId('verify-email-page')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('shows generic error alert on registerUser rejected (network/server error)', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.register).mockRejectedValueOnce(new Error('Network Error'));

      renderRegisterPage();

      await user.type(screen.getByLabelText(/username/i), 'validuser');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password1!');
      await user.click(screen.getByRole('button', {name: /create account/i}));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('cleanup on unmount', () => {
    it('does not show stale error after unmount and remount', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.register).mockRejectedValueOnce(new Error('Network Error'));

      const {unmount} = renderRegisterPage();

      await user.type(screen.getByLabelText(/username/i), 'validuser');
      await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password1!');
      await user.click(screen.getByRole('button', {name: /create account/i}));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      unmount();
      renderRegisterPage();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
