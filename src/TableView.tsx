import { useState } from 'react';
import type { WordBook, SavedWord } from './types';

interface TableViewProps {
  allWords: SavedWord[];
  books: WordBook[];
}

function TableRowToggle({
  w,
  bookName,
}: {
  w: SavedWord;
  bookName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="table-row-toggle">
      <button
        type="button"
        className={`table-row-head ${open ? 'open' : ''}`}
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
      >
        <span className="col-word">{w.word}</span>
        <span className="table-row-preview">{w.japanese ?? w.meaning.slice(0, 25)}…</span>
        <span className="table-row-icon" aria-hidden>▼</span>
      </button>
      {open && (
        <div className="table-row-body">
          <dl className="table-row-dl">
            <dt>意味（英語）</dt>
            <dd>{w.meaning}</dd>
            <dt>日本語訳</dt>
            <dd>{w.japanese ?? '—'}</dd>
            <dt>ドイツ語訳</dt>
            <dd>{w.german}</dd>
            <dt>単語帳</dt>
            <dd>{bookName}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}

export function TableView({ allWords, books }: TableViewProps) {
  if (allWords.length === 0) {
    return (
      <section className="table-view">
        <p className="empty">単語がありません。検索で単語を追加してください。</p>
      </section>
    );
  }

  return (
    <section className="table-view">
      <p className="table-hint">タップで各行の詳細を開閉</p>
      <div className="table-list">
        {allWords.map((w) => {
          const book = books.find((b) => b.words.some((x) => x.word === w.word));
          return (
            <TableRowToggle
              key={`${w.word}-${w.addedAt}`}
              w={w}
              bookName={book?.name ?? '—'}
            />
          );
        })}
      </div>
    </section>
  );
}
