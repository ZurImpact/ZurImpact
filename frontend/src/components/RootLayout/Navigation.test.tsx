import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {type DeepPartial, type RootState} from '../../store/store';
import {Navigation} from './Navigation';

const mockApiPost = vi.hoisted(() => vi.fn());
const mockApiGet = vi.hoisted(() => vi.fn());

vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
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

vi.mock('../../utility/i18n', () => ({
  __esModule: true,
  default: {changeLanguage: vi.fn(), language: 'en'},
}));

import * as authApi from '../../api/authApi';

const authenticatedState = {
  user: {
    currentUser: {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      role: 'USER',
      emailVerified: true,
      points: 42,
      address: null,
      createdAt: null,
      hasPendingEmailChange: false,
    },
    isAuthenticated: true,
    loading: false,
    error: null,
  },
};

const unauthenticatedState = {
  user: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
};

function renderNavigation(preloadedState?: DeepPartial<RootState>) {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Navigation />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
    {preloadedState},
  );
}

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue({
      data: {
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        role: 'USER',
        emailVerified: true,
        points: 42,
        address: null,
        createdAt: null,
      },
    });
    mockApiPost.mockResolvedValue({});
  });

  describe('unauthenticated state', () => {
    it('shows Sign in link pointing to /login', () => {
      renderNavigation(unauthenticatedState);

      const signInLink = screen.getByRole('link', {name: /sign in/i});
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('shows Sign up link pointing to /register', () => {
      renderNavigation(unauthenticatedState);

      const signUpLink = screen.getByRole('link', {name: /sign up/i});
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/register');
    });

    it('does not show Sign out button when unauthenticated', () => {
      renderNavigation(unauthenticatedState);

      expect(screen.queryByRole('button', {name: /sign out/i})).not.toBeInTheDocument();
    });

    it('does not show points display when unauthenticated', () => {
      renderNavigation(unauthenticatedState);

      expect(screen.queryByText(/42/)).not.toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    it('shows username when authenticated', () => {
      renderNavigation(authenticatedState);

      expect(screen.getByText('alice')).toBeInTheDocument();
    });

    it('shows points display when authenticated', () => {
      renderNavigation(authenticatedState);

      expect(screen.getByText(/42/)).toBeInTheDocument();
    });

    it('shows Sign out button when authenticated', () => {
      renderNavigation(authenticatedState);

      expect(screen.getByRole('button', {name: /sign out/i})).toBeInTheDocument();
    });

    it('shows profile link pointing to /profile when authenticated', () => {
      renderNavigation(authenticatedState);

      const profileLink = screen.getByRole('link', {name: /profile/i});
      expect(profileLink).toBeInTheDocument();
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('does not show Sign in link when authenticated', () => {
      renderNavigation(authenticatedState);

      expect(screen.queryByRole('link', {name: /sign in/i})).not.toBeInTheDocument();
    });

    it('dispatches logoutUser and navigates to /login when Sign out is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.logout).mockResolvedValueOnce(undefined);

      renderNavigation(authenticatedState);

      const signOutButton = screen.getByRole('button', {name: /sign out/i});
      await user.click(signOutButton);

      await waitFor(() => {
        expect(vi.mocked(authApi.logout)).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });
});
