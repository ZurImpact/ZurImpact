import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

export interface RewardDto {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  icon: string;
  available: number;
}

interface RedemptionResult {
  success: boolean;
}

interface RewardState {
  rewards: RewardDto[];
  redemptionLoading: boolean;
  redemptionSuccess: boolean;
  redemptionError: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: RewardState = {
  rewards: [],
  redemptionLoading: false,
  redemptionSuccess: false,
  redemptionError: null,
  loading: false,
  error: null,
};

export const fetchRewards = createAsyncThunk('reward/fetchRewards', async (_, {rejectWithValue}) => {
  try {
    const response = await apiClient.get('/rewards');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch rewards');
  }
});

export const redeemVoucher = createAsyncThunk(
  'reward/redeemVoucher',
  async ({userId, voucherId}: {userId: number; voucherId: string}, {rejectWithValue}) => {
    try {
      const response = await apiClient.post(`/users/redemptions?userId=${userId}&voucherId=${voucherId}`);
      return response.data as RedemptionResult;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {data?: {error?: string}};
        };
        return rejectWithValue(axiosError.response?.data?.error ?? 'Failed to redeem voucher');
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to redeem voucher');
    }
  },
);

const rewardSlice = createSlice({
  name: 'reward',
  initialState,
  reducers: {
    resetRedemptionStatus: (state) => {
      state.redemptionSuccess = false;
      state.redemptionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(redeemVoucher.pending, (state) => {
        state.redemptionLoading = true;
        state.redemptionError = null;
        state.redemptionSuccess = false;
      })
      .addCase(redeemVoucher.fulfilled, (state) => {
        state.redemptionLoading = false;
        state.redemptionSuccess = true;
      })
      .addCase(redeemVoucher.rejected, (state, action) => {
        state.redemptionLoading = false;
        state.redemptionError = action.payload as string;
        state.redemptionSuccess = false;
      });
  },
});

export const {resetRedemptionStatus} = rewardSlice.actions;
export default rewardSlice.reducer;
