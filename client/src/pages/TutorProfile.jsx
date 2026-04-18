import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTutorById } from '../services/tutorService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingCalendar from '../components/BookingCalendar';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

export default function TutorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration] = useState(60);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    getTutorById(id)
      .then(r => setTutor(r.data))
      .catch(() => toast.error('Tutor not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const total = tutor ? Math.round(tutor.price * (duration / 60)) : 0;

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedDate || !selectedTime) { toast.error('Please select date and time'); return; }
    setBooking(true);
    try {
      const { data } = await createBooking({ tutorId: tutor.id, date: selectedDate, time: selectedTime, duration });
      toast.success('Booking request sent! Proceed to payment.');
      navigate(`/checkout/${data.booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally { setBooking(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!tutor) return <div className="page-container"><div className="empty-state"><div className="empty-icon">😕</div><h3>Tutor not found</h3></div></div>;

  const { user: u, subject, experience, price, rating, review_count, bio, tags, reviews } = tutor;
  const color = u?.avatar_color || '#6366f1';
  const initials = u?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate(-1)}>← Back</button>

      {/* Profile Hero */}
      <div style={{ background: `linear-gradient(135deg, ${color}33, var(--bg-3))`, border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1e3a8a33, #7c3aed22)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="avatar" style={{ width: 80, height: 80, fontSize: '2rem', background: color, margin: '0 auto 1rem', border: '4px solid rgba(255,255,255,0.2)' }}>{initials}</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{u?.name}</h1>
          <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{subject} • {experience} yrs experience</div>
          <div className="flex-center gap-2 mt-3">
            <StarRating rating={rating} size="md" />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{parseFloat(rating || 0).toFixed(1)} ({review_count} reviews)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.75rem' }}>
            ₹{price}<span style={{ fontSize: '0.875rem', fontWeight: 400, opacity: 0.7 }}>/hour</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: About + Reviews */}
        <div>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
            <div className="section-title">About</div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>{bio || 'No bio provided yet.'}</p>
            <div className="flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
              {(Array.isArray(tags) ? tags : []).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div className="section-title">Reviews</div>
            {reviews && reviews.length ? reviews.map((r, i) => (
              <div key={i} style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.75rem', background: r.student?.avatar_color || 'var(--primary)' }}>
                    {r.student?.name?.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="font-600 text-sm">{r.student?.name}</div>
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{r.comment}</p>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '2rem' }}>⭐</div>
                <p>No reviews yet – be the first!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'sticky', top: 'calc(var(--nav-height) + 1rem)' }}>
          <div className="section-title">Book a Session</div>
          <div className="alert alert-info text-sm mb-4">Select a date and time to book</div>
          <BookingCalendar tutorId={tutor.id} onDateSelect={setSelectedDate} onSlotSelect={setSelectedTime} />

          {selectedDate && selectedTime && (
            <div style={{ marginTop: '1.5rem' }}>
              <div className="form-group mb-3">
                <label className="form-label">Duration</label>
                <select className="form-select" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Amount</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  ₹{total}
                </div>
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={handleBook} disabled={booking}>
                {booking ? '⏳ Processing...' : 'Proceed to Payment →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
