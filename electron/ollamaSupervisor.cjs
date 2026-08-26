const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');

const DEFAULT_BASE_URL = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'qwen2.5-coder:3b';
const CLI_DOWNLOAD_URL = 'https://ollama.com/download/ollama-windows-amd64.zip';
const HEALTH_TIMEOUT_MS = 2_500;
const REQUEST_TIMEOUT_MS = 30_000;
const START_TIMEOUT_MS = 30_000;

function cleanString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function isWindows() {
  return process.platform === 'win32';
}

function isExecutable(filePath) {
  return Boolean(filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile());
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function quotePowerShell(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

class OllamaSupervisor extends EventEmitter {
  constructor({ baseUrl = DEFAULT_BASE_URL, model = DEFAULT_MODEL, userDataPath, runtimeDir, modelDir, runtimePath }) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.userDataPath = userDataPath;
    const hasConfiguredRuntimeDir = Boolean(runtimeDir && runtimeDir.trim());
    this.runtimeDir = cleanString(runtimeDir, path.join(userDataPath, 'ollama'));
    this.runtimePath = cleanString(runtimePath || process.env.REACTLAB_OLLAMA_BIN);
    this.modelDir = cleanString(modelDir || process.env.REACTLAB_OLLAMA_MODELS || process.env.OLLAMA_MODELS, '');
    if (!this.modelDir) {
      const runtimePath = this.findRuntimePath();
      const siblingModelDir = runtimePath
        ? path.resolve(path.dirname(runtimePath), '..', 'OllamaModels')
        : '';
      const candidates = [siblingModelDir, isWindows() ? 'D:\\AI\\OllamaModels' : '', path.join(userDataPath, 'ollama-models')];
      this.modelDir = candidates.find((candidate) => candidate && fs.existsSync(candidate)) || path.join(userDataPath, 'ollama-models');
    }
    if (!hasConfiguredRuntimeDir && this.runtimePath) {
      this.runtimeDir = path.dirname(this.runtimePath);
    }
    this.child = null;
    this.busy = false;
    this.lastStatus = null;
    this.lastError = '';
  }

  get config() {
    return {
      baseUrl: this.baseUrl,
      model: this.model,
      runtimeDir: this.runtimeDir,
      modelDir: this.modelDir,
      runtimePath: this.runtimePath || null,
    };
  }

  async updatePaths({ runtimeDir, modelDir } = {}) {
    if (this.child) await this.stopOwnedServer();

    if (typeof runtimeDir === 'string' && runtimeDir.trim()) {
      this.runtimeDir = path.resolve(runtimeDir.trim());
    }
    if (typeof modelDir === 'string' && modelDir.trim()) {
      this.modelDir = path.resolve(modelDir.trim());
    }

    this.runtimePath = null;
    const selectedRuntime = path.join(this.runtimeDir, isWindows() ? 'ollama.exe' : 'ollama');
    if (isExecutable(selectedRuntime)) this.runtimePath = selectedRuntime;
    this.lastError = '';
    return this.getStatus();
  }

  candidateRuntimePaths() {
    const localAppData = process.env.LOCALAPPDATA || '';
    const userProfile = process.env.USERPROFILE || os.homedir();
    const rawCandidates = [
      this.runtimePath,
      this.runtimeDir ? path.join(this.runtimeDir, isWindows() ? 'ollama.exe' : 'ollama') : '',
      localAppData ? path.join(localAppData, 'Programs', 'Ollama', isWindows() ? 'ollama.exe' : 'ollama') : '',
      localAppData ? path.join(localAppData, 'Ollama', isWindows() ? 'ollama.exe' : 'ollama') : '',
      userProfile ? path.join(userProfile, '.ollama', isWindows() ? 'ollama.exe' : 'ollama') : '',
      isWindows() ? 'D:\\AI\\Ollama\\ollama.exe' : '',
    ];
    return unique(
      rawCandidates
        .filter((item) => typeof item === 'string' && item.trim().length > 0)
        .map((candidate) => path.normalize(candidate.trim()))
    );
  }

  findRuntimePath() {
    const found = this.candidateRuntimePaths().find(isExecutable);
    if (found) {
      this.runtimePath = found;
      return found;
    }
    return null;
  }

  async request(endpoint, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Ollama returned HTTP ${response.status}`);
      }
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  async readTags() {
    try {
      const response = await this.request('/api/tags', { method: 'GET' }, HEALTH_TIMEOUT_MS);
      const data = await response.json();
      const models = Array.isArray(data.models) ? data.models : [];
      return { available: true, models };
    } catch (error) {
      this.emit('log', `[health-check] ${error.name || 'Error'}: ${error.message || 'request failed'}`);
      return { available: false, models: [] };
    }
  }

  modelIsInstalled(models) {
    return models.some((item) => item?.name === this.model || item?.model === this.model);
  }

  deriveState({ runtimeInstalled, serverRunning, modelInstalled }) {
    if (this.busy) return this.lastStatus || 'starting';
    if (!runtimeInstalled && !serverRunning) return 'not-installed';
    if (!serverRunning) return 'installed-stopped';
    if (!modelInstalled) return 'running-no-model';
    return 'ready';
  }

  statusPayload(overrides = {}) {
    return {
      ok: true,
      status: this.lastStatus || 'not-installed',
      runtimeInstalled: Boolean(this.findRuntimePath()),
      runtimePath: this.runtimePath || null,
      serverRunning: Boolean(this.child) || Boolean(overrides.serverRunning),
      ownedProcess: Boolean(this.child),
      modelInstalled: overrides.modelInstalled ?? null,
      model: this.model,
      modelDir: this.modelDir,
      runtimeDir: this.runtimeDir,
      baseUrl: this.baseUrl,
      progress: overrides.progress || null,
      message: overrides.message || this.lastError || '',
      ...overrides,
    };
  }

  publish(payload) {
    this.lastStatus = payload.status || this.lastStatus;
    this.emit('status', payload);
    return payload;
  }

  async getStatus() {
    const runtimePath = this.findRuntimePath();
    const tags = await this.readTags();
    const modelInstalled = tags.available ? this.modelIsInstalled(tags.models) : null;
    const status = this.deriveState({
      runtimeInstalled: Boolean(runtimePath),
      serverRunning: tags.available,
      modelInstalled: Boolean(modelInstalled),
    });
    return this.publish(this.statusPayload({
      status,
      runtimeInstalled: Boolean(runtimePath),
      runtimePath,
      serverRunning: tags.available,
      modelInstalled,
      models: tags.models.map((item) => item?.name || item?.model).filter(Boolean),
    }));
  }

  async ensureDirectories() {
    await fsp.mkdir(this.runtimeDir, { recursive: true });
    await fsp.mkdir(this.modelDir, { recursive: true });
  }

  async runPowerShell(command) {
    return new Promise((resolve, reject) => {
      const child = spawn('powershell.exe', [
        '-NoLogo',
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        command,
      ], {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
      child.once('error', reject);
      child.once('close', (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(stderr.trim() || `PowerShell exited with code ${code}`));
      });
    });
  }

  async downloadRuntime() {
    if (!isWindows()) {
      throw new Error('Automatic Ollama installation currently supports Windows only.');
    }

    const existing = this.findRuntimePath();
    if (existing) return existing;

    await this.ensureDirectories();
    this.busy = true;
    this.lastError = '';
    this.publish(this.statusPayload({
      status: 'installing',
      runtimeInstalled: false,
      progress: { phase: 'runtime', percent: 0 },
      message: 'Downloading the local Ollama runtime…',
    }));

    const zipPath = path.join(this.runtimeDir, 'ollama-windows-amd64.zip');
    try {
      const response = await fetch(CLI_DOWNLOAD_URL);
      if (!response.ok || !response.body) {
        throw new Error(`Could not download Ollama (HTTP ${response.status}).`);
      }
      const total = Number(response.headers.get('content-length')) || 0;
      const reader = response.body.getReader();
      const file = await fsp.open(zipPath, 'w');
      let completed = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await file.write(value);
          completed += value.byteLength;
          this.publish(this.statusPayload({
            status: 'installing',
            progress: {
              phase: 'runtime',
              completed,
              total,
              percent: total ? Math.round((completed / total) * 100) : null,
            },
            message: 'Downloading the local Ollama runtime…',
          }));
        }
      } finally {
        await file.close();
      }

      this.publish(this.statusPayload({
        status: 'installing',
        progress: { phase: 'runtime-extract', percent: 0 },
        message: 'Extracting the local Ollama runtime…',
      }));
      await this.runPowerShell(`Expand-Archive -LiteralPath ${quotePowerShell(zipPath)} -DestinationPath ${quotePowerShell(this.runtimeDir)} -Force`);
      const runtimePath = this.findRuntimePath();
      if (!runtimePath) throw new Error('Ollama was extracted, but ollama.exe was not found.');
      this.runtimePath = runtimePath;
      return runtimePath;
    } catch (error) {
      this.lastError = error.message;
      this.publish(this.statusPayload({ status: 'error', message: error.message }));
      throw error;
    } finally {
      this.busy = false;
      try { await fsp.rm(zipPath, { force: true }); } catch { /* cleanup is best effort */ }
    }
  }

  async waitForServer() {
    const deadline = Date.now() + START_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const tags = await this.readTags();
      if (tags.available) return tags;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error('Ollama did not become ready within 30 seconds.');
  }

  async startServer() {
    const existing = await this.readTags();
    if (existing.available) {
      const modelInstalled = this.modelIsInstalled(existing.models);
      return this.publish(this.statusPayload({
        status: modelInstalled ? 'ready' : 'running-no-model',
        serverRunning: true,
        modelInstalled,
        models: existing.models.map((item) => item?.name || item?.model).filter(Boolean),
        message: 'Ollama is already running.',
      }));
    }

    const runtimePath = this.findRuntimePath();
    if (!runtimePath) {
      return this.publish(this.statusPayload({
        status: 'not-installed',
        serverRunning: false,
        message: 'Install the local Ollama runtime first.',
      }));
    }

    if (this.child) return this.getStatus();

    await this.ensureDirectories();
    this.busy = true;
    this.lastError = '';
    this.publish(this.statusPayload({ status: 'starting', progress: null, message: 'Starting the local mentor runtime…' }));

    const runtimeBinDir = path.dirname(runtimePath);
    const childEnv = {
      ...process.env,
      PATH: `${path.join(runtimeBinDir, 'lib', 'ollama')};${runtimeBinDir};${process.env.PATH || ''}`,
      OLLAMA_HOST: this.baseUrl,
      OLLAMA_MODELS: this.modelDir,
      OLLAMA_NO_CLOUD: '1',
      OLLAMA_NUM_PARALLEL: '1',
    };

    const child = spawn(runtimePath, ['serve'], {
      cwd: runtimeBinDir,
      env: childEnv,
      windowsHide: true,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    this.child = child;
    child.stdout.on('data', (chunk) => this.emit('log', chunk.toString()));
    child.stderr.on('data', (chunk) => this.emit('log', chunk.toString()));
    child.once('error', (error) => {
      this.lastError = error.message;
      this.emit('error', error);
    });
    child.once('exit', () => {
      const owned = this.child === child;
      if (owned) this.child = null;
      if (owned && !this.busy) {
        this.publish(this.statusPayload({ status: 'error', serverRunning: false, message: 'The local Ollama runtime stopped unexpectedly.' }));
      }
    });

    try {
      const tags = await this.waitForServer();
      const modelInstalled = this.modelIsInstalled(tags.models);
      return this.publish(this.statusPayload({
        status: modelInstalled ? 'ready' : 'running-no-model',
        serverRunning: true,
        modelInstalled,
        models: tags.models.map((item) => item?.name || item?.model).filter(Boolean),
        message: 'The local Ollama runtime is running in the background.',
      }));
    } catch (error) {
      if (this.child === child) this.child = null;
      try { child.kill(); } catch { /* best effort */ }
      this.lastError = error.message;
      this.publish(this.statusPayload({ status: 'error', serverRunning: false, message: error.message }));
      throw error;
    } finally {
      this.busy = false;
    }
  }

  async downloadModel() {
    await this.startServer();
    const tags = await this.readTags();
    if (!tags.available) throw new Error('Ollama is not reachable.');
    if (this.modelIsInstalled(tags.models)) return this.getStatus();

    this.busy = true;
    this.lastError = '';
    this.publish(this.statusPayload({
      status: 'downloading-model',
      serverRunning: true,
      modelInstalled: false,
      progress: { phase: 'model', percent: 0 },
      message: `Downloading ${this.model}…`,
    }));

    try {
      const response = await this.request('/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, stream: true }),
      }, 10 * 60 * 1000);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Ollama returned no model-download stream.');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          let event;
          try { event = JSON.parse(line); } catch { continue; }
          const total = Number(event.total) || 0;
          const completed = Number(event.completed) || 0;
          this.publish(this.statusPayload({
            status: 'downloading-model',
            serverRunning: true,
            modelInstalled: false,
            progress: {
              phase: 'model',
              percent: total ? Math.round((completed / total) * 100) : null,
              completed,
              total,
              status: event.status || '',
            },
            message: event.status || `Downloading ${this.model}…`,
          }));
        }
      }
      const finalTags = await this.readTags();
      const modelInstalled = this.modelIsInstalled(finalTags.models);
      if (!modelInstalled) throw new Error(`Ollama finished without listing ${this.model}.`);
      return this.publish(this.statusPayload({
        status: 'ready',
        serverRunning: true,
        modelInstalled: true,
        models: finalTags.models.map((item) => item?.name || item?.model).filter(Boolean),
        progress: { phase: 'model', percent: 100 },
        message: `${this.model} is ready.`,
      }));
    } catch (error) {
      this.lastError = error.message;
      this.publish(this.statusPayload({ status: 'error', message: error.message }));
      throw error;
    } finally {
      this.busy = false;
    }
  }

  async setup() {
    if (this.busy) return this.getStatus();

    try {
      let status = await this.getStatus();
      if (!status.runtimeInstalled) {
        this.publish(this.statusPayload({
          status: 'installing',
          progress: { phase: 'runtime', percent: 0 },
          message: 'Preparing the local mentor runtime…',
        }));
        await this.downloadRuntime();
        status = await this.getStatus();
      }

      if (!status.serverRunning) {
        status = await this.startServer();
      }
      if (!status.serverRunning) {
        throw new Error('The local mentor runtime could not be started.');
      }

      if (!status.modelInstalled) {
        status = await this.downloadModel();
      }
      return status;
    } catch (error) {
      this.lastError = error.message;
      this.publish(this.statusPayload({ status: 'error', message: error.message }));
      throw error;
    }
  }

  async stopOwnedServer() {
    if (!this.child) return this.getStatus();
    const child = this.child;
    this.child = null;
    this.busy = true;
    try {
      child.kill();
      await new Promise((resolve) => child.once('exit', resolve));
    } catch {
      /* best effort: the OS will clean up the child with the app */
    } finally {
      this.busy = false;
    }
    return this.publish(this.statusPayload({ status: 'installed-stopped', serverRunning: false, message: 'The local Ollama runtime is stopped.' }));
  }

  async close() {
    if (!this.child) return;
    const child = this.child;
    this.child = null;
    try { child.kill(); } catch { /* best effort */ }
  }
}

module.exports = {
  OllamaSupervisor,
  DEFAULT_MODEL,
  DEFAULT_BASE_URL,
  CLI_DOWNLOAD_URL,
};
