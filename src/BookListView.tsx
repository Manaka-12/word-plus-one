import { useState } from 'react';
import type { WordBook, SavedWord } from './types';
import { WORDS_PER_BOOK, MAX_FREE_BOOKS } from './types';

interface BookListViewProps {
  books: WordBook[];
  onRemoveWord: (bookId: string, word: string) => void;
  onReorderWord: (bookId: string, fromIndex: number, toIndex: number) => void;
  onMoveWord: (fromBookId: string, wordIndex: number, toBookId: string) => void;
  onClearBook: (bookId: string) => void;
  premium: boolean;
  onUpgrade: () => void;
}

function WordItemToggle({
  w,
  index,
  book,
  allBooks,
  onRemove,
  onMoveUp,
  onMoveDown,
  onMove,
}: {
  w: SavedWord;
  index: number;
  book: WordBook;
  allBooks: WordBook[];
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMove: (toBookId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showMoveSelect, setShowMoveSelect] = useState(false);
  const otherBooks = allBooks.filter((b) => b.id !== book.id && b.words.length >= 0);
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
          <div className="word-item-actions">
            <div className="word-item-order">
              <button type="button" className="action-btn" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={index === 0} aria-label="上へ">↑</button>
              <button type="button" className="action-btn" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={index >= book.words.length - 1} aria-label="下へ">↓</button>
            </div>
            {otherBooks.length > 0 && (
              <div className="word-item-move">
                {showMoveSelect ? (
                  <>
                    <span className="move-label">移動先:</span>
                    <select
                      className="move-select"
                      value=""
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id) { onMove(id); setShowMoveSelect(false); }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">選択...</option>
                      {otherBooks.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <button type="button" className="action-btn" onClick={(e) => { e.stopPropagation(); setShowMoveSelect(false); }}>キャンセル</button>
                  </>
                ) : (
                  <button type="button" className="action-btn" onClick={(e) => { e.stopPropagation(); setShowMoveSelect(true); }}>移動</button>
                )}
              </div>
            )}
            <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label={`${w.word} を削除`}>削除</button>
          </div>
        </div>
      )}
    </li>
  );
}

export function BookListView({ books, onRemoveWord, onReorderWord, onMoveWord, onClearBook, premium, onUpgrade }: BookListViewProps) {
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
      <p className="hint">単語帳は20単語ごとに自動で分かれています。タップで詳細を開閉。並び替え・移動・削除もできます。</p>
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
          <div className="book-block-header">
            <h2 className="book-title">
              {book.name}（{book.words.length} / {WORDS_PER_BOOK}）
            </h2>
            <button
              type="button"
              className="clear-book-btn"
              onClick={() => window.confirm(`「${book.name}」の単語をすべて削除しますか？`) && onClearBook(book.id)}
              aria-label={`${book.name}を空にする`}
            >
              一括で空にする
            </button>
          </div>
          <ul className="word-list">
            {book.words.map((w, index) => (
              <WordItemToggle
                key={`${book.id}-${w.word}-${w.addedAt}`}
                w={w}
                index={index}
                book={book}
                allBooks={books}
                onRemove={() => onRemoveWord(book.id, w.word)}
                onMoveUp={() => onReorderWord(book.id, index, index - 1)}
                onMoveDown={() => onReorderWord(book.id, index, index + 1)}
                onMove={(toBookId) => onMoveWord(book.id, index, toBookId)}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
