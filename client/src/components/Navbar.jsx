import { useState, useEffect } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close menus on route change
  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [location.pathname]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setMobileOpen(false);
  };

  const dashPath = user?.role === 'admin' ? '/dashboard/admin'
    : user?.role === 'tutor' ? '/dashboard/tutor'
    : '/dashboard/student';

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';
  const isMobileActive = (path) => location.pathname === path ? 'mobile-nav-link active' : 'mobile-nav-link';

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

          {/* Center Links (desktop) */}
          <div style={linksStyle} className="nav-links">
            <Link className={isActive('/')} to="/" style={linkStyle}>Home</Link>
            <Link className={isActive('/search')} to="/search" style={linkStyle}>Find Tutors</Link>
            {user && (
              <Link className={isActive(dashPath)} to={dashPath} style={linkStyle}>Dashboard</Link>
            )}
          </div>

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={toggleTheme} style={iconBtnStyle} title="Toggle Theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <button onClick={() => setNotifOpen(true)} style={iconBtnStyle} title="Notifications">
                  🔔
                  {unread > 0 && (
                    <span style={badgeStyle}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </button>

                {/* User dropdown (desktop only) */}
                <div style={{ position: 'relative' }} className="nav-links">
                  <button onClick={() => setMenuOpen(!menuOpen)} style={avatarBtnStyle}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', background: user.avatar_color || 'var(--primary)' }}>
                      {initials}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{user.name?.split(' ')[0]}</span>
                      <div className={`badge ${user.role === 'tutor' ? 'badge-accent' : 'badge-indigo'}`} style={{ fontSize: '0.6rem', padding: '0 4px', marginTop: 1 }}>
                        {user.role}
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginLeft: 4 }}>▼</span>
                  </button>

                  {menuOpen && (
                    <div style={dropdownStyle} className="animate-slide">
                      <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{user.email}</div>
                      </div>
                      <Link to={dashPath} style={dropItemStyle} onClick={() => setMenuOpen(false)}>
                        <span style={{ marginRight: 8 }}>📊</span> Dashboard
                      </Link>
                      <Link to="/search" style={dropItemStyle} onClick={() => setMenuOpen(false)}>
                        <span style={{ marginRight: 8 }}>🔍</span> Find Tutors
                      </Link>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <button onClick={handleLogout} style={{ ...dropItemStyle, color: 'var(--danger)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ marginRight: 8 }}>🚪</span> Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Hamburger (mobile only) */}
                <button className="hamburger-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
                  <span style={mobileOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}} />
                  <span style={mobileOpen ? { opacity: 0 } : {}} />
                  <span style={mobileOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-links">
                  <button className="btn btn-ghost btn-sm">Log In</button>
                </Link>
                <Link to="/register" className="nav-links">
                  <button className="btn btn-primary btn-sm">Sign Up</button>
                </Link>
                {/* Hamburger (mobile only, logged-out) */}
                <button className="hamburger-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
                  <span style={mobileOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}} />
                  <span style={mobileOpen ? { opacity: 0 } : {}} />
                  <span style={mobileOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile slide-down drawer */}
      {mobileOpen && (
        <div className="mobile-nav-drawer">
          <Link className={isMobileActive('/')} to="/" onClick={() => setMobileOpen(false)}>
            <span>🏠</span> Home
          </Link>
          <Link className={isMobileActive('/search')} to="/search" onClick={() => setMobileOpen(false)}>
            <span>🔍</span> Find Tutors
          </Link>
          {user ? (
            <>
              <Link className={isMobileActive(dashPath)} to={dashPath} onClick={() => setMobileOpen(false)}>
                <span>📊</span> Dashboard
              </Link>
              <div className="mobile-nav-divider" />
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Signed in as <strong style={{ color: 'var(--text)' }}>{user.name}</strong>
                <span className={`badge ${user.role === 'tutor' ? 'badge-accent' : 'badge-indigo'}`} style={{ marginLeft: 6 }}>{user.role}</span>
              </div>
              <button className="mobile-nav-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                <span>🚪</span> Logout
              </button>
            </>
          ) : (
            <>
              <div className="mobile-nav-divider" />
              <Link className="mobile-nav-link" to="/login" onClick={() => setMobileOpen(false)}>
                <span>🔑</span> Log In
              </Link>
              <Link className="mobile-nav-link" to="/register" onClick={() => setMobileOpen(false)}>
                <span>✨</span> Sign Up
              </Link>
            </>
          )}
        </div>
      )}

      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Backdrop to close dropdowns */}
      {(menuOpen || mobileOpen) && (
        <div
          onClick={() => { setMenuOpen(false); setMobileOpen(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 198 }}
        />
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
