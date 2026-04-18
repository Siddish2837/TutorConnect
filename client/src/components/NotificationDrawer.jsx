import { useNotifications } from '../context/NotificationContext';

export default function NotificationDrawer({ open, onClose }) {
  const { notifications, unread, markAllRead } = useNotifications();

  if (!open) return null;

  const typeIcon = (type) => {
    if (type?.includes('booking')) return '📅';
    if (type?.includes('payment')) return '💰';
    if (type?.includes('review')) return '⭐';
    return '🔔';
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 299 }} />
      <div style={drawerStyle} className="animate-slide">
        <div style={headerStyle}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Notifications</span>
            {unread > 0 && <span style={unreadBadge}>{unread} new</span>}
          </div>
          <div className="flex gap-2">
            {unread > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
            )}
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} style={{ ...notifItemStyle, background: n.read ? 'transparent' : 'rgba(99,102,241,0.06)' }}>
                <span style={{ fontSize: '1.3rem' }}>{typeIcon(n.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{n.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

const drawerStyle = {
  position: 'fixed', top: 'var(--nav-height)', right: 12, width: 360, maxHeight: '80vh',
  background: 'var(--bg-2)', border: '1px solid var(--border-accent)',
  borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
  zIndex: 300, display: 'flex', flexDirection: 'column',
};
const headerStyle = {
  padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
const unreadBadge = {
  marginLeft: 8, background: 'var(--primary)', color: '#fff',
  borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700,
  padding: '2px 7px',
};
const notifItemStyle = {
  padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
  display: 'flex', gap: 10, alignItems: 'flex-start',
  transition: 'var(--transition)',
};
