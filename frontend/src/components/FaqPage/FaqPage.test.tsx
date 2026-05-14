import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithProviders} from '../../test/test.utils';
import {BrowserRouter} from 'react-router';
import {FaqPage} from './FaqPage';

const renderFaqPage = () => {
  return renderWithProviders(
    <BrowserRouter>
      <FaqPage />
    </BrowserRouter>,
  );
};

describe('FaqPage', () => {
  it('renders the header and subheader', async () => {
    renderFaqPage();

    expect(await screen.findByText('faq.header')).toBeInTheDocument();
    expect(await screen.findByText('faq.subheader')).toBeInTheDocument();
  });

  it('renders all FAQ items', async () => {
    renderFaqPage();

    // Check for question keys
    expect(await screen.findByText('faq.howItWorksTitle')).toBeInTheDocument();
    expect(await screen.findByText('faq.whatArePointsTitle')).toBeInTheDocument();
    expect(await screen.findByText('faq.howToEarnPointsTitle')).toBeInTheDocument();
    expect(await screen.findByText('faq.howToRedeemRewardsTitle')).toBeInTheDocument();
    expect(await screen.findByText('faq.isAppFreeTitle')).toBeInTheDocument();
    expect(await screen.findByText('faq.howIsImpactMeasuredTitle')).toBeInTheDocument();
  });
});
