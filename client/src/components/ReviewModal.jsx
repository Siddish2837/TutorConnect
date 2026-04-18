import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(0);

  const submit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await api.post('/reviews', {
        tutorId: booking.tutor_id,
        bookingId: booking.id,
        rating, comment,
      });
      toast.success('Review submitted! Thank you 🌟');
      onSubmit?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal animate-slide">
        <div className="modal-header">
          <div className="modal-title">Rate Your Session ⭐</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="text-muted text-sm mb-4">
            How was your session with <strong style={{ color: 'var(--text)' }}>{booking?.tutor?.user?.name}</strong>?
          </p>
          {/* Star input */}
          <div className="flex gap-2 mb-4">
            {[1,2,3,4,5].map(n => (
              <span
                key={n}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                style={{ fontSize: '2.2rem', cursor: 'pointer', color: n <= (hovered || rating) ? '#fbbf24' : '#374151', transition: 'var(--transition)' }}
              >★</span>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Your Review</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Skip</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
