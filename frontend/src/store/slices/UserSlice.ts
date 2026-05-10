import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import {logoutUser} from './AuthSlice';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
  points: number;
  address: number | null;
  createdAt: string | null;
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
    const whoamiResponse = await apiClient.get('/auth/whoami');
    const userId: number = whoamiResponse.data.id;
    const userResponse = await apiClient.get(`/users/${userId}`);
    return userResponse.data as UserDto;
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
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const {logout, clearUserError} = userSlice.actions;
export default userSlice.reducer;
