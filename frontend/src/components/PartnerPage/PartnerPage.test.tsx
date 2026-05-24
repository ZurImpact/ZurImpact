import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderWithProviders} from '../../test/test.utils';
import {BrowserRouter, MemoryRouter, Route, Routes} from 'react-router';
import {PartnersPage} from './PartnerPage';
import {resolveT} from '../../test/setup';

const renderPartnerPage = () =>
  renderWithProviders(
    <BrowserRouter>
      <PartnersPage />
    </BrowserRouter>,
  );

describe('PartnersPage', () => {
  /* Hero Section */
  it('renders hero title', async () => {
    renderPartnerPage();

    expect(await screen.findByText(resolveT('partnerPage.heroTitle'))).toBeInTheDocument();
  });

  it('renders become a partner CTA button', async () => {
    renderPartnerPage();

    expect(await screen.findByText(resolveT('partnerPage.heroCta'))).toBeInTheDocument();
  });

  /* Pitch Deck Download */
  it('renders download pitch deck link with correct href and download attribute', async () => {
    renderPartnerPage();

    const downloadLink = screen.getByText(resolveT('partnerPage.downloadPitchDeck'));
    const anchor = downloadLink.closest('a');
    expect(anchor).toHaveAttribute('href', '/Zurimpact_PitchDeck.pdf');
    expect(anchor).toHaveAttribute('download');
  });

  /* Benefits Section */
  it('renders all four benefit cards', async () => {
    renderPartnerPage();

    expect(await screen.findByText(resolveT('partnerPage.benefit1Title'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('partnerPage.benefit2Title'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('partnerPage.benefit3Title'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('partnerPage.benefit4Title'))).toBeInTheDocument();
  });

  it('renders the who can partner image with alt text', async () => {
    renderPartnerPage();

    expect(await screen.findByAltText(resolveT('partnerPage.whoCanPartnerImgAlt'))).toBeInTheDocument();
  });

  /* How It Works Section */
  it('renders all three how it works steps', async () => {
    renderPartnerPage();

    expect(await screen.findByText(resolveT('partnerPage.step1Title'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('partnerPage.step2Title'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('partnerPage.step3Title'))).toBeInTheDocument();
  });

  it('renders the how it works image with alt text', async () => {
    renderPartnerPage();

    expect(await screen.findByAltText(resolveT('partnerPage.howItWorksImgAlt'))).toBeInTheDocument();
  });

  /* CTA Section */
  it('navigates to /contact when Get Started button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={['/partners']}>
        <Routes>
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/contact" element={<div>Contact Page Content</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByText(resolveT('partnerPage.ctaButton')));
    expect(await screen.findByText('Contact Page Content')).toBeInTheDocument();
  });

  it('navigates to /about when Learn More button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={['/partners']}>
        <Routes>
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/about" element={<div>About Page Content</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByText(resolveT('partnerPage.ctaSecondary')));
    expect(await screen.findByText('About Page Content')).toBeInTheDocument();
  });
});
