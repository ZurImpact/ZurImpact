import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function App() {
    const { t } = useTranslation(['common']);

    return (
        <LanguageSwitcher />
    );
}

export default App;
