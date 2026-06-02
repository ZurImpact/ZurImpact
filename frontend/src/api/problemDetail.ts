/**
 * RFC 9457 (Problem Details) consumption helpers.
 *
 * The backend returns errors as `application/problem+json` with the shape
 * `{ type, title, status, detail, instance, errors?, incidentId? }`. These
 * pure helpers extract a typed model from an unknown (axios) error and derive
 * user-facing text / field errors from it. No axios import — the error is
 * duck-typed so the helpers stay trivially unit-testable.
 */

export interface ProblemFieldError {
  field: string;
  message: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Validation extension member (400 validation-error). */
  errors?: ProblemFieldError[];
  /** Correlation id present on 5xx responses. */
  incidentId?: string;
  [key: string]: unknown;
}

/** react-hook-form's `setError` signature, narrowed to what we use. */
type SetFieldError = (field: string, error: {type?: string; message: string}) => void;

function isProblemDetail(data: unknown): data is ProblemDetail {
  return (
    !!data &&
    typeof data === 'object' &&
    typeof (data as Record<string, unknown>).status === 'number' &&
    typeof (data as Record<string, unknown>).title === 'string'
  );
}

/**
 * Extracts the Problem Detail body from an axios-style error, or null when the
 * error is not an HTTP response carrying a problem+json body (e.g. a network
 * failure or a non-conforming body).
 */
export function getProblemDetail(error: unknown): ProblemDetail | null {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as {response?: {data?: unknown}}).response?.data;
    if (isProblemDetail(data)) {
      return data;
    }
  }
  return null;
}

/**
 * User-facing message for an error. Prefers the backend `detail`; falls back to
 * the native Error message (network/timeout), then the provided fallback.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const problem = getProblemDetail(error);
  if (problem?.detail) {
    return problem.detail;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/** HTTP status from the problem body, or undefined when not a problem response. */
export function getProblemStatus(error: unknown): number | undefined {
  return getProblemDetail(error)?.status;
}

/**
 * HTTP status from the axios response itself (present even when the body is not
 * problem+json). Prefer this for status-based branching; use the problem body
 * for `detail` / `errors`.
 */
export function getHttpStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as {response?: {status?: number}}).response?.status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}

/** Field-level validation errors (empty when none / not a validation problem). */
export function getFieldErrors(error: unknown): ProblemFieldError[] {
  return getProblemDetail(error)?.errors ?? [];
}

/**
 * Applies any field-level validation errors onto a react-hook-form via
 * `setError`. Returns true when at least one field error was applied — callers
 * can use that to decide whether to also show a generic/toast message.
 */
export function applyFieldErrors(error: unknown, setError: SetFieldError): boolean {
  const fieldErrors = getFieldErrors(error);
  fieldErrors.forEach(({field, message}) => setError(field, {type: 'server', message}));
  return fieldErrors.length > 0;
}
