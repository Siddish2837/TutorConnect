import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, respondBooking } from '../services/bookingService';
import { updateTutorProfile } from '../services/tutorService';
import ChatPanel from '../components/ChatPanel';
import toast from 'react-hot-toast';

const TABS = ['Booking Requests', 'My Schedule', 'Earnings', 'Edit Profile', 'Messages'];

export default function TutorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: user?.name || '', subject: 'Mathematics', experience: 3, price: 400, bio: '', tags: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getMyBookings();
      setBookings(data || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleRespond = async (id, status) => {
    try {
      await respondBooking(id, status);
      toast.success(status === 'confirmed' ? 'Booking accepted!' : 'Booking rejected');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleSaveProfile = async () => {
    try {
      const tags = profile.tags ? profile.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await updateTutorProfile({ ...profile, tags });
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const pending = bookings.filter(b => b.status === 'pending');
  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + Number(b.amount), 0);

  const stats = [
    { icon: '📥', num: pending.length, label: 'Pending Requests', color: 'var(--warning)' },
    { icon: '📅', num: confirmed.length, label: 'Upcoming Sessions', color: 'var(--primary)' },
    { icon: '💰', num: `₹${totalEarnings.toLocaleString('en-IN')}`, label: 'Total Earnings', color: 'var(--success)' },
    { icon: '⭐', num: '4.8', label: 'Average Rating', color: 'var(--accent)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tutor Dashboard</h1>
        <p className="page-sub">Welcome, {user?.name?.split(' ')[0]}!</p>
      </div>

      <div className="grid-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="stat-card glass">
            <div className="stat-icon" style={{ background: `${s.color}20` }}>{s.icon}</div>
            <div><div className="stat-num">{s.num}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {TABS.map((t, i) => <button key={t} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>)}
      </div>

      {tab === 0 && (
        <div className="animate-fade table-wrap">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Subject</th><th>Date & Time</th><th>Duration</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6}><div className="loading-center"><div className="spinner" /></div></td></tr>
                : bookings.length ? bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.75rem', background: b.student?.avatar_color || 'var(--success)' }}>
                          {b.student?.name?.split(' ').map(w => w[0]).join('')}
                        </div>
                        <span className="font-600">{b.student?.name}</span>
                      </div>
                    </td>
                    <td>{b.tutor?.subject}</td>
                    <td>{b.date}<br /><span className="text-xs text-muted">{b.time}</span></td>
                    <td>{b.duration} min</td>
                    <td className="font-bold">₹{b.amount}</td>
                    <td>
                      {b.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button className="btn btn-success btn-sm" onClick={() => handleRespond(b.id, 'confirmed')}>Accept</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRespond(b.id, 'rejected')}>Reject</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <span className={`status-badge status-${b.status}`}>{b.status}</span>
                          {b.status === 'confirmed' && <button className="btn btn-primary btn-sm" onClick={() => navigate(`/session/${b.id}`)}>Start</button>}
                        </div>
                      )}
                    </td>
                  </tr>
              )) : <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📥</div><h3>No bookings yet</h3></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 1 && (
        <div className="animate-fade">
          {confirmed.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📅</div><h3>No upcoming sessions</h3></div>
          ) : confirmed.map(b => (
            <div key={b.id} className="glass flex items-center justify-between p-4 mb-3" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <div className="font-600">{b.student?.name}</div>
                <div className="text-sm text-muted">{b.date} • {b.time} • {b.duration} min</div>
                <a href={b.session_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>🔗 {b.session_link}</a>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/session/${b.id}`)}>Start Session</button>
            </div>
          ))}
        </div>
      )}

      {tab === 2 && (
        <div className="animate-fade grid-2" style={{ alignItems: 'start' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div className="section-title">Earnings Overview</div>
            {[['This Week', '₹3,200', 65], ['This Month', `₹${totalEarnings.toLocaleString('en-IN')}`, 80], ['Total', `₹${(totalEarnings * 4).toLocaleString('en-IN')}`, 100]].map(([label, val, pct]) => (
              <div key={label} className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">{label}</span>
                  <span className="font-bold text-success">{val}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div className="section-title">Recent Payments</div>
            {bookings.filter(b => b.status === 'completed').slice(0, 5).map(b => (
              <div key={b.id} className="flex justify-between mt-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div className="font-600 text-sm">{b.student?.name}</div>
                  <div className="text-xs text-muted">{b.date}</div>
                </div>
                <div className="font-bold text-success">+₹{b.amount}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 3 && (
        <div className="animate-fade">
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', maxWidth: 600 }}>
            <div className="section-title">Edit Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Full Name</label>
                <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Subject</label>
                  <input className="form-input" value={profile.subject} onChange={e => setProfile(p => ({ ...p, subject: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Experience (yrs)</label>
                  <input className="form-input" type="number" value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: Number(e.target.value) }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Hourly Rate (₹)</label>
                <input className="form-input" type="number" value={profile.price} onChange={e => setProfile(p => ({ ...p, price: Number(e.target.value) }))} /></div>
              <div className="form-group"><label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" placeholder="e.g. Calculus, JEE Prep" value={profile.tags} onChange={e => setProfile(p => ({ ...p, tags: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Bio</label>
                <textarea className="form-textarea" rows={4} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} /></div>
              <button className="btn btn-primary" onClick={handleSaveProfile}>Save Profile</button>
            </div>
          </div>
        </div>
      )}

      {tab === 4 && <div className="animate-fade"><ChatPanel /></div>}
    </div>
  );
}
