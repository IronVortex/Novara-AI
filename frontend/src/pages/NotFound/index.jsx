import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      background: 'var(--color-bg)',
      color: 'var(--color-text)',
      textAlign: 'center',
      padding: '24px',
      fontFamily: 'inherit',
    }}>
      <div style={{ fontSize: '5rem', lineHeight: 1 }}>404</div>
      <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Page not found</h1>
      <p style={{ color: 'var(--color-muted)', margin: 0 }}>This page doesn&apos;t exist or has been moved.</p>
      <button
        onClick={() => navigate('/app')}
        style={{
          padding: '11px 28px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          minHeight: '44px',
          marginTop: '8px',
          fontFamily: 'inherit',
        }}
      >
        Go to App
      </button>
    </div>
  );
}

export default NotFound;
