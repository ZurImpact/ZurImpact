import {ActionDashboard} from '../ActionDashboard/ActionDashboard';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router';
import {RootLayout} from '../RootLayout/RootLayout';
import {AboutPage} from '../AboutUs/AboutUs';
import {ContactPage} from '../Contact/ContactPage';
import {GpsActionDetailPage} from '../ActionDetailPage/GpsActionDetailPage';
import {ActionCreatePage} from '../ActionCreatePage/ActionCreatePage';
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
import {HomePage} from '../HomePage/HomePage';
import {FaqPage} from '../FaqPage/FaqPage';
import {VerifyEmailChangePage} from '../Auth/VerifyEmailChangePage';
import {PartnersPage} from '../PartnerPage/PartnerPage';

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
            <Route path={ROUTES.verifyEmailChange} element={<VerifyEmailChangePage />} />
          </Route>

          {/* Public marketing pages — with app nav, no auth required */}
          <Route path={ROUTES.root} element={<RootLayout />}>
            <Route index element={<Navigate to={ROUTES.home} replace />} />
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.faq} element={<FaqPage />} />
            <Route path={ROUTES.about} element={<AboutPage />} />
            <Route path={ROUTES.contact} element={<ContactPage />} />
            <Route path={ROUTES.partners} element={<PartnersPage />} />
          </Route>

          {/* Protected app pages — auth required */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RootLayout />}>
              <Route path={ROUTES.dashboard} element={<ActionDashboard />} />
              <Route path={ROUTES.actionCreate} element={<ActionCreatePage />} />
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
