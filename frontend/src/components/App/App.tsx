import {ActionDashboard} from '../ActionDashboard/ActionDashboard';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router';
import {RootLayout} from '../RootLayout/RootLayout';

import {ROUTES} from '../../routes';
import {ThemeProvider} from 'next-themes';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.root} element={<RootLayout />}>
            <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
            <Route path={ROUTES.dashboard} element={<ActionDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
