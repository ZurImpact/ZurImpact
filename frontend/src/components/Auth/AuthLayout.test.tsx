import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {AuthLayout} from './AuthLayout';
import {resolveT} from '../../test/setup';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe('AuthLayout', () => {
  it('navigates to the root route when the header link is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/" element={<LocationDisplay />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', {name: resolveT('auth.layout.logoAlt')}));

    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });
});
