import {describe, it, expect, vi} from 'vitest';
import {screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {RootLayout} from './RootLayout';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        appName: 'ZurImpact',
        'rootLayout.dashboard': 'Dashboard',
        'rootLayout.logout': 'Logout',
        points: 'Points',
        language: 'Language',
      };
      return translations[key] ?? key;
    },
    i18n: {changeLanguage: vi.fn(), language: 'en'},
  }),
  initReactI18next: {type: '3rdParty'},
}));

vi.mock('../../utility/i18n', () => ({
  __esModule: true,
  default: {changeLanguage: vi.fn(), language: 'en'},
}));

const renderWithRouter = (initialRoute = '/') => {
  return renderWithProviders(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="dashboard" element={<div>Dashboard Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
};

describe('RootLayout', () => {
  it('renders the app name in the nav bar', () => {
    renderWithRouter();

    expect(screen.getByText('ZurImpact')).toBeInTheDocument();
  });

  it('renders the dashboard navigation link', () => {
    renderWithRouter();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders the logout button', () => {
    renderWithRouter();

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders points display', () => {
    renderWithRouter();

    // "123 Points" is combined in a single span
    expect(screen.getByText(/123/)).toBeInTheDocument();
    expect(screen.getByText(/Points/)).toBeInTheDocument();
  });

  it('renders the child route via Outlet', () => {
    renderWithRouter('/dashboard');

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('highlights dashboard link when on dashboard route', () => {
    renderWithRouter('/dashboard');

    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toHaveClass('text-green-600');
  });
});
