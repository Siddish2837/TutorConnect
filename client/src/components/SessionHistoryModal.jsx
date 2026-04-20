import { useState, useEffect } from 'react';
import { getSessionHistory } from '../services/bookingService';
import toast from 'react-hot-toast';

export default function SessionHistoryModal({ booking, onClose }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await getSessionHistory(booking.id);
        setHistory(data);
      } catch (err) {
        toast.error('Failed to load session history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [booking.id]);

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 700, width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Session History</h2>
            <p className="text-sm text-muted">{booking.date} • {booking.tutor?.subject || booking.subject}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-2)' }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Notes Section */}
              <section>
                <div className="section-title mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                  <span>📝</span> Session Notes
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-lg)', 
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {history?.notes || 'No notes were saved for this session.'}
                </div>
              </section>

              {/* Chat Section */}
              <section>
                <div className="section-title mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                  <span>💬</span> Session Transcript
                </div>
                {history?.messages?.length ? (
                  <div className="chat-container" style={{ background: 'var(--bg-3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                    {history.messages.map((m) => {
                      // Logic: 'booking.student_id' is the student USER ID.
                      // 'm.sender_id' is the sender USER ID.
                      // Relative view: if I am the student, then student_id === my_id. 
                      // For a neutral history view, we identify by Role name.
                      return (
                        <div key={m.id} className={`chat-row ${m.sender_id === booking.student_id ? 'theirs' : 'mine'}`}>
                          <div className="chat-bubble">
                            <div className="chat-sender">{m.sender?.name}</div>
                            <div className="chat-text">{m.content}</div>
                            <div className="chat-meta">
                              <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {m.sender_id !== booking.student_id && <span style={{ color: 'var(--accent)', marginLeft: 4 }}>✓✓</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass text-center text-sm p-8" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>💬</div>
                    <div className="text-muted">No chat messages during this session.</div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
