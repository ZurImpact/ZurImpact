import {Outlet} from 'react-router';
import {Navigation} from './Navigation';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
