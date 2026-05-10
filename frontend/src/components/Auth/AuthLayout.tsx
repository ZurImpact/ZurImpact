import {Outlet} from 'react-router';
import {Mountain} from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Mountain className="h-7 w-7 text-brand" aria-hidden="true" />
          <span className="text-xl font-bold text-brand">ZurImpact</span>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
