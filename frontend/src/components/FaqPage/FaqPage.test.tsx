import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithProviders} from '../../test/test.utils';
import {BrowserRouter} from 'react-router';
import {FaqPage} from './FaqPage';
import {resolveT} from '../../test/setup';

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

    expect(await screen.findByText(resolveT('faq.header'))).toBeInTheDocument();
    expect(await screen.findByText(/Find answers to common questions about ZurImpact/)).toBeInTheDocument();
  });

  it('renders all FAQ items', async () => {
    renderFaqPage();

    expect(await screen.findByText(resolveT('faq.howItWorksTitle'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('faq.whatArePointsTitle'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('faq.howToEarnPointsTitle'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('faq.howToRedeemRewardsTitle'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('faq.isAppFreeTitle'))).toBeInTheDocument();
    expect(await screen.findByText(resolveT('faq.howIsImpactMeasuredTitle'))).toBeInTheDocument();
  });
});
