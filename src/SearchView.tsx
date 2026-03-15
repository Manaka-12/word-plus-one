import { useState } from 'react';
import type { SavedWord } from './types';
import { fetchDefinition, translateWithFallback, formatMeaning, getPhonetic } from './api';
import { getWordTranslation } from './wordUtils';

function ResultCard({ result }: { result: SavedWord }) {
  const [openSection, setOpenSection] = useState<'meaning' | 'translation' | null>('meaning');
  const { text: translationText, label: translationLabel } = getWordTranslation(result);
  const sections = [
    { id: 'meaning' as const, title: '意味（英語）', body: result.meaning },
    { id: 'translation' as const, title: `${translationLabel}訳`, body: translationText },
  ];
  const toggle = (id: 'meaning' | 'translation') => {
    setOpenSection((prev) => (prev === id ? null : id));
  };
  return (
    <div className="result-card">
      <h2 className="result-word">
        {result.word}
        {result.phonetic && (
          <span className="phonetic"> {result.phonetic}</span>
        )}
      </h2>
      {sections.map(({ id, title, body }) => (
        <div key={id} className="result-toggle">
          <button
            type="button"
            className={`result-toggle-head ${openSection === id ? 'open' : ''}`}
            onClick={() => toggle(id)}
            aria-expanded={openSection === id}
          >
            <span>{title}</span>
            <span className="result-toggle-icon" aria-hidden>▼</span>
          </button>
          {openSection === id && (
            <div className="result-toggle-body">
              <p>{body}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface SearchViewProps {
  onAddWord: (w: SavedWord) => boolean;
  premium: boolean;
  bookCount: number;
  secondLang: import('./types').SecondLangCode;
}

export function SearchView({ onAddWord, premium, bookCount, secondLang }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SavedWord | null>(null);
  const [added, setAdded] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAdded(false);
    setLimitReached(false);
    try {
      const entries = await fetchDefinition(q);
      if (!entries || entries.length === 0) {
        setError('単語が見つかりませんでした。');
        return;
      }
      const meaning = formatMeaning(entries);
      const translation = await translateWithFallback(q, secondLang);
      const phonetic = getPhonetic(entries);
      const word: SavedWord = {
        word: entries[0].word,
        meaning,
        translation: translation || '—',
        translationLang: secondLang,
        phonetic,
        addedAt: Date.now(),
      };
      setResult(word);
      const ok = onAddWord(word);
      if (ok) setAdded(true);
      else if (!premium && bookCount >= 3) setLimitReached(true);
    } catch {
      setError('検索に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="search-view">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="英単語を入力..."
          className="search-input"
          disabled={loading}
        />
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? '検索中...' : '検索'}
        </button>
      </form>

      {error && <p className="message error">{error}</p>}
      {added && <p className="message success">単語帳に追加しました。</p>}
      {limitReached && (
        <p className="message limit">
          単語帳は3冊までです。プレミアムで無制限に。
        </p>
      )}

      {result && (
        <ResultCard result={result} />
      )}
    </section>
  );
}
