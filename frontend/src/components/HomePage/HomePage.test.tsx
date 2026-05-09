import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithProviders} from '../../test/test.utils';
import {BrowserRouter} from 'react-router';
import {HomePage} from './HomePage';

const renderHomePage = () =>
  renderWithProviders(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>,
  );

describe('HomePage', () => {
  it('renders the hero badge translation key', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.hero.badge')).toBeInTheDocument();
  });

  it('renders the hero title translation keys', async () => {
    renderHomePage();

    expect(await screen.findByText(/homePage\.hero\.titleLine1/)).toBeInTheDocument();
    expect(await screen.findByText(/homePage\.hero\.titleLine2/)).toBeInTheDocument();
  });

  it('renders the hero subtitle translation key', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.hero.subtitle')).toBeInTheDocument();
  });

  it('renders the hero image', async () => {
    renderHomePage();

    const heroImage = await screen.findByAltText('Zurich cityscape');
    expect(heroImage).toBeInTheDocument();
  });

  it('renders all stat values', async () => {
    renderHomePage();

    expect(await screen.findByText('200+')).toBeInTheDocument();
    expect(await screen.findByText('1,000kg')).toBeInTheDocument();
    expect(await screen.findByText('10+')).toBeInTheDocument();
    expect(await screen.findByText('4,000+')).toBeInTheDocument();
  });

  it('renders all stat labels', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.statsParticipants')).toBeInTheDocument();
    expect(await screen.findByText('homePage.statsWasteCollected')).toBeInTheDocument();
    expect(await screen.findByText('homePage.statsPartnerVenues')).toBeInTheDocument();
    expect(await screen.findByText('homePage.statsRewardsRedeemed')).toBeInTheDocument();
  });

  it('renders the how it works section title and subtitle', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.howItWorksTitle')).toBeInTheDocument();
    expect(await screen.findByText('homePage.howItWorksSubtitle')).toBeInTheDocument();
  });

  it('renders all three step titles and descriptions', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.step1Title')).toBeInTheDocument();
    expect(await screen.findByText('homePage.step1Desc')).toBeInTheDocument();
    expect(await screen.findByText('homePage.step2Title')).toBeInTheDocument();
    expect(await screen.findByText('homePage.step2Desc')).toBeInTheDocument();
    expect(await screen.findByText('homePage.step3Title')).toBeInTheDocument();
    expect(await screen.findByText('homePage.step3Desc')).toBeInTheDocument();
  });

  it('renders step numbers', async () => {
    renderHomePage();

    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
  });

  it('renders the featured activities section title and subtitle', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.featuredTitle')).toBeInTheDocument();
    expect(await screen.findByText('homePage.featuredSubtitle')).toBeInTheDocument();
  });

  it('renders all three featured activity point badges', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.featured1Points')).toBeInTheDocument();
    expect(await screen.findByText('homePage.featured2Points')).toBeInTheDocument();
    expect(await screen.findByText('homePage.featured3Points')).toBeInTheDocument();
  });

  it('renders all three featured activity titles', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.featured1Title')).toBeInTheDocument();
    expect(await screen.findByText('homePage.featured2Title')).toBeInTheDocument();
    expect(await screen.findByText('homePage.featured3Title')).toBeInTheDocument();
  });

  it('renders all three featured activity descriptions', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.featured1Desc')).toBeInTheDocument();
    expect(await screen.findByText('homePage.featured2Desc')).toBeInTheDocument();
    expect(await screen.findByText('homePage.featured3Desc')).toBeInTheDocument();
  });

  it('renders featured activity images', async () => {
    renderHomePage();

    expect(await screen.findByAltText('Collecting litter')).toBeInTheDocument();
    expect(await screen.findByAltText('Cycling in Zürich')).toBeInTheDocument();
    expect(await screen.findByAltText('Public transport')).toBeInTheDocument();
  });

  it('renders the CTA section title and subtitle', async () => {
    renderHomePage();

    expect(await screen.findByText('homePage.ctaTitle')).toBeInTheDocument();
    expect(await screen.findByText('homePage.ctaSubtitle')).toBeInTheDocument();
  });
});
