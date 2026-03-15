import type { WordBook } from './types';
import type { SecondLangCode } from './types';
import { STORAGE_KEY, PREMIUM_STORAGE_KEY, SECOND_LANG_STORAGE_KEY, SECOND_LANGUAGES } from './types';

const VALID_CODES = new Set(SECOND_LANGUAGES.map((x) => x.code));

export function loadWordBooks(): WordBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as WordBook[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveWordBooks(books: WordBook[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function loadPremium(): boolean {
  try {
    return localStorage.getItem(PREMIUM_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function savePremium(premium: boolean): void {
  localStorage.setItem(PREMIUM_STORAGE_KEY, premium ? 'true' : 'false');
}

export function loadSecondLanguage(): SecondLangCode {
  try {
    const code = localStorage.getItem(SECOND_LANG_STORAGE_KEY);
    if (code && VALID_CODES.has(code as SecondLangCode)) return code as SecondLangCode;
  } catch {
    // ignore
  }
  return 'de';
}

export function saveSecondLanguage(code: SecondLangCode): void {
  localStorage.setItem(SECOND_LANG_STORAGE_KEY, code);
}
