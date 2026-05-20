import '@testing-library/jest-dom/vitest';

import {Fragment, createElement} from 'react';
import {vi} from 'vitest';
import enCommon from '../../public/locales/en/common.json';

export const mockI18nChangeLanguage = vi.fn();
export const mockToastSuccess = vi.fn();
export const mockToastError = vi.fn();

/**
 * Resolves a dot-separated i18n key against the EN common.json so that
 * existing test assertions using English strings keep working after components
 * are converted to use t('auth.login.title') etc.
 *
 * Falls back to returning the key itself when no translation is found (safe
 * for keys not yet in the JSON, and consistent with the previous behaviour).
 *
 * Exported as `resolveT` so tests can assert against the translation of a key
 * (e.g. `expect(toast).toHaveBeenCalledWith(resolveT('action.completed'))`)
 * instead of hardcoding the English copy.
 */
export function resolveT(key: string, options?: Record<string, unknown>): string {
  return resolveKey(key, options);
}

function resolveKey(key: string, options?: Record<string, unknown>): string {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = enCommon;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') {
      return key;
    }
    node = node[part];
  }
  if (typeof node !== 'string') {
    return key;
  }
  // Handle simple {{variable}} interpolation (i18next syntax)
  if (options) {
    return node.replace(/\{\{(\w+)\}\}/g, (_match: string, varName: string) =>
      String(options[varName] ?? `{{${varName}}}`),
    );
  }
  return node;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => resolveKey(key, options),
    i18n: {changeLanguage: mockI18nChangeLanguage, language: 'en'},
  }),
  initReactI18next: {type: '3rdParty'},
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  ThemeProvider: ({children}: {children: React.ReactNode}) => createElement(Fragment, null, children),
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    systemTheme: 'light',
    setTheme: mockSetTheme,
  }),
}));

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

const _ls: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (k: string) => _ls[k] ?? null,
  setItem: (k: string, v: string) => {
    _ls[k] = v;
  },
  removeItem: (k: string) => {
    delete _ls[k];
  },
  clear: () => {
    for (const k in _ls) delete _ls[k];
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
