// Centralized route paths for the app
export const ROUTES = {
  root: '/',
  dashboard: '/dashboard',
  track: '/track',
  rewards: '/rewards',
  home: '/home',
  faq: '/faq',
  actionDetailsPattern: '/actions/:id',
  actionDetails: (actionId: number | string) => `/actions/${actionId}`,
};
