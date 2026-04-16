import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LanguageSwitcher} from './LanguageSwitcher';
import {mockI18nChangeLanguage} from '../../test/setup';

describe('LanguageSwitcher', () => {
  it('renders the language label', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText(/language/)).toBeInTheDocument();
  });

  it('renders EN and DE buttons', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();
  });

  it('calls changeLanguage with "en" when EN button is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByText('EN'));
    expect(mockI18nChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('calls changeLanguage with "de" when DE button is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByText('DE'));
    expect(mockI18nChangeLanguage).toHaveBeenCalledWith('de');
  });
});
