import {describe, it, expect, vi} from 'vitest';
import {screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {RootLayout} from './RootLayout';
import type {DeepPartial} from '../../store/store';
import type {RootState} from '../../store/store';

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

const mockUser = {id: 1, username: 'zurUser', email: 'zur@example.com', points: 500};

const renderWithRouter = (initialRoute = '/', preloadedState?: DeepPartial<RootState>) => {
  return renderWithProviders(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="dashboard" element={<div>Dashboard Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
    {preloadedState},
  );
};

describe('RootLayout', () => {
  it('renders the app name translation key', () => {
    renderWithRouter();

    expect(screen.getByText('appName')).toBeInTheDocument();
  });

  it('renders the dashboard navigation link', () => {
    renderWithRouter();

    expect(screen.getByText('rootLayout.dashboard')).toBeInTheDocument();
  });

  it('renders points from user store', () => {
    renderWithRouter('/', {
      user: {user: mockUser, loading: false, error: null},
    });

    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.getByText(/points/)).toBeInTheDocument();
  });

  it('shows fallback when user is null', () => {
    renderWithRouter('/', {
      user: {user: null, loading: false, error: null},
    });

    expect(screen.getByText(/--/)).toBeInTheDocument();
  });

  it('shows zero points when user has zero points', () => {
    renderWithRouter('/', {
      user: {user: {...mockUser, points: 0}, loading: false, error: null},
    });

    expect(screen.getByText(/\b0\b/)).toBeInTheDocument();
  });

  it('renders the child route via Outlet', () => {
    renderWithRouter('/dashboard');

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('highlights dashboard link when on dashboard route', () => {
    renderWithRouter('/dashboard');

    const dashboardLink = screen.getByText('rootLayout.dashboard');
    expect(dashboardLink).toHaveClass('text-green-600');
  });
});
