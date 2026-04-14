import {Link, useLocation} from 'react-router';
import {ROUTES} from '../../routes';
import {Mountain, Award, Menu, Moon, Sun} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useTheme} from 'next-themes';
import {useAppSelector} from '../../store/store';
import {Sheet, SheetContent, SheetTrigger} from '../ui/sheet';

export const Navigation = () => {
  const location = useLocation();
  const {t} = useTranslation();
  const {theme, setTheme} = useTheme();
  const user = useAppSelector((state) => state.user.user);

  const navLinks = [
    {to: ROUTES.dashboard, label: t('rootLayout.dashboard')},
    {to: ROUTES.track, label: t('rootLayout.track')},
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
      onClick={toggleLanguage}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
      title="Toggle language"
    >
      <Languages className="h-5 w-5" />
      <span className="text-xs font-medium">{i18n.language.toUpperCase()}</span>
    </button>
     */
  );

  const renderThemeButton = () => (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
  return (
    <nav className="bg-background border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{t('appName')}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:text-green-600 transition-colors ${
                  location.pathname === link.to ? 'text-green-600' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {renderThemeButton()}
            {renderLanguageButton()}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                <Award className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">
                  {user ? user.points : '--'} {t('points')}
                </span>
              </div>
              {/**
               * <Button variant="outline" size="sm" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('rootLayout.logout')}
              </Button>
               */}
            </div>
          </div>
          <div className="flex md:hidden items-center gap-4">
            {renderThemeButton()}
            {renderLanguageButton()}
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-13 pl-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`text-lg hover:text-green-600 transition-colors ${
                        location.pathname === link.to ? 'text-green-600 font-semibold' : 'text-gray-300'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
