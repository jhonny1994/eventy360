'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#f9fafb',
          color: '#111827',
          textAlign: 'center',
        }}>
          <div style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '28rem',
            width: '100%',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#fef2f2',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              fontSize: '2rem',
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              Something went wrong!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {error.message || 'A critical error occurred. Please try again.'}
            </p>
            <button
              onClick={() => reset()}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 500,
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
