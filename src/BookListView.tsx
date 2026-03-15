import { useState } from 'react';
import type { WordBook, SavedWord } from './types';
import { WORDS_PER_BOOK, MAX_FREE_BOOKS } from './types';

interface BookListViewProps {
  books: WordBook[];
  onRemoveWord: (bookId: string, word: string) => void;
  premium: boolean;
  onUpgrade: () => void;
}

function WordItemToggle({
  w,
  onRemove,
}: {
  w: SavedWord;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="word-item-toggle">
      <button
        type="button"
        className={`word-item-head ${open ? 'open' : ''}`}
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
      >
        <span className="word-name">{w.word}</span>
        <span className="word-item-preview">{w.japanese ?? w.meaning.slice(0, 30)}…</span>
        <span className="word-item-icon" aria-hidden>▼</span>
      </button>
      {open && (
        <div className="word-item-body">
          <p className="word-item-mean">{w.meaning}</p>
          <p className="word-item-ja"><strong>日本語:</strong> {w.japanese ?? '—'}</p>
          <p className="word-item-de"><strong>ドイツ語:</strong> {w.german}</p>
          <button
            type="button"
            className="remove-btn"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            aria-label={`${w.word} を削除`}
          >
            削除
          </button>
        </div>
      )}
    </li>
  );
}

export function BookListView({ books, onRemoveWord, premium, onUpgrade }: BookListViewProps) {
  const nonEmpty = books.filter((b) => b.words.length > 0);
  const atLimit = !premium && nonEmpty.length >= MAX_FREE_BOOKS;
  if (nonEmpty.length === 0) {
    return (
      <section className="book-list-view">
        <p className="empty">まだ単語がありません。検索タブで英単語を検索すると自動で単語帳に追加されます。</p>
        {!premium && (
          <p className="plan-hint-inline">無料版は単語帳3冊まで。プレミアムで無制限。</p>
        )}
      </section>
    );
  }

  return (
    <section className="book-list-view">
      <p className="hint">単語帳は20単語ごとに自動で分かれています。タップで詳細を開閉。</p>
      {atLimit && (
        <div className="upgrade-bar">
          <span>単語帳は3冊までです。</span>
          <button type="button" className="upgrade-btn" onClick={onUpgrade}>
            プレミアムで無制限・広告なし
          </button>
        </div>
      )}
      {nonEmpty.map((book) => (
        <div key={book.id} className="book-block">
          <h2 className="book-title">
            {book.name}（{book.words.length} / {WORDS_PER_BOOK}）
          </h2>
          <ul className="word-list">
            {book.words.map((w) => (
              <WordItemToggle
                key={`${book.id}-${w.word}`}
                w={w}
                onRemove={() => onRemoveWord(book.id, w.word)}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
