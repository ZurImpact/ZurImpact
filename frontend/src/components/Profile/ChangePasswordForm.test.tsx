import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {type DeepPartial, type RootState} from '../../store/store';
import {ChangePasswordForm} from './ChangePasswordForm';

// Mock userApi so real reducer logic still runs through the store
vi.mock('../../api/userApi', () => ({
  changePassword: vi.fn(),
  getUserById: vi.fn(),
}));

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

import * as userApi from '../../api/userApi';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const authenticatedUser = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  role: 'USER',
  emailVerified: true,
  points: 100,
  address: null,
  createdAt: '2024-01-01T00:00:00Z',
  hasPendingEmailChange: false,
};

function renderChangePasswordForm(preloadedState?: DeepPartial<RootState>) {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<ChangePasswordForm />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
    {
      preloadedState: {
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: authenticatedUser,
          error: null,
        },
        ...preloadedState,
      },
    },
  );
}

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders three password fields and a submit button', () => {
      renderChangePasswordForm();

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm.*password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /change password/i})).toBeInTheDocument();
    });

    it('renders a card with "Change password" heading', () => {
      renderChangePasswordForm();

      expect(screen.getByRole('heading', {name: /change password/i})).toBeInTheDocument();
    });

    it('renders description about signing out of all devices', () => {
      renderChangePasswordForm();

      expect(screen.getByText(/sign.*out.*all.*devices/i)).toBeInTheDocument();
    });
  });

  describe('client-side validation', () => {
    it('shows FormMessage when newPassword is shorter than 8 chars and does not dispatch', async () => {
      const user = userEvent.setup();
      renderChangePasswordForm();

      await user.type(screen.getByLabelText(/current password/i), 'oldpass');
      await user.type(screen.getByLabelText(/^new password$/i), 'short');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'short');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });

      expect(vi.mocked(userApi.changePassword)).not.toHaveBeenCalled();
    });

    it('shows FormMessage when passwords do not match and does not dispatch', async () => {
      const user = userEvent.setup();
      renderChangePasswordForm();

      await user.type(screen.getByLabelText(/current password/i), 'oldpass');
      await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'DifferentPass!');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      expect(vi.mocked(userApi.changePassword)).not.toHaveBeenCalled();
    });

    it('shows FormMessage on newPassword when new equals current and does not dispatch', async () => {
      const user = userEvent.setup();
      renderChangePasswordForm();

      await user.type(screen.getByLabelText(/current password/i), 'SamePassword1!');
      await user.type(screen.getByLabelText(/^new password$/i), 'SamePassword1!');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'SamePassword1!');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      await waitFor(() => {
        expect(screen.getByText(/must differ from current/i)).toBeInTheDocument();
      });

      expect(vi.mocked(userApi.changePassword)).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('dispatches changePassword with {currentPassword, newPassword} and not confirmPassword on valid submit', async () => {
      const user = userEvent.setup();
      vi.mocked(userApi.changePassword).mockResolvedValueOnce(undefined);

      renderChangePasswordForm();

      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      await waitFor(() => {
        expect(vi.mocked(userApi.changePassword)).toHaveBeenCalledWith({
          currentPassword: 'OldPassword1!',
          newPassword: 'NewPassword1!',
        });
      });

      // confirmPassword must NOT be in payload
      const callArg = vi.mocked(userApi.changePassword).mock.calls[0][0];
      expect(callArg).not.toHaveProperty('confirmPassword');
    });

    it('disables submit button and shows loading state while pending', async () => {
      const user = userEvent.setup();
      let resolveChangePassword!: (value: undefined) => void;
      vi.mocked(userApi.changePassword).mockReturnValueOnce(
        new Promise<undefined>((res) => {
          resolveChangePassword = res;
        }),
      );

      renderChangePasswordForm();

      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      await waitFor(() => {
        const btn = screen.getByRole('button', {name: /changing/i});
        expect(btn).toBeDisabled();
      });

      resolveChangePassword(undefined);
    });

    it('navigates to /login with reason=password_changed on success (LoginPage clears auth state)', async () => {
      const user = userEvent.setup();
      vi.mocked(userApi.changePassword).mockResolvedValueOnce(undefined);

      renderChangePasswordForm();

      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      // ChangePasswordForm intentionally does NOT dispatch logout — that would
      // race with ProtectedRoute and inject from=/profile into the login state.
      // LoginPage clears auth on mount when it sees reason=password_changed.
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          replace: true,
          state: {reason: 'password_changed'},
        });
      });
    });
  });

  describe('error handling', () => {
    it('shows inline alert about incorrect current password on wrong_current_password error', async () => {
      const user = userEvent.setup();
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

      renderChangePasswordForm();

      await user.type(screen.getByLabelText(/current password/i), 'WrongOldPass!');
      await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/current password is incorrect/i)).toBeInTheDocument();
    });

    it('shows generic error alert for non-wrong_current_password rejections', async () => {
      const user = userEvent.setup();
      vi.mocked(userApi.changePassword).mockRejectedValueOnce(new Error('Network Error'));

      renderChangePasswordForm();

      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/couldn't change password/i)).toBeInTheDocument();
    });
  });

  describe('cleanup on unmount', () => {
    it('resets changePassword auth op on unmount', async () => {
      vi.mocked(userApi.changePassword).mockRejectedValueOnce(new Error('Network Error'));

      const {store, unmount} = renderChangePasswordForm();

      const user = userEvent.setup();
      await user.type(screen.getByLabelText(/current password/i), 'OldPassword1!');
      await user.type(screen.getByLabelText(/^new password$/i), 'NewPassword1!');
      await user.type(screen.getByLabelText(/confirm.*password/i), 'NewPassword1!');
      await user.click(screen.getByRole('button', {name: /change password/i}));

      await waitFor(() => {
        expect(store.getState().auth.changePassword.status).toBe('rejected');
      });

      unmount();

      expect(store.getState().auth.changePassword.status).toBe('idle');
    });
  });
});
