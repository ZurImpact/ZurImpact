import {Link, useLocation, useNavigate} from 'react-router';
import {Mountain, Award, Menu, Moon, Sun, LogOut, LogIn, User} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useTheme} from 'next-themes';
import {useState} from 'react';
import {Sheet, SheetContent, SheetTrigger} from '../ui/sheet';
import {Button} from '../ui/button';
import apiClient from '../../api/apiClient';
import {fetchCurrentUser} from '../../store/slices/UserSlice';
import {logoutUser} from '../../store/slices/AuthSlice';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {ROUTES} from '../../routes';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {theme, setTheme} = useTheme();
  const dispatch = useAppDispatch();
  const {currentUser, isAuthenticated, loading} = useAppSelector((s) => s.user);
  const [isDevLoggingIn, setIsDevLoggingIn] = useState(false);
  const points = currentUser?.points ?? 0;

  const navLinks = [
    {to: ROUTES.dashboard, label: t('rootLayout.dashboard')},
    {to: ROUTES.track, label: t('rootLayout.track')},
    {to: ROUTES.rewards, label: t('rootLayout.rewards')},
  ];

  const renderThemeButton = () => (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-surface-container-high"
      aria-label={theme === 'dark' ? t('rootLayout.switchToLight') : t('rootLayout.switchToDark')}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );

  const handleDevLogin = async () => {
    setIsDevLoggingIn(true);
    try {
      await apiClient.post('/auth/dev-login', {username: 'alice'});
      await dispatch(fetchCurrentUser());
    } finally {
      setIsDevLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.login);
  };

  const renderAuthControls = (className = '') => {
    if (isAuthenticated) {
      return (
        <div className={`flex items-center gap-2 ${className}`.trim()}>
          <span className="text-sm font-medium">{currentUser?.username}</span>
          <Link
            to={ROUTES.profile}
            className="flex items-center gap-1 text-sm hover:text-brand transition-colors"
            aria-label={t('rootLayout.profile')}
          >
            <User className="h-4 w-4" aria-hidden="true" />
            {t('rootLayout.profile')}
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-card border"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('rootLayout.signOut')}
          </Button>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 ${className}`.trim()}>
        <Link
          to={ROUTES.login}
          className="flex items-center gap-1 text-sm hover:text-brand transition-colors"
          aria-label={t('rootLayout.signIn')}
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {t('rootLayout.signIn')}
        </Link>
        <Link
          to={ROUTES.register}
          className="flex items-center gap-1 text-sm hover:text-brand transition-colors"
          aria-label={t('rootLayout.signUp')}
        >
          {t('rootLayout.signUp')}
        </Link>
      </div>
    );
  };

  const renderDevLoginButton = () => {
    if (!import.meta.env.DEV) return null;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={() => void handleDevLogin()}
        disabled={loading || isDevLoggingIn}
      >
        {t('rootLayout.devLogin')}
      </Button>
    );
  };

  const renderPointsDisplay = () => {
    if (!isAuthenticated) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-brand-container border border-brand rounded-full">
        <Award className="h-4 w-4 text-on-brand-container" aria-hidden="true" />
        <span className="font-medium text-on-brand-container">
          {`${points} ${t('points')}`}
        </span>
      </div>
    );
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-brand" />
            <span className="text-2xl font-bold text-brand">{t('appName')}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:text-brand transition-colors ${
                  location.pathname === link.to ? 'text-brand' : 'text-muted-foreground'
                }`}
                aria-current={location.pathname === link.to ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            {renderThemeButton()}
            <div className="flex items-center gap-3">
              {renderPointsDisplay()}
              {renderAuthControls()}
              {renderDevLoginButton()}
            </div>
          </div>
          <div className="flex md:hidden items-center gap-4">
            {renderThemeButton()}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-md hover:bg-surface-container-high"
                  aria-label={t('rootLayout.openMenu')}
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-13 pl-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`text-lg hover:text-brand transition-colors ${
                        location.pathname === link.to ? 'text-brand font-semibold' : 'text-muted-foreground'
                      }`}
                      aria-current={location.pathname === link.to ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4 flex flex-col gap-3 pr-8">
                    {renderPointsDisplay()}
                    {renderAuthControls('w-full flex-col')}
                    {renderDevLoginButton()}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
