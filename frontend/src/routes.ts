// Centralized route paths for the app
export const ROUTES = {
  root: '/',
  dashboard: '/dashboard',
  track: '/track',
  rewards: '/rewards',
  about: '/about',
  contact: '/contact',
  home: '/home',
  actionDetailsPattern: '/actions/:id',
  actionDetails: (actionId: number | string) => `/actions/${actionId}`,
};
