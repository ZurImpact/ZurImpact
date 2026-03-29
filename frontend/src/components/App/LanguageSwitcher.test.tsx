import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LanguageSwitcher} from './LanguageSwitcher';

const mockChangeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'language' ? 'Language' : key),
    i18n: {changeLanguage: mockChangeLanguage},
  }),
}));

describe('LanguageSwitcher', () => {
  it('renders the language label', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText(/Language/)).toBeInTheDocument();
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
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('calls changeLanguage with "de" when DE button is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByText('DE'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('de');
  });
});
