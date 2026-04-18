export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', zIndex: 9999 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem', width: 48, height: 48, borderWidth: 4 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading TutorConnect...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  );
}
