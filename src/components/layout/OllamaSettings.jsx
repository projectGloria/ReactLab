import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FolderOpen, HardDriveDownload, Power, RefreshCw } from 'lucide-react';

const STATUS_LABELS = {
  unsupported: 'Not supported on this platform',
  'not-installed': 'Runtime not installed',
  installing: 'Installing runtime…',
  'installed-stopped': 'Runtime installed but stopped',
  starting: 'Starting local runtime…',
  'running-no-model': 'Runtime ready; model not downloaded',
  'downloading-model': 'Downloading mentor model…',
  ready: 'Local mentor ready',
  error: 'Local mentor error',
};

function getOllamaApi() {
  return typeof window !== 'undefined' ? window.electronAPI?.ollama : undefined;
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let amount = value;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toFixed(unit >= 2 ? 1 : 0)} ${units[unit]}`;
}

function PathRow({ label, value, onChoose, disabled, picking }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr auto', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#a8a29e', fontSize: '0.72rem' }}>{label}</span>
      <code style={{ minWidth: 0, overflow: 'hidden', color: '#d6d3d1', fontSize: '0.68rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={value}>
        {value || 'Not selected'}
      </code>
      <button type="button" onClick={onChoose} disabled={disabled} style={folderButtonStyle} title={`Choose ${label.toLowerCase()}`}>
        <FolderOpen size={13} />
        {picking ? 'Choosing…' : 'Browse'}
      </button>
    </div>
  );
}

export default function OllamaSettings() {
  const [status, setStatus] = useState(null);
  const [paths, setPaths] = useState({ runtimeDir: '', modelDir: '' });
  const [isWorking, setIsWorking] = useState(false);
  const [isPicking, setIsPicking] = useState('');
  const [error, setError] = useState('');

  const applyStatus = (nextStatus) => {
    if (!nextStatus) return;
    setStatus(nextStatus);
    if (nextStatus.runtimeDir || nextStatus.modelDir) {
      setPaths({
        runtimeDir: nextStatus.runtimeDir || '',
        modelDir: nextStatus.modelDir || '',
      });
    }
  };

  const refresh = async () => {
    const api = getOllamaApi();
    if (!api) {
      applyStatus({ status: 'unsupported', runtimeInstalled: false, serverRunning: false, modelInstalled: false });
      return;
    }
    try {
      applyStatus(await api.getStatus());
    } catch (requestError) {
      setError(requestError.message || 'Could not read local mentor status.');
    }
  };

  useEffect(() => {
    refresh();
    const api = getOllamaApi();
    if (!api?.onStatus) return undefined;
    return api.onStatus((nextStatus) => applyStatus(nextStatus));
  }, []);

  const run = async (action) => {
    const api = getOllamaApi();
    if (!api) return;
    setIsWorking(true);
    setError('');
    try {
      const result = await action(api);
      applyStatus(result);
      if (result?.ok === false) setError(result.error || result.message || 'The local mentor action failed.');
    } catch (actionError) {
      setError(actionError.message || 'The local mentor action failed.');
    } finally {
      setIsWorking(false);
      refresh();
    }
  };

  const chooseFolder = async (kind) => {
    const api = getOllamaApi();
    if (!api?.pickFolder) return;
    setIsPicking(kind);
    setError('');
    try {
      const result = await api.pickFolder();
      if (!result.canceled && result.path) {
        setPaths((currentPaths) => ({ ...currentPaths, [kind]: result.path }));
      }
    } catch (pickerError) {
      setError(pickerError.message || 'Could not choose that folder.');
    } finally {
      setIsPicking('');
    }
  };

  const savePaths = () => run((api) => api.setPaths(paths));
  const resetPaths = () => run((api) => api.resetPaths());
  const setupLocalMentor = () => run(async (api) => {
    if (pathsReady) {
      const pathResult = await api.setPaths(paths);
      if (pathResult?.ok === false) return pathResult;
    }
    return api.setup();
  });
  const pathsReady = Boolean(paths.runtimeDir && paths.modelDir);

  const current = status || { status: 'starting', runtimeInstalled: false, serverRunning: false, modelInstalled: false };
  const statusKey = current.status || 'error';
  const progress = current.progress;
  const ready = statusKey === 'ready' || (current.serverRunning && current.modelInstalled);
  const unsupported = statusKey === 'unsupported';
  const runtimeMissing = !unsupported && (statusKey === 'not-installed' || !current.runtimeInstalled);
  const modelMissing = !unsupported && current.runtimeInstalled && current.serverRunning && current.modelInstalled === false;
  const canStart = !unsupported && current.runtimeInstalled && !current.serverRunning && !isWorking;
  const canStop = !unsupported && current.serverRunning && current.ownedProcess && !isWorking;

  return (
    <section style={{
      backgroundColor: '#12110f',
      borderRadius: '14px',
      padding: '18px 20px',
      border: ready ? '1px solid rgba(120, 140, 93, 0.35)' : '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: '#f5f5f4' }}>
            <HardDriveDownload size={17} color="var(--accent-primary, #d97757)" />
            <span>Local React Mentor</span>
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: ready ? 'rgba(120,140,93,0.15)' : 'rgba(255,255,255,0.06)',
              color: ready ? 'var(--success)' : '#a8a29e',
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${ready ? 'rgba(120,140,93,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              Offline
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#a8a29e', marginTop: '5px', lineHeight: 1.5 }}>
            ReactLab can install and manage the local coding model. Nothing is sent to a cloud AI when the local mentor is used.
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isWorking}
          title="Refresh local mentor status"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
            background: 'transparent', color: '#a8a29e', cursor: isWorking ? 'wait' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={isWorking ? 'spin' : ''} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: ready ? 'var(--success)' : statusKey === 'error' ? 'var(--error)' : '#d9a057', fontSize: '0.8rem', fontWeight: 600 }}>
        {ready ? <CheckCircle2 size={15} /> : statusKey === 'error' ? <AlertTriangle size={15} /> : <Power size={15} />}
        {STATUS_LABELS[statusKey] || statusKey}
      </div>

      {(current.message || error) && (
        <div style={{ color: error || statusKey === 'error' ? '#fca5a5' : '#a8a29e', fontSize: '0.75rem', lineHeight: 1.45 }}>
          {error || current.message}
        </div>
      )}

      {progress && (statusKey === 'installing' || statusKey === 'downloading-model') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ height: '7px', borderRadius: '999px', overflow: 'hidden', background: '#262522' }}>
            <div style={{ width: `${Math.max(0, Math.min(100, progress.percent ?? 3))}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.25s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', fontSize: '0.7rem' }}>
            <span>{progress.status || (progress.phase === 'runtime-extract' ? 'Extracting…' : 'Working…')}</span>
            <span>{progress.percent == null ? 'Preparing…' : `${progress.percent}%`}{progress.completed ? ` · ${formatBytes(progress.completed)}` : ''}</span>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px',
        borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d6d3d1' }}>Storage locations</div>
        <div style={{ fontSize: '0.7rem', color: '#78716c', lineHeight: 1.4 }}>
          Choose where ReactLab installs the runtime and stores model files. Existing folders are detected automatically.
        </div>
        <PathRow
          label="Runtime folder"
          value={paths.runtimeDir}
          onChoose={() => chooseFolder('runtimeDir')}
          disabled={isWorking || Boolean(isPicking)}
          picking={isPicking === 'runtimeDir'}
        />
        <PathRow
          label="Model folder"
          value={paths.modelDir}
          onChoose={() => chooseFolder('modelDir')}
          disabled={isWorking || Boolean(isPicking)}
          picking={isPicking === 'modelDir'}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" disabled={!pathsReady || isWorking} onClick={savePaths} style={primaryButtonStyle}>
            <CheckCircle2 size={14} />
            Save locations
          </button>
          <button type="button" disabled={isWorking} onClick={resetPaths} style={secondaryButtonStyle}>
            <RefreshCw size={14} />
            Reset automatic detection
          </button>
        </div>
      </div>

      {!unsupported && !ready && (
        <button
          type="button"
          disabled={isWorking || !pathsReady || ['installing', 'starting', 'downloading-model'].includes(statusKey)}
          onClick={setupLocalMentor}
          style={{ ...primaryButtonStyle, width: '100%', justifyContent: 'center', minHeight: '40px', fontSize: '0.8rem' }}
        >
          {isWorking || ['installing', 'starting', 'downloading-model'].includes(statusKey) ? <RefreshCw size={15} className="spin" /> : <HardDriveDownload size={15} />}
          {isWorking || ['installing', 'starting', 'downloading-model'].includes(statusKey) ? 'Setting up local mentor…' : 'Set up local mentor'}
        </button>
      )}

      <details style={{ color: '#a8a29e' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Advanced controls</summary>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
          {runtimeMissing && (
            <button type="button" disabled={isWorking} onClick={() => run((api) => api.installRuntime())} style={primaryButtonStyle}>
              <Download size={14} />
              Install runtime
            </button>
          )}
          {!runtimeMissing && !current.serverRunning && (
            <button type="button" disabled={!canStart} onClick={() => run((api) => api.start())} style={primaryButtonStyle}>
              <Power size={14} />
              Start quietly
            </button>
          )}
          {modelMissing && (
            <button type="button" disabled={isWorking} onClick={() => run((api) => api.downloadModel())} style={primaryButtonStyle}>
              <Download size={14} />
              Download model
            </button>
          )}
          {canStop && (
            <button type="button" disabled={isWorking} onClick={() => run((api) => api.stop())} style={secondaryButtonStyle}>
              <Power size={14} />
              Stop runtime
            </button>
          )}
        </div>
      </details>

      <div style={{ display: 'grid', gap: '4px', color: '#6f6b63', fontSize: '0.68rem', lineHeight: 1.4 }}>
        <div>Model: <code style={{ color: '#a8a29e' }}>{current.model || 'qwen2.5-coder:3b'}</code></div>
        <div>Runtime: <code style={{ color: '#a8a29e', wordBreak: 'break-all' }}>{current.runtimePath || current.runtimeDir || 'Not installed'}</code></div>
        <div>Models: <code style={{ color: '#a8a29e', wordBreak: 'break-all' }}>{current.modelDir || 'Not configured'}</code></div>
      </div>
    </section>
  );
}

const primaryButtonStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
  minHeight: '34px', padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(217,119,87,0.35)',
  background: 'rgba(217,119,87,0.16)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700,
  cursor: 'pointer',
};

const folderButtonStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
  minHeight: '30px', padding: '5px 8px', borderRadius: '7px', border: '1px solid var(--border-subtle)',
  background: 'transparent', color: '#a8a29e', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  border: '1px solid var(--border-subtle)',
  background: 'transparent',
  color: '#a8a29e',
};
