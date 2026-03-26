import {useState} from 'react';
import {Card} from '../ui/card';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {Bike, Trash2, Footprints, Award, Plus} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '../ui/dialog';
import {Label} from '../ui/label';
import {Input} from '../ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select';
import {ImageWithFallback} from '../ui/ImageWithFallback';
import {toast} from 'sonner';
import {useAppSelector} from '../../store/store';

const activityTypes = [
  {
    value: 'bike',
    label: 'Bike Ride',
    icon: Bike,
    basePoints: 10,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    value: 'walk',
    label: 'Walking',
    icon: Footprints,
    basePoints: 5,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    value: 'cleanup',
    label: 'Cleanup',
    icon: Trash2,
    basePoints: 25,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export function ActionDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [distance, setDistance] = useState('');
  const [title, setTitle] = useState('');

  const {actions} = useAppSelector((state) => state.actions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const activityType = activityTypes.find((t) => t.value === selectedType);
    if (!activityType) return;

    const distanceNum = distance ? parseFloat(distance) : 0;
    const points =
      selectedType === 'cleanup' ? activityType.basePoints : Math.round(activityType.basePoints * distanceNum);

    toast.success(`Activity logged! You earned ${points} points!`);

    // Reset form
    setSelectedType('');
    setDistance('');
    setTitle('');
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Activities</h1>
          <p className="text-gray-600">Log your sustainable activities and earn points</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Activity</DialogTitle>
              <DialogDescription>Track your sustainable actions and earn rewards</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="type">Activity Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Activity Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Morning commute to work"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {selectedType && selectedType !== 'cleanup' && (
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="5.0"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {selectedType === 'bike' && (
                    <>
                      <strong>Bike rides:</strong> 10 points per kilometer
                    </>
                  )}
                  {selectedType === 'walk' && (
                    <>
                      <strong>Walking:</strong> 5 points per kilometer
                    </>
                  )}
                  {selectedType === 'cleanup' && (
                    <>
                      <strong>Cleanup:</strong> 25 points per activity
                    </>
                  )}
                </p>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={!selectedType}>
                Log Activity
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Activity Types Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative z-10">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
              <Bike className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bike to Work</h3>
            <p className="text-gray-600 mb-4">Track your cycling routes and earn 10 points per kilometer</p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              10 pts/km
            </Badge>
          </div>
          <div className="absolute right-0 bottom-0 w-48 h-48 opacity-5">
            <Bike className="w-full h-full" />
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative z-10">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
              <Footprints className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Walk Around</h3>
            <p className="text-gray-600 mb-4">Log your walking distances and earn 5 points per kilometer</p>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              5 pts/km
            </Badge>
          </div>
          <div className="absolute right-0 bottom-0 w-48 h-48 opacity-5">
            <Footprints className="w-full h-full" />
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative z-10">
            <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
              <Trash2 className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cleanup Events</h3>
            <p className="text-gray-600 mb-4">Join cleanup activities and earn 25 points per session</p>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              25 pts/event
            </Badge>
          </div>
          <div className="absolute right-0 bottom-0 w-48 h-48 opacity-5">
            <Trash2 className="w-full h-full" />
          </div>
        </Card>
      </div>

      {/* Activity History */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Your Activity History</h2>

        {actions.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No activities logged yet. Start your sustainable journey today!</p>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsDialogOpen(true)}>
              Log Your First Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => {
              const Icon = Award;

              return (
                <div
                  key={action.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{action.displayName}</h4>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">+{action.points}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Inspiration Images */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1757181470818-05fcb4052658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxadXJpY2glMjBjaXR5JTIwc3VzdGFpbmFibGUlMjBiaWtlfGVufDF8fHx8MTc3MjYyMjYzNHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Cycling in Zürich"
            className="w-full h-64 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold mb-1">Bike Around Zürich</h3>
            <p className="text-sm text-gray-600">Explore the city on two wheels and earn rewards</p>
          </div>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1577369083609-051feb777894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBjbGVhbmluZyUyMGdhcmJhZ2UlMjBuYXR1cmV8ZW58MXx8fHwxNzcyNjIyNjM0fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Community cleanup"
            className="w-full h-64 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold mb-1">Join Cleanup Events</h3>
            <p className="text-sm text-gray-600">Help keep Zürich clean and beautiful</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
