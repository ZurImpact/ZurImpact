import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router';
import {GpsActionDetailPage} from './GpsActionDetailPage';
import {renderWithProviders} from '../../test/test.utils';
import type {DeepPartial, RootState} from '../../store/store';
import {mockToastSuccess, mockToastError} from '../../test/setup';

const navigateMock = vi.fn();
const mockGet = vi.fn();
const mockPost = vi.fn();

let watchSuccessCallback: ((position: GeolocationPosition) => void) | undefined;
let watchErrorCallback: ((error: GeolocationPositionError) => void) | undefined;

const watchPositionMock = vi.fn();
const clearWatchMock = vi.fn();

const actionFixture = {
  id: 1,
  displayName: 'GPS City Walk',
  description: 'Visit all checkpoints',
  points: 120,
  subTasks: [
    {
      id: 101,
      displayName: 'Checkpoint A',
      description: 'First checkpoint',
      actionId: 1,
      latitude: 47.3769,
      longitude: 8.5417,
    },
    {
      id: 102,
      displayName: 'Checkpoint B',
      description: 'Second checkpoint',
      actionId: 1,
      latitude: 47.3772,
      longitude: 8.5419,
    },
  ],
};

const activeHistoryActionFixture = {
  actionId: 1,
  displayName: 'Running GPS City Walk',
  description: 'Continue where you left off',
  points: 125,
  completionState: 'ACTIVE',
  isSubtask: false,
};

vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useParams: () => ({id: '1'}),
    useNavigate: () => navigateMock,
  };
});

vi.mock('react-leaflet', () => ({
  MapContainer: ({children}: {children: React.ReactNode}) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({children}: {children?: React.ReactNode}) => <div data-testid="marker">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  Popup: ({children}: {children?: React.ReactNode}) => <div>{children}</div>,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 14,
  }),
}));

vi.mock('leaflet', () => {
  const markerConstructor = function Marker() {} as unknown as {prototype: {options: Record<string, unknown>}};
  markerConstructor.prototype = {options: {}};

  const leaflet = {
    icon: vi.fn(() => ({})),
    divIcon: vi.fn(() => ({})),
    Marker: markerConstructor,
  };

  return {
    default: leaflet,
    ...leaflet,
  };
});

const installGeolocation = () => {
  Object.defineProperty(global.navigator, 'geolocation', {
    configurable: true,
    value: {
      watchPosition: watchPositionMock,
      clearWatch: clearWatchMock,
    },
  });
};

const defaultUserState: DeepPartial<RootState['user']> = {
  currentUser: {id: 5, username: 'Test User', email: 'test@test.com', points: 100},
  isAuthenticated: true,
  loading: false,
  error: null,
};

const renderPage = (preloadedState: DeepPartial<RootState> = {}) =>
  renderWithProviders(
    <MemoryRouter>
      <GpsActionDetailPage />
    </MemoryRouter>,
    {preloadedState: {user: defaultUserState, ...preloadedState}},
  );

const createActionState = (overrides: DeepPartial<RootState['actions']> = {}): DeepPartial<RootState['actions']> => ({
  actions: [],
  selectedAction: actionFixture,
  userActions: [],
  loading: false,
  error: null,
  ...overrides,
});

describe('GpsActionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    watchSuccessCallback = undefined;
    watchErrorCallback = undefined;

    watchPositionMock.mockImplementation((success: typeof watchSuccessCallback, error: typeof watchErrorCallback) => {
      watchSuccessCallback = success;
      watchErrorCallback = error;
      return 999;
    });

    mockGet.mockImplementation((url: string) => {
      if (url === '/userActionHistory/getUserActions?userId=5&active=true') return Promise.resolve({data: []});
      if (url === '/actions/1') return Promise.resolve({data: actionFixture});
      if (url === '/auth/whoami') return Promise.resolve({data: {id: 5}});
      if (url === '/users/5') return Promise.resolve({data: defaultUserState.currentUser});
      return Promise.resolve({data: {}});
    });

    mockPost.mockImplementation((url: string) => {
      if (url === '/actions/startAction') return Promise.resolve({data: {success: true}});
      if (url === '/subTasks/completeSubTask') return Promise.resolve({data: {success: true}});
      if (url === '/actions/completeAction') return Promise.resolve({data: {success: true}});
      return Promise.resolve({data: {}});
    });

    installGeolocation();
  });

  it('fetches action details on mount and renders action content', async () => {
    renderPage({
      actions: createActionState(),
    });

    expect(await screen.findByText('GPS City Walk')).toBeInTheDocument();
    expect(await screen.findByText('Visit all checkpoints')).toBeInTheDocument();
    expect(await screen.findByRole('button', {name: 'gpsActionDetail.startAction'})).toBeInTheDocument();
    expect(await screen.findByText(/0 \/ 2/)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/actions/1');
    });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/userActionHistory/getUserActions?userId=5&active=true');
    });
  });

  it('loads matched active user history action from url id into state', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === '/userActionHistory/getUserActions?userId=5&active=true') {
        return Promise.resolve({data: [activeHistoryActionFixture]});
      }
      if (url === '/actions/1') return Promise.resolve({data: actionFixture});
      return Promise.resolve({data: {}});
    });

    renderPage({
      actions: createActionState(),
    });

    expect(await screen.findByText('Running GPS City Walk')).toBeInTheDocument();
    expect(await screen.findByText('Continue where you left off')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('button', {name: 'gpsActionDetail.startAction'})).not.toBeInTheDocument();
    });
  });

  it('renders loading state', () => {
    renderPage({
      actions: createActionState({
        selectedAction: null,
        loading: true,
      }),
    });

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state and navigates back', async () => {
    const user = userEvent.setup();
    mockGet.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderPage({
      actions: createActionState({
        selectedAction: null,
      }),
    });

    expect(await screen.findByText('Failed to fetch')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'gpsActionDetail.back'}));
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });

  it('starts action successfully from dialog', async () => {
    const user = userEvent.setup();

    renderPage({
      actions: createActionState(),
    });

    await user.click(await screen.findByRole('button', {name: 'gpsActionDetail.startAction'}));
    expect(screen.getByText('gpsActionDetail.startDialogTitle')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'gpsActionDetail.confirmStart'}));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/actions/startAction', null, {
        params: {userId: 5, actionId: 1},
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('gpsActionDetail.actionStarted');
  });

  it('shows error toast when start action fails', async () => {
    const user = userEvent.setup();

    mockPost.mockImplementation((url: string) => {
      if (url === '/actions/startAction') return Promise.reject(new Error('start failed'));
      if (url === '/subTasks/completeSubTask') return Promise.resolve({data: {success: true}});
      if (url === '/actions/completeAction') return Promise.resolve({data: {success: true}});
      return Promise.resolve({data: {}});
    });

    renderPage({
      actions: createActionState(),
    });

    await user.click(await screen.findByRole('button', {name: 'gpsActionDetail.startAction'}));
    await user.click(screen.getByRole('button', {name: 'gpsActionDetail.confirmStart'}));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('gpsActionDetail.startError');
    });
  });

  it('checks in checkpoints and completes action once all are reached', async () => {
    const user = userEvent.setup();

    renderPage({
      actions: createActionState(),
    });

    await user.click(await screen.findByRole('button', {name: 'gpsActionDetail.startAction'}));
    await user.click(screen.getByRole('button', {name: 'gpsActionDetail.confirmStart'}));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/actions/startAction', null, {
        params: {userId: 5, actionId: 1},
      });
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', {name: 'gpsActionDetail.startAction'})).not.toBeInTheDocument();
    });

    await act(async () => {
      watchSuccessCallback?.({
        coords: {latitude: 47.3769, longitude: 8.5417} as GeolocationCoordinates,
      } as GeolocationPosition);
      await new Promise((r) => setTimeout(r, 100));
    });

    // allow async operations to complete and add the additionalData
    await waitFor(
      () => {
        expect(mockPost).toHaveBeenCalledWith('/subTasks/completeSubTask', {
          userId: 5,
          actionId: 1,
          subTaskId: 101,
          actionType: 'GPS',
          additionalData: {
            latitude: 47.3769,
            longitude: 8.5417,
          },
        });
      },
      {timeout: 5000},
    );

    await act(async () => {
      watchSuccessCallback?.({
        coords: {latitude: 47.3772, longitude: 8.5419} as GeolocationCoordinates,
      } as GeolocationPosition);
      await new Promise((r) => setTimeout(r, 100));
    });

    // allow async operations to complete + additionalData
    await waitFor(
      () => {
        expect(mockPost).toHaveBeenCalledWith('/subTasks/completeSubTask', {
          userId: 5,
          actionId: 1,
          subTaskId: 102,
          actionType: 'GPS',
          additionalData: {
            latitude: 47.3772,
            longitude: 8.5419,
          },
        });
      },
      {timeout: 5000},
    );

    // allow async operations to complete
    await waitFor(
      () => {
        expect(mockPost).toHaveBeenCalledWith('/actions/completeAction', {userId: 5, actionId: 1});
      },
      {timeout: 5000},
    );

    // Wrap final assertions in waitFor so we don't race against the React commit that updates the DOM after `completeAction` resolves.
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('gpsActionDetail.actionCompleted');
    });

    await waitFor(() => {
      expect(screen.getByText('gpsActionDetail.allCheckpointsReached')).toBeInTheDocument();
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('gpsActionDetail.actionCompleted');
  }, 30000);

  it('shows geolocation error toast when geolocation is unavailable', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });

    renderPage({
      actions: createActionState(),
    });

    expect(mockToastError).toHaveBeenCalledWith('gpsActionDetail.geolocationError');
  });

  it('handles geolocation watch error callback', async () => {
    renderPage({
      actions: createActionState(),
    });

    await screen.findByText('GPS City Walk');
    await waitFor(() => expect(watchPositionMock).toHaveBeenCalled());

    await act(async () => {
      watchErrorCallback?.({message: 'location unavailable'} as GeolocationPositionError);
    });

    expect(mockToastError).toHaveBeenCalledWith('gpsActionDetail.locationError');
  });

  describe('per-checkpoint distance threshold', () => {
    const basePoint = {latitude: 47.3769, longitude: 8.5417};
    const tenMetersNorth = {
      latitude: basePoint.latitude + 10 / 111320,
      longitude: basePoint.longitude,
    };
    const threeMetersNorth = {
      latitude: basePoint.latitude + 3 / 111320,
      longitude: basePoint.longitude,
    };

    const makeFixture = (level: 'EASY' | 'MEDIUM' | 'HARD') => ({
      id: 1,
      displayName: 'Threshold Fixture',
      description: 'Single checkpoint',
      points: 50,
      subTasks: [
        {
          id: 201,
          displayName: 'Only Checkpoint',
          description: 'Only one',
          actionId: 1,
          latitude: basePoint.latitude,
          longitude: basePoint.longitude,
          distanceThresholdLevel: level,
        },
      ],
    });

    it('EASY: check-in triggers when user is 10m away', async () => {
      const fixture = makeFixture('EASY');
      mockGet.mockImplementation((url: string) =>
        url === '/actions/1' ? Promise.resolve({data: fixture}) : Promise.resolve({data: {}}),
      );
      const user = userEvent.setup();
      renderPage({actions: {...createActionState(), selectedAction: fixture}});
      await user.click(await screen.findByRole('button', {name: 'gpsActionDetail.startAction'}));
      await user.click(screen.getByRole('button', {name: 'gpsActionDetail.confirmStart'}));
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/actions/startAction', null, {
          params: {userId: 5, actionId: 1},
        });
      });
      await act(async () => {
        watchSuccessCallback?.({
          coords: {latitude: tenMetersNorth.latitude, longitude: tenMetersNorth.longitude} as GeolocationCoordinates,
        } as GeolocationPosition);
        await new Promise((r) => setTimeout(r, 100));
      });
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/subTasks/completeSubTask', {
          userId: 5,
          actionId: 1,
          subTaskId: 201,
          actionType: 'GPS',
          additionalData: {
            latitude: tenMetersNorth.latitude,
            longitude: tenMetersNorth.longitude,
          },
        });
      });
    }, 15000);

    it('HARD: check-in does NOT trigger when user is 10m away', async () => {
      const fixture = makeFixture('HARD');
      mockGet.mockImplementation((url: string) => {
        if (url === '/actions/1') return Promise.resolve({data: fixture});
        if (url === '/userActionHistory/getUserActions?userId=5&active=true') return Promise.resolve({data: []});
        return Promise.resolve({data: {}});
      });
      const user = userEvent.setup();
      renderPage({actions: {...createActionState(), selectedAction: fixture}});
      await user.click(await screen.findByRole('button', {name: 'gpsActionDetail.startAction'}));
      await user.click(screen.getByRole('button', {name: 'gpsActionDetail.confirmStart'}));
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/actions/startAction', null, {
          params: {userId: 5, actionId: 1},
        });
      });
      await act(async () => {
        watchSuccessCallback?.({
          coords: {latitude: tenMetersNorth.latitude, longitude: tenMetersNorth.longitude} as GeolocationCoordinates,
        } as GeolocationPosition);
      });
      // Give effects a tick
      await new Promise((r) => setTimeout(r, 50));
      expect(mockPost).not.toHaveBeenCalledWith('/subTasks/completeSubTask', expect.objectContaining({subTaskId: 201}));
    });

    it('HARD: check-in triggers when user is 3m away', async () => {
      const fixture = makeFixture('HARD');
      mockGet.mockImplementation((url: string) =>
        url === '/actions/1' ? Promise.resolve({data: fixture}) : Promise.resolve({data: {}}),
      );
      const user = userEvent.setup();
      renderPage({actions: {...createActionState(), selectedAction: fixture}});
      await user.click(await screen.findByRole('button', {name: 'gpsActionDetail.startAction'}));
      await user.click(screen.getByRole('button', {name: 'gpsActionDetail.confirmStart'}));
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/actions/startAction', null, {
          params: {userId: 5, actionId: 1},
        });
      });
      await act(async () => {
        watchSuccessCallback?.({
          coords: {
            latitude: threeMetersNorth.latitude,
            longitude: threeMetersNorth.longitude,
          } as GeolocationCoordinates,
        } as GeolocationPosition);
        await new Promise((r) => setTimeout(r, 100));
      });
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/subTasks/completeSubTask', {
          userId: 5,
          actionId: 1,
          subTaskId: 201,
          actionType: 'GPS',
          additionalData: {
            latitude: threeMetersNorth.latitude,
            longitude: threeMetersNorth.longitude,
          },
        });
      });
    }, 15000);
  });
});
