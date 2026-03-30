import {describe, it, expect} from 'vitest';
import apiClient from './apiClient';

describe('apiClient', () => {
  it('has the configured baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:5173/backend_war_exploded/api');
  });

  it('has a 10 second timeout', () => {
    expect(apiClient.defaults.timeout).toBe(10000);
  });

  it('sets Content-Type to application/json', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
