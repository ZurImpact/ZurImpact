import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../test/test.utils';
import {ActionDashboard} from './ActionDashboard';
import type {ActionDto} from '../../store/slices/ActionSlice';

const mockGet = vi.fn();

vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'actionDashboard.header': 'Activities',
        'actionDashboard.subheader': 'Log your sustainable activities and earn points',
        'actionDashboard.historyTitle': 'Your Activity History',
        'actionDashboard.loading': 'Loading actions...',
        'actionDashboard.noActions': 'No actions yet',
        points: 'Points',
      };
      return translations[key] ?? key;
    },
    i18n: {changeLanguage: vi.fn()},
  }),
}));

const mockActions: ActionDto[] = [
  {id: 1, displayName: 'Clean Park', description: 'Help clean', points: 50, tags: ['SOCIAL']},
  {id: 2, displayName: 'Plant Tree', description: 'Plant a tree', points: 100, tags: ['FOOD']},
];

const mockUserActions = [
  {
    actionId: 1,
    displayName: 'Clean Park',
    points: 50,
    completionState: 'COMPLETED',
    actionCreatedOn: '2026-03-01',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ActionDashboard', () => {
  it('renders the header and subheader', () => {
    mockGet.mockResolvedValue({data: []});
    renderWithProviders(<ActionDashboard />);

    expect(screen.getByText('Activities')).toBeInTheDocument();
    expect(screen.getByText('Log your sustainable activities and earn points')).toBeInTheDocument();
  });

  it('shows loading spinner while fetching', () => {
    // Never resolve — keeps the component in loading state
    mockGet.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<ActionDashboard />);

    expect(screen.getByText('Loading actions...')).toBeInTheDocument();
  });

  it('shows empty state when API returns no actions', async () => {
    mockGet.mockResolvedValue({data: []});
    renderWithProviders(<ActionDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No actions yet')).toBeInTheDocument();
    });
  });

  it('renders action cards when API returns actions', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/actions') return Promise.resolve({data: mockActions});
      return Promise.resolve({data: []});
    });
    renderWithProviders(<ActionDashboard />);

    expect(await screen.findByText('Clean Park')).toBeInTheDocument();
    expect(screen.getByText('Plant Tree')).toBeInTheDocument();
  });

  it('renders user action history with points', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/actions') return Promise.resolve({data: mockActions});
      if (url.includes('getUserActions')) return Promise.resolve({data: mockUserActions});
      return Promise.resolve({data: []});
    });
    renderWithProviders(<ActionDashboard />);

    await waitFor(() => {
      expect(screen.getByText('+50')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    renderWithProviders(<ActionDashboard />);

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('renders activity history section title', () => {
    mockGet.mockResolvedValue({data: []});
    renderWithProviders(<ActionDashboard />);

    expect(screen.getByText('Your Activity History')).toBeInTheDocument();
  });
});
