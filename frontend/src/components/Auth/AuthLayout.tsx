import {Outlet, Link} from 'react-router';
import {ROUTES} from '../../routes';
import {useTranslation} from 'react-i18next';
import logo from '/logo.png';

export function AuthLayout() {
  const {t} = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <img src={logo} alt={t('auth.layout.logoAlt')} className="h-8 w-auto" aria-hidden="true" />
          <span className="text-2xl font-bold text-brand">{t('auth.layout.logoAlt')}</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
