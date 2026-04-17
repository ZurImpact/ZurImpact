import {combineReducers, configureStore} from '@reduxjs/toolkit';
import type {TypedUseSelectorHook} from 'react-redux';
import {useDispatch, useSelector} from 'react-redux';
import actionReducer from './slices/ActionSlice';
import rewardReducer from './slices/RewardSlice';
import userReducer from './slices/UserSlice';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

const rootReducer = combineReducers({
  actions: actionReducer,
  rewards: rewardReducer,
  user: userReducer,
});

export const setupStore = (preloadedState?: DeepPartial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState,
  });

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Export pre-typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
