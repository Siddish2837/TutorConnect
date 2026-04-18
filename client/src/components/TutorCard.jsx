import { Link, useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

export default function TutorCard({ tutor }) {
  const navigate = useNavigate();
  const { id, user, subject, experience, price, rating, review_count, tags } = tutor;
  const name = user?.name || 'Tutor';
  const color = user?.avatar_color || '#6366f1';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const tagList = Array.isArray(tags) ? tags : [];

  return (
    <div style={cardStyle} className="tutor-card glass">
      <div style={topStyle}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.1rem', background: color, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{name}</div>
          <div style={{ color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600, marginTop: 2 }}>{subject}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>📚 {experience} yrs experience</div>
          <div className="stars flex items-center gap-1 mt-1">
            <StarRating rating={rating} size="sm" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 4 }}>
              {parseFloat(rating || 0).toFixed(1)} ({review_count || 0})
            </span>
          </div>
          <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
            {tagList.slice(0, 3).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={footerStyle}>
        <div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>₹{price}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 3 }}>/hr</span>
        </div>
        <div className="flex gap-2">
          <Link to={`/tutor/${id}`}>
            <button className="btn btn-ghost btn-sm">Profile</button>
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/tutor/${id}`)}>
            Book Now
          </button>
        </div>
      </div>

      <style>{`
        .tutor-card { transition: var(--transition); }
        .tutor-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-glow); border-color: var(--border-accent); }
      `}</style>
    </div>
  );
}

const cardStyle = { borderRadius: 'var(--radius-lg)', overflow: 'hidden' };
const topStyle = { padding: '1.25rem', display: 'flex', gap: 12, alignItems: 'flex-start' };
const footerStyle = {
  padding: '1rem 1.25rem',
  borderTop: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
