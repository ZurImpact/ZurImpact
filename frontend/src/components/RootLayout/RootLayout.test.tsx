import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {RootLayout} from './RootLayout';

const mockApiGet = vi.hoisted(() => vi.fn());

vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {changeLanguage: vi.fn(), language: 'en'},
  }),
  initReactI18next: {type: '3rdParty'},
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
  });

  it('renders the app name translation key', async () => {
    renderWithRouter();

    expect(await screen.findByText('appName')).toBeInTheDocument();
  });

  it('renders the dashboard navigation link', async () => {
    renderWithRouter();

    expect(await screen.findByText('rootLayout.dashboard')).toBeInTheDocument();
  });

  /**
 *   it('renders the logout button', () => {
    renderWithRouter();

    expect(screen.getByText('rootLayout.logout')).toBeInTheDocument();
  });
 */

  it('renders points display', async () => {
    renderWithRouter('/', {
      preloadedState: {
        user: {
          currentUser: {id: 1, points: 123, name: 'Test User', email: 'test@test.com'},
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
    expect(dashboardLink).toHaveClass('text-green-600');
  });
});
