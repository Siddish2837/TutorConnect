import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api.get(`/auth/verify/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }} className="animate-fade">
        {status === 'loading' && (
          <>
            <div className="spinner" style={{ margin: '0 auto 1.5rem', width: 48, height: 48 }} />
            <h2>Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Email Verified!</h2>
            <p className="text-muted mb-4">Your account is now active. You can log in.</p>
            <Link to="/login"><button className="btn btn-primary btn-lg">Go to Login →</button></Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Verification Failed</h2>
            <p className="text-muted mb-4">The link is invalid or has expired.</p>
            <Link to="/login"><button className="btn btn-ghost">Back to Login</button></Link>
          </>
        )}
      </div>
    </div>
  );
}
