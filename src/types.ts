export interface DictMeaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
}

export interface DictEntry {
  word: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings: DictMeaning[];
}

export interface SavedWord {
  word: string;
  meaning: string; // 英語の意味（要約）
  japanese?: string; // 日本語訳（旧データ互換のため任意）
  german: string;
  phonetic?: string;
  addedAt: number;
}

export interface WordBook {
  id: string;
  name: string;
  words: SavedWord[];
  createdAt: number;
}

export const WORDS_PER_BOOK = 20;
export const MAX_FREE_BOOKS = 3; // 無課金で作成できる単語帳の上限
export const STORAGE_KEY = 'wordplusone-data';
export const PREMIUM_STORAGE_KEY = 'wordplusone-premium';
