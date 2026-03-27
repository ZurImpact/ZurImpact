import {ActionDashboard} from '../ActionDashboard/ActionDashboard';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router';
import {RootLayout} from '../RootLayout/RootLayout';

import {ROUTES} from '../../routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.root} element={<RootLayout />}>
          <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path={ROUTES.dashboard} element={<ActionDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
