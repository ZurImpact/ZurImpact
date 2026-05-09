import {ActionDashboard} from '../ActionDashboard/ActionDashboard';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router';
import {RootLayout} from '../RootLayout/RootLayout';
import {GpsActionDetailPage} from '../ActionDetailPage/GpsActionDetailPage';
import {MapTrackingPage} from '../MapTrackingPage/MapTrackingPage';
import {RewardsPage} from '../Rewardspage/Rewardspage';

import {ROUTES} from '../../routes';
import {ThemeProvider} from 'next-themes';
import {HomePage} from '../HomePage/HomePage';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.root} element={<RootLayout />}>
            {/* <Route index element={<Navigate to={ROUTES.dashboard} replace />} /> */}
            <Route index element={<Navigate to={ROUTES.home} replace />} />
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.dashboard} element={<ActionDashboard />} />
            <Route path={ROUTES.track} element={<MapTrackingPage />} />
            <Route path={ROUTES.rewards} element={<RewardsPage />} />
            <Route path={ROUTES.actionDetailsPattern} element={<GpsActionDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
