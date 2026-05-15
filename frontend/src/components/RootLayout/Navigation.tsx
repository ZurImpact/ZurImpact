import {Link, useLocation, useNavigate} from 'react-router';
import {Mountain, Award, Menu, Moon, Sun, LogOut, LogIn} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useTheme} from 'next-themes';
import {useState} from 'react';
import {Sheet, SheetContent, SheetTrigger} from '../ui/sheet';
import {Button} from '../ui/button';
import apiClient from '../../api/apiClient';
import {logout, fetchCurrentUser} from '../../store/slices/UserSlice';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {ROUTES} from '../../routes';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {theme, setTheme} = useTheme();
  const dispatch = useAppDispatch();
  const {currentUser, isAuthenticated, loading} = useAppSelector((s) => s.user);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const points = currentUser?.points ?? 0;

  const navLinks = [
    {to: ROUTES.home, label: t('rootLayout.home')},
    {to: ROUTES.about, label: t('rootLayout.about')},
    {to: ROUTES.dashboard, label: t('rootLayout.dashboard')},
    {to: ROUTES.track, label: t('rootLayout.track')},
    {to: ROUTES.rewards, label: t('rootLayout.rewards')},
    {to: ROUTES.faq, label: t('rootLayout.faq')},
  ];

  /**
   * const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLang);
  };
   */

  const renderLanguageButton = () => (
    <></>
    /**
     * <button
     *   onClick={toggleLanguage}
     *   className="p-2 rounded-md hover:bg-surface-container-high"
     *   aria-label={t('rootLayout.switchLanguage')}
     * >
     *   <Languages className="h-5 w-5" aria-hidden="true" />
     *   <span className="text-xs font-medium">{i18n.language.toUpperCase()}</span>
     * </button>
     */
  );

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

  const renderNavLinks = (mobile = false) => {
    const linksToShow = isAuthenticated
      ? navLinks
      : navLinks.filter((link) => link.to === ROUTES.home || link.to === ROUTES.about || link.to === ROUTES.faq);

    return linksToShow.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        className={
          mobile
            ? `text-lg hover:text-brand transition-colors ${
                location.pathname === link.to ? 'text-brand font-semibold' : 'text-muted-foreground'
              }`
            : `hover:text-brand transition-colors ${
                location.pathname === link.to ? 'text-brand' : 'text-muted-foreground'
              }`
        }
        aria-current={location.pathname === link.to ? 'page' : undefined}
      >
        {link.label}
      </Link>
    ));
  };

  const renderPoints = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-brand-container border border-brand rounded-full">
        <Award className="h-4 w-4 text-on-brand-container" aria-hidden="true" />
        <span className="font-medium text-on-brand-container">{`${points} ${t('points')}`}</span>
      </div>
    );
  };

  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await apiClient.post('/auth/dev-login', {username: 'alice'});
      await dispatch(fetchCurrentUser());
      navigate(ROUTES.dashboard);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      dispatch(logout());
      navigate(ROUTES.home);
      return;
    }

    void handleLogin();
  };

  const renderAuthButton = (className = '') => (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 bg-card border ${className}`.trim()}
      onClick={handleAuthAction}
      disabled={!isAuthenticated && (loading || isAuthenticating)}
    >
      {isAuthenticated ? (
        <LogOut className="h-4 w-4" aria-hidden="true" />
      ) : (
        <LogIn className="h-4 w-4" aria-hidden="true" />
      )}
      {isAuthenticated ? t('rootLayout.logout') : t('rootLayout.login')}
    </Button>
  );

  return (
    <nav className="bg-background border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-brand" />
            <span className="text-2xl font-bold text-brand">{t('appName')}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {renderNavLinks()}
            {renderThemeButton()}
            {renderLanguageButton()}
            <div className="flex items-center gap-3">
              {renderPoints()}
              {renderAuthButton()}
            </div>
          </div>
          <div className="flex md:hidden items-center gap-4">
            {renderThemeButton()}
            {renderLanguageButton()}
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
                  {renderNavLinks(true)}
                  <div className="mt-4 flex flex-col gap-3 pr-8">
                    {renderPoints()}
                    {renderAuthButton('w-full justify-center')}
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
