import {render, type RenderOptions} from '@testing-library/react';
import {Provider} from 'react-redux';
import {setupStore, type DeepPartial, type RootState} from '../store/store';
import {ThemeProvider} from 'next-themes';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: DeepPartial<RootState>;
  store?: ReturnType<typeof setupStore>;
}

export const preloadedStateForTests: DeepPartial<RootState> = {
  actions: {
    actions: [],
    loading: false,
    error: null,
  },
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(overrideDefaultState(preloadedState)),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) => {
  function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Provider store={store}>{children}</Provider>
      </ThemeProvider>
    );
  }
  return {store, ...render(ui, {wrapper: Wrapper, ...renderOptions})};
};

const mergeStates = (state1: DeepPartial<RootState>, state2: DeepPartial<RootState>): DeepPartial<RootState> => {
  for (const key of Object.keys(state2) as (keyof RootState)[]) {
    const value2 = state2[key];
    const value1 = state1[key];

    if (typeof value2 === 'object' && value2 !== null && typeof value1 === 'object' && value1 !== null) {
      if (Array.isArray(value2)) {
        state1[key] = value2;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        state1[key] = mergeStates(value1 as any, value2 as any) as any;
      }
    } else {
      state1[key] = value2;
    }
  }

  return state1;
};

const overrideDefaultState = (state: DeepPartial<RootState>): DeepPartial<RootState> => {
  return mergeStates(structuredClone(preloadedStateForTests), state);
};
