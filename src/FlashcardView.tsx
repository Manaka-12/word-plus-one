import { useState, useEffect } from 'react';
import type { WordBook } from './types';

interface FlashcardViewProps {
  books: WordBook[];
}

export function FlashcardView({ books }: FlashcardViewProps) {
  const booksWithWords = books.filter((b) => b.words.length > 0);
  const allWords = booksWithWords.flatMap((b) => b.words);
  const [bookIndex, setBookIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [meaningExpanded, setMeaningExpanded] = useState(false);

  const currentBook = booksWithWords[bookIndex];
  const words = currentBook?.words ?? [];
  const current = words[cardIndex];

  // カードが変わったら英訳を折りたたむ
  useEffect(() => {
    setMeaningExpanded(false);
  }, [bookIndex, cardIndex]);

  // 表に戻したら英訳を折りたたむ
  useEffect(() => {
    if (!flipped) setMeaningExpanded(false);
  }, [flipped]);

  if (allWords.length === 0) {
    return (
      <section className="flashcard-view">
        <p className="empty">単語がありません。検索で単語を追加してください。</p>
      </section>
    );
  }

  const goPrev = () => {
    setFlipped(false);
    if (cardIndex > 0) setCardIndex((i) => i - 1);
    else if (bookIndex > 0) {
      setBookIndex((i) => i - 1);
      setCardIndex(books[bookIndex - 1].words.length - 1);
    }
  };

  const goNext = () => {
    setFlipped(false);
    if (cardIndex < words.length - 1) setCardIndex((i) => i + 1);
    else if (bookIndex < booksWithWords.length - 1) {
      setBookIndex((i) => i + 1);
      setCardIndex(0);
    }
  };

  return (
    <section className="flashcard-view">
      <div className="flashcard-controls">
        <label>
          単語帳:
          <select
            value={bookIndex}
            onChange={(e) => {
              setBookIndex(Number(e.target.value));
              setCardIndex(0);
              setFlipped(false);
            }}
          >
            {booksWithWords.map((b, i) => (
              <option key={b.id} value={i}>
                {b.name}（{b.words.length}語）
              </option>
            ))}
          </select>
        </label>
        <span className="card-counter">
          {cardIndex + 1} / {words.length}
        </span>
      </div>

      <div
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setFlipped((f) => !f)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <p className="card-word">{current?.word ?? '—'}</p>
            <p className="card-hint">クリックで裏返す</p>
          </div>
          <div className="flashcard-back">
            <p className="card-word">{current?.word ?? '—'}</p>
            <div
              className={`card-meaning-wrap ${meaningExpanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setMeaningExpanded((x) => !x);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setMeaningExpanded((x) => !x);
                }
              }}
            >
              <p className="card-meaning">{current?.meaning ?? '—'}</p>
              <span className="card-meaning-toggle">
                {meaningExpanded ? '折りたたむ' : '全文表示'}
              </span>
            </div>
            <p className="card-japanese">
              <strong>日本語:</strong> {current?.japanese ?? '—'}
            </p>
            <p className="card-german">
              <strong>ドイツ語:</strong> {current?.german ?? '—'}
            </p>
            <p className="card-hint">クリックで表に戻す</p>
          </div>
        </div>
      </div>

      <div className="flashcard-nav">
        <button type="button" onClick={goPrev} disabled={bookIndex === 0 && cardIndex === 0}>
          前へ
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={bookIndex === booksWithWords.length - 1 && cardIndex === words.length - 1}
        >
          次へ
        </button>
      </div>
    </section>
  );
}
