import {Navigate, Outlet, useLocation} from 'react-router';
import {useAppSelector} from '../../store/store';

export function ProtectedRoute() {
  const {isAuthenticated, loading} = useAppSelector((s) => s.user);
  const location = useLocation();

  // Show spinner only while performing initial auth check (not yet known if authenticated)
  if (loading && !isAuthenticated) {
    return <div data-testid="protected-route-spinner" aria-label="Loading" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{from: location.pathname}} replace />;
  }

  return <Outlet />;
}
