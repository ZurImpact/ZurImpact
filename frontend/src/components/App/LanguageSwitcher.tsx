import {useTranslation} from 'react-i18next';

export function LanguageSwitcher() {
  const {i18n, t} = useTranslation('common');

  return (
    <div>
      <span>{t('language')}: </span>
      <button type="button" onClick={() => i18n.changeLanguage('en')}>
        EN
      </button>
      <button type="button" onClick={() => i18n.changeLanguage('de')}>
        DE
      </button>
    </div>
  );
}

export default LanguageSwitcher;
