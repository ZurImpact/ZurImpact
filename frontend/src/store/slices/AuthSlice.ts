import {createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';
import * as userApi from '../../api/userApi';

type OpStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

interface AuthOpState {
  status: OpStatus;
  error: string | null;
}

export interface AuthState {
  login: AuthOpState;
  register: AuthOpState;
  logout: AuthOpState;
  verifyEmail: AuthOpState;
  resendVerification: AuthOpState;
  requestPasswordReset: AuthOpState;
  confirmPasswordReset: AuthOpState;
  changePassword: AuthOpState;
}

const makeIdleOp = (): AuthOpState => ({status: 'idle', error: null});

const initialState: AuthState = {
  login: makeIdleOp(),
  register: makeIdleOp(),
  logout: makeIdleOp(),
  verifyEmail: makeIdleOp(),
  resendVerification: makeIdleOp(),
  requestPasswordReset: makeIdleOp(),
  confirmPasswordReset: makeIdleOp(),
  changePassword: makeIdleOp(),
};

function extractErrorCode(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {response?: {status?: number; data?: {message?: string}}};
    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.message;
    if (status === 401) return 'invalid_credentials';
    if (status === 403 && message === 'email_not_verified') return 'email_not_verified';
    if (status === 400 && message === 'wrong_current_password') return 'wrong_current_password';
  }
  return fallback;
}

export const loginUser = createAsyncThunk('auth/login', async (req: authApi.LoginRequest, {rejectWithValue}) => {
  try {
    return await authApi.login(req);
  } catch (error: unknown) {
    return rejectWithValue(extractErrorCode(error, 'login_failed'));
  }
});

export const registerUser = createAsyncThunk(
  'auth/register',
  async (req: authApi.RegisterRequest, {rejectWithValue}) => {
    try {
      return await authApi.register(req);
    } catch (error: unknown) {
      return rejectWithValue(extractErrorCode(error, 'register_failed'));
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, {rejectWithValue}) => {
  try {
    return await authApi.logout();
  } catch (error: unknown) {
    return rejectWithValue(extractErrorCode(error, 'logout_failed'));
  }
});

export const verifyEmailToken = createAsyncThunk(
  'auth/verifyEmail',
  async (req: {token: string}, {rejectWithValue}) => {
    try {
      return await authApi.verifyEmail(req);
    } catch (error: unknown) {
      return rejectWithValue(extractErrorCode(error, 'verify_email_failed'));
    }
  },
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (req: {email: string}, {rejectWithValue}) => {
    try {
      return await authApi.resendVerification(req);
    } catch (error: unknown) {
      return rejectWithValue(extractErrorCode(error, 'resend_verification_failed'));
    }
  },
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (req: {email: string}, {rejectWithValue}) => {
    try {
      return await authApi.requestPasswordReset(req);
    } catch (error: unknown) {
      return rejectWithValue(extractErrorCode(error, 'request_password_reset_failed'));
    }
  },
);

export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async (req: {token: string; newPassword: string}, {rejectWithValue}) => {
    try {
      return await authApi.confirmPasswordReset(req);
    } catch (error: unknown) {
      return rejectWithValue(extractErrorCode(error, 'confirm_password_reset_failed'));
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (req: {currentPassword: string; newPassword: string}, {rejectWithValue}) => {
    try {
      return await userApi.changePassword(req);
    } catch (error: unknown) {
      return rejectWithValue(extractErrorCode(error, 'change_password_failed'));
    }
  },
);

function setPending(op: AuthOpState) {
  op.status = 'pending';
  op.error = null;
}

function setFulfilled(op: AuthOpState) {
  op.status = 'fulfilled';
  op.error = null;
}

function setRejected(op: AuthOpState, error: string | null) {
  op.status = 'rejected';
  op.error = error;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthOp: (state, action: PayloadAction<keyof AuthState>) => {
      state[action.payload] = makeIdleOp();
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => setPending(state.login))
      .addCase(loginUser.fulfilled, (state) => setFulfilled(state.login))
      .addCase(loginUser.rejected, (state, action) => setRejected(state.login, action.payload as string));

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => setPending(state.register))
      .addCase(registerUser.fulfilled, (state) => setFulfilled(state.register))
      .addCase(registerUser.rejected, (state, action) => setRejected(state.register, action.payload as string));

    // logoutUser
    builder
      .addCase(logoutUser.pending, (state) => setPending(state.logout))
      .addCase(logoutUser.fulfilled, (state) => setFulfilled(state.logout))
      .addCase(logoutUser.rejected, (state, action) => setRejected(state.logout, action.payload as string));

    // verifyEmailToken
    builder
      .addCase(verifyEmailToken.pending, (state) => setPending(state.verifyEmail))
      .addCase(verifyEmailToken.fulfilled, (state) => setFulfilled(state.verifyEmail))
      .addCase(verifyEmailToken.rejected, (state, action) => setRejected(state.verifyEmail, action.payload as string));

    // resendVerification
    builder
      .addCase(resendVerification.pending, (state) => setPending(state.resendVerification))
      .addCase(resendVerification.fulfilled, (state) => setFulfilled(state.resendVerification))
      .addCase(resendVerification.rejected, (state, action) =>
        setRejected(state.resendVerification, action.payload as string),
      );

    // requestPasswordReset
    builder
      .addCase(requestPasswordReset.pending, (state) => setPending(state.requestPasswordReset))
      .addCase(requestPasswordReset.fulfilled, (state) => setFulfilled(state.requestPasswordReset))
      .addCase(requestPasswordReset.rejected, (state, action) =>
        setRejected(state.requestPasswordReset, action.payload as string),
      );

    // confirmPasswordReset
    builder
      .addCase(confirmPasswordReset.pending, (state) => setPending(state.confirmPasswordReset))
      .addCase(confirmPasswordReset.fulfilled, (state) => setFulfilled(state.confirmPasswordReset))
      .addCase(confirmPasswordReset.rejected, (state, action) =>
        setRejected(state.confirmPasswordReset, action.payload as string),
      );

    // changePassword
    builder
      .addCase(changePassword.pending, (state) => setPending(state.changePassword))
      .addCase(changePassword.fulfilled, (state) => setFulfilled(state.changePassword))
      .addCase(changePassword.rejected, (state, action) => setRejected(state.changePassword, action.payload as string));
  },
});

export const {resetAuthOp} = authSlice.actions;
export default authSlice.reducer;
