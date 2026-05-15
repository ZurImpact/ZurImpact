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

    expect(await screen.findByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(await screen.findByText(/Find answers to common questions about ZurImpact/)).toBeInTheDocument();
  });

  it('renders all FAQ items', async () => {
    renderFaqPage();

    expect(await screen.findByText('How does ZurImpact work?')).toBeInTheDocument();
    expect(await screen.findByText('What are Impact Points?')).toBeInTheDocument();
    expect(await screen.findByText('How do I earn points?')).toBeInTheDocument();
    expect(await screen.findByText('How do I redeem rewards?')).toBeInTheDocument();
    expect(await screen.findByText('Is ZurImpact free to use?')).toBeInTheDocument();
    expect(await screen.findByText('How is my impact measured?')).toBeInTheDocument();
  });
});
