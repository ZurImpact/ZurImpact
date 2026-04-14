import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  points: number;
  createdAt?: string;
}

interface UserState {
  user: UserDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchUser = createAsyncThunk('user/fetchUser', async (userId: number, {rejectWithValue}) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error: unknown) {
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
    clearUser: (state) => {
      state.user = null;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearUser, clearUserError} = userSlice.actions;
export default userSlice.reducer;
