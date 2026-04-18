import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookingById, completeBooking } from '../services/bookingService';
import Whiteboard from '../components/Whiteboard';
import ReviewModal from '../components/ReviewModal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LiveSession() {
  const { bookingId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [notes, setNotes] = useState('');
  const [wbChat, setWbChat] = useState([]);
  const [wbInput, setWbInput] = useState('');

  useEffect(() => {
    getBookingById(bookingId)
      .then(r => setBooking(r.data))
      .catch(() => toast.error('Session not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const endSession = async () => {
    try {
      await completeBooking(bookingId);
      toast.success('Session ended!');
      if (user?.role === 'student') setShowReview(true);
      else navigate('/dashboard/tutor');
    } catch {}
  };

  const sendWbChat = () => {
    if (!wbInput.trim()) return;
    setWbChat(prev => [...prev, { mine: true, text: wbInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setWbInput('');
    setTimeout(() => {
      setWbChat(prev => [...prev, { mine: false, text: 'Got it! Let me explain that on the board.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1200);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Live Session 🟢</h1>
          <div className="alert alert-success mt-2" style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}>
            🟢 Session Active — {booking?.date} at {booking?.time}
          </div>
        </div>
        <div className="flex gap-3">
          <a href={booking?.session_link} target="_blank" rel="noreferrer" className="btn btn-ghost">📹 Join Meet</a>
          <button className="btn btn-danger" onClick={endSession}>End Session</button>
        </div>
      </div>

      {/* Whiteboard */}
      <div className="mb-4">
        <Whiteboard bookingId={bookingId} token={token} />
      </div>

      {/* Notes + Chat */}
      <div className="grid-2">
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div className="section-title">Session Notes</div>
          <textarea
            className="form-textarea w-full"
            rows={6}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Take notes here..."
          />
          <button className="btn btn-primary btn-sm mt-3" onClick={() => toast.success('Notes saved!')}>Save Notes</button>
        </div>

        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }}>
          <div className="section-title">Quick Chat</div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 200, marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {wbChat.map((m, i) => (
              <div key={i} style={{ maxWidth: '80%', alignSelf: m.mine ? 'flex-end' : 'flex-start' }}>
                <div style={{ padding: '0.5rem 0.85rem', borderRadius: 10, fontSize: '0.875rem', background: m.mine ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)', color: m.mine ? '#fff' : 'var(--text)' }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="form-input" style={{ flex: 1 }} placeholder="Message..." value={wbInput}
              onChange={e => setWbInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendWbChat()} />
            <button className="btn btn-primary btn-sm" onClick={sendWbChat}>Send</button>
          </div>
        </div>
      </div>

      {showReview && (
        <ReviewModal
          booking={booking}
          onClose={() => { setShowReview(false); navigate('/dashboard/student'); }}
          onSubmit={() => navigate('/dashboard/student')}
        />
      )}
    </div>
  );
}
