import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithProviders} from '../../test/test.utils';
import {BrowserRouter} from 'react-router';
import {Footer} from './Footer';
import {resolveT} from '../../test/setup';

const renderFooter = () =>
  renderWithProviders(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>,
  );

describe('Footer', () => {
  it('renders the brand logo and name', () => {
    renderFooter();

    expect(screen.getByText(resolveT('appName'))).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderFooter();

    expect(screen.getByText(resolveT('rootLayout.home'))).toBeInTheDocument();
    expect(screen.getByText(resolveT('rootLayout.about'))).toBeInTheDocument();
    expect(screen.getByText(resolveT('rootLayout.partners'))).toBeInTheDocument();
    expect(screen.getByText(resolveT('rootLayout.faq'))).toBeInTheDocument();
  });

  it('renders the Instagram link with correct URL', () => {
    renderFooter();

    const instagramLink = screen.getByText(resolveT('footer.instagram'));
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink.closest('a')).toHaveAttribute('href', 'https://www.instagram.com/zurimpact/');
    expect(instagramLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(instagramLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the copyright notice with current year', () => {
    renderFooter();

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(String(currentYear)))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(resolveT('footer.allRightsReserved')))).toBeInTheDocument();
  });
});
