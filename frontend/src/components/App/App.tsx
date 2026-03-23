import {useTranslation} from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function App() {
  useTranslation(['common']);

  return <LanguageSwitcher />;
}

export default App;
