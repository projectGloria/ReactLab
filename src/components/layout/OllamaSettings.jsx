import { useEffect, useState } from 'react';
import { AlertTriangle, Boxes, Check, CheckCircle2, Circle, Download, FolderOpen, HardDriveDownload, Power, RefreshCw } from 'lucide-react';

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

// Ollama treats a bare name as the :latest tag, so the selected model has to be
// compared the same way or the picker never highlights the current choice.
function sameModel(a, b) {
  const normalize = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.includes(':') ? text : `${text}:latest`;
  };
  return Boolean(normalize(a)) && normalize(a) === normalize(b);
}

function DetectionChip({ ok, label, title }) {
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '999px',
        fontSize: '0.68rem', fontWeight: 700,
        border: `1px solid ${ok ? 'rgba(120,140,93,0.35)' : 'rgba(255,255,255,0.08)'}`,
        background: ok ? 'rgba(120,140,93,0.12)' : 'rgba(255,255,255,0.02)',
        color: ok ? 'var(--success, #788c5d)' : '#78716c',
      }}
    >
      {ok ? <Check size={12} /> : <Circle size={12} />}
      {label}
    </span>
  );
}

function PathRow({ label, value, onChoose, disabled, picking, detected, detectedTitle }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr auto', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#a8a29e', fontSize: '0.72rem' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        {/* A found runtime/model store gets a check right on the path, so "is it
            actually detected?" is answerable without reading the status line. */}
        {detected ? (
          <CheckCircle2 size={13} color="var(--success, #788c5d)" style={{ flexShrink: 0 }} title={detectedTitle} />
        ) : (
          <Circle size={13} color="#57534e" style={{ flexShrink: 0 }} />
        )}
        <code style={{ minWidth: 0, overflow: 'hidden', color: detected ? '#d6d3d1' : '#8a857e', fontSize: '0.68rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={detectedTitle || value}>
          {value || 'Not selected'}
        </code>
      </div>
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
  const [models, setModels] = useState([]);
  const [pullTarget, setPullTarget] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isPicking, setIsPicking] = useState('');
  const [error, setError] = useState('');

  const applyStatus = (nextStatus) => {
    if (!nextStatus) return;
    setStatus(nextStatus);
    if (Array.isArray(nextStatus.availableModels)) setModels(nextStatus.availableModels);
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

  const rescanModels = async () => {
    const api = getOllamaApi();
    if (!api?.listModels) return;
    setIsScanning(true);
    setError('');
    try {
      const result = await api.listModels();
      if (result?.ok === false) setError(result.error || 'Could not read the installed models.');
      else setModels(Array.isArray(result?.models) ? result.models : []);
    } catch (scanError) {
      setError(scanError.message || 'Could not read the installed models.');
    } finally {
      setIsScanning(false);
    }
  };

  const chooseModel = (name) => run((api) => api.setModel({ model: name }));

  const pullModel = () => run(async (api) => {
    const target = pullTarget.trim();
    if (!target) return { ok: false, error: 'Type a model name, for example qwen2.5-coder:7b.' };
    const selected = await api.setModel({ model: target });
    if (selected?.ok === false) return selected;
    const result = await api.downloadModel();
    if (result?.ok !== false) setPullTarget('');
    return result;
  });

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
  const selectedModel = current.model || '';
  const diskModelCount = models.filter((item) => item.source !== 'server').length;

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

      {!unsupported && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <DetectionChip
            ok={Boolean(current.runtimeInstalled)}
            label={current.runtimeInstalled ? 'Runtime found' : 'Runtime not found'}
            title={current.runtimePath || 'No ollama executable found in the runtime folder or on PATH.'}
          />
          <DetectionChip
            ok={Boolean(current.serverRunning)}
            label={current.serverRunning ? (current.ownedProcess ? 'Server running' : 'Server running (external)') : 'Server stopped'}
            title={`Ollama API: ${current.baseUrl || 'http://127.0.0.1:11434'}`}
          />
          <DetectionChip
            ok={models.length > 0}
            label={models.length > 0 ? `${models.length} local model${models.length === 1 ? '' : 's'}` : 'No local models'}
            title={diskModelCount ? `${diskModelCount} found in ${current.modelDir}` : 'Nothing found in the model folder.'}
          />
          <DetectionChip
            ok={Boolean(current.modelInstalled)}
            label={current.modelInstalled ? `${selectedModel} ready` : `${selectedModel} unavailable`}
            title="The model the mentor will answer with."
          />
        </div>
      )}

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
          detected={Boolean(current.runtimeInstalled)}
          detectedTitle={current.runtimePath ? `Found ${current.runtimePath}` : paths.runtimeDir}
        />
        <PathRow
          label="Model folder"
          value={paths.modelDir}
          onChoose={() => chooseFolder('modelDir')}
          disabled={isWorking || Boolean(isPicking)}
          picking={isPicking === 'modelDir'}
          detected={diskModelCount > 0}
          detectedTitle={diskModelCount > 0 ? `${diskModelCount} model${diskModelCount === 1 ? '' : 's'} found here` : 'No manifests folder found here yet'}
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

      {!unsupported && (
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px',
        borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#d6d3d1' }}>
            <Boxes size={14} />
            Local models
          </div>
          <button type="button" onClick={rescanModels} disabled={isWorking || isScanning} style={{ ...folderButtonStyle, minHeight: '26px' }}>
            <RefreshCw size={12} className={isScanning ? 'spin' : ''} />
            {isScanning ? 'Scanning…' : 'Rescan'}
          </button>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#78716c', lineHeight: 1.4 }}>
          Choose which model the mentor answers with. Both the running server and the model folder are read, so anything already on this PC shows up here.
        </div>

        {models.length === 0 ? (
          <div style={{ fontSize: '0.72rem', color: '#8a857e', lineHeight: 1.45 }}>
            No models found yet. Point the model folder at your Ollama models directory (the one containing <code>manifests</code>), then rescan — or download one below.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '196px', overflowY: 'auto' }}>
            {models.map((item) => {
              const isSelected = sameModel(selectedModel, item.name);
              const meta = [item.parameterSize, item.quantization].filter(Boolean).join(' · ');
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => chooseModel(item.name)}
                  disabled={isWorking}
                  title={item.source === 'disk' ? 'Found in the model folder, not served by the running Ollama yet.' : 'Served by the running Ollama.'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left',
                    padding: '7px 9px', borderRadius: '8px', cursor: isWorking ? 'wait' : 'pointer',
                    border: `1px solid ${isSelected ? 'rgba(217,119,87,0.4)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(217,119,87,0.12)' : 'transparent',
                  }}
                >
                  {isSelected
                    ? <CheckCircle2 size={14} color="var(--accent-primary, #d97757)" style={{ flexShrink: 0 }} />
                    : <Circle size={14} color="#57534e" style={{ flexShrink: 0 }} />}
                  <span style={{
                    flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontSize: '0.74rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#f5f5f4' : '#d6d3d1',
                  }}>
                    {item.name}
                  </span>
                  {meta && <span style={{ flexShrink: 0, fontSize: '0.66rem', color: '#78716c' }}>{meta}</span>}
                  {item.size > 0 && <span style={{ flexShrink: 0, fontSize: '0.66rem', color: '#78716c' }}>{formatBytes(item.size)}</span>}
                  <span style={{
                    flexShrink: 0, fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.08)', color: item.source === 'disk' ? '#d9a057' : '#8a857e',
                  }}>
                    {item.source === 'disk' ? 'on disk' : 'served'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={pullTarget}
            onChange={(event) => setPullTarget(event.target.value)}
            placeholder="Download another model, e.g. qwen2.5-coder:7b"
            disabled={isWorking}
            style={{
              flex: '1 1 200px', minWidth: 0, minHeight: '34px', padding: '6px 10px', borderRadius: '8px',
              border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.25)', color: '#e7e5e4', fontSize: '0.72rem',
            }}
          />
          <button type="button" onClick={pullModel} disabled={isWorking || !pullTarget.trim()} style={secondaryButtonStyle}>
            <Download size={13} />
            Download
          </button>
        </div>
      </div>
      )}

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
