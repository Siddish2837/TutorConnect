import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, respondBooking } from '../services/bookingService';
import { updateTutorProfile, getTutorById, getGoogleAuthUrl } from '../services/tutorService';
import SessionHistoryModal from '../components/SessionHistoryModal';
import ChatPanel from '../components/ChatPanel';
import toast from 'react-hot-toast';

const TABS = ['Booking Requests', 'My Schedule', 'Earnings', 'Edit Profile', 'Messages'];

export default function TutorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: user?.name || '', subject: '', experience: 0, price: 0, bio: '', tags: '' });
  const [tutorData, setTutorData] = useState(null);
  const [selectedHistoryBooking, setSelectedHistoryBooking] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      if (user?.tutorId) {
        const tRes = await getTutorById(user.tutorId);
        setTutorData(tRes.data);
        
        let parsedTags = tRes.data.tags;
        try {
          if (typeof parsedTags === 'string') {
            const parsed = JSON.parse(parsedTags);
            if (Array.isArray(parsed)) parsedTags = parsed;
          }
        } catch (e) {
          // ignore parse errors
        }
        
        if (Array.isArray(parsedTags)) {
          parsedTags = parsedTags.join(', ');
        }
        
        setProfile({
          name: tRes.data.user?.name || user?.name || '',
          subject: tRes.data.subject || '',
          experience: tRes.data.experience || 0,
          price: tRes.data.price || 0,
          bio: tRes.data.bio || '',
          tags: parsedTags || ''
        });
      }
      const { data } = await getMyBookings();
      setBookings(data || []);
    } catch (e) { console.error('Error loading dashboard:', e); }
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
      const tagsStr = Array.isArray(profile.tags) ? profile.tags.join(', ') : String(profile.tags || '');
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      await updateTutorProfile({ ...profile, tags });
      // Show success BEFORE load() — so a refresh failure never triggers "Update failed"
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      return; // Don't reload if save itself failed
    }
    // Reload outside try/catch so its errors don't corrupt the success flow
    load().catch(e => console.error('Dashboard reload error after save:', e));
  };

  const handleConnectGoogle = async () => {
    try {
      const { data } = await getGoogleAuthUrl();
      const popup = window.open(data.url, 'google-auth', 'width=600,height=600');
      
      const messageListener = (event) => {
        if (event.data === 'google_connected') {
          toast.success('Google Calendar Connected!');
          load();
          window.removeEventListener('message', messageListener);
        }
      };
      window.addEventListener('message', messageListener);
    } catch (err) {
      toast.error('Failed to start Google connection');
    }
  };

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const pending = bookings.filter(b => b.status === 'pending');
  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + Number(b.amount), 0);

  const stats = [
    { icon: '📥', num: pending.length, label: 'Pending Requests', color: 'var(--warning)' },
    { icon: '📅', num: confirmed.length, label: 'Upcoming Sessions', color: 'var(--primary)' },
    { icon: '💰', num: `₹${totalEarnings.toLocaleString('en-IN')}`, label: 'Total Earnings', color: 'var(--success)' },
    { icon: '⭐', num: tutorData?.rating || 'New', label: 'Average Rating', color: 'var(--accent)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tutor Dashboard</h1>
        <p className="page-sub">Welcome, {user?.name?.split(' ')[0]}!</p>
      </div>

      <div className="grid-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="stat-card glass" style={{ border: `1px solid ${s.color}30` }}>
            <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
            <div><div className="stat-num" style={{ fontSize: '1.75rem', fontWeight: 800 }}>{s.num}</div><div className="stat-label">{s.label}</div></div>
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
              {loading ? (
                <tr><td colSpan={6}><div className="loading-center py-12"><div className="spinner" /></div></td></tr>
              ) : bookings.length ? bookings.map(b => (
                <tr key={b.id} className="row-hover">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.85rem', background: b.student?.avatar_color || 'var(--success)', border: '2px solid rgba(255,255,255,0.1)' }}>
                        {b.student?.name?.split(' ').map(w => w[0]).join('')}
                      </div>
                      <span className="font-600">{b.student?.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-indigo">{b.tutor?.subject}</span></td>
                  <td>
                    <div className="font-500">{b.date}</div>
                    <div className="text-xs text-muted">{b.time}</div>
                  </td>
                  <td>{b.duration} min</td>
                  <td className="font-700 text-lg">₹{b.amount}</td>
                  <td>
                    {b.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={() => handleRespond(b.id, 'confirmed')}>Accept ✓</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRespond(b.id, 'rejected')}>Reject</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <span className={`status-badge status-${b.status}`}>{b.status}</span>
                        {b.status === 'confirmed' && <button className="btn btn-primary btn-sm btn-pulse" onClick={() => navigate(`/session/${b.id}`)}>Start</button>}
                        {b.status === 'completed' && <button className="btn btn-ghost btn-sm" onClick={() => setSelectedHistoryBooking(b)}>History 📝</button>}
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state py-12">
                      <div className="empty-icon text-muted" style={{ fontSize: '3rem' }}>📥</div>
                      <h3 className="mt-4">No Booking Requests</h3>
                      <p className="text-muted">New requests from students will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
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

      {tab === 2 && (() => {
        const completed = bookings.filter(b => b.status === 'completed');
        const now = new Date();
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const weekEarnings = completed.filter(b => new Date(b.date) >= weekStart).reduce((s, b) => s + Number(b.amount), 0);
        const monthEarnings = completed.filter(b => new Date(b.date) >= monthStart).reduce((s, b) => s + Number(b.amount), 0);
        const maxVal = Math.max(totalEarnings, 1);
        const earningRows = [
          ['This Week', weekEarnings, Math.round((weekEarnings / maxVal) * 100)],
          ['This Month', monthEarnings, Math.round((monthEarnings / maxVal) * 100)],
          ['All Time', totalEarnings, 100],
        ];
        return (
        <div className="animate-fade grid-2" style={{ alignItems: 'start' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div className="section-title">Earnings Overview</div>
            {earningRows.map(([label, val, pct]) => (
              <div key={label} className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">{label}</span>
                  <span className="font-bold text-success">₹{Number(val).toLocaleString('en-IN')}</span>
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
        );
      })()}

      {tab === 3 && (
        <div className="animate-fade">
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: 800 }}>
            <div className="section-title mb-6">Edit Profile Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Display Name</label>
                  <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Subject Specialization</label>
                  <input className="form-input" value={profile.subject} onChange={e => setProfile(p => ({ ...p, subject: e.target.value }))} /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Years of Experience</label>
                  <input className="form-input" type="number" value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: Number(e.target.value) }))} /></div>
                <div className="form-group"><label className="form-label">Hourly Rate (₹)</label>
                  <input className="form-input" type="number" value={profile.price} onChange={e => setProfile(p => ({ ...p, price: Number(e.target.value) }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Expertise Tags (comma-separated)</label>
                <input className="form-input" placeholder="e.g. Calculus, JEE Prep, Physics" value={profile.tags} onChange={e => setProfile(p => ({ ...p, tags: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Professional Bio</label>
                <textarea className="form-textarea" rows={5} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell students about your teaching methodology..." /></div>
              <button className="btn btn-primary" onClick={handleSaveProfile} style={{ alignSelf: 'start', padding: '0.75rem 2rem' }}>Save Profile Changes</button>
              
              <div className="section-title mt-8 mb-4">Integrations & Tools</div>
              <div className="glass" style={{ padding: '1.25rem', border: tutorData?.google_connected ? '1px solid var(--success)50' : '1px solid var(--border)', background: tutorData?.google_connected ? 'rgba(16,185,129,0.05)' : 'transparent' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{ fontSize: '1.5rem' }}>🗓️</div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        Google Calendar 
                        {tutorData?.google_connected && <span className="badge badge-success text-xs">Active</span>}
                      </div>
                      <div className="text-sm text-muted">{tutorData?.google_connected ? 'Automatically generating Google Meet links for every session.' : 'Connect to generate Google Meet links automatically.'}</div>
                    </div>
                  </div>
                  <button 
                    className={`btn ${tutorData?.google_connected ? 'btn-ghost' : 'btn-accent'} btn-sm`} 
                    onClick={handleConnectGoogle}
                    disabled={tutorData?.google_connected}
                  >
                    {tutorData?.google_connected ? 'Connected ✅' : 'Connect Google Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 4 && <div className="animate-fade"><ChatPanel /></div>}

      {selectedHistoryBooking && (
        <SessionHistoryModal
          booking={selectedHistoryBooking}
          onClose={() => setSelectedHistoryBooking(null)}
        />
      )}
    </div>
  );
}
