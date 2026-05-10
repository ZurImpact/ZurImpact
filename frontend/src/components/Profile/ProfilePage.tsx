import {useAppSelector} from '../../store/store';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Badge} from '../ui/badge';
import {ChangePasswordForm} from './ChangePasswordForm';

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function ProfilePage() {
  const currentUser = useAppSelector((s) => s.user.currentUser);

  if (!currentUser) {
    return (
      <div data-testid="profile-page" className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div data-testid="profile-page" className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{currentUser.username}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
            <span className="text-muted-foreground font-medium">Email</span>
            <span>{currentUser.email}</span>

            <span className="text-muted-foreground font-medium">Role</span>
            <span>
              <Badge variant="secondary">{currentUser.role}</Badge>
            </span>

            <span className="text-muted-foreground font-medium">Email status</span>
            <span>
              {currentUser.emailVerified ? (
                <Badge variant="default">Verified</Badge>
              ) : (
                <Badge variant="destructive">Not verified</Badge>
              )}
            </span>

            <span className="text-muted-foreground font-medium">Credits</span>
            <span>
              <span className="text-2xl font-bold">{currentUser.points}</span>{' '}
              <span className="text-muted-foreground">credits</span>
            </span>

            {currentUser.createdAt && (
              <>
                <span className="text-muted-foreground font-medium">Member since</span>
                <span>{formatDate(currentUser.createdAt)}</span>
              </>
            )}

            {currentUser.address !== null && (
              <>
                <span className="text-muted-foreground font-medium">Address</span>
                <span>Address #{currentUser.address}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <ChangePasswordForm />
    </div>
  );
}
