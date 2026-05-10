import {ActionDashboard} from '../ActionDashboard/ActionDashboard';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router';
import {RootLayout} from '../RootLayout/RootLayout';
import {GpsActionDetailPage} from '../ActionDetailPage/GpsActionDetailPage';
import {MapTrackingPage} from '../MapTrackingPage/MapTrackingPage';
import {RewardsPage} from '../Rewardspage/Rewardspage';
import {AuthLayout} from '../Auth/AuthLayout';
import {ProtectedRoute} from '../Auth/ProtectedRoute';
import {LoginPage} from '../Auth/LoginPage';
import {RegisterPage} from '../Auth/RegisterPage';
import {VerifyEmailPage} from '../Auth/VerifyEmailPage';
import {ForgotPasswordPage} from '../Auth/ForgotPasswordPage';
import {ResetPasswordPage} from '../Auth/ResetPasswordPage';
import {ProfilePage} from '../Profile/ProfilePage';

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
            <Route path={ROUTES.register} element={<RegisterPage />} />
            <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />
            <Route path={ROUTES.passwordResetRequest} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.passwordResetConfirm} element={<ResetPasswordPage />} />
          </Route>

          {/* Protected branch — requires authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.root} element={<RootLayout />}>
              <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
              <Route path={ROUTES.dashboard} element={<ActionDashboard />} />
              <Route path={ROUTES.track} element={<MapTrackingPage />} />
              <Route path={ROUTES.rewards} element={<RewardsPage />} />
              <Route path={ROUTES.actionDetailsPattern} element={<GpsActionDetailPage />} />
              <Route path={ROUTES.profile} element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
