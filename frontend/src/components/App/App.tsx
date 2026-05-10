import {ActionDashboard} from '../ActionDashboard/ActionDashboard';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router';
import {RootLayout} from '../RootLayout/RootLayout';
import {GpsActionDetailPage} from '../ActionDetailPage/GpsActionDetailPage';
import {MapTrackingPage} from '../MapTrackingPage/MapTrackingPage';
import {RewardsPage} from '../Rewardspage/Rewardspage';
import {AuthLayout} from '../Auth/AuthLayout';
import {ProtectedRoute} from '../Auth/ProtectedRoute';
import {LoginPage} from '../Auth/LoginPage';

import {ROUTES} from '../../routes';
import {ThemeProvider} from 'next-themes';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <Routes>
          {/* Auth branch — no app nav, centered layout */}
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<div data-testid="register-stub">register</div>} />
            <Route path={ROUTES.verifyEmail} element={<div data-testid="verify-email-stub">verify-email</div>} />
            <Route path={ROUTES.passwordResetRequest} element={<div data-testid="forgot-password-stub">forgot-password</div>} />
            <Route path={ROUTES.passwordResetConfirm} element={<div data-testid="reset-password-stub">reset-password</div>} />
          </Route>

          {/* Protected branch — requires authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.root} element={<RootLayout />}>
              <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
              <Route path={ROUTES.dashboard} element={<ActionDashboard />} />
              <Route path={ROUTES.track} element={<MapTrackingPage />} />
              <Route path={ROUTES.rewards} element={<RewardsPage />} />
              <Route path={ROUTES.actionDetailsPattern} element={<GpsActionDetailPage />} />
              <Route path={ROUTES.profile} element={<div data-testid="profile-stub">profile</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
