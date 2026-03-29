import {Outlet} from 'react-router';
import {Link, useLocation} from 'react-router';
import {ROUTES} from '../../routes';
import {Mountain, LogOut, Award} from 'lucide-react';
import {Button} from '../ui/button';
import {LanguageSwitcher} from '../App/LanguageSwitcher';
import {useTranslation} from 'react-i18next';

function Navigation() {
  const location = useLocation();
  const {t} = useTranslation();

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{t('appName')}</span>
          </Link>
          <div className="flex items-center gap-6">
            <>
              <Link
                to={ROUTES.dashboard}
                className={`hover:text-green-600 transition-colors ${
                  location.pathname === ROUTES.dashboard ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                {t('rootLayout.dashboard')}
              </Link>
            </>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                <Award className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">
                  {123} {t('points') /*TODO Get actual points from auth state*/}
                </span>
              </div>
              <LanguageSwitcher />
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('rootLayout.logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
