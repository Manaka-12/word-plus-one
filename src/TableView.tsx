import { useState } from 'react';
import type { WordBook, SavedWord } from './types';
import { getWordTranslation } from './wordUtils';

interface TableViewProps {
  allWords: SavedWord[];
  books: WordBook[];
}

const ALL_BOOKS_ID = '__all__';

function TableRowToggle({
  w,
  bookName,
}: {
  w: SavedWord;
  bookName: string;
}) {
  const [open, setOpen] = useState(false);
  const { text: transText, label: transLabel } = getWordTranslation(w);
  return (
    <div className="table-row-toggle">
      <button
        type="button"
        className={`table-row-head ${open ? 'open' : ''}`}
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
      >
        <span className="col-word">{w.word}</span>
        <span className="table-row-preview">{transText !== '—' ? transText.slice(0, 25) + '…' : w.meaning.slice(0, 25) + '…'}</span>
        <span className="table-row-icon" aria-hidden>▼</span>
      </button>
      {open && (
        <div className="table-row-body">
          <dl className="table-row-dl">
            <dt>意味（英語）</dt>
            <dd>{w.meaning}</dd>
            <dt>{transLabel}訳</dt>
            <dd>{transText}</dd>
            <dt>単語帳</dt>
            <dd>{bookName}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}

export function TableView({ allWords, books }: TableViewProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>(ALL_BOOKS_ID);
  const booksWithWords = books.filter((b) => b.words.length > 0);

  if (allWords.length === 0) {
    return (
      <section className="table-view">
        <p className="empty">単語がありません。検索で単語を追加してください。</p>
      </section>
    );
  }

  const showAll = selectedBookId === ALL_BOOKS_ID;
  const selectedBook = books.find((b) => b.id === selectedBookId);

  return (
    <section className="table-view">
      <div className="table-view-controls">
        <label className="table-book-filter">
          <span>単語帳:</span>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
          >
            <option value={ALL_BOOKS_ID}>すべて</option>
            {booksWithWords.map((b) => (
              <option key={b.id} value={b.id}>{b.name}（{b.words.length}語）</option>
            ))}
          </select>
        </label>
      </div>
      <p className="table-hint">タップで各行の詳細を開閉</p>
      <div className="table-list">
        {showAll ? (
          booksWithWords.map((book) => (
            <div key={book.id} className="table-book-group">
              <h3 className="table-book-heading">{book.name}（{book.words.length}語）</h3>
              {book.words.map((w) => (
                <TableRowToggle
                  key={`${book.id}-${w.word}-${w.addedAt}`}
                  w={w}
                  bookName={book.name}
                />
              ))}
            </div>
          ))
        ) : selectedBook ? (
          selectedBook.words.map((w) => (
            <TableRowToggle
              key={`${selectedBook.id}-${w.word}-${w.addedAt}`}
              w={w}
              bookName={selectedBook.name}
            />
          ))
        ) : null}
      </div>
    </section>
  );
}
