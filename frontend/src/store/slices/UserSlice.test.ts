import {describe, it, expect, vi, beforeEach} from 'vitest';
import {configureStore} from '@reduxjs/toolkit';
import userReducer, {fetchCurrentUser, logout, clearUserError, type UserDto} from './UserSlice';

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from '../../api/apiClient';

const mockedGet = vi.mocked(apiClient.get);

const createTestStore = () =>
  configureStore({
    reducer: {user: userReducer},
  });

// Matches the stub payload currently returned by fetchCurrentUser (see UserSlice.ts)
const stubUser: UserDto = {
  id: 1,
  username: 'Test User',
  email: 'test@example.com',
  points: 100,
};

describe('UserSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has null currentUser, not authenticated, not loading, no error', () => {
      const store = createTestStore();
      const state = store.getState().user;

      expect(state.currentUser).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('synchronous reducers', () => {
    it('logout resets currentUser, isAuthenticated and error', async () => {
      const store = createTestStore();
      mockedGet.mockResolvedValueOnce({data: {id: 1}}).mockResolvedValueOnce({data: stubUser});
      await store.dispatch(fetchCurrentUser());
      expect(store.getState().user.isAuthenticated).toBe(true);
      expect(store.getState().user.currentUser).not.toBeNull();

      store.dispatch(logout());
      const state = store.getState().user;
      expect(state.currentUser).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('clearUserError sets error to null', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(fetchCurrentUser());
      expect(store.getState().user.error).toBe('fail');

      store.dispatch(clearUserError());
      expect(store.getState().user.error).toBeNull();
    });
  });

  describe('fetchCurrentUser', () => {
    it('stores user and marks authenticated on success', async () => {
      const store = createTestStore();
      mockedGet.mockResolvedValueOnce({data: {id: 1}}).mockResolvedValueOnce({data: stubUser});

      await store.dispatch(fetchCurrentUser());

      const state = store.getState().user;
      expect(state.currentUser).toEqual(stubUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockedGet).toHaveBeenCalledWith('/auth/whoami');
    });

    it('sets error "not_authenticated" on 401 response', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce({response: {status: 401}});

      await store.dispatch(fetchCurrentUser());

      const state = store.getState().user;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('not_authenticated');
      expect(state.isAuthenticated).toBe(false);
      expect(state.currentUser).toBeNull();
    });

    it('uses server-provided error message on non-401 axios error', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce({
        response: {status: 500, data: {error: 'Server exploded'}},
      });

      await store.dispatch(fetchCurrentUser());

      expect(store.getState().user.error).toBe('Server exploded');
      expect(store.getState().user.isAuthenticated).toBe(false);
    });

    it('falls back to "Failed to fetch user" when axios error has no data.error', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce({response: {status: 500}});

      await store.dispatch(fetchCurrentUser());

      expect(store.getState().user.error).toBe('Failed to fetch user');
    });

    it('uses Error.message when rejection is a plain Error', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(new Error('Network down'));

      await store.dispatch(fetchCurrentUser());

      expect(store.getState().user.error).toBe('Network down');
      expect(store.getState().user.isAuthenticated).toBe(false);
    });

    it('falls back to "Failed to fetch user" on unknown rejection type', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(42);

      await store.dispatch(fetchCurrentUser());

      expect(store.getState().user.error).toBe('Failed to fetch user');
    });
  });

  describe('loading state transitions', () => {
    it('sets loading true during pending and false after fulfilled', async () => {
      const store = createTestStore();
      const loadingStates: boolean[] = [];

      store.subscribe(() => {
        loadingStates.push(store.getState().user.loading);
      });

      mockedGet.mockResolvedValueOnce({data: {}});
      await store.dispatch(fetchCurrentUser());

      expect(loadingStates).toContain(true);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });

    it('clears previous error when a new request starts', async () => {
      const store = createTestStore();

      mockedGet.mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(fetchCurrentUser());
      expect(store.getState().user.error).toBe('fail');

      mockedGet.mockResolvedValueOnce({data: {id: 1}}).mockResolvedValueOnce({data: stubUser});
      await store.dispatch(fetchCurrentUser());
      expect(store.getState().user.error).toBeNull();
    });
  });
});
