import '@testing-library/jest-dom/vitest';

import {vi} from 'vitest';

export const mockI18nChangeLanguage = vi.fn();
export const mockToastSuccess = vi.fn();
export const mockToastError = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
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
