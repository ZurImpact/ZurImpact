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
  fetchActionById,
  fetchUserActions,
  clearSelectedAction,
  completeAction,
  startAction,
  completeSubTask,
  type ActionDto,
  type UserActionHistoryDto,
} from '../../store/slices/ActionSlice';
import {fetchCurrentUser} from '../../store/slices/UserSlice';
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

  const [hasStartedAction, setHasStartedAction] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [isStartingAction, setIsStartingAction] = useState(false);
  const [activeUserHistoryAction, setActiveUserHistoryAction] = useState<UserActionHistoryDto | null>(null);
  const completedSubtasksRef = useRef<Set<number>>(new Set());
  const {selectedAction, loading, error} = useAppSelector((state) => state.actions);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [checkedInCheckpointIds, setCheckedInCheckpointIds] = useState<Set<number>>(new Set());
  const checkedInCheckpointIdsRef = useRef(checkedInCheckpointIds);
  useEffect(() => {
    checkedInCheckpointIdsRef.current = checkedInCheckpointIds;
  }, [checkedInCheckpointIds]);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

  const [devLatInput, setDevLatInput] = useState('');
  const [devLngInput, setDevLngInput] = useState('');

  const watchIdRef = useRef<number | null>(null);
  const hasCalledCompleteAction = useRef(false);

  const handleStartAction = async () => {
    const userId = localStorage.getItem('userId') || '1'; //remove 1 once auth is fully implemented!!

    if (!userId || actionIdFromRoute === null) {
      toast.error(t('gpsActionDetail.actionNotFound'));
      return;
    }

    setIsStartingAction(true);
    try {
      await dispatch(startAction({userId: Number(userId), actionId: actionIdFromRoute})).unwrap();
      setHasStartedAction(true);
      setShowStartDialog(false);
      toast.success(t('gpsActionDetail.actionStarted'));
    } catch (error) {
      console.error('Error starting action:', error);
      toast.error(t('gpsActionDetail.startError'));
    } finally {
      setIsStartingAction(false);
    }
  };

  const initialCheckpoints = useMemo(() => {
    if (!selectedAction) {
      return [];
    }
    return processCheckpointsFromAction(selectedAction);
  }, [selectedAction]);

  const mapCenter = useMemo((): [number, number] => {
    if (initialCheckpoints.length === 0) {
      return [47.3769, 8.5417];
    }
    const avgLat = initialCheckpoints.reduce((sum, cp) => sum + cp.position[0], 0) / initialCheckpoints.length;
    const avgLng = initialCheckpoints.reduce((sum, cp) => sum + cp.position[1], 0) / initialCheckpoints.length;
    return [avgLat, avgLng];
  }, [initialCheckpoints]);

  const applyLocalLocation = useCallback(
    (latitude: number, longitude: number) => {
      const newLocation: [number, number] = [latitude, longitude];
      setUserLocation(newLocation);
      setDevLatInput(latitude.toString());
      setDevLngInput(longitude.toString());

      initialCheckpoints.forEach((cp) => {
        if (checkedInCheckpointIdsRef.current.has(cp.id)) return;

        const distance = calculateDistance(latitude, longitude, cp.position[0], cp.position[1]);
        if (distance <= thresholdToMeters(cp.distanceThresholdLevel) && hasStartedAction) {
          setCheckedInCheckpointIds((prev) => {
            if (prev.has(cp.id)) return prev;
            const next = new Set(prev);
            next.add(cp.id);
            return next;
          });

          if (!completedSubtasksRef.current.has(cp.id)) {
            completedSubtasksRef.current.add(cp.id);
            const userId = localStorage.getItem('userId') || '1'; //remove 1 once auth is fully implemented!!
            if (userId && actionIdFromRoute !== null) {
              dispatch(
                completeSubTask({
                  userId: Number(userId),
                  actionId: actionIdFromRoute,
                  subTaskId: cp.id,
                  actionType: 'GPS',
                }),
              );
            }
          }

          toast.success(
            t('gpsActionDetail.checkpointReached', {
              checkpoint: cp.index,
              name: cp.displayName,
            }),
          );
        }
      });
    },
    [actionIdFromRoute, dispatch, hasStartedAction, initialCheckpoints, t],
  );

  const checkpoints = useMemo(() => {
    return initialCheckpoints.map((cp) => ({
      ...cp,
      isCheckedIn: checkedInCheckpointIds.has(cp.id),
    }));
  }, [initialCheckpoints, checkedInCheckpointIds]);

  useEffect(() => {
    let isMounted = true;

    setActiveUserHistoryAction(null);
    setHasStartedAction(false);
    setCheckedInCheckpointIds(new Set());
    completedSubtasksRef.current = new Set();
    hasCalledCompleteAction.current = false;

    if (actionIdFromRoute !== null) {
      dispatch(fetchActionById(actionIdFromRoute));

      const userId = Number(localStorage.getItem('userId') || '1');
      if (Number.isInteger(userId) && userId > 0) {
        dispatch(fetchUserActions({userId, active: true}))
          .unwrap()
          .then((userActions: UserActionHistoryDto[]) => {
            if (!isMounted) {
              return;
            }

            const matchingActionEntries = userActions.filter((userAction) => userAction.actionId === actionIdFromRoute);
            if (matchingActionEntries.length === 0) {
              return;
            }

            const matchedAction = matchingActionEntries.find((userAction) => !userAction.isSubtask) ?? null;

            if (!matchedAction) {
              return;
            }

            setActiveUserHistoryAction(matchedAction);
            setHasStartedAction(true);

            const completedSubtaskIds = matchingActionEntries
              .filter((userAction) => userAction.isSubtask)
              .map((userAction) => Number(userAction.subtaskId ?? userAction.subactionId))
              .filter((subtaskId) => Number.isInteger(subtaskId) && subtaskId > 0);
            const completedSubtaskSet = new Set(completedSubtaskIds);

            setCheckedInCheckpointIds(completedSubtaskSet);
            completedSubtasksRef.current = completedSubtaskSet;
          })
          .catch(() => {
            if (!isMounted) {
              return;
            }

            setActiveUserHistoryAction(null);
          });
      }
    }

    return () => {
      isMounted = false;
      dispatch(clearSelectedAction());
    };
  }, [actionIdFromRoute, dispatch]);

  useEffect(() => {
    if (isDevMode) {
      setIsTrackingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      toast.error(t('gpsActionDetail.geolocationError'));
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        applyLocalLocation(latitude, longitude);
      },
      (err) => {
        console.error('Geolocation error:', err);
        toast.error(t('gpsActionDetail.locationError'));
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
  }, [
    applyLocalLocation,
    t,
    initialCheckpoints,
    checkedInCheckpointIds,
    actionIdFromRoute,
    dispatch,
    hasStartedAction,
    isDevMode,
  ]);

  const allCheckpointsCheckedIn = checkpoints.length > 0 && checkpoints.every((cp) => cp.isCheckedIn);
  const checkedInCount = checkpoints.filter((cp) => cp.isCheckedIn).length;

  useEffect(() => {
    const userId = localStorage.getItem('userId') || '1'; //remove 1 once auth is fully implemented!!
    if (isDevMode) {
      return;
    }
    if (allCheckpointsCheckedIn && userId && !hasCalledCompleteAction.current && actionIdFromRoute !== null) {
      hasCalledCompleteAction.current = true;
      dispatch(completeAction({userId: Number(userId), actionId: actionIdFromRoute}))
        .unwrap()
        .then(() => {
          toast.success(t('gpsActionDetail.actionCompleted'));
          dispatch(fetchCurrentUser());
        })
        .catch(() => {
          hasCalledCompleteAction.current = false;
        });
    }
  }, [allCheckpointsCheckedIn, dispatch, actionIdFromRoute, t, isDevMode]);
  const polylinePositions = checkpoints.map((cp) => cp.position);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4 pl-0">
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('gpsActionDetail.back')}
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {activeUserHistoryAction?.displayName ?? selectedAction.displayName}
            </h1>
            <p className="text-muted-foreground">
              {activeUserHistoryAction?.description ?? selectedAction.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="text-lg px-4 py-2 bg-brand-container border-brand text-on-brand-container"
            >
              <Award className="h-4 w-4 mr-1" />
              {activeUserHistoryAction?.points ?? selectedAction.points} {t('points')}
            </Badge>
            {!hasStartedAction && (
              <Button
                className="h-12 text-lg px-4 bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={() => setShowStartDialog(true)}
              >
                {t('gpsActionDetail.startAction')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {showStartDialog && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50"
          onClick={() => setShowStartDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t('gpsActionDetail.startDialogTitle')}
        >
          <div
            className="relative bg-card border rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStartDialog(false)}
              className="absolute top-3 right-3 p-1 hover:bg-surface-container-high rounded"
              aria-label={t('rootLayout.closeMenu')}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <h2 className="text-xl text-brand font-semibold mb-2">{t('gpsActionDetail.startDialogTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('gpsActionDetail.startDialogDescription')}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" className="border border-brand" onClick={() => setShowStartDialog(false)}>
                {t('gpsActionDetail.cancel')}
              </Button>
              <Button
                className="bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={handleStartAction}
                disabled={isStartingAction}
              >
                {isStartingAction ? t('gpsActionDetail.starting') : t('gpsActionDetail.confirmStart')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-[620px] shadow-lg">
            <MapContainer center={mapCenter} zoom={14} style={{height: '100%', width: '100%'}}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {polylinePositions.length > 1 && (
                <Polyline
                  positions={polylinePositions}
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
                    <div className="text-center p-2">
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
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-info-container rounded-lg">
                <Target className="h-5 w-5 text-on-info-container" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold">{t('gpsActionDetail.progress')}</h3>
                <p className="text-sm text-muted-foreground">
                  {checkedInCount} / {checkpoints.length} {t('gpsActionDetail.checkpoints')}
                </p>
              </div>
            </div>

            <div className="w-full bg-surface-container rounded-full h-3 mb-4">
              <div
                className="bg-brand h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${checkpoints.length > 0 ? (checkedInCount / checkpoints.length) * 100 : 0}%`,
                }}
              ></div>
            </div>

            {allCheckpointsCheckedIn && (
              <div className="mt-4 p-4 bg-brand-container border border-brand rounded-lg">
                <div className="flex items-center gap-2 text-on-brand-container">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <span className="font-semibold">{t('gpsActionDetail.allCheckpointsReached')}</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('gpsActionDetail.checkpointList')}</h3>
            <div className="space-y-3">
              {checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    checkpoint.isCheckedIn
                      ? 'bg-brand-container border border-brand'
                      : 'bg-surface-container border border-border'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
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
                  <div className="flex-1">
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
                <p className="text-muted-foreground text-center py-4">{t('gpsActionDetail.noCheckpoints')}</p>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-card">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-1">{t('gpsActionDetail.trackingActive')}</p>
                <p className="text-muted-foreground">
                  {isTrackingLocation ? t('gpsActionDetail.trackingEnabled') : t('gpsActionDetail.trackingDisabled')}
                </p>
              </div>
            </div>
          </Card>

          {userLocation && !isDevMode && (
            <Card className="p-6">
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
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-destructive" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t('gpsActionDetail.yourLocation')}</p>
                  <div className="flex gap-2 mt-2">
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
                  <p className="font-mono text-sm mt-2">
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
