import {Outlet} from 'react-router';
import {useEffect} from 'react';
import {Navigation} from './Navigation';
import {useAppDispatch} from '../../store/store';
import {fetchCurrentUser} from '../../store/slices/UserSlice';
import {useTranslation} from 'react-i18next';

export function RootLayout() {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* next line = for vision impaired people (NVDA) -> screen readers can skip directly to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-2 focus:outline-ring"
      >
        {t('rootLayout.skipToContent')}
      </a>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
