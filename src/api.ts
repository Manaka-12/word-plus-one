import type { DictEntry } from './types';
import type { SecondLangCode } from './types';

const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';
const API_KEY = import.meta.env.VITE_LIBRETRANSLATE_API_KEY as string | undefined;
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

export async function fetchDefinition(word: string): Promise<DictEntry[] | null> {
  const res = await fetch(`${DICT_API}/${encodeURIComponent(word.trim())}`);
  if (!res.ok) return null;
  return res.json();
}

/** MyMemory（GET）で英→指定言語に翻訳。ブラウザから CORS で使いやすく応答が速い */
function translateMyMemory(text: string, targetLang: SecondLangCode): Promise<string> {
  const pair = `en|${targetLang}`;
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text.trim())}&langpair=${pair}`;
  return fetch(url)
    .then((res) => res.json())
    .then((data: { responseData?: { translatedText?: string } }) => data?.responseData?.translatedText ?? '')
    .catch(() => '');
}

/** LibreTranslate で英→指定言語に翻訳（APIキー任意・制限緩和用） */
export async function translate(text: string, targetLang: SecondLangCode): Promise<string> {
  try {
    const body: Record<string, unknown> = {
      q: text.trim(),
      source: 'en',
      target: targetLang,
      format: 'text',
    };
    if (API_KEY) body.api_key = API_KEY;
    const res = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return '';
    const data = (await res.json()) as { translatedText?: string };
    return data?.translatedText ?? '';
  } catch {
    return '';
  }
}

/** 優先: MyMemory（速い）→ 失敗時のみ LibreTranslate */
export async function translateWithFallback(text: string, targetLang: SecondLangCode): Promise<string> {
  const fromMyMemory = await translateMyMemory(text, targetLang);
  if (fromMyMemory && fromMyMemory.trim() !== '') return fromMyMemory;
  return translate(text, targetLang);
}

export function formatMeaning(entries: DictEntry[]): string {
  const parts: string[] = [];
  for (const entry of entries) {
    for (const m of entry.meanings) {
      const defs = m.definitions.slice(0, 2).map((d) => d.definition);
      parts.push(`[${m.partOfSpeech}] ${defs.join('; ')}`);
    }
  }
  return parts.join(' ');
}

export function getPhonetic(entries: DictEntry[]): string | undefined {
  for (const entry of entries) {
    const p = entry.phonetics?.find((x) => x.text);
    if (p?.text) return p.text;
  }
  return undefined;
}
