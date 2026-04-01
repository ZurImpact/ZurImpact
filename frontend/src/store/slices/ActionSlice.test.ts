import {describe, it, expect, vi, beforeEach} from 'vitest';
import {configureStore} from '@reduxjs/toolkit';
import actionReducer, {
  fetchActions,
  fetchActionById,
  fetchUserActions,
  startAction,
  completeAction,
  clearSelectedAction,
  clearError,
  type ActionDto,
} from './ActionSlice';

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import apiClient from '../../api/apiClient';

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);

const createTestStore = () =>
  configureStore({
    reducer: {actions: actionReducer},
  });

const mockAction: ActionDto = {
  id: 1,
  displayName: 'Clean Park',
  description: 'Help clean the local park',
  points: 50,
  tags: ['SOCIAL'],
  hasSubtasks: false,
};

const mockActions: ActionDto[] = [mockAction, {id: 2, displayName: 'Plant Tree', points: 100, tags: ['FOOD']}];

const mockUserAction = {
  actionId: 1,
  displayName: 'Clean Park',
  points: 50,
  completionState: 'COMPLETED',
  mappingCreatedOn: '2026-03-01',
};

describe('ActionSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has empty actions, no selection, no loading, no error', () => {
      const store = createTestStore();
      const state = store.getState().actions;

      expect(state.actions).toEqual([]);
      expect(state.selectedAction).toBeNull();
      expect(state.userActions).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('synchronous reducers', () => {
    it('clearSelectedAction sets selectedAction to null', () => {
      const store = createTestStore();
      // First populate selectedAction via a fulfilled fetch
      mockedGet.mockResolvedValueOnce({data: mockAction});
      store.dispatch(fetchActionById(1)).then(() => {
        store.dispatch(clearSelectedAction());
        expect(store.getState().actions.selectedAction).toBeNull();
      });
    });

    it('clearError sets error to null', () => {
      const store = createTestStore();
      // Cause an error first
      mockedGet.mockRejectedValueOnce(new Error('fail'));
      store.dispatch(fetchActions({})).then(() => {
        expect(store.getState().actions.error).toBe('fail');
        store.dispatch(clearError());
        expect(store.getState().actions.error).toBeNull();
      });
    });
  });

  describe('fetchActions', () => {
    it('sets loading true on pending, then stores actions on fulfilled', async () => {
      const store = createTestStore();
      mockedGet.mockResolvedValueOnce({data: mockActions});

      await store.dispatch(fetchActions({}));

      const state = store.getState().actions;
      expect(state.loading).toBe(false);
      expect(state.actions).toEqual(mockActions);
      expect(state.error).toBeNull();
      expect(mockedGet).toHaveBeenCalledWith('/actions');
    });

    it('sets error on rejection with Error instance', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(new Error('Network error'));

      await store.dispatch(fetchActions({}));

      const state = store.getState().actions;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
      expect(state.actions).toEqual([]);
    });

    it('sets fallback error on rejection with non-Error', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce('something unexpected');

      await store.dispatch(fetchActions({}));

      const state = store.getState().actions;
      expect(state.error).toBe('Failed to fetch actions');
    });
  });

  describe('fetchActionById', () => {
    it('stores selectedAction on success', async () => {
      const store = createTestStore();
      mockedGet.mockResolvedValueOnce({data: mockAction});

      await store.dispatch(fetchActionById(1));

      const state = store.getState().actions;
      expect(state.selectedAction).toEqual(mockAction);
      expect(state.loading).toBe(false);
      expect(mockedGet).toHaveBeenCalledWith('/action/getAction?id=1');
    });

    it('sets error on failure', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(new Error('Not found'));

      await store.dispatch(fetchActionById(999));

      expect(store.getState().actions.error).toBe('Not found');
      expect(store.getState().actions.selectedAction).toBeNull();
    });

    it('sets fallback error on non-Error rejection', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(42);

      await store.dispatch(fetchActionById(1));

      expect(store.getState().actions.error).toBe('Failed to fetch action details');
    });
  });

  describe('fetchUserActions', () => {
    it('stores userActions on success', async () => {
      const store = createTestStore();
      mockedGet.mockResolvedValueOnce({data: [mockUserAction]});

      await store.dispatch(fetchUserActions(123));

      const state = store.getState().actions;
      expect(state.userActions).toEqual([mockUserAction]);
      expect(state.loading).toBe(false);
      expect(mockedGet).toHaveBeenCalledWith('/action/getUserActions?userId=123');
    });

    it('sets error on failure', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(new Error('Unauthorized'));

      await store.dispatch(fetchUserActions(123));

      expect(store.getState().actions.error).toBe('Unauthorized');
    });

    it('sets fallback error on non-Error rejection', async () => {
      const store = createTestStore();
      mockedGet.mockRejectedValueOnce(null);

      await store.dispatch(fetchUserActions(123));

      expect(store.getState().actions.error).toBe('Failed to fetch user actions');
    });
  });

  describe('startAction', () => {
    it('calls post and resolves without changing actions array', async () => {
      const store = createTestStore();
      mockedPost.mockResolvedValueOnce({data: {success: true}});

      await store.dispatch(startAction({userId: 123, actionId: 1}));

      const state = store.getState().actions;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockedPost).toHaveBeenCalledWith('/action/startAction?userId=123&actionId=1');
    });

    it('sets error on failure', async () => {
      const store = createTestStore();
      mockedPost.mockRejectedValueOnce(new Error('Server error'));

      await store.dispatch(startAction({userId: 123, actionId: 1}));

      expect(store.getState().actions.error).toBe('Server error');
    });

    it('sets fallback error on non-Error rejection', async () => {
      const store = createTestStore();
      mockedPost.mockRejectedValueOnce(undefined);

      await store.dispatch(startAction({userId: 123, actionId: 1}));

      expect(store.getState().actions.error).toBe('Failed to start action');
    });
  });

  describe('completeAction', () => {
    it('calls post and resolves without changing actions array', async () => {
      const store = createTestStore();
      mockedPost.mockResolvedValueOnce({data: {success: true}});

      await store.dispatch(completeAction({userId: 123, actionId: 1}));

      const state = store.getState().actions;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockedPost).toHaveBeenCalledWith('/action/completeAction?userId=123&actionId=1');
    });

    it('sets error on failure', async () => {
      const store = createTestStore();
      mockedPost.mockRejectedValueOnce(new Error('Timeout'));

      await store.dispatch(completeAction({userId: 123, actionId: 1}));

      expect(store.getState().actions.error).toBe('Timeout');
    });

    it('sets fallback error on non-Error rejection', async () => {
      const store = createTestStore();
      mockedPost.mockRejectedValueOnce({code: 500});

      await store.dispatch(completeAction({userId: 123, actionId: 1}));

      expect(store.getState().actions.error).toBe('Failed to complete action');
    });
  });

  describe('loading state transitions', () => {
    it('sets loading true during pending and false after fulfilled', async () => {
      const store = createTestStore();
      const loadingStates: boolean[] = [];

      store.subscribe(() => {
        loadingStates.push(store.getState().actions.loading);
      });

      mockedGet.mockResolvedValueOnce({data: mockActions});
      await store.dispatch(fetchActions({}));

      expect(loadingStates).toContain(true);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });

    it('clears previous error when a new request starts', async () => {
      const store = createTestStore();

      // First request fails
      mockedGet.mockRejectedValueOnce(new Error('fail'));
      await store.dispatch(fetchActions({}));
      expect(store.getState().actions.error).toBe('fail');

      // Second request starts — error should be cleared during pending
      mockedGet.mockResolvedValueOnce({data: []});
      await store.dispatch(fetchActions({}));
      expect(store.getState().actions.error).toBeNull();
    });
  });
});
