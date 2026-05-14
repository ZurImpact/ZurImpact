import {describe, it, expect, vi} from 'vitest';
import {screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {FaqPage} from './FaqPage';
import {renderWithProviders} from '../../test/test.utils';

describe('FaqPage', () => {
  it('renders the header and subheader', () => {
    renderWithProviders(
      <MemoryRouter>
        <FaqPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('faq.header')).toBeInTheDocument();
    expect(screen.getByText('faq.subheader')).toBeInTheDocument();
  });

  it('renders all FAQ items', () => {
    renderWithProviders(
      <MemoryRouter>
        <FaqPage />
      </MemoryRouter>,
    );

    // Check for question keys
    expect(screen.getByText('faq.howItWorksTitle')).toBeInTheDocument();
    expect(screen.getByText('faq.whatArePointsTitle')).toBeInTheDocument();
    expect(screen.getByText('faq.howToEarnPointsTitle')).toBeInTheDocument();
    expect(screen.getByText('faq.howToRedeemRewardsTitle')).toBeInTheDocument();
    expect(screen.getByText('faq.isAppFreeTitle')).toBeInTheDocument();
    expect(screen.getByText('faq.howIsImpactMeasuredTitle')).toBeInTheDocument();
  });
});