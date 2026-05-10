import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen} from '@testing-library/react';
import App from './App';
import {renderWithProviders} from '../../test/test.utils';

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({data: {}}),
    post: vi.fn().mockResolvedValue({data: {}}),
  },
}));

// Stub heavy page components to keep App routing tests fast
vi.mock('../ActionDashboard/ActionDashboard', () => ({
  ActionDashboard: () => <div data-testid="action-dashboard-stub">dashboard</div>,
}));

vi.mock('../MapTrackingPage/MapTrackingPage', () => ({
  MapTrackingPage: () => <div data-testid="map-stub">map</div>,
}));

vi.mock('../ActionDetailPage/GpsActionDetailPage', () => ({
  GpsActionDetailPage: () => <div data-testid="action-detail-stub">action</div>,
}));

vi.mock('../Rewardspage/Rewardspage', () => ({
  RewardsPage: () => <div data-testid="rewards-stub">rewards</div>,
}));

vi.mock('../Auth/LoginPage', () => ({
  LoginPage: () => <div data-testid="login-stub">login</div>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('shows the auth layout with login stub when not authenticated', async () => {
    renderWithProviders(<App />, {
      preloadedState: {
        user: {loading: false, isAuthenticated: false, currentUser: null, error: null},
      },
    });
    expect(await screen.findByTestId('login-stub')).toBeInTheDocument();
  });

  it('shows the dashboard when authenticated', async () => {
    renderWithProviders(<App />, {
      preloadedState: {
        user: {
          loading: false,
          isAuthenticated: true,
          currentUser: {
            id: 1,
            username: 'testuser',
            email: 'test@test.com',
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
    expect(await screen.findByTestId('action-dashboard-stub')).toBeInTheDocument();
  });
});
