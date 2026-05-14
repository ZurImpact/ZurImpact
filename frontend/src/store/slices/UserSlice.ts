import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  points: number;
  createdAt?: string;
}

type UserRole = 'ADMIN' | 'PARTNER' | 'ROLE_ADMIN' | 'ROLE_PARTNER' | 'ROLE_USER';

type FetchCurrentUserResult = {
  user: UserDto;
  roles: UserRole[];
};

interface UserState {
  currentUser: UserDto | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  roles: [],
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk('user/fetchCurrentUser', async (_, {rejectWithValue}) => {
  try {
    const whoamiResponse = await apiClient.get('/auth/whoami');
    const userId: number = whoamiResponse.data.id;
    const roles = Array.isArray(whoamiResponse.data.roles) ? (whoamiResponse.data.roles as UserRole[]) : [];
    const userResponse = await apiClient.get(`/users/${userId}`);
    return {
      user: userResponse.data as UserDto,
      roles,
    } satisfies FetchCurrentUserResult;
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
      state.roles = [];
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
        state.currentUser = action.payload.user;
        state.roles = action.payload.roles;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.roles = [];
      });
  },
});

export const {logout, clearUserError} = userSlice.actions;
export default userSlice.reducer;
