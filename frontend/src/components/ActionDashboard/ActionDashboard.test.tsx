import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {ActionDashboard} from './ActionDashboard';
import type {ActionDto} from '../../store/slices/ActionSlice';

const mockGet = vi.fn();

vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
  },
}));

const mockActions: ActionDto[] = [
  {id: 1, displayName: 'Clean Park', description: 'Help clean', points: 50, tags: ['SOCIAL']},
  {id: 2, displayName: 'Plant Tree', description: 'Plant a tree', points: 100, tags: ['FOOD']},
];

const mockUserActions = [
  {
    actionId: 1,
    displayName: 'Clean Park',
    points: 50,
    completionState: 'COMPLETED',
    actionCreatedOn: '2026-03-01',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

const renderAuthenticatedDashboard = () =>
  renderWithProviders(
    <BrowserRouter>
      <ActionDashboard />
    </BrowserRouter>,
    {
      preloadedState: {
        user: {
          currentUser: {id: 1, username: 'Test User', email: 'test@example.com', points: 100},
          roles: [],
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    },
  );

const renderAuthenticatedDashboardWithRoles = (roles: string[]) =>
  renderWithProviders(
    <BrowserRouter>
      <ActionDashboard />
    </BrowserRouter>,
    {
      preloadedState: {
        user: {
          currentUser: {id: 1, username: 'Test User', email: 'test@example.com', points: 100},
          roles,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    },
  );

describe('ActionDashboard', () => {
  it('renders the header and subheader translation keys', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboard();

    expect(await screen.findByText('actionDashboard.header')).toBeInTheDocument();
    expect(await screen.findByText('actionDashboard.subheader')).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    // Never resolve — keeps the component in loading state
    mockGet.mockReturnValue(new Promise(() => {}));
    renderAuthenticatedDashboard();

    expect(screen.getByText('actionDashboard.loading')).toBeInTheDocument();
  });

  it('shows empty state when API returns no actions', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboard();

    await waitFor(() => {
      expect(screen.getByText('actionDashboard.noActions')).toBeInTheDocument();
    });
  });

  it('renders action cards when API returns actions', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/actions') return Promise.resolve({data: mockActions});
      return Promise.resolve({data: []});
    });
    renderAuthenticatedDashboard();

    expect(await screen.findByText('Clean Park')).toBeInTheDocument();
    expect(screen.getByText('Plant Tree')).toBeInTheDocument();
  });

  it('renders user action history with points', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/actions') return Promise.resolve({data: mockActions});
      if (url.includes('getUserActions')) return Promise.resolve({data: mockUserActions});
      return Promise.resolve({data: []});
    });
    renderAuthenticatedDashboard();

    await waitFor(() => {
      expect(screen.getByText('+50')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    renderAuthenticatedDashboard();

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('renders activity history section title', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboard();

    expect(await screen.findByText('actionDashboard.historyTitle')).toBeInTheDocument();
  });

  it('shows create action button for admin users', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboardWithRoles(['ADMIN']);

    expect(await screen.findByRole('button', {name: 'actionDashboard.createAction'})).toBeInTheDocument();
  });

  it('hides create action button for regular users', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboardWithRoles(['ROLE_USER']);

    expect(screen.queryByRole('button', {name: 'actionDashboard.createAction'})).not.toBeInTheDocument();
  });

  it('shows login prompt when user is not authenticated', () => {
    renderWithProviders(
      <BrowserRouter>
        <ActionDashboard />
      </BrowserRouter>,
      {
        preloadedState: {
          user: {
            currentUser: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          },
        },
      },
    );

    expect(screen.getByText('actionDashboard.loginPrompt')).toBeInTheDocument();
  });
});
