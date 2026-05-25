import {Link, useLocation, useNavigate} from 'react-router';
import {Award, Menu, Moon, Sun, LogOut, LogIn, User, UserPlus} from 'lucide-react';
import logo from '/logo.png';
import {useTranslation} from 'react-i18next';
import {useTheme} from 'next-themes';
import {Sheet, SheetContent, SheetTrigger} from '../ui/sheet';
// import {Button} from '../ui/button';
import {logoutUser} from '../../store/slices/AuthSlice';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {ROUTES} from '../../routes';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {theme, setTheme} = useTheme();
  const dispatch = useAppDispatch();
  const {currentUser, isAuthenticated} = useAppSelector((s) => s.user);
  const points = currentUser?.points ?? 0;

  const navLinks = [
    {to: ROUTES.home, label: t('rootLayout.home')},
    {to: ROUTES.about, label: t('rootLayout.about')},
    {to: ROUTES.partners, label: t('rootLayout.partners')},
    {to: ROUTES.dashboard, label: t('rootLayout.dashboard')},
    {to: ROUTES.track, label: t('rootLayout.track')},
    {to: ROUTES.rewards, label: t('rootLayout.rewards')},
    {to: ROUTES.faq, label: t('rootLayout.faq')},
  ];

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.login);
  };

  // Shared classes so auth links look more aligned with nav links
  const linkClass = (to: string, mobile = false) => {
    const base = mobile
      ? 'text-lg hover:text-brand transition-colors whitespace-nowrap flex items-center gap-2'
      : 'hover:text-brand transition-colors whitespace-nowrap flex items-center gap-1';
    const active =
      location.pathname === to ? (mobile ? 'text-brand font-semibold' : 'text-brand') : 'text-muted-foreground';
    return `${base} ${active}`;
  };

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
      ? navLinks.filter(
          (link) => link.to === ROUTES.dashboard || link.to === ROUTES.track || link.to === ROUTES.rewards,
        )
      : navLinks.filter(
          (link) =>
            link.to === ROUTES.home ||
            link.to === ROUTES.about ||
            link.to === ROUTES.partners ||
            link.to === ROUTES.faq,
        );

    return linksToShow.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        className={linkClass(link.to, mobile)}
        aria-current={location.pathname === link.to ? 'page' : undefined}
      >
        {link.label}
      </Link>
    ));
  };

  // Auth links rendered as individual items, so they flow with the nav links
  const renderAuthLinks = (mobile = false) => {
    if (isAuthenticated) {
      return (
        <>
          <Link to={ROUTES.profile} className={linkClass(ROUTES.profile, mobile)}>
            <User className={mobile ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0'} aria-hidden="true" />
            {t('rootLayout.profile')}
          </Link>
          <button onClick={() => void handleSignOut()} className={`${linkClass('', mobile)} text-left`}>
            <LogOut className={mobile ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0'} aria-hidden="true" />
            {t('rootLayout.signOut')}
          </button>
        </>
      );
    }

    return (
      <>
        <Link to={ROUTES.login} className={linkClass(ROUTES.login, mobile)}>
          <LogIn className={mobile ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0'} aria-hidden="true" />
          {t('rootLayout.signIn')}
        </Link>
        <Link to={ROUTES.register} className={linkClass(ROUTES.register, mobile)}>
          <UserPlus className={mobile ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0'} aria-hidden="true" />
          {t('rootLayout.signUp')}
        </Link>
      </>
    );
  };

  const renderPointsDisplay = (mobile = false) => {
    if (!isAuthenticated) return null;
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 bg-brand-container border border-brand rounded-full shrink-0 whitespace-nowrap ${
          mobile ? 'self-start' : ''
        }`}
      >
        <Award className="h-4 w-4 text-on-brand-container shrink-0" aria-hidden="true" />
        <span className="font-medium text-on-brand-container whitespace-nowrap">{`${points} ${t('points')}`}</span>
      </div>
    );
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt={t('appName')} className="h-8 w-auto" />
            <span className="text-2xl font-bold text-brand whitespace-nowrap">{t('appName')}</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 ml-6">
            {renderNavLinks()}
            {/* Subtle separator before auth section */}
            <div className="h-5 w-px bg-border" aria-hidden="true" />
            {renderAuthLinks()}
            {isAuthenticated && <span className="text-sm font-medium whitespace-nowrap">{currentUser?.username}</span>}
            {renderPointsDisplay()}
            {renderThemeButton()}
          </div>

          {/* Mobile */}
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
                  {renderNavLinks(true)}
                  {/* Separator between nav and auth */}
                  <div className="h-px w-3/4 bg-border my-2" aria-hidden="true" />
                  {isAuthenticated && <span className="text-sm font-medium">{currentUser?.username}</span>}
                  {renderAuthLinks(true)}
                  {renderPointsDisplay(true)}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
