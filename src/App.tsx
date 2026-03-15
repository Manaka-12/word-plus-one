import { useState, useEffect, useCallback } from 'react';
import type { WordBook, SavedWord } from './types';
import { WORDS_PER_BOOK, MAX_FREE_BOOKS } from './types';
import { loadWordBooks, saveWordBooks, loadPremium, savePremium } from './storage';
import { SearchView } from './SearchView';
import { BookListView } from './BookListView';
import { FlashcardView } from './FlashcardView';
import { TableView } from './TableView';
import { AdBanner } from './AdBanner';
import './App.css';

type Tab = 'search' | 'books' | 'flashcard' | 'table';

function App() {
  const [books, setBooks] = useState<WordBook[]>(() => loadWordBooks());
  const [premium, setPremium] = useState<boolean>(() => loadPremium());
  const [tab, setTab] = useState<Tab>('search');

  useEffect(() => {
    saveWordBooks(books);
  }, [books]);

  useEffect(() => {
    savePremium(premium);
  }, [premium]);

  const addWord = useCallback((w: SavedWord): boolean => {
    const next = [...books];
    let target = next[next.length - 1];
    if (!target || target.words.length >= WORDS_PER_BOOK) {
      if (!premium && next.length >= MAX_FREE_BOOKS) return false;
      target = {
        id: `book-${Date.now()}`,
        name: `単語帳 ${next.length + 1}`,
        words: [],
        createdAt: Date.now(),
      };
      next.push(target);
    }
    if (target.words.some((x) => x.word.toLowerCase() === w.word.toLowerCase())) {
      return false;
    }
    const idx = next.indexOf(target);
    next[idx] = { ...target, words: [...target.words, w] };
    setBooks(next);
    return true;
  }, [books, premium]);

  const removeWord = useCallback((bookId: string, word: string) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id !== bookId
          ? b
          : { ...b, words: b.words.filter((x) => x.word !== word) }
      )
    );
  }, []);

  const allWords = books.flatMap((b) => b.words);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>Word+One</h1>
          {premium ? (
            <span className="premium-badge">プレミアム</span>
          ) : (
            <button type="button" className="premium-cta" onClick={() => setPremium(true)}>
              プレミアムで無制限・広告なし
            </button>
          )}
        </div>
        <p className="tagline">英単語を検索して単語帳に貯めよう。ドイツ語訳付き。</p>
        {!premium && (
          <p className="plan-hint">無料版は単語帳3冊まで。課金で無制限＋広告なし。</p>
        )}
        <nav className="tabs">
          <button
            className={tab === 'search' ? 'active' : ''}
            onClick={() => setTab('search')}
          >
            検索
          </button>
          <button
            className={tab === 'books' ? 'active' : ''}
            onClick={() => setTab('books')}
          >
            単語帳
          </button>
          <button
            className={tab === 'flashcard' ? 'active' : ''}
            onClick={() => setTab('flashcard')}
          >
            単語カード
          </button>
          <button
            className={tab === 'table' ? 'active' : ''}
            onClick={() => setTab('table')}
          >
            表で確認
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === 'search' && (
          <SearchView onAddWord={addWord} premium={premium} bookCount={books.length} />
        )}
        {tab === 'books' && (
          <BookListView books={books} onRemoveWord={removeWord} premium={premium} onUpgrade={() => setPremium(true)} />
        )}
        {tab === 'flashcard' && (
          <FlashcardView books={books} />
        )}
        {tab === 'table' && (
          <TableView allWords={allWords} books={books} />
        )}
      </main>

      {!premium && <AdBanner />}
    </div>
  );
}

export default App;
