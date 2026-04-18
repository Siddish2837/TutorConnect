import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi, googleAuth } from '../services/authService';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const ROLES = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'tutor', label: 'Tutor', icon: '👨‍🏫' },
  { id: 'admin', label: 'Admin', icon: '👔' },
];

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Programming','Data Science','Web Development'];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', subject: 'Mathematics', experience: 2, price: 350 });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all fields'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const { data } = await registerApi({ ...form, role });
      login(data.user, data.token);
      toast.success(`Welcome, ${form.name.split(' ')[0]}! 🎉`);
      const dash = data.user.role === 'admin' ? '/dashboard/admin' : data.user.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student';
      navigate(dash);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await googleAuth({ token: credentialResponse.credential, role });
      login(data.user, data.token);
      toast.success(`Welcome to TutorConnect, ${data.user.name.split(' ')[0]}! 🎉`);
      const dash = data.user.role === 'admin' ? '/dashboard/admin' : data.user.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student';
      navigate(dash);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle} className="animate-fade">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={logoStyle}>T</div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 6 }}>Create Account</h1>
          <p className="text-muted text-sm">Join TutorConnect today</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {ROLES.map(r => (
            <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
              padding: '0.85rem 0.5rem', border: '2px solid',
              borderColor: role === r.id ? 'var(--primary)' : 'var(--border)',
              borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center',
              background: role === r.id ? 'var(--primary-light)' : 'transparent',
              color: role === r.id ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.82rem', fontWeight: 600, transition: 'var(--transition)',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{r.icon}</div>
              {r.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Sign-up Failed')}
            text="signup_with"
          />
        </div>

        <div className="divider mb-4"><span style={{ background: 'var(--bg-2)', padding: '0 1rem' }}>Or register with email</span></div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Ravi Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="ravi@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>

          {role === 'tutor' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={form.subject} onChange={e => set('subject', e.target.value)}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (yrs)</label>
                  <input className="form-input" type="number" min={0} max={40} value={form.experience} onChange={e => set('experience', Number(e.target.value))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Hourly Rate (₹)</label>
                <input className="form-input" type="number" min={100} value={form.price} onChange={e => set('price', Number(e.target.value))} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? '⏳ Creating...' : 'Create Account →'}
          </button>
        </form>

        <div className="divider mt-4 mb-4"><span style={{ background: 'var(--bg-2)', padding: '0 1rem' }}>Already have an account?</span></div>
        <Link to="/login"><button className="btn btn-ghost btn-block">Log In</button></Link>
      </div>
    </div>
  );
}

const wrapperStyle = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' };
const cardStyle = { background: 'var(--bg-2)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-glow)' };
const logoStyle = { width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontWeight: 800, fontSize: '1.25rem' };
