import { useState, useEffect, useCallback } from 'react';
import type { WordBook, SavedWord } from './types';
import type { SecondLangCode } from './types';
import { WORDS_PER_BOOK } from './types';
import { loadWordBooks, saveWordBooks, loadSecondLanguage, saveSecondLanguage } from './storage';
import { SECOND_LANGUAGES } from './types';
import { SearchView } from './SearchView';
import { BookListView } from './BookListView';
import { FlashcardView } from './FlashcardView';
import { TableView } from './TableView';
import './App.css';

type Tab = 'search' | 'books' | 'flashcard' | 'table';

function App() {
  const [books, setBooks] = useState<WordBook[]>(() => loadWordBooks());
  const [secondLang, setSecondLang] = useState<SecondLangCode>(() => loadSecondLanguage());
  const [tab, setTab] = useState<Tab>('search');

  useEffect(() => {
    saveSecondLanguage(secondLang);
  }, [secondLang]);

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
        <p className="tagline">英単語を検索して単語帳に貯めよう。英語＋1言語で学べる。</p>
        <div className="second-lang-select">
          <label>
            <span>一緒に学ぶ言語:</span>
            <select
              value={secondLang}
              onChange={(e) => setSecondLang(e.target.value as SecondLangCode)}
              aria-label="一緒に学ぶ言語"
            >
              {SECOND_LANGUAGES.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </label>
        </div>
        <details className="app-notice">
          <summary>ご利用上の注意</summary>
          <ul>
            <li><strong>スマホで使うとき：</strong>ホーム画面に追加するとアプリのように開けます。iPhone（Safari）→ 共有 →「ホーム画面に追加」。Android（Chrome）→ メニュー⋮ →「ホーム画面に追加」。</li>
            <li><strong>訳について：</strong>英語の意味は辞書API、日・独訳は自動翻訳で表示しています。正確でない場合があるため、重要な用途では辞書等でご確認ください。</li>
            <li><strong>対応ブラウザ：</strong>Chrome / Edge / Safari / Firefox の最新版を推奨。シークレットモードでは終了時にデータが消えます。</li>
            <li><strong>保存データ：</strong>単語は端末のブラウザ内のみに保存されます。履歴・サイトデータの削除や端末初期化で消え、復元できません。</li>
          </ul>
        </details>
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
          <SearchView
            onAddWord={addWord}
            premium={true}
            bookCount={books.length}
            secondLang={secondLang}
          />
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
