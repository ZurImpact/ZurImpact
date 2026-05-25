import {Link, Outlet} from 'react-router';
import {Mountain} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {ROUTES} from '../../routes';

export function AuthLayout() {
  const {t} = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link to={ROUTES.root} className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Mountain className="h-8 w-8 text-brand" aria-hidden="true" />
          <span className="text-2xl font-bold text-brand">{t('auth.layout.logoAlt')}</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
