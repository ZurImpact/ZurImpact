import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {ActionDashboard} from './ActionDashboard';
import type {ActionDto} from '../../store/slices/ActionSlice';
import type {UserDto, UserRole} from '../../store/slices/UserSlice';
import {resolveT} from '../../test/setup';

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

const baseUser: UserDto = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
  emailVerified: true,
  points: 100,
  address: null,
  createdAt: null,
};

const renderAuthenticatedDashboard = () =>
  renderWithProviders(
    <BrowserRouter>
      <ActionDashboard />
    </BrowserRouter>,
    {
      preloadedState: {
        user: {
          currentUser: baseUser,
          roles: [],
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    },
  );

const renderAuthenticatedDashboardWithRoles = (roles: UserRole[]) =>
  renderWithProviders(
    <BrowserRouter>
      <ActionDashboard />
    </BrowserRouter>,
    {
      preloadedState: {
        user: {
          currentUser: baseUser,
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

    expect(await screen.findByText(resolveT('actionDashboard.header'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('actionDashboard.subheader'))).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    // Never resolve — keeps the component in loading state
    mockGet.mockReturnValue(new Promise(() => {}));
    renderAuthenticatedDashboard();

    expect(screen.getByText(resolveT('actionDashboard.loading'))).toBeInTheDocument();
  });

  it('shows empty state when API returns no actions', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboard();

    await waitFor(() => {
      expect(screen.getByText(resolveT('actionDashboard.noActions'))).toBeInTheDocument();
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

  it('hides completed actions from the available actions grid', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/actions') return Promise.resolve({data: mockActions});
      if (url === '/users/me/actions' || url.startsWith('/users/me/actions?'))
        return Promise.resolve({data: mockUserActions});
      return Promise.resolve({data: []});
    });
    renderAuthenticatedDashboard();

    expect(await screen.findByText('Plant Tree')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /Clean Park/i})).not.toBeInTheDocument();
  });

  it('renders user action history with points', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/actions') return Promise.resolve({data: mockActions});
      if (url === '/users/me/actions' || url.startsWith('/users/me/actions?'))
        return Promise.resolve({data: mockUserActions});
      return Promise.resolve({data: []});
    });
    renderAuthenticatedDashboard();

    await waitFor(() => {
      expect(screen.getByText('+50')).toBeInTheDocument();
    });
  });

  it('shows an empty state when all available actions are completed', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/actions') return Promise.resolve({data: [mockActions[0]]});
      if (url === '/users/me/actions' || url.startsWith('/users/me/actions?'))
        return Promise.resolve({data: mockUserActions});
      return Promise.resolve({data: []});
    });
    renderAuthenticatedDashboard();

    expect(await screen.findByText(resolveT('actionDashboard.noAvailableActions'))).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    renderAuthenticatedDashboard();

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('renders activity history section title', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboard();

    expect(await screen.findByText(resolveT('actionDashboard.historyTitle'))).toBeInTheDocument();
  });

  it('shows create action button for admin users', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboardWithRoles(['ADMIN']);

    expect(await screen.findByRole('button', {name: resolveT('actionDashboard.createAction')})).toBeInTheDocument();
  });

  it('hides create action button for regular users', async () => {
    mockGet.mockResolvedValue({data: []});
    renderAuthenticatedDashboardWithRoles(['ROLE_USER']);

    expect(screen.queryByRole('button', {name: resolveT('actionDashboard.createAction')})).not.toBeInTheDocument();
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
            roles: [],
            isAuthenticated: false,
            loading: false,
            error: null,
          },
        },
      },
    );

    expect(screen.getByText(resolveT('actionDashboard.loginPrompt'))).toBeInTheDocument();
  });
});
