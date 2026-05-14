import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router';
import {ActionCreatePage} from './ActionCreatePage';
import {renderWithProviders} from '../../test/test.utils';

const navigateMock = vi.fn();
const mockPost = vi.fn();

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <ActionCreatePage />
    </MemoryRouter>,
    {
      preloadedState: {
        user: {
          currentUser: {id: 1, username: 'Test User', email: 'test@example.com', points: 100},
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    },
  );

describe('ActionCreatePage', () => {
  it('renders the GPS action creation form', () => {
    renderPage();

    expect(screen.getByRole('heading', {name: 'actionCreatePage.header', level: 1})).toBeInTheDocument();
    expect(screen.getByText('actionCreatePage.badge', {selector: 'span'})).toBeInTheDocument();
    expect(screen.getByLabelText('actionCreatePage.actionNameLabel')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'actionCreatePage.submit'})).toBeInTheDocument();
  });

  it('submits a GPS-only action payload and navigates to the created action', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValueOnce({data: {id: 23}});

    renderPage();

    await user.type(screen.getByLabelText('actionCreatePage.actionNameLabel'), 'Walk to the Museum');
    await user.type(
      screen.getByLabelText('actionCreatePage.descriptionLabel'),
      'Visit checkpoints around the old town',
    );
    await user.type(screen.getByLabelText('actionCreatePage.pointsLabel'), '75');
    await user.type(screen.getByLabelText('actionCreatePage.validUntilLabel'), '2026-05-14');
    await user.type(screen.getByLabelText('actionCreatePage.checkpointNameLabel'), 'Start: Main Square');
    await user.type(screen.getByLabelText('actionCreatePage.latitudeLabel'), '47.3769');
    await user.type(screen.getByLabelText('actionCreatePage.longitudeLabel'), '8.5417');

    await user.click(screen.getByRole('button', {name: 'actionCreatePage.submit'}));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/actions',
        expect.objectContaining({
          id: 0,
          displayName: 'Walk to the Museum',
          description: 'Visit checkpoints around the old town',
          points: 75,
          tags: ['FOOD'],
          type: 'GPS',
          hasSubtasks: true,
          validUntil: '2026-05-14T00:00:00.000Z',
          subTasks: [
            expect.objectContaining({
              id: 0,
              displayName: 'Start: Main Square',
              description: '',
              actionId: 0,
              type: 'GPS',
              latitude: 47.3769,
              longitude: 8.5417,
              distanceThresholdLevel: 'MEDIUM',
            }),
          ],
        }),
      );
    });

    expect(navigateMock).toHaveBeenCalledWith('/actions/23');
  });
});
