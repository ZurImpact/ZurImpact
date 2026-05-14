import {describe, it, expect} from 'vitest';
import {ROUTES} from './routes';

describe('ROUTES', () => {
  it('defines root path', () => {
    expect(ROUTES.root).toBe('/');
  });

  it('defines dashboard path', () => {
    expect(ROUTES.dashboard).toBe('/dashboard');
  });

  it('defines action create path', () => {
    expect(ROUTES.actionCreate).toBe('/actions/new');
  });

  it('defines action details pattern path', () => {
    expect(ROUTES.actionDetailsPattern).toBe('/actions/:id');
  });

  it('builds action details path with action id', () => {
    expect(ROUTES.actionDetails(42)).toBe('/actions/42');
  });
});
