import {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {useParams, useNavigate} from 'react-router';
import {MapContainer, TileLayer, Marker, Polyline, Popup, useMap} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Card} from '../ui/card';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {useAppDispatch, useAppSelector} from '../../store/store';
import {
  loadGpsActionDetail,
  clearSelectedAction,
  clearGpsActionDetail,
  finishGpsAction,
  startGpsAction,
  completeGpsCheckpoint,
  type ActionDto,
} from '../../store/slices/ActionSlice';
import {useTranslation} from 'react-i18next';
import {toast} from 'sonner';
import {MapPin, Navigation, CheckCircle2, Circle, ArrowLeft, Award, Target, X} from 'lucide-react';
import {thresholdToMeters, type DistanceThresholdLevel} from '../../utils/distanceThreshold';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const createCheckpointIcon = (index: number, isCheckedIn: boolean) => {
  const color = isCheckedIn ? 'var(--brand)' : 'var(--info-container)';
  const textColor = isCheckedIn ? 'var(--brand-foreground)' : 'var(--on-info-container)';
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="${color}" stroke="white" stroke-width="4"/>
      <text x="50" y="65" font-size="40" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${index}</text>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: 'custom-checkpoint-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const userLocationIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="30" fill="var(--destructive)" stroke="white" stroke-width="4"/>
      <circle cx="50" cy="50" r="15" fill="white"/>
    </svg>
  `,
  className: 'user-location-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface Checkpoint {
  id: number;
  displayName: string;
  description?: string;
  actionId: number;
  latitude?: number;
  longitude?: number;
  distanceThresholdLevel: DistanceThresholdLevel;
  index: number;
  isCheckedIn: boolean;
  position: [number, number];
}

function RecenterMap({coords}: {coords: [number, number]}) {
  const map = useMap();
  useEffect(() => {
    if (map && coords) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function processCheckpointsFromAction(action: ActionDto): Checkpoint[] {
  if (!action.subTasks || action.subTasks.length === 0) {
    return [];
  }

  return action.subTasks
    .filter((sub) => sub.latitude !== undefined && sub.longitude !== undefined)
    .map((sub, idx) => ({
      id: sub.id,
      displayName: sub.displayName,
      description: sub.description,
      actionId: sub.actionId,
      latitude: sub.latitude,
      longitude: sub.longitude,
      distanceThresholdLevel: sub.distanceThresholdLevel ?? 'MEDIUM',
      index: idx + 1,
      isCheckedIn: false,
      position: [sub.latitude, sub.longitude] as [number, number],
    }));
}

export function GpsActionDetailPage() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const {selectedAction, error, gpsActionDetail: gpsActionDetailState} = useAppSelector((state) => state.actions);
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const gpsActionDetail = gpsActionDetailState ?? {
    activeUserHistoryAction: null,
    completedSubtaskIds: [],
    hasStartedAction: false,
    loading: false,
    startLoading: false,
    checkpointLoading: false,
    completionLoading: false,
    error: null,
  };

  const isDevMode = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('dev') === 'true';
    } catch {
      return false;
    }
  }, []);

  const actionIdFromRoute = useMemo(() => {
    if (!id) {
      return null;
    }

    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return null;
    }

    return parsedId;
  }, [id]);

  const [showStartDialog, setShowStartDialog] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [devLatInput, setDevLatInput] = useState('');
  const [devLngInput, setDevLngInput] = useState('');

  const watchIdRef = useRef<number | null>(null);
  const hasCalledCompleteAction = useRef(false);
  const checkpointsRef = useRef<Checkpoint[]>([]);
  const completedCheckpointIdsRef = useRef<Set<number>>(new Set());
  const pendingCheckpointIdsRef = useRef<Set<number>>(new Set());
  const hasStartedActionRef = useRef(false);
  const currentUserIdRef = useRef<number | undefined>(currentUser?.id);
  const actionIdRef = useRef<number | null>(actionIdFromRoute);

  const activeUserHistoryAction = gpsActionDetail.activeUserHistoryAction;
  const hasStartedAction = gpsActionDetail.hasStartedAction;
  const hasCompletedActionBefore = activeUserHistoryAction?.completionState === 'COMPLETED';
  const isStartActionDisabled = hasStartedAction || hasCompletedActionBefore;
  const displayedAction = activeUserHistoryAction ?? selectedAction;

  const initialCheckpoints = useMemo(() => {
    if (!selectedAction) {
      return [];
    }
    return processCheckpointsFromAction(selectedAction);
  }, [selectedAction]);

  const checkpoints = useMemo(() => {
    return initialCheckpoints.map((cp) => ({
      ...cp,
      isCheckedIn: gpsActionDetail.completedSubtaskIds.includes(cp.id),
    }));
  }, [initialCheckpoints, gpsActionDetail.completedSubtaskIds]);

  const mapCenter = useMemo((): [number, number] => {
    if (initialCheckpoints.length === 0) {
      return [47.3769, 8.5417];
    }

    const avgLat = initialCheckpoints.reduce((sum, cp) => sum + cp.position[0], 0) / initialCheckpoints.length;
    const avgLng = initialCheckpoints.reduce((sum, cp) => sum + cp.position[1], 0) / initialCheckpoints.length;
    return [avgLat, avgLng];
  }, [initialCheckpoints]);

  const checkedInCount = checkpoints.filter((cp) => cp.isCheckedIn).length;
  const allCheckpointsCheckedIn = checkpoints.length > 0 && checkpoints.every((cp) => cp.isCheckedIn);
  const isDetailLoading = gpsActionDetail.loading || (actionIdFromRoute !== null && !selectedAction && !error);
  const actionPoints = displayedAction?.points ?? 0;

  useEffect(() => {
    checkpointsRef.current = initialCheckpoints;
  }, [initialCheckpoints]);

  useEffect(() => {
    completedCheckpointIdsRef.current = new Set(gpsActionDetail.completedSubtaskIds);
  }, [gpsActionDetail.completedSubtaskIds]);

  useEffect(() => {
    hasStartedActionRef.current = gpsActionDetail.hasStartedAction;
  }, [gpsActionDetail.hasStartedAction]);

  useEffect(() => {
    currentUserIdRef.current = currentUser?.id;
  }, [currentUser?.id]);

  useEffect(() => {
    actionIdRef.current = actionIdFromRoute;
  }, [actionIdFromRoute]);

  const applyLocalLocation = useCallback(
    (latitude: number, longitude: number) => {
      const newLocation: [number, number] = [latitude, longitude];
      setUserLocation(newLocation);
      setDevLatInput(latitude.toString());
      setDevLngInput(longitude.toString());

      checkpointsRef.current.forEach((cp) => {
        if (completedCheckpointIdsRef.current.has(cp.id) || pendingCheckpointIdsRef.current.has(cp.id)) {
          return;
        }

        const distance = calculateDistance(latitude, longitude, cp.position[0], cp.position[1]);
        if (distance > thresholdToMeters(cp.distanceThresholdLevel) || !hasStartedActionRef.current) {
          return;
        }

        const userId = currentUserIdRef.current;
        const routeActionId = actionIdRef.current;

        if (!userId || routeActionId === null) {
          return;
        }

        pendingCheckpointIdsRef.current.add(cp.id);

        dispatch(
          completeGpsCheckpoint({
            userId,
            actionId: routeActionId,
            subTaskId: cp.id,
            actionType: 'GPS',
            additionalData: {latitude, longitude},
          }),
        )
          .unwrap()
          .then(() => {
            pendingCheckpointIdsRef.current.delete(cp.id);
            completedCheckpointIdsRef.current.add(cp.id);
            toast.success(
              tRef.current('gpsActionDetail.checkpointReached', {
                checkpoint: cp.index,
                name: cp.displayName,
              }),
            );
          })
          .catch((requestError) => {
            pendingCheckpointIdsRef.current.delete(cp.id);
            console.error('Error completing GPS checkpoint:', requestError);
            toast.error(
              tRef.current('gpsActionDetail.checkpointError', {
                checkpoint: cp.index,
                name: cp.displayName,
                defaultValue: 'Checkpoint check-in failed. Please try again.',
              }),
            );
          });
      });
    },
    [dispatch],
  );

  const handleStartAction = async () => {
    const userId = currentUserIdRef.current;

    if (!userId || actionIdFromRoute === null || isStartActionDisabled) {
      return;
    }

    try {
      await dispatch(startGpsAction({userId, actionId: actionIdFromRoute})).unwrap();
      setShowStartDialog(false);
      toast.success(t('gpsActionDetail.actionStarted'));
    } catch (requestError) {
      console.error('Error starting action:', requestError);
      toast.error(t('gpsActionDetail.startError'));
    }
  };

  useEffect(() => {
    hasCalledCompleteAction.current = false;
    pendingCheckpointIdsRef.current = new Set();

    dispatch(clearSelectedAction());
    dispatch(clearGpsActionDetail());

    if (actionIdFromRoute !== null) {
      dispatch(loadGpsActionDetail({actionId: actionIdFromRoute, userId: currentUser?.id}));
    }

    return () => {
      pendingCheckpointIdsRef.current = new Set();
      dispatch(clearSelectedAction());
      dispatch(clearGpsActionDetail());
    };
  }, [actionIdFromRoute, currentUser?.id, dispatch]);

  useEffect(() => {
    if (isDevMode) {
      return;
    }

    if (!navigator.geolocation) {
      toast.error(tRef.current('gpsActionDetail.geolocationError'));
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        applyLocalLocation(latitude, longitude);
      },
      (err) => {
        console.error('Geolocation error:', err);
        toast.error(tRef.current('gpsActionDetail.locationError'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    requestAnimationFrame(() => {
      setIsTrackingLocation(true);
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTrackingLocation(false);
    };
  }, [applyLocalLocation, isDevMode]);

  useEffect(() => {
    const userId = currentUser?.id;

    console.log(allCheckpointsCheckedIn, userId, hasCalledCompleteAction.current, actionIdFromRoute);
    if (
      allCheckpointsCheckedIn &&
      userId &&
      !hasCalledCompleteAction.current &&
      actionIdFromRoute !== null &&
      !hasCompletedActionBefore
    ) {
      hasCalledCompleteAction.current = true;
      dispatch(finishGpsAction({userId, actionId: actionIdFromRoute}))
        .unwrap()
        .then(() => {
          toast.success(tRef.current('gpsActionDetail.actionCompleted'));
        })
        .catch((requestError) => {
          console.error('Error completing action:', requestError);
          hasCalledCompleteAction.current = false;
        });
    }
  }, [allCheckpointsCheckedIn, dispatch, actionIdFromRoute, hasCompletedActionBefore, isDevMode, currentUser?.id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isDetailLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand"></div>
        </div>
      </div>
    );
  }

  if (error || !selectedAction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <p className="text-destructive">{error || t('gpsActionDetail.actionNotFound')}</p>
          <Button onClick={handleBack} className="mt-4">
            {t('gpsActionDetail.back')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('gpsActionDetail.back')}
        </Button>

        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface-container to-background shadow-xl">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="border-brand bg-brand-container text-on-brand-container">
                  <Target className="mr-1 h-4 w-4" />
                  GPS
                </Badge>
                <Badge variant="outline" className="border-border bg-background/70">
                  {checkedInCount} / {checkpoints.length} {t('gpsActionDetail.checkpoints')}
                </Badge>
                {hasStartedAction && (
                  <Badge className="border border-transparent bg-info-container text-on-info-container">
                    {t('gpsActionDetail.trackingActive')}
                  </Badge>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {displayedAction?.displayName}
                </h1>
                <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
                  {displayedAction?.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-end xl:justify-center">
              <Badge
                variant="secondary"
                className="justify-center border-brand bg-brand-container px-4 py-3 text-base text-on-brand-container"
              >
                <Award className="mr-1 h-4 w-4" />
                {actionPoints} {t('points')}
              </Badge>

              <Button
                className="h-12 bg-brand px-5 text-base text-brand-foreground hover:bg-brand/90"
                onClick={() => setShowStartDialog(true)}
                disabled={isStartActionDisabled}
              >
                {hasCompletedActionBefore
                  ? t('gpsActionDetail.alreadyCompleted')
                  : hasStartedAction
                    ? t('gpsActionDetail.alreadyStarted')
                    : t('gpsActionDetail.startAction')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showStartDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowStartDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t('gpsActionDetail.startDialogTitle')}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStartDialog(false)}
              className="absolute right-3 top-3 rounded-md p-1 hover:bg-surface-container-high"
              aria-label={t('rootLayout.closeMenu')}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <h2 className="mb-2 text-xl font-semibold text-brand">{t('gpsActionDetail.startDialogTitle')}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{t('gpsActionDetail.startDialogDescription')}</p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border border-brand" onClick={() => setShowStartDialog(false)}>
                {t('gpsActionDetail.cancel')}
              </Button>
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={handleStartAction}
                disabled={gpsActionDetail.startLoading}
              >
                {gpsActionDetail.startLoading ? t('gpsActionDetail.starting') : t('gpsActionDetail.confirmStart')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
        <div className="min-w-0">
          <Card className="relative isolate overflow-hidden rounded-3xl border shadow-xl">
            <div className="flex items-center justify-between border-b border-border bg-surface-container/60 px-5 py-4">
              <div>
                <h2 className="font-semibold text-foreground">{t('gpsActionDetail.progress')}</h2>
                <p className="text-sm text-muted-foreground">
                  {checkedInCount} / {checkpoints.length} {t('gpsActionDetail.checkpoints')}
                </p>
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                {isTrackingLocation ? t('gpsActionDetail.trackingEnabled') : t('gpsActionDetail.trackingDisabled')}
              </div>
            </div>

            <div className="h-[620px] bg-surface-container/20">
              <MapContainer center={mapCenter} zoom={14} style={{height: '100%', width: '100%'}}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {checkpoints.length > 1 && (
                  <Polyline
                    positions={checkpoints.map((cp) => cp.position)}
                    color="var(--brand)"
                    weight={4}
                    dashArray="10, 10"
                    opacity={0.7}
                  />
                )}

                {checkpoints.map((checkpoint) => (
                  <Marker
                    key={checkpoint.id}
                    position={checkpoint.position}
                    icon={createCheckpointIcon(checkpoint.index, checkpoint.isCheckedIn)}
                  >
                    <Popup>
                      <div className="p-2 text-center">
                        <p className="font-bold">
                          {t('gpsActionDetail.checkpoint')} {checkpoint.index}
                        </p>
                        <p className="text-sm">{checkpoint.displayName}</p>
                        {checkpoint.isCheckedIn && (
                          <Badge className="mt-2 bg-brand">
                            {t('gpsActionDetail.checkpointReached', {
                              checkpoint: checkpoint.index,
                              name: checkpoint.displayName,
                            })}
                          </Badge>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {userLocation && (
                  <>
                    <Marker position={userLocation} icon={userLocationIcon}>
                      <Popup>{t('gpsActionDetail.yourLocation')}</Popup>
                    </Marker>
                    <RecenterMap coords={userLocation} />
                  </>
                )}
              </MapContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-info-container p-2">
                <Target className="h-5 w-5 text-on-info-container" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{t('gpsActionDetail.progress')}</h3>
                <p className="text-sm text-muted-foreground">
                  {checkedInCount} / {checkpoints.length} {t('gpsActionDetail.checkpoints')}
                </p>
              </div>
            </div>

            <div className="mt-4 h-3 w-full rounded-full bg-surface-container">
              <div
                className="h-3 rounded-full bg-brand transition-all duration-500"
                style={{
                  width: `${checkpoints.length > 0 ? (checkedInCount / checkpoints.length) * 100 : 0}%`,
                }}
              ></div>
            </div>

            {allCheckpointsCheckedIn && (
              <div className="mt-4 rounded-2xl border border-brand bg-brand-container p-4 text-on-brand-container">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <span className="font-semibold">{t('gpsActionDetail.allCheckpointsReached')}</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="rounded-3xl border p-6 shadow-lg">
            <h3 className="mb-4 font-semibold">{t('gpsActionDetail.checkpointList')}</h3>
            <div className="space-y-3">
              {checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                    checkpoint.isCheckedIn ? 'border-brand bg-brand-container' : 'border-border bg-surface-container'
                  }`}
                >
                  <div
                    className={`rounded-full p-2 ${
                      checkpoint.isCheckedIn
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-info-container text-on-info-container'
                    }`}
                  >
                    {checkpoint.isCheckedIn ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4 w-4" aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {t('gpsActionDetail.checkpoint')} {checkpoint.index}
                    </p>
                    <p className="text-sm text-muted-foreground">{checkpoint.displayName}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {checkpoint.position[0].toFixed(4)}, {checkpoint.position[1].toFixed(4)}
                    </p>
                  </div>

                  {isDevMode && !checkpoint.isCheckedIn && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        applyLocalLocation(checkpoint.position[0], checkpoint.position[1]);
                      }}
                    >
                      Teleport
                    </Button>
                  )}
                </div>
              ))}

              {checkpoints.length === 0 && (
                <p className="py-4 text-center text-muted-foreground">{t('gpsActionDetail.noCheckpoints')}</p>
              )}
            </div>
          </Card>

          <Card className="rounded-3xl border p-6 shadow-lg bg-card">
            <div className="flex items-start gap-3">
              <Navigation className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" aria-hidden="true" />
              <div className="text-sm">
                <p className="mb-1 font-semibold text-foreground">{t('gpsActionDetail.trackingActive')}</p>
                <p className="text-muted-foreground">
                  {isTrackingLocation ? t('gpsActionDetail.trackingEnabled') : t('gpsActionDetail.trackingDisabled')}
                </p>
              </div>
            </div>
          </Card>

          {userLocation && !isDevMode && (
            <Card className="rounded-3xl border p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-destructive" aria-hidden="true" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('gpsActionDetail.yourLocation')}</p>
                  <p className="font-mono text-sm">
                    {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {isDevMode && (
            <Card className="rounded-3xl border p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-destructive" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">{t('gpsActionDetail.yourLocation')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      type="number"
                      step="0.000001"
                      className="h-10 w-40 rounded-md border border-border bg-background px-3 text-sm"
                      value={devLatInput}
                      onChange={(e) => setDevLatInput(e.target.value)}
                      aria-label="Latitude"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="0.000001"
                      className="h-10 w-40 rounded-md border border-border bg-background px-3 text-sm"
                      value={devLngInput}
                      onChange={(e) => setDevLngInput(e.target.value)}
                      aria-label="Longitude"
                      placeholder="Longitude"
                    />
                    <Button
                      onClick={() => {
                        const latitude = Number(devLatInput);
                        const longitude = Number(devLngInput);

                        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                          return;
                        }

                        applyLocalLocation(latitude, longitude);
                      }}
                    >
                      Set location
                    </Button>
                  </div>
                  <p className="mt-2 font-mono text-sm">
                    {userLocation
                      ? `${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}`
                      : t('gpsActionDetail.noLocation')}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
