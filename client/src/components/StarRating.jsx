export default function StarRating({ rating = 0, size = 'sm', interactive = false, onRate }) {
  const filled = Math.round(rating);
  const fontSize = size === 'lg' ? '1.4rem' : size === 'md' ? '1.1rem' : '0.9rem';

  if (interactive) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => onRate?.(n)}
            style={{ fontSize: '1.8rem', cursor: 'pointer', color: n <= filled ? '#fbbf24' : '#374151', transition: 'var(--transition)' }}
            onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
            onMouseLeave={(e) => e.target.style.color = n <= filled ? '#fbbf24' : '#374151'}
          >★</span>
        ))}
      </div>
    );
  }

  return (
    <div className="stars flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize, color: n <= filled ? '#fbbf24' : '#374151' }}>★</span>
      ))}
    </div>
  );
}
