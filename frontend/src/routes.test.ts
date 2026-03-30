import {describe, it, expect} from 'vitest';
import {ROUTES} from './routes';

describe('ROUTES', () => {
  it('defines root path', () => {
    expect(ROUTES.root).toBe('/');
  });

  it('defines dashboard path', () => {
    expect(ROUTES.dashboard).toBe('/dashboard');
  });
});
