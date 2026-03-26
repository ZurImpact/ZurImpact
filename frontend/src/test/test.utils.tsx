import {render, type RenderOptions} from '@testing-library/react';
import {Provider} from 'react-redux';
import {setupStore, type DeepPartial, type RootState} from '../store/store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: DeepPartial<RootState>;
  store?: ReturnType<typeof setupStore>;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {preloadedState = {}, store = setupStore(preloadedState), ...renderOptions}: ExtendedRenderOptions = {},
) => {
  function Wrapper({children}: {children: React.ReactNode}) {
    return <Provider store={store}>{children}</Provider>;
  }
  return {store, ...render(ui, {wrapper: Wrapper, ...renderOptions})};
};
