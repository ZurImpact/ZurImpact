import {describe, it, expect, vi, beforeEach} from 'vitest';
import {screen} from '@testing-library/react';
import App from './App';
import {renderWithProviders} from '../../test/test.utils';

const mockApiGet = vi.hoisted(() => vi.fn());

vi.mock('../../api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockImplementation((url: string) => {
      if (url === '/users/current') {
        return Promise.resolve({data: {id: 1, name: 'Test User', email: 'test@test.com', points: 123}});
      }
      if (url === '/actions' || url.includes('getUserActions')) {
        return Promise.resolve({data: []});
      }
      return Promise.resolve({data: {}});
    });
  });

  it('renders without crashing', async () => {
    renderWithProviders(<App />);
    expect(await screen.findByText('actionDashboard.header')).toBeInTheDocument();
  });
});
