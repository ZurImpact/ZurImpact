import {Outlet} from 'react-router';
import {useEffect} from 'react';
import {Navigation} from './Navigation';
import {useAppDispatch} from '../../store/store';
import {fetchCurrentUser} from '../../store/slices/UserSlice';

export function RootLayout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
