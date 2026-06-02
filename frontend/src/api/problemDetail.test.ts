import {describe, it, expect, vi} from 'vitest';
import {
  getProblemDetail,
  getErrorMessage,
  getProblemStatus,
  getFieldErrors,
  applyFieldErrors,
  type ProblemDetail,
} from './problemDetail';

function axiosError(data: unknown) {
  return {response: {data}};
}

const problem: ProblemDetail = {
  type: 'https://zurimpact.ch/problems/not-found',
  title: 'Not Found',
  status: 404,
  detail: 'Voucher not found',
  instance: '/api/vouchers/99/redeem',
};

describe('getProblemDetail', () => {
  it('extracts a problem+json body', () => {
    expect(getProblemDetail(axiosError(problem))).toEqual(problem);
  });

  it('returns null for a non-problem body', () => {
    expect(getProblemDetail(axiosError({message: 'legacy'}))).toBeNull();
    expect(getProblemDetail(axiosError('a string body'))).toBeNull();
  });

  it('returns null for a network error (no response)', () => {
    expect(getProblemDetail(new Error('Network Error'))).toBeNull();
  });
});

describe('getErrorMessage', () => {
  it('prefers the problem detail', () => {
    expect(getErrorMessage(axiosError(problem), 'fallback')).toBe('Voucher not found');
  });

  it('falls back to a native Error message (network/timeout)', () => {
    expect(getErrorMessage(new Error('timeout of 10000ms exceeded'), 'fallback')).toBe('timeout of 10000ms exceeded');
  });

  it('uses the fallback when there is no detail and no Error message', () => {
    expect(getErrorMessage(axiosError({title: 'X', status: 500}), 'fallback')).toBe('fallback');
    expect(getErrorMessage({}, 'fallback')).toBe('fallback');
  });
});

describe('getProblemStatus', () => {
  it('returns the status of a problem response', () => {
    expect(getProblemStatus(axiosError(problem))).toBe(404);
  });

  it('is undefined for non-problem errors', () => {
    expect(getProblemStatus(new Error('x'))).toBeUndefined();
  });
});

describe('getFieldErrors / applyFieldErrors', () => {
  const validation = axiosError({
    type: 'https://zurimpact.ch/problems/validation-error',
    title: 'Validation failed',
    status: 400,
    errors: [
      {field: 'username', message: 'must not be blank'},
      {field: 'email', message: 'must be a valid email'},
    ],
  });

  it('returns the field errors array', () => {
    expect(getFieldErrors(validation)).toHaveLength(2);
    expect(getFieldErrors(axiosError(problem))).toEqual([]);
  });

  it('applies each field error via setError and reports whether any applied', () => {
    const setError = vi.fn();
    expect(applyFieldErrors(validation, setError)).toBe(true);
    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenCalledWith('username', {type: 'server', message: 'must not be blank'});
  });

  it('returns false when there are no field errors', () => {
    const setError = vi.fn();
    expect(applyFieldErrors(axiosError(problem), setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
