// Placeholder shown while a lesson module is still resolving.
export default function LessonSkeleton() {
  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'pulse 1.5s infinite' }}>
      <div style={{ height: '40px', width: '30%', backgroundColor: 'var(--bg-panel)', borderRadius: '8px' }}></div>
      <div style={{ height: '20px', width: '80%', backgroundColor: 'var(--bg-panel)', borderRadius: '4px' }}></div>
      <div style={{ height: '20px', width: '60%', backgroundColor: 'var(--bg-panel)', borderRadius: '4px' }}></div>
      <div style={{ height: '300px', width: '100%', backgroundColor: 'var(--bg-panel)', borderRadius: '12px', marginTop: '20px' }}></div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
