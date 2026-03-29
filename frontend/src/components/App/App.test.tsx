import {describe, it, expect} from 'vitest';
import App from './App';
import {renderWithProviders} from '../../test/test.utils';

describe('App', () => {
  it('renders without crashing', () => {
    renderWithProviders(<App />);
    // The App component renders a LanguageSwitcher
    expect(document.body).toBeDefined();
  });
});
