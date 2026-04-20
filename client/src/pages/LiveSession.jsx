import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getBookingById, completeBooking, getSessionHistory, updateSessionNotes } from '../services/bookingService';
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
  const [syncingNotes, setSyncingNotes] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    getBookingById(bookingId)
      .then(r => setBooking(r.data))
      .catch(() => toast.error('Session not found'))
      .finally(() => setLoading(false));

    // Socket Initialization
    const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    console.log('🔄 Initializing Whiteboard Socket at:', `${apiUrl}/whiteboard`);
    
    const s = io(`${apiUrl}/whiteboard`, { 
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      console.log('✅ Whiteboard socket connected! ID:', s.id);
      s.emit('join_session', { bookingId });
    });

    s.on('connect_error', (err) => {
      console.error('❌ Whiteboard socket connection error:', err.message);
      toast.error('Real-time connection failed. Chat may be delayed.');
    });

    s.on('joined', (data) => {
      console.log('📬 Joined session room:', data.bookingId);
    });

    s.on('chat_message', (data) => {
      console.log('📩 New chat message received:', data);
      setWbChat(prev => [...prev, { 
        senderId: data.userId,
        senderName: data.senderName,
        text: data.message, 
        time: new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    });

    s.on('notes_update', (data) => {
      console.log('📝 Remote notes update received');
      setNotes(data.notes);
    });

    // Load History (Notes & Chat)
    getSessionHistory(bookingId)
      .then(r => {
        setNotes(r.data.notes || '');
        if (r.data.messages) {
          setWbChat(r.data.messages.map(m => ({
            senderId: m.sender_id,
            senderName: m.sender?.name,
            text: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      })
      .catch(() => {});

    return () => s.disconnect();
  }, [bookingId, token, user?.id]);

  const handleSaveNotes = async () => {
    try {
      await updateSessionNotes(bookingId, notes);
      toast.success('Notes saved to session history!');
    } catch (err) {
      toast.error('Failed to save notes');
    }
  };

  const endSession = async () => {
    try {
      await completeBooking(bookingId);
      toast.success('Session ended!');
      if (user?.role === 'student') setShowReview(true);
      else navigate('/dashboard/tutor');
    } catch {}
  };

  const sendWbChat = () => {
    const socket = socketRef.current;
    if (!wbInput.trim() || !socket) {
      console.warn('⚠️ Cannot send message: socket not ready or empty input');
      return;
    }
    console.log('📤 Sending chat message:', wbInput);
    socket.emit('chat_message', { bookingId, message: wbInput });
    setWbInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wbChat]);

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
        <Whiteboard bookingId={bookingId} token={token} socket={socket} />
      </div>

      {/* Session Notes – full width */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
        <div className="flex justify-between items-center mb-3">
          <div className="section-title m-0">Session Notes</div>
          {syncingNotes && <div className="text-xs text-primary animate-pulse">Syncing...</div>}
        </div>
        <textarea
          className="form-textarea w-full"
          style={{ minHeight: 200, fontSize: '1rem', background: 'rgba(255,255,255,0.02)' }}
          value={notes}
          onChange={e => {
            const newNotes = e.target.value;
            setNotes(newNotes);
            setSyncingNotes(true);
            socketRef.current?.emit('notes_update', { bookingId, notes: newNotes });
            setTimeout(() => setSyncingNotes(false), 800);
          }}
          placeholder="Take notes here..."
        />
        <button className="btn btn-primary btn-sm mt-4" onClick={handleSaveNotes}>Save to History</button>
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
