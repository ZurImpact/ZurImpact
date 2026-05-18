import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithProviders} from '../../test/test.utils';
import {BrowserRouter} from 'react-router';
import {HomePage} from './HomePage';
import {resolveT} from '../../test/setup';

const renderHomePage = () =>
  renderWithProviders(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>,
  );

describe('HomePage', () => {
  it('renders the hero badge', async () => {
    renderHomePage();

    expect(await screen.findByText(resolveT('homePage.hero.badge'))).toBeInTheDocument();
  });

  it('renders the hero title lines', async () => {
    renderHomePage();

    expect(await screen.findByText(/Explore Zürich\./)).toBeInTheDocument();
    expect(await screen.findByText(/Make an Impact\./)).toBeInTheDocument();
  });

  it('renders the hero subtitle', async () => {
    renderHomePage();

    expect(await screen.findByText(/Get rewarded for making sustainable choices/)).toBeInTheDocument();
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

    expect(await screen.findByText(resolveT('homePage.statsParticipants'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.statsWasteCollected'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.statsPartnerVenues'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.statsRewardsRedeemed'))).toBeInTheDocument();
  });

  it('renders the how it works section title and subtitle', async () => {
    renderHomePage();

    expect(await screen.findByText(resolveT('homePage.howItWorksTitle'))).toBeInTheDocument();
    expect(await screen.findByText(/Making a positive impact is simple/)).toBeInTheDocument();
  });

  it('renders all three step titles and descriptions', async () => {
    renderHomePage();

    expect(await screen.findByText(resolveT('homePage.step1Title'))).toBeInTheDocument();
    expect(await screen.findByText(/track your eco-friendly activities/)).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.step2Title'))).toBeInTheDocument();
    expect(await screen.findByText(/Each eco-friendly action earns you points/)).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.step3Title'))).toBeInTheDocument();
    expect(await screen.findByText(/Exchange points for vouchers/)).toBeInTheDocument();
  });

  it('renders step numbers', async () => {
    renderHomePage();

    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
  });

  it('renders the featured activities section title and subtitle', async () => {
    renderHomePage();

    expect(await screen.findByText(resolveT('homePage.featuredTitle'))).toBeInTheDocument();
    expect(await screen.findByText(/Choose from various eco-friendly activities/)).toBeInTheDocument();
  });

  it('renders all three featured activity point badges', async () => {
    renderHomePage();

    expect(await screen.findByText(resolveT('homePage.featured1Points'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.featured2Points'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.featured3Points'))).toBeInTheDocument();
  });

  it('renders all three featured activity titles', async () => {
    renderHomePage();

    expect(await screen.findByText(resolveT('homePage.featured1Title'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.featured2Title'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('homePage.featured3Title'))).toBeInTheDocument();
  });

  it('renders all three featured activity descriptions', async () => {
    renderHomePage();

    expect(await screen.findByText(/Collect litter around the city/)).toBeInTheDocument();
    expect(await screen.findByText(/Track your cycling routes/)).toBeInTheDocument();
    expect(await screen.findByText(/Log your walking distances/)).toBeInTheDocument();
  });

  it('renders featured activity images', async () => {
    renderHomePage();

    expect(await screen.findByAltText('Collecting litter')).toBeInTheDocument();
    expect(await screen.findByAltText('Cycling in Zürich')).toBeInTheDocument();
    expect(await screen.findByAltText('Public transport')).toBeInTheDocument();
  });

  it('renders the CTA section title and subtitle', async () => {
    renderHomePage();

    expect(await screen.findByText(resolveT('homePage.ctaTitle'))).toBeInTheDocument();
    expect(await screen.findByText(/Join thousands of people making Zürich more sustainable/)).toBeInTheDocument();
  });
});
