const { contextBridge, ipcRenderer } = require('electron');

// Expose narrow desktop capabilities to the renderer. The renderer never gets
// shell access, arbitrary IPC, or direct filesystem access.
contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  },
  openDetachedWindow: (payload) => ipcRenderer.invoke('window:open-detached', payload),
  onDetachedClosed: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('detached:closed', listener);
    return () => ipcRenderer.removeListener('detached:closed', listener);
  },
  mentor: {
    getStatus: () => ipcRenderer.invoke('mentor:get-status'),
    ask: (payload) => ipcRenderer.invoke('mentor:ask', payload),
    onChunk: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('mentor:chunk', listener);
      return () => ipcRenderer.removeListener('mentor:chunk', listener);
    },
  },
  ollama: {
    getStatus: () => ipcRenderer.invoke('ollama:get-status'),
    pickFolder: () => ipcRenderer.invoke('ollama:pick-folder'),
    setPaths: (payload) => ipcRenderer.invoke('ollama:set-paths', payload),
    resetPaths: () => ipcRenderer.invoke('ollama:reset-paths'),
    setup: () => ipcRenderer.invoke('ollama:setup'),
    installRuntime: () => ipcRenderer.invoke('ollama:install-runtime'),
    start: () => ipcRenderer.invoke('ollama:start'),
    downloadModel: () => ipcRenderer.invoke('ollama:download-model'),
    stop: () => ipcRenderer.invoke('ollama:stop'),
    onStatus: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('ollama:status', listener);
      return () => ipcRenderer.removeListener('ollama:status', listener);
    },
  },
});
