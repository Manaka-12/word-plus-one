import { useState, useEffect, useCallback } from 'react';
import type { WordBook, SavedWord } from './types';
import { WORDS_PER_BOOK } from './types';
import { loadWordBooks, saveWordBooks } from './storage';
import { SearchView } from './SearchView';
import { BookListView } from './BookListView';
import { FlashcardView } from './FlashcardView';
import { TableView } from './TableView';
import './App.css';

type Tab = 'search' | 'books' | 'flashcard' | 'table';

function App() {
  const [books, setBooks] = useState<WordBook[]>(() => loadWordBooks());
  const [tab, setTab] = useState<Tab>('search');

  useEffect(() => {
    saveWordBooks(books);
  }, [books]);

  const addWord = useCallback((w: SavedWord): boolean => {
    const next = [...books];
    let target = next[next.length - 1];
    if (!target || target.words.length >= WORDS_PER_BOOK) {
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
  }, [books]);

  const removeWord = useCallback((bookId: string, word: string) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id !== bookId
          ? b
          : { ...b, words: b.words.filter((x) => x.word !== word) }
      )
    );
  }, []);

  const reorderWord = useCallback((bookId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId || fromIndex < 0 || toIndex < 0 || fromIndex >= b.words.length || toIndex >= b.words.length) return b;
        const words = [...b.words];
        const [removed] = words.splice(fromIndex, 1);
        words.splice(toIndex, 0, removed);
        return { ...b, words };
      })
    );
  }, []);

  const moveWord = useCallback((fromBookId: string, wordIndex: number, toBookId: string) => {
    if (fromBookId === toBookId) return;
    setBooks((prev) => {
      const fromBook = prev.find((b) => b.id === fromBookId);
      const toBook = prev.find((b) => b.id === toBookId);
      if (!fromBook || !toBook || wordIndex < 0 || wordIndex >= fromBook.words.length) return prev;
      const word = fromBook.words[wordIndex];
      return prev.map((b) => {
        if (b.id === fromBookId) return { ...b, words: b.words.filter((_, i) => i !== wordIndex) };
        if (b.id === toBookId) return { ...b, words: [...b.words, word] };
        return b;
      });
    });
  }, []);

  const clearBook = useCallback((bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id !== bookId ? b : { ...b, words: [] }))
    );
  }, []);

  const allWords = books.flatMap((b) => b.words);

  return (
    <div className="app">
      <header className="header">
        <h1>Word+One</h1>
        <p className="tagline">英単語を検索して単語帳に貯めよう。ドイツ語訳付き。</p>
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
          <SearchView onAddWord={addWord} premium={true} bookCount={books.length} />
        )}
        {tab === 'books' && (
          <BookListView
          books={books}
          onRemoveWord={removeWord}
          onReorderWord={reorderWord}
          onMoveWord={moveWord}
          onClearBook={clearBook}
          premium={true}
          onUpgrade={() => {}}
        />
        )}
        {tab === 'flashcard' && (
          <FlashcardView books={books} />
        )}
        {tab === 'table' && (
          <TableView allWords={allWords} books={books} />
        )}
      </main>
    </div>
  );
}

export default App;
