import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  points: number;
  createdAt?: string;
}

interface UserState {
  currentUser: UserDto | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk('user/fetchCurrentUser', async (_, {rejectWithValue}) => {
  try {
    await apiClient.get('/auth/whoami');
    // TODOD implement actual user fetching
    const result = {name: 'Test User', email: 'test@example.com', points: 100, id: 123} as UserDto;
    return result as UserDto;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {status?: number; data?: {error?: string}};
      };
      if (axiosError.response?.status === 401) {
        return rejectWithValue('not_authenticated');
      }
      return rejectWithValue(axiosError.response?.data?.error ?? 'Failed to fetch user');
    }
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch user');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const {logout, clearUserError} = userSlice.actions;
export default userSlice.reducer;
