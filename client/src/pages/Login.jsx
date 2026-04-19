import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/authService';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 🎉`);
      const dash = data.user.role === 'admin' ? '/dashboard/admin' : data.user.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student';
      navigate(dash);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle} className="animate-fade">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={logoStyle}>T</div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 6 }}>Welcome Back</h1>
          <p className="text-muted text-sm">Sign in to your TutorConnect account</p>
        </div>

        {/* Demo hint */}
        <div className="alert alert-info text-sm mb-4">
          💡 Demo: Use email with "tutor" for tutor role, "admin" for admin role
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Log In →'}
          </button>
        </form>

        <div className="divider mt-4 mb-4"><span style={{ background: 'var(--bg-2)', padding: '0 1rem' }}>New to TutorConnect?</span></div>
        <Link to="/register"><button className="btn btn-ghost btn-block">Create an Account</button></Link>
      </div>
    </div>
  );
}

const wrapperStyle = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' };
const cardStyle = { background: 'var(--bg-2)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-glow)' };
const logoStyle = { width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontWeight: 800, fontSize: '1.25rem' };
