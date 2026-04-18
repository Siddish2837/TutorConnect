import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = ['Users', 'Tutor Approvals', 'All Bookings', 'Revenue'];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u, t, b, r] = await Promise.all([
        api.get('/admin/users'), api.get('/admin/tutors/pending'),
        api.get('/admin/bookings'), api.get('/admin/revenue'),
      ]);
      setUsers(u.data); setTutors(t.data); setBookings(b.data); setRevenue(r.data);
    } catch (err) { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approveTutor = async (id) => {
    try { await api.put(`/admin/tutors/${id}/approve`); toast.success('Tutor approved!'); load(); }
    catch { toast.error('Failed'); }
  };
  const rejectTutor = async (id) => {
    if (!confirm('Reject and delete this tutor?')) return;
    try { await api.put(`/admin/tutors/${id}/reject`); toast.success('Tutor rejected'); load(); }
    catch { toast.error('Failed'); }
  };
  const suspendUser = async (id) => {
    try { await api.put(`/admin/users/${id}/suspend`); toast.success('User status updated'); load(); }
    catch { toast.error('Failed'); }
  };

  const stats = [
    { icon: '👥', num: revenue.userCount || 0, label: 'Total Users', color: 'var(--primary)' },
    { icon: '📚', num: revenue.tutorCount || 0, label: 'Active Tutors', color: 'var(--success)' },
    { icon: '📋', num: revenue.bookingCount || 0, label: 'Total Bookings', color: 'var(--secondary)' },
    { icon: '💰', num: `₹${Number(revenue.total || 0).toLocaleString('en-IN')}`, label: 'Total Revenue', color: 'var(--warning)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">Manage the entire TutorConnect platform</p>
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

      {loading ? <LoadingSpinner /> : <>
        {/* Users */}
        {tab === 0 && (
          <div className="animate-fade table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="font-bold">{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td className="text-sm text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${u.is_active ? 'status-confirmed' : 'status-cancelled'}`}>{u.is_active ? 'Active' : 'Suspended'}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => suspendUser(u.id)}>
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tutor Approvals */}
        {tab === 1 && (
          <div className="animate-fade">
            <div className="alert alert-warning mb-4">⚠️ Review and approve or reject pending tutor registrations below.</div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Subject</th><th>Experience</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {tutors.map(t => (
                    <tr key={t.id}>
                      <td className="font-bold">{t.user?.name}</td>
                      <td>{t.subject}</td>
                      <td>{t.experience} yrs</td>
                      <td className="font-bold">₹{t.price}/hr</td>
                      <td><span className={`status-badge ${t.approved ? 'status-confirmed' : 'status-pending'}`}>{t.approved ? 'Approved' : 'Pending'}</span></td>
                      <td>
                        <div className="flex gap-2">
                          {!t.approved && <button className="btn btn-success btn-sm" onClick={() => approveTutor(t.id)}>Approve</button>}
                          <button className="btn btn-danger btn-sm" onClick={() => rejectTutor(t.id)}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tutors.length === 0 && (
                    <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">✅</div><h3>All caught up!</h3></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Bookings */}
        {tab === 2 && (
          <div className="animate-fade table-wrap">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Student</th><th>Tutor</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="font-bold text-primary">BK-{b.id}</td>
                    <td>{b.student?.name}</td>
                    <td>{b.tutor?.user?.name}</td>
                    <td className="text-sm">{b.date}</td>
                    <td className="font-bold">₹{b.amount}</td>
                    <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Revenue */}
        {tab === 3 && (
          <div className="animate-fade grid-2" style={{ alignItems: 'start' }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="section-title">Revenue Summary</div>
              {[
                ['Monthly Revenue', `₹${Number(revenue.monthly || 0).toLocaleString('en-IN')}`, 'var(--primary)'],
                ['Total Revenue', `₹${Number(revenue.total || 0).toLocaleString('en-IN')}`, 'var(--success)'],
                ['Total Bookings', revenue.bookingCount, 'var(--secondary)'],
                ['Active Tutors', revenue.tutorCount, 'var(--warning)'],
              ].map(([label, val, color]) => (
                <div key={label} className="flex justify-between items-center mt-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-muted">{label}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color }}>{val}</span>
                </div>
              ))}
            </div>
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="section-title">Platform Health</div>
              {[['Users', revenue.userCount, 80], ['Tutors', revenue.tutorCount, 65], ['Bookings', revenue.bookingCount, 90]].map(([label, val, pct]) => (
                <div key={label} className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">{label}</span>
                    <span className="font-bold">{val}</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>}
    </div>
  );
}
