import type { DictEntry } from './types';

const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const TRANS_API = 'https://api.mymemory.translated.net/get';

export async function fetchDefinition(word: string): Promise<DictEntry[] | null> {
  const res = await fetch(`${DICT_API}/${encodeURIComponent(word.trim())}`);
  if (!res.ok) return null;
  return res.json();
}

export async function translateToJapanese(text: string): Promise<string> {
  try {
    const res = await fetch(
      `${TRANS_API}?q=${encodeURIComponent(text)}&langpair=en|ja`
    );
    const data = await res.json();
    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch {
    // ignore
  }
  return '';
}

export async function translateToGerman(text: string): Promise<string> {
  try {
    const res = await fetch(
      `${TRANS_API}?q=${encodeURIComponent(text)}&langpair=en|de`
    );
    const data = await res.json();
    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch {
    // ignore
  }
  return '';
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
