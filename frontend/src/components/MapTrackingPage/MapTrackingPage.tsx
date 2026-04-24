import {useState, useEffect, useRef} from 'react';
// import { useNavigate } from "react-router";
import {Card} from '../ui/card';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {MapContainer, TileLayer, Polyline, Marker, useMap} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Play, Square, MapPin, Clock, Route, Award, Bike, Footprints} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select';
import {toast} from 'sonner';
import {useTranslation} from 'react-i18next';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export function MapTrackingPage() {
  const {t} = useTranslation();
  const [isTracking, setIsTracking] = useState(false);
  const [activityType, setActivityType] = useState<'bike' | 'walk'>('bike');
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [path, setPath] = useState<[number, number][]>([]);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTracking && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, startTime]);

  // calculating distance using the haversine forumla
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStartTracking = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }

    setIsTracking(true);
    setStartTime(Date.now());
    setPath([]);
    setDistance(0);

    // Watch position in real-time
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        const newPoint: [number, number] = [latitude, longitude];

        setPath((prevPath) => {
          if (prevPath.length > 0) {
            const lastPoint = prevPath[prevPath.length - 1];
            const d = calculateDistance(lastPoint[0], lastPoint[1], latitude, longitude);
            // Only add distance if movement is > 5 meters to avoid GPS jitter
            if (d > 0.005) setDistance((prev) => prev + d);
          }
          return [...prevPath, newPoint];
        });
      },
      (error) => toast.error('Error tracking location: ' + error.message),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // maybe adding a method which can destinguish how fast the change of location is -> so someone cannot take the car??

  const handleStopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setIsTracking(false);

    if (distance > 0) {
      const totalDistance = parseFloat(distance.toFixed(2));
      const points = activityType === 'bike' ? Math.round(totalDistance * 10) : Math.round(totalDistance * 5);

      //   addActivity({
      //     type: activityType,
      //     title: `${activityType === "bike" ? "Bike Ride" : "Walk"} - ${totalDistance} km`,
      //     points,
      //     distance: totalDistance,
      //   });

      toast.success(`Activity saved! You earned ${points} points!`);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setStartTime(null);
    setDistance(0);
    setElapsedTime(0);
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-primary mb-2">{t('actionDetail.header')}</h1>
        <p className="text-primary">{t('actionDetail.subheader')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-[600px] bg-primary/20 flex items-center justify-center shadow-lg">
            <div className="h-full w-full">
              <MapContainer center={[47.3769, 8.5417]} zoom={13} style={{height: '100%', width: '100%'}}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {path.length > 0 && (
                  <>
                    <Polyline positions={path} color="blue" weight={5} />
                    <Marker position={path[path.length - 1]} />
                    <RecenterMap coords={path[path.length - 1]} />
                  </>
                )}
              </MapContainer>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Activity Type Selection */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-4">Activity Type</h3>
            <Select
              value={activityType}
              onValueChange={(value: 'bike' | 'walk') => setActivityType(value)}
              disabled={isTracking}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bike">
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    Bike Ride (10 pts/km)
                  </div>
                </SelectItem>
                <SelectItem value="walk">
                  <div className="flex items-center gap-2">
                    <Footprints className="h-4 w-4" />
                    Walking (5 pts/km)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Stats */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-4">{t('actionDetail.statsTitle')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Route className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('actionDetail.distance')}</p>
                  <p className="text-2xl font-bold">{distance.toFixed(2)} km</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('actionDetail.duration')}</p>
                  <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('actionDetail.points')}</p>
                  <p className="text-2xl font-bold">
                    {activityType === 'bike' ? Math.round(distance * 10) : Math.round(distance * 5)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Controls */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            {!isTracking ? (
              <Button
                onClick={handleStartTracking}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                size="lg"
              >
                <Play className="h-5 w-5" />
                {t('actionDetail.startTracking')}
              </Button>
            ) : (
              <Button
                onClick={handleStopTracking}
                className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                size="lg"
              >
                <Square className="h-5 w-5" />
                Stop & Save
              </Button>
            )}
          </Card>

          {/* Info */}
          <Card className="p-6 bg-card">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-500">
                <p className="font-semibold mb-1">GPS Tracking</p>
                <p className="text-blue-500">
                  Your location is tracked only during active sessions. Make sure location services are enabled on your
                  device.
                </p>
              </div>
            </div>
          </Card>

          {isTracking && (
            <Badge variant="secondary" className="w-full justify-center py-2 bg-green-100 text-green-700">
              <span className="animate-pulse mr-2">●</span>
              Currently Tracking
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple helper to keep map centered on user
function RecenterMap({coords}: {coords: [number, number]}) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}
