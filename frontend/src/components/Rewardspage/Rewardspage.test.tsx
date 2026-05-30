import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RewardsPage} from './Rewardspage';
import {renderWithProviders} from '../../test/test.utils';
import type {DeepPartial, RootState} from '../../store/store';
import {mockToastSuccess, mockToastError, resolveT} from '../../test/setup';
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

const baseRewards = [
  {
    id: 'r1',
    title: 'Coffee Voucher',
    description: 'A free coffee',
    points: 100,
    icon: 'Coffee',
    available: 5,
  },
  {
    id: 'r2',
    title: 'Museum Ticket',
    description: 'One museum entry',
    points: 200,
    icon: 'Ticket',
    available: 2,
  },
];

const renderRewardsPage = (preloadedState: DeepPartial<RootState> = {}) => {
  return renderWithProviders(<RewardsPage />, {preloadedState});
};

describe('RewardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGet.mockImplementation((url: string) => {
      if (url === '/auth/whoami') return Promise.resolve({data: {id: 1}});
      if (url.startsWith('/users/'))
        return Promise.resolve({
          data: {
            id: 1,
            username: 'testuser',
            email: 'user@example.com',
            role: 'USER',
            emailVerified: true,
            points: 300,
            address: null,
            createdAt: null,
            hasPendingEmailChange: false,
          },
        });
      if (url === '/vouchers') return Promise.resolve({data: baseRewards});
      return Promise.resolve({data: {}});
    });

    mockPost.mockResolvedValue({data: {success: true}});
  });

  it('dispatches initial user and rewards fetch actions', async () => {
    renderRewardsPage({
      rewards: {
        rewards: baseRewards,
      },
      user: {
        currentUser: {
          id: 1,
          username: 'testuser',
          email: 'user@example.com',
          role: 'USER',
          emailVerified: true,
          points: 300,
          address: null,
          createdAt: null,
          hasPendingEmailChange: false,
        },
        isAuthenticated: true,
      },
    });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/auth/whoami');
      expect(mockGet).toHaveBeenCalledWith('/vouchers');
    });
  });

  it('renders loading state while user is loading', () => {
    renderRewardsPage({
      user: {
        loading: true,
      },
    });

    expect(screen.getByText(resolveT('rewardsPage.loading'))).toBeInTheDocument();
  });

  it('renders login prompt for unauthenticated users and retries auth', async () => {
    const user = userEvent.setup();

    mockGet.mockImplementation((url: string) => {
      if (url === '/auth/whoami') {
        return Promise.reject({response: {status: 401, data: {error: 'not_authenticated'}}});
      }
      if (url === '/vouchers') return Promise.resolve({data: baseRewards});
      return Promise.resolve({data: {}});
    });

    renderRewardsPage({
      user: {
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: 'not_authenticated',
      },
      rewards: {
        rewards: baseRewards,
      },
    });

    expect(await screen.findByText(resolveT('rewardsPage.loginRequired'))).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: resolveT('rewardsPage.tryAgain')}));

    await waitFor(() => {
      const authCalls = mockGet.mock.calls.filter(([url]) => url === '/auth/whoami');
      expect(authCalls.length).toBe(2);
    });
  });

  it('renders all rewards without category filtering', async () => {
    renderRewardsPage({
      rewards: {
        rewards: baseRewards,
      },
      user: {
        currentUser: {
          id: 1,
          username: 'testuser',
          email: 'user@example.com',
          role: 'USER',
          emailVerified: true,
          points: 300,
          address: null,
          createdAt: null,
          hasPendingEmailChange: false,
        },
        isAuthenticated: true,
      },
    });

    expect(await screen.findByText('Coffee Voucher')).toBeInTheDocument();
    expect(await screen.findByText('Museum Ticket')).toBeInTheDocument();

    expect(screen.queryByRole('button', {name: 'Culture'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Food & Drink'})).not.toBeInTheDocument();
  });

  it('opens and closes redemption dialog', async () => {
    const user = userEvent.setup();

    renderRewardsPage({
      rewards: {
        rewards: baseRewards,
      },
      user: {
        currentUser: {
          id: 1,
          username: 'testuser',
          email: 'user@example.com',
          role: 'USER',
          emailVerified: true,
          points: 300,
          address: null,
          createdAt: null,
          hasPendingEmailChange: false,
        },
        isAuthenticated: true,
      },
    });

    const redeemButtons = await screen.findAllByRole('button', {name: 'Redeem'});
    await user.click(redeemButtons[0]);

    expect(screen.getByText(resolveT('rewardsPage.redeemReward'))).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: resolveT('gpsActionDetail.cancel')}));

    await waitFor(() => {
      expect(screen.queryByText(resolveT('rewardsPage.redeemReward'))).not.toBeInTheDocument();
    });
  });

  it('dispatches redeem action when confirming redemption', async () => {
    const user = userEvent.setup();

    renderRewardsPage({
      rewards: {
        rewards: baseRewards,
      },
      user: {
        currentUser: {
          id: 1,
          username: 'testuser',
          email: 'user@example.com',
          role: 'USER',
          emailVerified: true,
          points: 300,
          address: null,
          createdAt: null,
          hasPendingEmailChange: false,
        },
        isAuthenticated: true,
      },
    });

    const redeemButtons = await screen.findAllByRole('button', {name: 'Redeem'});
    await user.click(redeemButtons[0]);
    await user.click(screen.getByRole('button', {name: resolveT('rewardsPage.confirmRedemptionBtn')}));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/vouchers/r1/redeem');
    });
  });

  it('shows success toast and resets redemption flags when redemption succeeds', async () => {
    const {store} = renderRewardsPage({
      rewards: {
        rewards: baseRewards,
        redemptionSuccess: true,
        redemptionError: null,
      },
      user: {
        currentUser: {
          id: 1,
          username: 'testuser',
          email: 'user@example.com',
          role: 'USER',
          emailVerified: true,
          points: 300,
          address: null,
          createdAt: null,
          hasPendingEmailChange: false,
        },
        isAuthenticated: true,
      },
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(resolveT('rewardsPage.redeemSuccess'));
    });

    await waitFor(() => {
      expect(store.getState().rewards.redemptionSuccess).toBe(false);
      expect(store.getState().rewards.redemptionError).toBeNull();
    });
  });

  it('shows error toast and clears redemption error after reset', async () => {
    const {store} = renderRewardsPage({
      rewards: {
        rewards: baseRewards,
        redemptionSuccess: false,
        redemptionError: 'Voucher unavailable',
      },
      user: {
        currentUser: {
          id: 1,
          username: 'testuser',
          email: 'user@example.com',
          role: 'USER',
          emailVerified: true,
          points: 300,
          address: null,
          createdAt: null,
          hasPendingEmailChange: false,
        },
        isAuthenticated: true,
      },
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Voucher unavailable');
    });

    await waitFor(() => {
      expect(store.getState().rewards.redemptionError).toBeNull();
    });
  });
});
