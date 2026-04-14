import {describe, it, expect, vi, beforeEach} from 'vitest';
import {configureStore} from '@reduxjs/toolkit';
import userReducer, {fetchUser, clearUser, clearUserError, type UserDto} from './UserSlice';

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

const mockUser: UserDto = {
  id: 1,
  username: 'zurUser',
  email: 'zur.user@example.com',
  points: 250,
};

describe('UserSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has null user, no loading, no error', () => {
      const store = createTestStore();
      const state = store.getState().user;

      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('synchronous reducers', () => {
    it('clearUser sets user to null', async () => {
      const store = createTestStore();
      mockedGet.mockResolvedValueOnce({data: mockUser});
      await store.dispatch(fetchUser(1));
      expect(store.getState().user.user).toEqual(mockUser);

      store.dispatch(clearUser());
      expect(store.getState().user.user).toBeNull();
    });

    it('clearUserError sets error to null', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(fetchUser(1));
      expect(store.getState().user.error).toBe('fail');

      store.dispatch(clearUserError());
      expect(store.getState().user.error).toBeNull();
    });
  });

  describe('fetchUser', () => {
    it('stores user on success', async () => {
      const store = createTestStore();
      mockedGet.mockResolvedValueOnce({data: mockUser});

      await store.dispatch(fetchUser(1));

      const state = store.getState().user;
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockedGet).toHaveBeenCalledWith('/users/1');
    });

    it('sets error on rejection with Error instance', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(new Error('Not found'));

      await store.dispatch(fetchUser(999));

      const state = store.getState().user;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Not found');
      expect(state.user).toBeNull();
    });

    it('sets fallback error on rejection with non-Error', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(42);

      await store.dispatch(fetchUser(1));

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

      mockedGet.mockResolvedValueOnce({data: mockUser});
      await store.dispatch(fetchUser(1));

      expect(loadingStates).toContain(true);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });

    it('clears previous error when a new request starts', async () => {
      const store = createTestStore();

      mockedGet.mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(fetchUser(1));
      expect(store.getState().user.error).toBe('fail');

      mockedGet.mockResolvedValueOnce({data: mockUser});
      await store.dispatch(fetchUser(1));
      expect(store.getState().user.error).toBeNull();
    });
  });
});
