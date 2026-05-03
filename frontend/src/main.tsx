import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import App from './components/App/App.tsx';
import {store} from './store/store';
import i18n from './utility/i18n';
import './styles/index.css';

// Sync html lang with i18n language -> WCAG Criterion for screen readers
document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
