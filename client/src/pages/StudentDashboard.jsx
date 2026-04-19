import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking, completeBooking } from '../services/bookingService';
import { getPaymentHistory } from '../services/paymentService';
import ReviewModal from '../components/ReviewModal';
import ChatPanel from '../components/ChatPanel';
import toast from 'react-hot-toast';

const TABS = ['My Bookings', 'Payments', 'Reviews', 'Messages'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([getMyBookings(), getPaymentHistory()]);
      setBookings(bRes.data || []);
      setPayments(pRes.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled. Refund initiated.');
      loadData();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Cancel failed'); 
      console.error(err);
    }
  };

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const avgRating = completedBookings.length > 0
    ? (completedBookings.reduce((s, b) => s + (b.rating || 0), 0) / completedBookings.length).toFixed(1)
    : '—';

  const stats = [
    { icon: '📅', num: bookings.filter(b => b.status === 'confirmed').length, label: 'Upcoming Sessions', color: 'var(--primary)' },
    { icon: '✅', num: completedBookings.length, label: 'Completed', color: 'var(--success)' },
    { icon: '⭐', num: avgRating, label: 'Avg Rating Given', color: 'var(--warning)' },
    { icon: '💳', num: `₹${payments.filter(p => p.status === 'success').reduce((s, p) => s + Number(p.amount), 0).toLocaleString('en-IN')}`, label: 'Total Spent', color: 'var(--accent)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-sub">Welcome back, {user?.name?.split(' ')[0]}!</p>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="stat-card glass">
            <div className="stat-icon" style={{ background: `${s.color}20` }}>{s.icon}</div>
            <div>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={t} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* Tab 0: Bookings */}
      {tab === 0 && (
        <div className="animate-fade">
          <div className="alert alert-info mb-4">📌 Click "Join Session" to enter the live whiteboard and chat.</div>
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Tutor</th><th>Subject</th><th>Date & Time</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.length ? bookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.75rem', background: b.tutor?.user?.avatar_color || 'var(--primary)' }}>
                            {b.tutor?.user?.name?.split(' ').map(w => w[0]).join('')}
                          </div>
                          <span className="font-600">{b.tutor?.user?.name}</span>
                        </div>
                      </td>
                      <td>{b.tutor?.subject}</td>
                      <td>{b.date}<br /><span className="text-xs text-muted">{b.time}</span></td>
                      <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                      <td className="font-bold">₹{b.amount}</td>
                      <td>
                        <div className="flex gap-2">
                          {b.status === 'confirmed' && (
                            <button className="btn btn-success btn-sm" onClick={() => navigate(`/session/${b.id}`)}>Join Session</button>
                          )}
                          {b.status === 'pending' && (
                            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/checkout/${b.id}`)}>Pay Now</button>
                          )}
                          {b.status === 'completed' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => setReviewBooking(b)}>Rate ⭐</button>
                          )}
                          {!['cancelled', 'completed', 'rejected'].includes(b.status) && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📅</div><h3>No bookings yet</h3><p>Find a tutor to get started!</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Payments */}
      {tab === 1 && (
        <div className="animate-fade table-wrap">
          <table className="data-table">
            <thead><tr><th>Payment ID</th><th>Tutor</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {payments.length ? payments.map(p => (
                <tr key={p.id}>
                  <td className="font-bold text-primary">PAY-{p.id}</td>
                  <td>{p.booking?.tutor?.user?.name || `Tutor #${p.booking?.tutor_id}`}</td>
                  <td className="font-bold">₹{p.amount}</td>
                  <td>{p.method}</td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td><span className={`status-badge status-${p.status === 'success' ? 'confirmed' : p.status}`}>{p.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">💳</div><h3>No payments yet</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Reviews placeholder */}
      {tab === 2 && (
        <div className="animate-fade">
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>Your Reviews</h3>
            <p>Complete a session to leave a review for your tutor.</p>
          </div>
        </div>
      )}

      {/* Tab 3: Messages */}
      {tab === 3 && (
        <div className="animate-fade">
          <ChatPanel />
        </div>
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={loadData}
        />
      )}
    </div>
  );
}
