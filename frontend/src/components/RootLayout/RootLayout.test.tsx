import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import userEvent from '@testing-library/user-event';
import {renderWithProviders} from '../../test/test.utils';
import {RootLayout} from './RootLayout';

const mockApiGet = vi.hoisted(() => vi.fn());
const mockApiPost = vi.hoisted(() => vi.fn());

vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

vi.mock('../../utility/i18n', () => ({
  __esModule: true,
  default: {changeLanguage: vi.fn(), language: 'en'},
}));

const renderWithRouter = (initialRoute = '/', options?: Record<string, unknown>) => {
  return renderWithProviders(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="dashboard" element={<div>Dashboard Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
    options,
  );
};

describe('RootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue({
      data: {id: 1, name: 'Test User', email: 'test@test.com', points: 123},
    });
    mockApiPost.mockResolvedValue({});
  });

  it('renders the app name translation key', async () => {
    renderWithRouter();

    expect(await screen.findByText('appName')).toBeInTheDocument();
  });

  it('renders the dashboard navigation link', async () => {
    renderWithRouter();

    expect(await screen.findByText('rootLayout.dashboard')).toBeInTheDocument();
  });

  it('renders the Sign out button when authenticated', async () => {
    renderWithRouter('/', {
      preloadedState: {
        user: {
          currentUser: {id: 1, points: 123, username: 'testuser', email: 'test@test.com', role: 'USER', emailVerified: true, address: null, createdAt: null},
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });

    expect(await screen.findByRole('button', {name: /sign out/i})).toBeInTheDocument();
  });

  it('calls dev login endpoint via dev login button and fetches current user', async () => {
    const user = userEvent.setup();
    mockApiGet.mockReset();
    mockApiGet
      .mockResolvedValueOnce({data: {id: 1}})
      .mockResolvedValueOnce({data: {id: 1, name: 'Test User', email: 'test@test.com', points: 123}});

    renderWithRouter();

    const devLoginButton = await screen.findByRole('button', {name: /dev login/i});
    await user.click(devLoginButton);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/auth/dev-login', {username: 'alice'});
    });
  });

  it('renders points display', async () => {
    renderWithRouter('/', {
      preloadedState: {
        user: {
          currentUser: {id: 1, points: 123, username: 'testuser', email: 'test@test.com', role: 'USER', emailVerified: true, address: null, createdAt: null},
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });

    // "123 points" is combined in a single span
    expect(await screen.findByText(/123/)).toBeInTheDocument();
    expect(await screen.findByText(/points/)).toBeInTheDocument();
  });

  it('renders the child route via Outlet', async () => {
    renderWithRouter('/dashboard');

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('highlights dashboard link when on dashboard route', async () => {
    renderWithRouter('/dashboard');

    const dashboardLink = await screen.findByText('rootLayout.dashboard');
    expect(dashboardLink).toHaveClass('text-brand');
  });
});
