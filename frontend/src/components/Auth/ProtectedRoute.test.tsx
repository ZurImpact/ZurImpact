import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {ProtectedRoute} from './ProtectedRoute';

function renderProtectedRoute(preloadedState: Parameters<typeof renderWithProviders>[1]) {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div data-testid="protected-content">Protected</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
    preloadedState,
  );
}

describe('ProtectedRoute', () => {
  it('shows spinner when loading is true', () => {
    renderProtectedRoute({
      preloadedState: {
        user: {loading: true, isAuthenticated: false, currentUser: null, error: null},
      },
    });
    expect(screen.getByTestId('protected-route-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated and not loading', () => {
    renderProtectedRoute({
      preloadedState: {
        user: {loading: false, isAuthenticated: false, currentUser: null, error: null},
      },
    });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders Outlet content when authenticated', () => {
    renderProtectedRoute({
      preloadedState: {
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: {
            id: 1,
            username: 'alice',
            email: 'alice@example.com',
            role: 'USER',
            emailVerified: true,
            points: 0,
            address: null,
            createdAt: null,
          },
          error: null,
        },
      },
    });
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
