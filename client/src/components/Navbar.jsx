import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unread } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const dashPath = user?.role === 'admin' ? '/dashboard/admin'
    : user?.role === 'tutor' ? '/dashboard/tutor'
    : '/dashboard/student';

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <>
      <nav style={navStyle}>
        <div style={innerStyle}>
          {/* Logo */}
          <Link to="/" style={logoStyle}>
            <div style={logoIconStyle}>T</div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              Tutor<span style={{ color: 'var(--accent)' }}>Connect</span>
            </span>
          </Link>

          {/* Center Links */}
          <div style={linksStyle} className="nav-links">
            <Link className={isActive('/')} to="/" style={linkStyle}>Home</Link>
            <Link className={isActive('/search')} to="/search" style={linkStyle}>Find Tutors</Link>
            {user && (
              <Link className={isActive(dashPath)} to={dashPath} style={linkStyle}>Dashboard</Link>
            )}
          </div>

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <>
                {/* Notifications */}
                <button onClick={() => setNotifOpen(true)} style={iconBtnStyle} title="Notifications">
                  🔔
                  {unread > 0 && (
                    <span style={badgeStyle}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </button>

                {/* User menu */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setMenuOpen(!menuOpen)} style={avatarBtnStyle}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', background: user.avatar_color || 'var(--primary)' }}>
                      {initials}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{user.name?.split(' ')[0]}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>▼</span>
                  </button>

                  {menuOpen && (
                    <div style={dropdownStyle} className="animate-slide">
                      <Link to={dashPath} style={dropItemStyle} onClick={() => setMenuOpen(false)}>
                        📊 Dashboard
                      </Link>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <button onClick={handleLogout} style={{ ...dropItemStyle, color: 'var(--danger)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="btn btn-ghost btn-sm">Log In</button>
                </Link>
                <Link to="/register">
                  <button className="btn btn-primary btn-sm">Sign Up</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
      )}

      <style>{`
        .nav-link { font-size: 0.875rem; font-weight: 500; color: var(--text-muted); padding: 0.4rem 0.75rem; border-radius: var(--radius); transition: var(--transition); text-decoration: none; }
        .nav-link:hover { color: var(--text); background: var(--surface); }
        .nav-link.active { color: var(--primary); background: var(--primary-light); }
        @media (max-width: 640px) { .nav-links { display: none !important; } }
      `}</style>
    </>
  );
}

const navStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
  height: 'var(--nav-height)',
  background: 'rgba(10,10,15,0.85)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid var(--border)',
};
const innerStyle = {
  maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
  height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
const logoStyle = { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' };
const logoIconStyle = {
  width: 34, height: 34, borderRadius: 8,
  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', fontWeight: 800, fontSize: '1rem',
};
const linksStyle = { display: 'flex', gap: 4, alignItems: 'center' };
const linkStyle = {};
const iconBtnStyle = {
  position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '0.45rem 0.6rem', cursor: 'pointer', fontSize: '1.1rem',
};
const badgeStyle = {
  position: 'absolute', top: -4, right: -4,
  background: 'var(--danger)', color: '#fff',
  borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 700,
  minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 3px',
};
const avatarBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '0.35rem 0.75rem 0.35rem 0.45rem',
  cursor: 'pointer', transition: 'var(--transition)',
};
const dropdownStyle = {
  position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 180,
  background: 'var(--bg-2)', border: '1px solid var(--border-accent)',
  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
  padding: '6px', zIndex: 200,
};
const dropItemStyle = {
  display: 'block', padding: '0.6rem 0.85rem',
  borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 500,
  color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition)',
};
