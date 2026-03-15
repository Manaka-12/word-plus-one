import type { WordBook } from './types';
import { STORAGE_KEY, PREMIUM_STORAGE_KEY } from './types';

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
