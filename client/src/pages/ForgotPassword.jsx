import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { token } = useParams(); // present when resetting
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending reset email');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password reset! You can now log in.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle} className="animate-fade">
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>
          {token ? '🔑 Reset Password' : '🔒 Forgot Password'}
        </h1>
        <p className="text-muted text-sm mb-6">
          {token ? 'Enter your new password below.' : "Enter your email and we'll send a reset link."}
        </p>

        {sent ? (
          <div className="alert alert-success">
            ✅ Reset link sent! Check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={token ? handleReset : handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!token ? (
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Min 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? '⏳ Sending...' : token ? 'Reset Password' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

const wrapperStyle = { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' };
const cardStyle = { background: 'var(--bg-2)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-glow)' };
