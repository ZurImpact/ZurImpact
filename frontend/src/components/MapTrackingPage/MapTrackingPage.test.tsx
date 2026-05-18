import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MapTrackingPage} from './MapTrackingPage';
import {renderWithProviders} from '../../test/test.utils';
import {mockToastSuccess, mockToastError, resolveT} from '../../test/setup';

const watchPositionMock = vi.fn();
const clearWatchMock = vi.fn();

let watchSuccessCallback: ((position: GeolocationPosition) => void) | undefined;
let watchErrorCallback: ((error: GeolocationPositionError) => void) | undefined;

vi.mock('react-leaflet', () => ({
  MapContainer: ({children}: {children: React.ReactNode}) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Polyline: () => <div data-testid="polyline" />,
  Marker: ({children}: {children?: React.ReactNode}) => <div data-testid="marker">{children}</div>,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 13,
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

describe('MapTrackingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    watchSuccessCallback = undefined;
    watchErrorCallback = undefined;

    watchPositionMock.mockImplementation((success: typeof watchSuccessCallback, error: typeof watchErrorCallback) => {
      watchSuccessCallback = success;
      watchErrorCallback = error;
      return 123;
    });

    installGeolocation();
  });

  it('renders header and start tracking button', () => {
    renderWithProviders(<MapTrackingPage />);

    expect(screen.getByText('Track Your Route')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /start tracking/i})).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('shows error toast when geolocation is unavailable', async () => {
    const user = userEvent.setup();

    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });

    renderWithProviders(<MapTrackingPage />);

    await user.click(screen.getByRole('button', {name: /start tracking/i}));

    expect(mockToastError).toHaveBeenCalledWith(resolveT('actionDetail.geolocationError'));
  });

  it('starts, tracks distance, and stops with saved activity toast', async () => {
    const user = userEvent.setup();

    renderWithProviders(<MapTrackingPage />);

    await user.click(screen.getByRole('button', {name: /start tracking/i}));

    expect(watchPositionMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Currently Tracking')).toBeInTheDocument();

    await act(async () => {
      watchSuccessCallback?.({
        coords: {latitude: 47.3769, longitude: 8.5417} as GeolocationCoordinates,
      } as GeolocationPosition);

      watchSuccessCallback?.({
        coords: {latitude: 47.3779, longitude: 8.5417} as GeolocationCoordinates,
      } as GeolocationPosition);
    });

    expect(screen.getByText((content) => content.includes('0.11') && content.includes('km'))).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /Stop & Save/}));

    expect(clearWatchMock).toHaveBeenCalledWith(123);
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it('shows error toast when watchPosition callback reports an error', async () => {
    const user = userEvent.setup();

    renderWithProviders(<MapTrackingPage />);

    await user.click(screen.getByRole('button', {name: /start tracking/i}));

    await act(async () => {
      watchErrorCallback?.({message: 'Permission denied'} as GeolocationPositionError);
    });

    expect(mockToastError).toHaveBeenCalledWith('actionDetail.locationErrorPermission denied');
  });
});
