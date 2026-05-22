import {createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import type {DistanceThresholdLevel} from '../../utils/distanceThreshold';
import {fetchCurrentUser} from './UserSlice';
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
  completedSubtaskIds?: number[];
  mappingCreatedOn?: string;
}

interface ActionState {
  actions: ActionDto[];
  selectedAction: ActionDto | null;
  userActions: UserActionHistoryDto[];
  gpsActionDetail: GpsActionDetailState;
  loading: boolean;
  error: string | null;
}

interface GpsActionDetailState {
  activeUserHistoryAction: UserActionHistoryDto | null;
  completedSubtaskIds: number[];
  hasStartedAction: boolean;
  loading: boolean;
  startLoading: boolean;
  checkpointLoading: boolean;
  completionLoading: boolean;
  error: string | null;
}

type LoadGpsActionDetailResult = {
  activeUserHistoryAction: UserActionHistoryDto | null;
  completedSubtaskIds: number[];
  userActions?: UserActionHistoryDto[];
};

const initialGpsActionDetailState: GpsActionDetailState = {
  activeUserHistoryAction: null,
  completedSubtaskIds: [],
  hasStartedAction: false,
  loading: false,
  startLoading: false,
  checkpointLoading: false,
  completionLoading: false,
  error: null,
};

const initialState: ActionState = {
  actions: [],
  selectedAction: null,
  userActions: [],
  gpsActionDetail: initialGpsActionDetailState,
  loading: false,
  error: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {response?: {data?: {error?: string}}};
    return axiosError.response?.data?.error ?? fallback;
  }

  return fallback;
}

function mergeUserActions(...actionGroups: UserActionHistoryDto[][]): UserActionHistoryDto[] {
  const seen = new Set<string>();
  const mergedActions: UserActionHistoryDto[] = [];

  actionGroups.flat().forEach((userAction) => {
    const key = [
      userAction.actionId,
      userAction.completionState ?? '',
      userAction.isSubtask ? 'subtask' : 'action',
      userAction.subtaskId ?? '',
      userAction.subactionId ?? '',
      userAction.mappingCreatedOn ?? '',
    ].join('|');

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    mergedActions.push(userAction);
  });

  return mergedActions;
}

function deriveGpsActionHistory(actionId: number, userActions: UserActionHistoryDto[]) {
  const matchingActionEntries = userActions.filter((userAction) => userAction.actionId === actionId);
  const activeUserHistoryAction =
    matchingActionEntries.find((userAction) => !userAction.isSubtask && userAction.completionState !== 'COMPLETED') ??
    matchingActionEntries.find((userAction) => !userAction.isSubtask) ??
    null;

  const completedSubtaskIds =
    activeUserHistoryAction && Array.isArray(activeUserHistoryAction.completedSubtaskIds)
      ? activeUserHistoryAction.completedSubtaskIds.filter((subtaskId): subtaskId is number =>
          Number.isInteger(subtaskId),
        )
      : matchingActionEntries
          .filter((userAction) => userAction.isSubtask)
          .map((userAction) => Number(userAction.subtaskId ?? userAction.subactionId))
          .filter((subtaskId) => Number.isInteger(subtaskId) && subtaskId > 0);

  return {
    activeUserHistoryAction,
    completedSubtaskIds,
  };
}

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
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch action details'));
    }
  },
);

// Async thunk for fetching the authenticated user's action history.
// Backed by GET /users/me/actions — see backend UserController#getMyActions.
type FetchMyActionsParams = {
  active?: boolean;
};

export const fetchMyActions = createAsyncThunk(
  'action/fetchMyActions',
  async (params: FetchMyActionsParams, {rejectWithValue}) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.active !== undefined) {
        searchParams.append('active', String(params.active));
      }
      const query = searchParams.toString();
      const url = `/users/me/actions${query ? `?${query}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch user actions'));
    }
  },
);

export const loadGpsActionDetail = createAsyncThunk<
  LoadGpsActionDetailResult,
  {actionId: number; userId?: number},
  {rejectValue: string}
>('action/loadGpsActionDetail', async ({actionId, userId}, {dispatch, rejectWithValue}) => {
  try {
    const actionRequest = dispatch(fetchActionById(actionId)).unwrap();
    const activeHistoryRequest = userId
      ? dispatch(fetchMyActions({active: true})).unwrap()
      : Promise.resolve([] as UserActionHistoryDto[]);
    const fullHistoryRequest = userId
      ? dispatch(fetchMyActions({})).unwrap()
      : Promise.resolve([] as UserActionHistoryDto[]);
    const [, activeHistory, fullHistory] = await Promise.all([actionRequest, activeHistoryRequest, fullHistoryRequest]);
    const userActions = userId ? mergeUserActions(activeHistory, fullHistory) : [];

    const {activeUserHistoryAction, completedSubtaskIds} = deriveGpsActionHistory(actionId, userActions);

    return {
      activeUserHistoryAction,
      completedSubtaskIds,
      userActions: userId ? userActions : undefined,
    };
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error, 'Failed to load GPS action details'));
  }
});

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
      return rejectWithValue(getErrorMessage(error, 'Failed to start action'));
    }
  },
);

export const startGpsAction = createAsyncThunk(
  'action/startGpsAction',
  async ({userId, actionId}: {userId: number; actionId: number}, {dispatch, rejectWithValue}) => {
    try {
      await dispatch(startAction({userId, actionId})).unwrap();
      return {userId, actionId};
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to start action'));
    }
  },
);

// Async thunk for completing an action
export const completeAction = createAsyncThunk(
  'action/completeAction',
  async ({userId, actionId}: {userId: number; actionId: number}, {rejectWithValue}) => {
    try {
      const response = await apiClient.post('/actions/completeAction', null, {
        params: {userId, actionId},
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to complete action'));
    }
  },
);

export const finishGpsAction = createAsyncThunk(
  'action/finishGpsAction',
  async ({userId, actionId}: {userId: number; actionId: number}, {dispatch, rejectWithValue}) => {
    try {
      await dispatch(completeAction({userId, actionId})).unwrap();
      await dispatch(fetchCurrentUser()).unwrap();
      return {userId, actionId};
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to complete action'));
    }
  },
);

// Async thunk for completing a subtask
export const completeSubTask = createAsyncThunk(
  'action/completeSubTask',
  async (
    request: {
      userId: number;
      actionId: number;
      subTaskId: number;
      actionType: string;
      additionalData?: Record<string, unknown>;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await apiClient.post('/subTasks/completeSubTask', request);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to complete subtask'));
    }
  },
);

export const completeGpsCheckpoint = createAsyncThunk(
  'action/completeGpsCheckpoint',
  async (
    request: {
      userId: number;
      actionId: number;
      subTaskId: number;
      actionType: string;
      additionalData?: Record<string, unknown>;
    },
    {dispatch, rejectWithValue},
  ) => {
    try {
      await dispatch(completeSubTask(request)).unwrap();
      return {subTaskId: request.subTaskId};
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to complete subtask'));
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
      state.gpsActionDetail.error = null;
    },
    clearGpsActionDetail: (state) => {
      state.gpsActionDetail = {...initialGpsActionDetailState};
    },
    markGpsCheckpointCheckedIn: (state, action: PayloadAction<number>) => {
      if (!state.gpsActionDetail.completedSubtaskIds.includes(action.payload)) {
        state.gpsActionDetail.completedSubtaskIds.push(action.payload);
      }
      state.gpsActionDetail.hasStartedAction = true;
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

    // fetchMyActions cases
    builder
      .addCase(fetchMyActions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyActions.fulfilled, (state, action) => {
        state.loading = false;
        state.userActions = action.payload;
      })
      .addCase(fetchMyActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(loadGpsActionDetail.pending, (state) => {
        state.gpsActionDetail.loading = true;
        state.gpsActionDetail.error = null;
      })
      .addCase(loadGpsActionDetail.fulfilled, (state, action) => {
        state.gpsActionDetail.loading = false;
        state.gpsActionDetail.error = null;
        state.gpsActionDetail.activeUserHistoryAction =
          action.payload.activeUserHistoryAction ?? state.gpsActionDetail.activeUserHistoryAction;
        state.gpsActionDetail.hasStartedAction =
          state.gpsActionDetail.hasStartedAction || Boolean(action.payload.activeUserHistoryAction);

        const mergedSubtaskIds = new Set<number>(state.gpsActionDetail.completedSubtaskIds);
        action.payload.completedSubtaskIds.forEach((subtaskId) => mergedSubtaskIds.add(subtaskId));
        state.gpsActionDetail.completedSubtaskIds = [...mergedSubtaskIds];

        if (action.payload.userActions) {
          state.userActions = action.payload.userActions;
        }
      })
      .addCase(loadGpsActionDetail.rejected, (state, action) => {
        state.gpsActionDetail.loading = false;
        state.gpsActionDetail.error = action.payload as string;
      });

    builder
      .addCase(startGpsAction.pending, (state) => {
        state.gpsActionDetail.startLoading = true;
        state.gpsActionDetail.error = null;
      })
      .addCase(startGpsAction.fulfilled, (state) => {
        state.gpsActionDetail.startLoading = false;
        state.gpsActionDetail.hasStartedAction = true;
      })
      .addCase(startGpsAction.rejected, (state, action) => {
        state.gpsActionDetail.startLoading = false;
        state.gpsActionDetail.error = action.payload as string;
      });

    builder
      .addCase(completeGpsCheckpoint.pending, (state) => {
        state.gpsActionDetail.checkpointLoading = true;
        state.gpsActionDetail.error = null;
      })
      .addCase(completeGpsCheckpoint.fulfilled, (state, action) => {
        state.gpsActionDetail.checkpointLoading = false;
        if (!state.gpsActionDetail.completedSubtaskIds.includes(action.payload.subTaskId)) {
          state.gpsActionDetail.completedSubtaskIds.push(action.payload.subTaskId);
        }
        state.gpsActionDetail.hasStartedAction = true;
      })
      .addCase(completeGpsCheckpoint.rejected, (state, action) => {
        state.gpsActionDetail.checkpointLoading = false;
        state.gpsActionDetail.error = action.payload as string;
      });

    builder
      .addCase(finishGpsAction.pending, (state) => {
        state.gpsActionDetail.completionLoading = true;
        state.gpsActionDetail.error = null;
      })
      .addCase(finishGpsAction.fulfilled, (state) => {
        state.gpsActionDetail.completionLoading = false;
      })
      .addCase(finishGpsAction.rejected, (state, action) => {
        state.gpsActionDetail.completionLoading = false;
        state.gpsActionDetail.error = action.payload as string;
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
        state.loading = false;
      });
  },
});

export const {clearSelectedAction, clearError, clearGpsActionDetail, markGpsCheckpointCheckedIn} = actionSlice.actions;
export default actionSlice.reducer;
