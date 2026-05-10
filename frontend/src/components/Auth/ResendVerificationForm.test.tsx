import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router';
import {renderWithProviders} from '../../test/test.utils';
import {ResendVerificationForm} from './ResendVerificationForm';

vi.mock('../../api/authApi', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({data: {}}),
    post: vi.fn().mockResolvedValue({data: {}}),
  },
}));

vi.mock('../../utility/i18n', () => ({
  __esModule: true,
  default: {changeLanguage: vi.fn(), language: 'en'},
}));

import * as authApi from '../../api/authApi';

function renderResendForm(defaultEmail?: string) {
  return renderWithProviders(
    <MemoryRouter>
      <ResendVerificationForm defaultEmail={defaultEmail} />
    </MemoryRouter>,
  );
}

describe('ResendVerificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders email field and submit button', () => {
      renderResendForm();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /resend/i})).toBeInTheDocument();
    });

    it('pre-fills email when defaultEmail prop is provided', () => {
      renderResendForm('prefilled@example.com');
      expect(screen.getByLabelText(/email/i)).toHaveValue('prefilled@example.com');
    });
  });

  describe('client-side validation', () => {
    it('shows error and blocks submit when email is empty', async () => {
      const user = userEvent.setup();
      renderResendForm();

      await user.click(screen.getByRole('button', {name: /resend/i}));

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
      expect(vi.mocked(authApi.resendVerification)).not.toHaveBeenCalled();
    });

    // Note: client-side "invalid email" rendering is not tested here because
    // jsdom enforces HTML5 email validation on `type="email"` inputs and blocks
    // userEvent.type from entering invalid strings. Zod email validation itself
    // is covered by lib/validation/authSchemas.test.ts.
  });

  describe('form submission', () => {
    it('dispatches resendVerification with {email} on valid submit', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.resendVerification).mockResolvedValueOnce(undefined);

      renderResendForm();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', {name: /resend/i}));

      await waitFor(() => {
        expect(vi.mocked(authApi.resendVerification)).toHaveBeenCalledWith({email: 'test@example.com'});
      });
    });

    it('disables submit button while pending', async () => {
      const user = userEvent.setup();
      let resolveResend!: (value: undefined) => void;
      vi.mocked(authApi.resendVerification).mockReturnValueOnce(new Promise<undefined>((res) => { resolveResend = res; }));

      renderResendForm();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', {name: /resend/i}));

      await waitFor(() => {
        expect(screen.getByRole('button', {name: /sending/i})).toBeDisabled();
      });

      resolveResend(undefined);
    });

    it('hides form and shows generic success message after fulfilled', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.resendVerification).mockResolvedValueOnce(undefined);

      renderResendForm();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', {name: /resend/i}));

      await waitFor(() => {
        expect(screen.getByText(/if an account with that address exists/i)).toBeInTheDocument();
      });
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });

    it('shows generic error but keeps form visible on rejected (network error)', async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.resendVerification).mockRejectedValueOnce(new Error('Network Error'));

      renderResendForm();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', {name: /resend/i}));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/couldn't reach the server/i)).toBeInTheDocument();
      // Form should still be visible
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });
});
