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

// Ollama stores every pulled model as manifests/<registry>/<namespace>/<name>/<tag>,
// so a model folder can be read without a running server. That matters here: the
// status card used to report "model not downloaded" for a model sitting on disk,
// because the only thing it ever asked was /api/tags.
const LIBRARY_REGISTRIES = new Set(['registry.ollama.ai', 'ollama.com']);

// `qwen2.5-coder` and `qwen2.5-coder:latest` are the same model to Ollama.
function normalizeModelName(name) {
  const value = cleanString(name);
  if (!value) return '';
  return value.includes(':') ? value : `${value}:latest`;
}

function manifestPathToModelName(segments) {
  if (segments.length < 3) return '';
  const [registry, ...rest] = segments;
  const tag = rest.pop();
  const namespace = rest.shift();
  const name = [...rest].join('/');
  const bare = name ? `${namespace}/${name}` : namespace;
  const shortName = LIBRARY_REGISTRIES.has(registry) && namespace === 'library' ? name || namespace : bare;
  const prefix = LIBRARY_REGISTRIES.has(registry) ? '' : `${registry}/`;
  return `${prefix}${shortName}:${tag}`;
}

async function walkFiles(dir, depth = 0, maxDepth = 6) {
  if (depth > maxDepth) return [];
  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const found = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await walkFiles(full, depth + 1, maxDepth));
    else if (entry.isFile()) found.push(full);
  }
  return found;
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
      const homeModelDir = path.join(process.env.USERPROFILE || os.homedir(), '.ollama', 'models');
      const fallback = path.join(userDataPath, 'ollama-models');
      const candidates = unique([
        siblingModelDir,
        homeModelDir,
        isWindows() ? 'D:\\AI\\OllamaModels' : '',
        fallback,
      ]).filter((candidate) => fs.existsSync(candidate));
      // A folder that already holds manifests wins over one that merely exists:
      // an empty sibling folder used to shadow the real model store.
      this.modelDir = candidates.find((candidate) => fs.existsSync(path.join(candidate, 'manifests')))
        || candidates[0]
        || fallback;
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
      isWindows() ? path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Ollama', 'ollama.exe') : '',
      isWindows() ? 'D:\\AI\\Ollama\\ollama.exe' : '',
      // Anything already on PATH: an Ollama installed by winget/scoop/a package
      // manager lands somewhere none of the fixed guesses above cover.
      ...String(process.env.PATH || '')
        .split(path.delimiter)
        .filter(Boolean)
        .map((entry) => path.join(entry.trim(), isWindows() ? 'ollama.exe' : 'ollama')),
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
    const wanted = normalizeModelName(this.model);
    return models.some((item) => {
      const candidates = typeof item === 'string' ? [item] : [item?.name, item?.model];
      return candidates.some((candidate) => normalizeModelName(candidate) === wanted);
    });
  }

  // Read the model folder directly. Used both when no server is running and to
  // surface models the running server does not serve (its OLLAMA_MODELS may differ).
  async scanModelDirectory(dir = this.modelDir) {
    const manifestRoot = dir ? path.join(dir, 'manifests') : '';
    if (!manifestRoot || !fs.existsSync(manifestRoot)) return [];
    const files = await walkFiles(manifestRoot);
    const found = [];
    for (const file of files) {
      const segments = path.relative(manifestRoot, file).split(path.sep).filter(Boolean);
      const name = manifestPathToModelName(segments);
      if (!name) continue;
      let size = 0;
      try {
        const manifest = JSON.parse(await fsp.readFile(file, 'utf8'));
        const layers = Array.isArray(manifest.layers) ? manifest.layers : [];
        size = layers.reduce((total, layer) => total + (Number(layer?.size) || 0), 0)
          + (Number(manifest?.config?.size) || 0);
      } catch {
        continue; // not a manifest: ignore stray files under manifests/
      }
      found.push({ name, size });
    }
    return found;
  }

  // The union of what the server serves and what the model folder holds, so the
  // settings card can offer every model this machine actually has.
  async listModels() {
    const tags = await this.readTags();
    return this.mergeModels(tags.models, await this.scanModelDirectory());
  }

  mergeModels(serverModels, diskModels) {
    const merged = new Map();
    for (const item of serverModels) {
      const name = cleanString(item?.name || item?.model);
      if (!name) continue;
      merged.set(normalizeModelName(name), {
        name,
        size: Number(item?.size) || 0,
        parameterSize: cleanString(item?.details?.parameter_size),
        quantization: cleanString(item?.details?.quantization_level),
        family: cleanString(item?.details?.family),
        source: 'server',
      });
    }
    for (const item of diskModels) {
      const key = normalizeModelName(item.name);
      const existing = merged.get(key);
      if (existing) {
        existing.source = 'both';
        if (!existing.size) existing.size = item.size;
      } else {
        merged.set(key, { name: item.name, size: item.size, parameterSize: '', quantization: '', family: '', source: 'disk' });
      }
    }
    return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async setModel(model) {
    const next = cleanString(model);
    if (!next) throw new Error('Choose a model name first.');
    this.model = next;
    this.lastError = '';
    return this.getStatus();
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
      modelOnDisk: overrides.modelOnDisk ?? null,
      availableModels: overrides.availableModels || [],
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
    const diskModels = await this.scanModelDirectory();
    const availableModels = this.mergeModels(tags.models, diskModels);
    const modelOnDisk = this.modelIsInstalled(diskModels);
    // While the server is up, "installed" means "this server serves it" -- a model
    // sitting in the configured folder is useless to a server pointed elsewhere.
    const modelInstalled = tags.available ? this.modelIsInstalled(tags.models) : modelOnDisk;
    const status = this.deriveState({
      runtimeInstalled: Boolean(runtimePath),
      serverRunning: tags.available,
      modelInstalled: Boolean(modelInstalled),
    });
    // The confusing case worth naming: an Ollama the app did not start is holding
    // the port with a different OLLAMA_MODELS, so a model that is plainly on disk
    // never shows up in /api/tags.
    const strandedOnDisk = tags.available && !modelInstalled && modelOnDisk && !this.child;
    return this.publish(this.statusPayload({
      status,
      runtimeInstalled: Boolean(runtimePath),
      runtimePath,
      serverRunning: tags.available,
      externalServer: tags.available && !this.child,
      modelInstalled,
      modelOnDisk,
      availableModels,
      models: availableModels.map((item) => item.name),
      message: strandedOnDisk
        ? `${this.model} is in ${this.modelDir}, but the Ollama server already running on ${this.baseUrl} serves a different model folder. Pick one of its models below, or close that Ollama so ReactLab can start its own.`
        : this.lastError,
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
