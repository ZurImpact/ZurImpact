import {useTranslation} from 'react-i18next';
import {Button} from '../ui/button';

export function LanguageSwitcher() {
  const {i18n, t} = useTranslation('common');

  return (
    <div className="flex items-center gap-2">
      <span>{t('language')}: </span>
      <Button data-testid="lang-switch-en" variant="outline" size="sm" onClick={() => i18n.changeLanguage('en')}>
        EN
      </Button>
      <Button data-testid="lang-switch-de" variant="outline" size="sm" onClick={() => i18n.changeLanguage('de')}>
        DE
      </Button>
    </div>
  );
}

export default LanguageSwitcher;
