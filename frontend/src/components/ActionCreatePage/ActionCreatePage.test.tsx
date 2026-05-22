import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router';
import {ActionCreatePage} from './ActionCreatePage';
import {renderWithProviders} from '../../test/test.utils';
import {resolveT} from '../../test/setup';

const navigateMock = vi.fn();
const mockPost = vi.fn();
let mapClickHandler: ((event: {latlng: {lat: number; lng: number}}) => void) | null = null;

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

vi.mock('react-leaflet', () => ({
  MapContainer: ({children}: {children: React.ReactNode}) => <div data-testid="checkpoint-map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({children}: {children?: React.ReactNode}) => <div data-testid="marker">{children}</div>,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 14,
  }),
  useMapEvents: (handlers: {click?: (event: {latlng: {lat: number; lng: number}}) => void}) => {
    mapClickHandler = handlers.click ?? null;
    return null;
  },
}));

vi.mock('leaflet', () => {
  const markerConstructor = function Marker() {} as unknown as {prototype: {options: Record<string, unknown>}};
  markerConstructor.prototype = {options: {}};

  const leaflet = {
    icon: vi.fn(() => ({})),
    Marker: markerConstructor,
  };

  return {
    default: leaflet,
    ...leaflet,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mapClickHandler = null;
});

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <ActionCreatePage />
    </MemoryRouter>,
    {
      preloadedState: {
        user: {
          currentUser: {
            id: 1,
            username: 'Test User',
            email: 'test@example.com',
            role: 'USER',
            emailVerified: true,
            points: 100,
            address: null,
            createdAt: null,
          },
          roles: [],
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

    expect(screen.getByRole('heading', {name: resolveT('actionCreatePage.header'), level: 1})).toBeInTheDocument();
    expect(screen.getByText(resolveT('actionCreatePage.badge'), {selector: 'span'})).toBeInTheDocument();
    expect(screen.getByLabelText(resolveT('actionCreatePage.actionNameLabel'))).toBeInTheDocument();
    expect(screen.getByTestId('checkpoint-map')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: resolveT('actionCreatePage.submit')})).toBeInTheDocument();
  });

  it('submits a GPS-only action payload and navigates to the created action', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValueOnce({data: {id: 23}});

    renderPage();

    await user.type(screen.getByLabelText(resolveT('actionCreatePage.actionNameLabel')), 'Walk to the Museum');
    await user.type(
      screen.getByLabelText(resolveT('actionCreatePage.descriptionLabel')),
      'Visit checkpoints around the old town',
    );
    await user.type(screen.getByLabelText(resolveT('actionCreatePage.pointsLabel')), '75');
    await user.type(screen.getByLabelText(resolveT('actionCreatePage.validUntilLabel')), '2026-05-14');
    await user.type(screen.getByLabelText(resolveT('actionCreatePage.checkpointNameLabel')), 'Start: Main Square');

    await act(async () => {
      mapClickHandler?.({latlng: {lat: 47.3769, lng: 8.5417}});
    });

    await user.click(screen.getByRole('button', {name: resolveT('actionCreatePage.submit')}));

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

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/actions/23');
    });
  }, 15000);
});
