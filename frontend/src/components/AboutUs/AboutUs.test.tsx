import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderWithProviders} from '../../test/test.utils';
import {BrowserRouter, MemoryRouter, Route, Routes} from 'react-router';
import {AboutPage} from './AboutUs';

const renderAboutPage = () =>
  renderWithProviders(
    <BrowserRouter>
      <AboutPage />
    </BrowserRouter>,
  );

describe('AboutPage', () => {
  /* Hero Section */
  it('renders hero title', async () => {
    renderAboutPage();

    expect(await screen.findByText('About Us')).toBeInTheDocument();
  });

  it('renders hero image with alt text', async () => {
    renderAboutPage();

    expect(await screen.findByAltText('cafe')).toBeInTheDocument();
  });

  /* Mission Section */
  it('renders both mission descriptions', async () => {
    renderAboutPage();

    expect(await screen.findByText(/Inspired by Copenhagen's CopenPay/)).toBeInTheDocument();
    expect(await screen.findByText(/By partnering with local businesses/)).toBeInTheDocument();
  });

  /* Pitch Deck Download */
  it('renders download pitch deck link with correct href and download attribute', async () => {
    renderAboutPage();

    const downloadLink = screen.getByText('Download Pitch Deck');
    const anchor = downloadLink.closest('a');
    expect(anchor).toHaveAttribute('href', '/Zurimpact_PitchDeck.pdf');
    expect(anchor).toHaveAttribute('download');
  });

  /* Team Section */
  it('renders team member images with correct alt text', async () => {
    renderAboutPage();

    expect(await screen.findByAltText('Photo of Umut Öztürk')).toBeInTheDocument();
    expect(await screen.findByAltText('Photo of Colin Debuis')).toBeInTheDocument();
    expect(await screen.findByAltText('Photo of Denis Djaferi')).toBeInTheDocument();
  });

  /* CTA Section */
  it('navigates to /contact when CTA button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={['/about']}>
        <Routes>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<div>Contact Page Content</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByText('Contact Us'));
    expect(await screen.findByText('Contact Page Content')).toBeInTheDocument();
  });
});
