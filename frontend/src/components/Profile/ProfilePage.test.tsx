import {describe, it, expect, vi} from 'vitest';
import {screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {type DeepPartial, type RootState} from '../../store/store';
import {ProfilePage} from './ProfilePage';

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

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const fullyPopulatedUser = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  role: 'USER',
  emailVerified: true,
  points: 250,
  address: null,
  createdAt: '2024-03-15T10:00:00Z',
};

function renderProfilePage(preloadedState?: DeepPartial<RootState>) {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>,
    {preloadedState},
  );
}

describe('ProfilePage', () => {
  describe('with fully populated currentUser', () => {
    it('renders username, email, role, and points', () => {
      renderProfilePage({
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: fullyPopulatedUser,
          error: null,
        },
      });

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('USER')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
    });

    it('renders Verified badge when emailVerified is true', () => {
      renderProfilePage({
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: {...fullyPopulatedUser, emailVerified: true},
          error: null,
        },
      });

      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    it('renders formatted createdAt date', () => {
      renderProfilePage({
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: fullyPopulatedUser,
          error: null,
        },
      });

      // The date 2024-03-15 should appear in some human-readable format
      expect(screen.getByText(/march.*2024|2024.*march|mar.*2024|15.*2024/i)).toBeInTheDocument();
    });
  });

  describe('with emailVerified false', () => {
    it('renders Not verified badge', () => {
      renderProfilePage({
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: {...fullyPopulatedUser, emailVerified: false},
          error: null,
        },
      });

      expect(screen.getByText('Not verified')).toBeInTheDocument();
    });
  });

  describe('address handling', () => {
    it('does not render address row when address is null', () => {
      renderProfilePage({
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: {...fullyPopulatedUser, address: null},
          error: null,
        },
      });

      expect(screen.queryByText(/address/i)).not.toBeInTheDocument();
    });

    it('renders address row when address is a number', () => {
      renderProfilePage({
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: {...fullyPopulatedUser, address: 42},
          error: null,
        },
      });

      expect(screen.getByText(/address.*42|#42/i)).toBeInTheDocument();
    });
  });

  describe('with null currentUser', () => {
    it('renders graceful loading state without crashing', () => {
      renderProfilePage({
        user: {
          loading: false,
          isAuthenticated: false,
          currentUser: null,
          error: null,
        },
      });

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      // Should not show user PII
      expect(screen.queryByText('alice')).not.toBeInTheDocument();
      expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
    });
  });

  describe('ChangePasswordForm inclusion', () => {
    it('includes the ChangePasswordForm via "Change password" heading', () => {
      renderProfilePage({
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: fullyPopulatedUser,
          error: null,
        },
      });

      expect(screen.getByRole('heading', {name: /change password/i})).toBeInTheDocument();
    });
  });
});
