import { Link } from 'react-router-dom';

export default function NotFound({ title = 'Page not found', message = 'The page you requested does not exist or is no longer available.' }) {
  return (
    <section
      aria-labelledby="not-found-title"
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100%',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <p style={{ color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '12px' }}>404</p>
        <h1 id="not-found-title">{title}</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0 28px' }}>{message}</p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-solid)',
            color: 'white',
            fontWeight: 600,
          }}
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
