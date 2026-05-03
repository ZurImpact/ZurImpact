import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import type {DistanceThresholdLevel} from '../../utils/distanceThreshold';
export type {DistanceThresholdLevel};

export interface ActionDto {
  id: number;
  description?: string;
  displayName: string;
  points?: number;
  tags?: Tag[];
  subTasks?: SubActionDto[];
  type?: ActionType;
  hasSubtasks?: boolean;
  validUntil?: string;
  createdOn?: string;
}

type Tag = 'FOOD' | 'SOCIAL';

export interface SubActionDto {
  id: number;
  description?: string;
  displayName: string;
  actionId: number;
  latitude?: number;
  longitude?: number;
  type?: ActionType;
  distanceThresholdLevel?: DistanceThresholdLevel;
}

export type ActionType = 'GPS' | 'PHOTO' | 'TICKET';

export interface UserActionHistoryDto {
  actionId: number;
  description?: string;
  displayName: string;
  points?: number;
  tags?: string;
  validUntil?: string;
  actionCreatedOn?: string;
  completionState?: string;
  isSubtask?: boolean;
  subtaskId?: string;
  subactionId?: string;
  mappingCreatedOn?: string;
}

interface ActionState {
  actions: ActionDto[];
  selectedAction: ActionDto | null;
  userActions: UserActionHistoryDto[];
  loading: boolean;
  error: string | null;
}

const initialState: ActionState = {
  actions: [],
  selectedAction: null,
  userActions: [],
  loading: false,
  error: null,
};

export const fetchActions = createAsyncThunk(
  'action/fetchActions',
  async (
    filters: {
      text?: string;
      points?: number;
      tags?: string;
      validUntil?: string;
    },
    {rejectWithValue},
  ) => {
    try {
      const params = new URLSearchParams();
      if (filters?.text) params.append('text', filters.text);
      if (filters?.points) params.append('points', filters.points.toString());
      if (filters?.tags) params.append('tags', filters.tags);
      if (filters?.validUntil) params.append('validUntil', filters.validUntil);

      const response = await apiClient.get(`/actions`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch actions');
    }
  },
);

// Async thunk for fetching a single action by ID
export const fetchActionById = createAsyncThunk(
  'action/fetchActionById',
  async (actionId: number, {rejectWithValue}) => {
    try {
      const response = await apiClient.get(`/actions/${actionId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch action details');
    }
  },
);

// Async thunk for fetching user's action history
type FetchUserActionsParams = {
  userId: number;
  active?: boolean;
};

export const fetchUserActions = createAsyncThunk(
  'action/fetchUserActions',
  async (params: FetchUserActionsParams, {rejectWithValue}) => {
    try {
      const searchParams = new URLSearchParams({userId: String(params.userId)});

      if (params.active !== undefined) {
        searchParams.append('active', String(params.active));
      }

      const response = await apiClient.get(`/userActionHistory/getUserActions?${searchParams.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch user actions');
    }
  },
);

// Async thunk for starting an action
export const startAction = createAsyncThunk(
  'action/startAction',
  async ({userId, actionId}: {userId: number; actionId: number}, {rejectWithValue}) => {
    try {
      const response = await apiClient.post('/actions/startAction', null, {
        params: {userId, actionId},
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to start action');
    }
  },
);

// Async thunk for completing an action
export const completeAction = createAsyncThunk(
  'action/completeAction',
  async ({userId, actionId}: {userId: number; actionId: number}, {rejectWithValue}) => {
    try {
      const response = await apiClient.post(`/actions/completeAction`, {userId, actionId});
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to complete action');
    }
  },
);

// Async thunk for completing a subtask
export const completeSubTask = createAsyncThunk(
  'action/completeSubTask',
  async (request: {userId: number; actionId: number; subTaskId: number; actionType: string}, {rejectWithValue}) => {
    try {
      const response = await apiClient.post('/subTasks/completeSubTask', request);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to complete subtask');
    }
  },
);

const actionSlice = createSlice({
  name: 'action',
  initialState,
  reducers: {
    clearSelectedAction: (state) => {
      state.selectedAction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchActions cases
    builder
      .addCase(fetchActions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActions.fulfilled, (state, action) => {
        state.loading = false;
        state.actions = action.payload;
      })
      .addCase(fetchActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchActionById cases
    builder
      .addCase(fetchActionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAction = action.payload;
      })
      .addCase(fetchActionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchUserActions cases
    builder
      .addCase(fetchUserActions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActions.fulfilled, (state, action) => {
        state.loading = false;
        state.userActions = action.payload;
      })
      .addCase(fetchUserActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // startAction cases
    builder
      .addCase(startAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(startAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // completeAction cases
    builder
      .addCase(completeAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(completeAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // completeSubtask cases
    builder
      .addCase(completeSubTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeSubTask.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(completeSubTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {clearSelectedAction, clearError} = actionSlice.actions;
export default actionSlice.reducer;
