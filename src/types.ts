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
  /** 英語＋1言語の訳。選んだ言語のコード（ja, de 等） */
  translation?: string;
  translationLang?: string;
  /** 旧データ互換 */
  japanese?: string;
  german?: string;
  phonetic?: string;
  addedAt: number;
}

/** 英語と一緒に学べる言語の一覧 */
export const SECOND_LANGUAGES = [
  { code: 'ja', name: '日本語' },
  { code: 'de', name: 'ドイツ語' },
  { code: 'fr', name: 'フランス語' },
  { code: 'es', name: 'スペイン語' },
  { code: 'zh', name: '中国語' },
  { code: 'ko', name: '韓国語' },
  { code: 'it', name: 'イタリア語' },
  { code: 'pt', name: 'ポルトガル語' },
  { code: 'ru', name: 'ロシア語' },
  { code: 'ar', name: 'アラビア語' },
] as const;

export type SecondLangCode = (typeof SECOND_LANGUAGES)[number]['code'];
export const SECOND_LANG_STORAGE_KEY = 'wordplusone-second-lang';

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
