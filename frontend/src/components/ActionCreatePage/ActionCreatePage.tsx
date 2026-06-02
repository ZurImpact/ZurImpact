import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router';
import {ArrowLeft, Plus, Trash2, MapPin} from 'lucide-react';
import {toast} from 'sonner';
import {useTranslation} from 'react-i18next';
import {MapContainer, Marker, TileLayer, useMap, useMapEvents} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiClient from '../../api/apiClient';
import {getErrorMessage} from '../../api/problemDetail';
import {ROUTES} from '../../routes';
import {useAppSelector} from '../../store/store';
import {Button} from '../ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Input} from '../ui/input';
import {Label} from '../ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select';
import type {DistanceThresholdLevel} from '../../utils/distanceThreshold';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER: [number, number] = [47.378177, 8.540192];

type CheckpointFormState = {
  displayName: string;
  description: string;
  latitude: string;
  longitude: string;
  distanceThresholdLevel: DistanceThresholdLevel;
};

type CreateGpsActionRequest = {
  id: number;
  displayName: string;
  description: string;
  points: number;
  tags: ['FOOD'];
  subTasks: Array<{
    id: number;
    description: string;
    displayName: string;
    actionId: number;
    type: 'GPS';
    latitude?: number;
    longitude?: number;
    distanceThresholdLevel?: DistanceThresholdLevel;
  }>;
  type: 'GPS';
  hasSubtasks: true;
  validUntil: string;
  createdOn: string;
};

function RecenterMap({center}: {center: [number, number]}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

function MapClickHandler({onSelect}: {onSelect: (coords: [number, number]) => void}) {
  useMapEvents({
    click: (event) => {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function CheckpointMapPicker({
  latitude,
  longitude,
  onSelect,
  checkpointLabel,
  helperText,
  selectedCoordinatesLabel,
}: {
  latitude: string;
  longitude: string;
  onSelect: (coords: [number, number]) => void;
  checkpointLabel: string;
  helperText: string;
  selectedCoordinatesLabel: string;
}) {
  const selectedCoordinates = useMemo<[number, number] | null>(() => {
    if (!latitude.trim() || !longitude.trim()) {
      return null;
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
      return null;
    }

    return [parsedLatitude, parsedLongitude];
  }, [latitude, longitude]);

  const center = selectedCoordinates ?? DEFAULT_CENTER;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{checkpointLabel}</Label>
        <p className="text-xs text-muted-foreground">{helperText}</p>
      </div>
      <div className="relative isolate overflow-hidden rounded-lg border border-border/70 bg-muted/20">
        <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{height: '18rem', width: '100%'}}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onSelect={onSelect} />
          {selectedCoordinates && (
            <>
              <Marker position={selectedCoordinates} />
              <RecenterMap center={selectedCoordinates} />
            </>
          )}
        </MapContainer>
      </div>
      {selectedCoordinates ? (
        <p className="text-xs text-muted-foreground">
          {selectedCoordinatesLabel}: {selectedCoordinates[0].toFixed(5)}, {selectedCoordinates[1].toFixed(5)}
        </p>
      ) : null}
    </div>
  );
}

const createEmptyCheckpoint = (): CheckpointFormState => ({
  displayName: '',
  description: '',
  latitude: '',
  longitude: '',
  distanceThresholdLevel: 'MEDIUM',
});

export function ActionCreatePage() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const [actionName, setActionName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [checkpoints, setCheckpoints] = useState<CheckpointFormState[]>([createEmptyCheckpoint()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createdOn = useMemo(() => new Date().toISOString(), []);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-6 text-center">
          <p className="text-muted-foreground">{t('actionCreatePage.loginPrompt')}</p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate(ROUTES.dashboard)}>{t('actionCreatePage.backToDashboard')}</Button>
          </div>
        </Card>
      </div>
    );
  }

  const updateCheckpoint = (index: number, field: keyof CheckpointFormState, value: string) => {
    setCheckpoints((current) =>
      current.map((checkpoint, currentIndex) =>
        currentIndex === index ? {...checkpoint, [field]: value} : checkpoint,
      ),
    );
  };

  const updateCheckpointCoordinates = (index: number, coords: [number, number]) => {
    const [latitude, longitude] = coords;

    setCheckpoints((current) =>
      current.map((checkpoint, currentIndex) =>
        currentIndex === index
          ? {...checkpoint, latitude: latitude.toString(), longitude: longitude.toString()}
          : checkpoint,
      ),
    );
  };

  const updateThreshold = (index: number, value: DistanceThresholdLevel) => {
    setCheckpoints((current) =>
      current.map((checkpoint, currentIndex) =>
        currentIndex === index ? {...checkpoint, distanceThresholdLevel: value} : checkpoint,
      ),
    );
  };

  const addCheckpoint = () => {
    setCheckpoints((current) => [...current, createEmptyCheckpoint()]);
  };

  const removeCheckpoint = (index: number) => {
    setCheckpoints((current) =>
      current.length === 1 ? current : current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const buildRequest = (): CreateGpsActionRequest => ({
    id: 0,
    displayName: actionName.trim(),
    description: description.trim(),
    points: Number(points),
    tags: ['FOOD'],
    subTasks: checkpoints.map((checkpoint) => ({
      id: 0,
      description: checkpoint.description.trim(),
      displayName: checkpoint.displayName.trim(),
      actionId: 0,
      type: 'GPS',
      latitude: Number(checkpoint.latitude),
      longitude: Number(checkpoint.longitude),
      distanceThresholdLevel: checkpoint.distanceThresholdLevel,
    })),
    type: 'GPS',
    hasSubtasks: true,
    validUntil: new Date(validUntil).toISOString(),
    createdOn,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!actionName.trim()) {
      setFormError(t('actionCreatePage.actionNameLabel'));
      return;
    }

    const pointValue = Number(points);
    if (!Number.isFinite(pointValue) || pointValue <= 0) {
      setFormError(t('actionCreatePage.pointsLabel'));
      return;
    }

    if (!validUntil) {
      setFormError(t('actionCreatePage.validUntilLabel'));
      return;
    }

    const hasInvalidCheckpoint = checkpoints.some((checkpoint) => {
      const latitude = Number(checkpoint.latitude);
      const longitude = Number(checkpoint.longitude);
      return (
        !checkpoint.displayName.trim() ||
        !checkpoint.latitude.trim() ||
        !checkpoint.longitude.trim() ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      );
    });

    if (checkpoints.length === 0 || hasInvalidCheckpoint) {
      setFormError(t('actionCreatePage.emptyCheckpoints'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/actions', buildRequest());
      toast.success(t('actionCreatePage.success'));
      navigate(ROUTES.actionDetails(response.data.id));
    } catch (error) {
      console.error('Failed to create action:', error);
      const message = getErrorMessage(error, t('actionCreatePage.error'));
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-container px-4 py-2 text-on-brand-container">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">{t('actionCreatePage.badge')}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">{t('actionCreatePage.header')}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">{t('actionCreatePage.subheader')}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(ROUTES.dashboard)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('actionCreatePage.backToDashboard')}
          </Button>
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive bg-destructive-container p-4 text-on-destructive-container"
          >
            {formError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <Card className="overflow-hidden border bg-card shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>{t('actionCreatePage.header')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <section className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="action-name">{t('actionCreatePage.actionNameLabel')}</Label>
                    <Input
                      id="action-name"
                      value={actionName}
                      onChange={(event) => setActionName(event.target.value)}
                      placeholder={t('actionCreatePage.actionNamePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="action-description">{t('actionCreatePage.descriptionLabel')}</Label>
                    <textarea
                      id="action-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder={t('actionCreatePage.descriptionPlaceholder')}
                      className="border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border bg-input-background flex min-h-28 w-full rounded-md px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="action-points">{t('actionCreatePage.pointsLabel')}</Label>
                    <Input
                      id="action-points"
                      type="number"
                      min="1"
                      step="1"
                      value={points}
                      onChange={(event) => setPoints(event.target.value)}
                      placeholder={t('actionCreatePage.pointsPlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="action-valid-until">{t('actionCreatePage.validUntilLabel')}</Label>
                    <Input
                      id="action-valid-until"
                      type="date"
                      value={validUntil}
                      onChange={(event) => setValidUntil(event.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">{t('actionCreatePage.validUntilHelper')}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {t('actionCreatePage.checkpointsTitle')}
                      </h2>
                      <p className="text-sm text-muted-foreground">{t('actionCreatePage.summaryLine2')}</p>
                    </div>
                    <Button type="button" variant="outline" onClick={addCheckpoint}>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      {t('actionCreatePage.addCheckpoint')}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {checkpoints.map((checkpoint, index) => (
                      <Card key={index} className="border border-border/70 bg-background/60 p-4">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-brand">
                              {t('actionCreatePage.checkpointsTitle')} {index + 1}
                            </p>
                            <p className="text-xs text-muted-foreground">{t('actionCreatePage.summaryLine1')}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeCheckpoint(index)}
                            disabled={checkpoints.length === 1}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            {t('actionCreatePage.removeCheckpoint')}
                          </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`checkpoint-name-${index}`}>
                              {t('actionCreatePage.checkpointNameLabel')}
                            </Label>
                            <Input
                              id={`checkpoint-name-${index}`}
                              value={checkpoint.displayName}
                              onChange={(event) => updateCheckpoint(index, 'displayName', event.target.value)}
                              placeholder={t('actionCreatePage.checkpointNamePlaceholder')}
                              required
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`checkpoint-description-${index}`}>
                              {t('actionCreatePage.checkpointDescriptionLabel')}
                            </Label>
                            <textarea
                              id={`checkpoint-description-${index}`}
                              value={checkpoint.description}
                              onChange={(event) => updateCheckpoint(index, 'description', event.target.value)}
                              placeholder={t('actionCreatePage.checkpointDescriptionPlaceholder')}
                              className="border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border bg-input-background flex min-h-24 w-full rounded-md px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <CheckpointMapPicker
                              latitude={checkpoint.latitude}
                              longitude={checkpoint.longitude}
                              onSelect={(coords) => updateCheckpointCoordinates(index, coords)}
                              checkpointLabel={t('actionCreatePage.checkpointLocationLabel')}
                              helperText={t('actionCreatePage.checkpointLocationHelper')}
                              selectedCoordinatesLabel={t('actionCreatePage.selectedCoordinatesLabel')}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`checkpoint-threshold-${index}`}>
                              {t('actionCreatePage.thresholdLabel')}
                            </Label>
                            <Select
                              value={checkpoint.distanceThresholdLevel}
                              onValueChange={(value) => updateThreshold(index, value as DistanceThresholdLevel)}
                            >
                              <SelectTrigger id={`checkpoint-threshold-${index}`}>
                                <SelectValue placeholder={t('actionCreatePage.thresholdLabel')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EASY">{t('actionCreatePage.thresholdEasy')}</SelectItem>
                                <SelectItem value="MEDIUM">{t('actionCreatePage.thresholdMedium')}</SelectItem>
                                <SelectItem value="HARD">{t('actionCreatePage.thresholdHard')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate(ROUTES.dashboard)}>
                    {t('actionCreatePage.cancel')}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('actionCreatePage.creating') : t('actionCreatePage.submit')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border bg-brand-container p-6 text-on-brand-container shadow-sm">
              <CardTitle className="mb-3 text-lg">{t('actionCreatePage.checkpointsTitle')}</CardTitle>
              <ul className="space-y-2 text-sm">
                <li>• {t('actionCreatePage.actionNameLabel')}</li>
                <li>• {t('actionCreatePage.pointsLabel')}</li>
                <li>• {t('actionCreatePage.checkpointLocationLabel')}</li>
                <li>• {t('actionCreatePage.thresholdLabel')}</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
