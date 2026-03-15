import type { DictEntry } from './types';
import type { SecondLangCode } from './types';

const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';
const API_KEY = import.meta.env.VITE_LIBRETRANSLATE_API_KEY as string | undefined;

/** 当アプリの言語コード → Google 翻訳の tl 用コード（zh は zh-CN） */
const GOOGLE_TL: Record<SecondLangCode, string> = {
  ja: 'ja', de: 'de', fr: 'fr', es: 'es', zh: 'zh-CN', ko: 'ko',
  it: 'it', pt: 'pt', ru: 'ru', ar: 'ar',
};

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t';

export async function fetchDefinition(word: string): Promise<DictEntry[] | null> {
  const res = await fetch(`${DICT_API}/${encodeURIComponent(word.trim())}`);
  if (!res.ok) return null;
  return res.json();
}

/** Google 翻訳の非公式エンドポイント（利用制限なし・CORS 対策でプロキシ経由） */
function translateGoogle(text: string, targetLang: SecondLangCode): Promise<string> {
  const tl = GOOGLE_TL[targetLang];
  const url = `${GOOGLE_TRANSLATE_URL}&tl=${tl}&q=${encodeURIComponent(text.trim())}`;
  const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;
  return fetch(proxied)
    .then((res) => res.json())
    .then((data: unknown) => {
      if (!Array.isArray(data) || !Array.isArray(data[0])) return '';
      const segments = data[0] as Array<[string | null, ...unknown[]]>;
      return segments.map((s) => (s[0] != null ? String(s[0]) : '')).join('').trim();
    })
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

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

/** MyMemory（GET）で英→指定言語に翻訳 */
function translateMyMemory(text: string, targetLang: SecondLangCode): Promise<string> {
  const pair = `en|${targetLang}`;
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text.trim())}&langpair=${pair}`;
  return fetch(url)
    .then((res) => res.json())
    .then((data: { responseData?: { translatedText?: string } }) => data?.responseData?.translatedText ?? '')
    .catch(() => '');
}

/** 優先: Google（制限なし）→ LibreTranslate → MyMemory */
export async function translateWithFallback(text: string, targetLang: SecondLangCode): Promise<string> {
  const fromGoogle = await translateGoogle(text, targetLang);
  if (fromGoogle && fromGoogle.trim() !== '') return fromGoogle;
  const fromLibre = await translate(text, targetLang);
  if (fromLibre && fromLibre.trim() !== '') return fromLibre;
  return translateMyMemory(text, targetLang);
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
