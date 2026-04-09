import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router';
import {ActionCard} from './ActionCard';
import type {ActionDto} from '../../../store/slices/ActionSlice';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {changeLanguage: vi.fn()},
  }),
}));

const baseAction: ActionDto = {
  id: 1,
  displayName: 'Clean Park',
  description: 'Help clean the local park',
  points: 50,
  tags: ['SOCIAL'],
};

describe('ActionCard', () => {
  it('renders the action display name', () => {
    render(
      <BrowserRouter>
        <ActionCard action={baseAction} onClick={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Clean Park')).toBeInTheDocument();
  });

  it('renders the action description', () => {
    render(
      <BrowserRouter>
        <ActionCard action={baseAction} onClick={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Help clean the local park')).toBeInTheDocument();
  });

  it('renders points with the points label key', () => {
    render(
      <BrowserRouter>
        <ActionCard action={baseAction} onClick={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText('50 points')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <BrowserRouter>
        <ActionCard action={baseAction} onClick={handleClick} />
      </BrowserRouter>,
    );

    await user.click(screen.getByText('Clean Park'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders without description when not provided', () => {
    const action: ActionDto = {id: 2, displayName: 'Walk', points: 10};

    render(
      <BrowserRouter>
        <ActionCard action={action} onClick={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Walk')).toBeInTheDocument();
    expect(screen.getByText('10 points')).toBeInTheDocument();
  });

  it('renders with zero points', () => {
    const action: ActionDto = {id: 3, displayName: 'Free Action', points: 0};

    render(
      <BrowserRouter>
        <ActionCard action={action} onClick={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText('0 points')).toBeInTheDocument();
  });
});
