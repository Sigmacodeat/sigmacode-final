export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 72, color: '#94a3b8', fontWeight: 700 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '1rem 0' }}>Seite nicht gefunden</h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.6rem 1rem',
            borderRadius: 8,
            background: '#2563eb',
            color: 'white',
            textDecoration: 'none',
          }}
        >
          Zur Startseite
        </a>
      </div>
    </div>
  );
}
