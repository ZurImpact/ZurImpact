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
  it('renders the hero badge', async () => {
    renderHomePage();

    expect(await screen.findByText('Sustainable Tourism in Zürich')).toBeInTheDocument();
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

    expect(await screen.findByText('Active Participants')).toBeInTheDocument();
    expect(await screen.findByText('Waste Collected')).toBeInTheDocument();
    expect(await screen.findByText('Partner Venues')).toBeInTheDocument();
    expect(await screen.findByText('Rewards Redeemed')).toBeInTheDocument();
  });

  it('renders the how it works section title and subtitle', async () => {
    renderHomePage();

    expect(await screen.findByText('How It Works')).toBeInTheDocument();
    expect(await screen.findByText(/Making a positive impact is simple/)).toBeInTheDocument();
  });

  it('renders all three step titles and descriptions', async () => {
    renderHomePage();

    expect(await screen.findByText('Take Sustainable Actions')).toBeInTheDocument();
    expect(await screen.findByText(/track your eco-friendly activities/)).toBeInTheDocument();
    expect(await screen.findByText('Earn Impact Points')).toBeInTheDocument();
    expect(await screen.findByText(/Each eco-friendly action earns you points/)).toBeInTheDocument();
    expect(await screen.findByText('Redeem Rewards')).toBeInTheDocument();
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

    expect(await screen.findByText('Featured Activities')).toBeInTheDocument();
    expect(await screen.findByText(/Choose from various eco-friendly activities/)).toBeInTheDocument();
  });

  it('renders all three featured activity point badges', async () => {
    renderHomePage();

    expect(await screen.findByText('+50 points')).toBeInTheDocument();
    expect(await screen.findByText('+30 points')).toBeInTheDocument();
    expect(await screen.findByText('+20 points')).toBeInTheDocument();
  });

  it('renders all three featured activity titles', async () => {
    renderHomePage();

    expect(await screen.findByText('Clean-Up Challenge')).toBeInTheDocument();
    expect(await screen.findByText('Bike to Work')).toBeInTheDocument();
    expect(await screen.findByText('Walk Around Zürich')).toBeInTheDocument();
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

    expect(await screen.findByText('Ready to Make an Impact?')).toBeInTheDocument();
    expect(await screen.findByText(/Join thousands of people making Zürich more sustainable/)).toBeInTheDocument();
  });
});
