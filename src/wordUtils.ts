import type { SavedWord } from './types';
import { SECOND_LANGUAGES } from './types';

/** 単語の「英語＋1言語」の訳テキストと表示用ラベルを返す（旧データ互換あり） */
export function getWordTranslation(w: SavedWord): { text: string; label: string } {
  if (w.translation != null && w.translationLang) {
    const lang = SECOND_LANGUAGES.find((x) => x.code === w.translationLang);
    return { text: w.translation || '—', label: lang?.name ?? w.translationLang };
  }
  if (w.german != null) return { text: w.german || '—', label: 'ドイツ語' };
  if (w.japanese != null) return { text: w.japanese || '—', label: '日本語' };
  return { text: '—', label: '訳' };
}
