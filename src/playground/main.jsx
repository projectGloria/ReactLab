import { StrictMode, Component, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ff6b6b', backgroundColor: '#2a1215', fontFamily: 'monospace' }}>
          <h3>Runtime Error in Playground</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const urlParams = new URLSearchParams(window.location.search);
const mod = urlParams.get('module') || 'fundamentals';
const les = urlParams.get('lesson') || 'jsx-intro';

// Dynamically import App.jsx so we can gracefully catch compile/syntax errors!
const App = lazy(() => import(`./${mod}/${les}/App.jsx`).catch(err => {
  console.error("Playground Import Error:", err);
  return { 
    default: () => (
      <div style={{ padding: '20px', color: '#ff6b6b', backgroundColor: '#2a1215', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #4a1f24' }}>
        <h3 style={{ marginTop: 0 }}>Syntax Error in App.jsx</h3>
        <p>Vite failed to compile your code due to a syntax error.</p>
        <p>Please check <strong>src/playground/{mod}/{les}/App.jsx</strong> in your VS Code to fix it, then save the file.</p>
      </div>
    ) 
  };
}));

if (import.meta.hot) {
  import.meta.hot.on('playground-update', () => {
    window.location.reload();
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div style={{ padding: '20px', color: '#888', fontFamily: 'monospace' }}>Compiling preview...</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
