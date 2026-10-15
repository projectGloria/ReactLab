const { app, BrowserWindow, shell, session, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const { OllamaSupervisor, DEFAULT_MODEL, DEFAULT_BASE_URL } = require('./ollamaSupervisor.cjs');
const {
  cleanText,
  cleanHistory,
  buildUserPrompt,
  MAX_CONTEXT_CHARS,
  LOCAL_CONTEXT_CHARS,
} = require('./mentorPrompt.cjs');

// A dev run is "electron.exe", so its windows would wear Electron's own icon.
// Packaged windows inherit the .exe icon and need nothing here -- electron-builder
// keeps build/ (its buildResources dir) out of the asar, so the file is absent
// there and `icon` must stay undefined rather than point at a missing path.
const devIcon = path.join(__dirname, '..', 'build', 'icon.ico');
const APP_ICON = fs.existsSync(devIcon) ? devIcon : undefined;
const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const OLLAMA_BASE_URL = process.env.REACTLAB_OLLAMA_URL || DEFAULT_BASE_URL;
const DEFAULT_MENTOR_MODEL = process.env.REACTLAB_OLLAMA_MODEL || DEFAULT_MODEL;
const REQUEST_TIMEOUT_MS = 120_000;
const MAX_QUESTION_CHARS = 8_000;

let mainWindow = null;
let ollamaSupervisor = null;
let savedOllamaConfig = {};

function getOllamaConfigPath() {
  return path.join(app.getPath('userData'), 'ollama-config.json');
}

async function loadOllamaConfig() {
  try {
    const raw = await fsp.readFile(getOllamaConfigPath(), 'utf8');
    const parsed = JSON.parse(raw);
    savedOllamaConfig = {
      runtimeDir: typeof parsed.runtimeDir === 'string' ? parsed.runtimeDir : undefined,
      modelDir: typeof parsed.modelDir === 'string' ? parsed.modelDir : undefined,
      model: typeof parsed.model === 'string' ? parsed.model : undefined,
    };
  } catch {
    savedOllamaConfig = {};
  }
}

async function saveOllamaConfig(patch) {
  const next = { ...savedOllamaConfig };
  for (const key of ['runtimeDir', 'modelDir', 'model']) {
    if (!(key in patch)) continue;
    next[key] = typeof patch[key] === 'string' && patch[key].trim() ? patch[key].trim() : undefined;
  }
  savedOllamaConfig = next;
  await fsp.mkdir(path.dirname(getOllamaConfigPath()), { recursive: true });
  await fsp.writeFile(getOllamaConfigPath(), JSON.stringify(savedOllamaConfig, null, 2), 'utf8');
}

// Fallback only: the renderer sends the learner's own persona text with every
// question. Kept word-for-word in sync with DEFAULT_MENTOR_PROMPT in
// src/lib/mentorPersonas.js, which is the copy Settings shows and edits.
const MENTOR_SYSTEM_PROMPT = `You are the ReactLab Mentor, a patient and precise React and JavaScript tutor built into an offline course app. The learner is in the middle of a lesson; the lesson text, their current code, and any runtime error are attached automatically when available.

How to answer:
1. Match the size of the question. Greetings and small talk get one friendly sentence, not a lecture. A direct question gets a direct answer, usually under 150 words.
2. Lead with the mental model in a sentence or two ("state is a snapshot taken per render", "effects run after paint"), then give the specific fix.
3. When the learner is stuck on a challenge, give the next hint rather than the finished solution. Hand over the full solution only if they ask for it or have already tried and failed twice.
4. Use the learner's own component and variable names. When their code is attached, point at the exact line or expression that is wrong instead of rewriting the file for them.
5. Keep code blocks minimal: the smallest snippet that shows the change. No unrelated refactors, no renaming, no extra scaffolding.
6. If a runtime error is attached, explain what the error message itself means before fixing it, so the learner can read the next one alone.
7. Teach current React (19.x) and modern JavaScript: function components, hooks, Actions, Suspense. Mention legacy patterns only to contrast them.
8. If you are unsure, or the question goes past the lesson, say so in one line and answer what you can. Never invent an API or a prop.`;


function getSupervisor() {
  if (!ollamaSupervisor) {
    ollamaSupervisor = new OllamaSupervisor({
      baseUrl: OLLAMA_BASE_URL,
      model: savedOllamaConfig.model || DEFAULT_MENTOR_MODEL,
      userDataPath: app.getPath('userData'),
      runtimeDir: savedOllamaConfig.runtimeDir,
      modelDir: savedOllamaConfig.modelDir,
    });
    ollamaSupervisor.on('status', (status) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('ollama:status', status);
      }
    });
    ollamaSupervisor.on('log', (line) => {
      if (isDev) console.debug('[ollama]', line.trim());
    });
    ollamaSupervisor.on('error', (error) => {
      console.error('[ollama]', error);
    });
  }
  return ollamaSupervisor;
}

async function ollamaRequest(endpoint, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const raw = await response.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const detail = data?.error || raw || `Ollama returned HTTP ${response.status}`;
      throw new Error(detail);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

ipcMain.handle('ollama:get-status', async () => {
  try {
    return await getSupervisor().getStatus();
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('ollama:install-runtime', async () => {
  try {
    const supervisor = getSupervisor();
    await supervisor.downloadRuntime();
    return await supervisor.getStatus();
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('ollama:setup', async () => {
  try {
    return await getSupervisor().setup();
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('ollama:list-models', async () => {
  try {
    const supervisor = getSupervisor();
    return { ok: true, model: supervisor.model, modelDir: supervisor.modelDir, models: await supervisor.listModels() };
  } catch (error) {
    return { ok: false, models: [], error: error.message };
  }
});

ipcMain.handle('ollama:set-model', async (_event, payload = {}) => {
  try {
    const model = typeof payload.model === 'string' ? payload.model.trim() : '';
    if (!model) return { ok: false, error: 'Choose a model first.' };
    await saveOllamaConfig({ model });
    return { ...(await getSupervisor().setModel(model)), modelSaved: true };
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('ollama:pick-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose a folder',
    properties: ['openDirectory', 'createDirectory'],
  });
  return {
    ok: true,
    canceled: result.canceled,
    path: result.canceled ? null : result.filePaths[0] || null,
  };
});

ipcMain.handle('ollama:set-paths', async (_event, payload = {}) => {
  try {
    const runtimeDir = typeof payload.runtimeDir === 'string' ? payload.runtimeDir.trim() : '';
    const modelDir = typeof payload.modelDir === 'string' ? payload.modelDir.trim() : '';
    if (!runtimeDir || !modelDir) return { ok: false, error: 'Choose both a runtime folder and a model folder.' };
    await saveOllamaConfig({ runtimeDir, modelDir });
    const status = await getSupervisor().updatePaths({ runtimeDir, modelDir });
    return { ...status, pathsSaved: true };
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('ollama:reset-paths', async () => {
  try {
    if (ollamaSupervisor) await ollamaSupervisor.close();
    await saveOllamaConfig({ runtimeDir: null, modelDir: null });
    ollamaSupervisor = null;
    return { ...(await getSupervisor().getStatus()), pathsSaved: true };
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('ollama:start', async () => {
  try {
    return await getSupervisor().startServer();
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('ollama:download-model', async () => {
  try {
    return await getSupervisor().downloadModel();
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('ollama:stop', async () => {
  try {
    return await getSupervisor().stopOwnedServer();
  } catch (error) {
    return { ok: false, status: 'error', error: error.message };
  }
});

ipcMain.handle('window:minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
  return { ok: true };
});

ipcMain.handle('window:toggle-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
      return { ok: true, isMaximized: false };
    } else {
      win.maximize();
      return { ok: true, isMaximized: true };
    }
  }
  return { ok: false };
});

ipcMain.handle('window:close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
  return { ok: true };
});

ipcMain.handle('window:is-maximized', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return { ok: true, isMaximized: win ? win.isMaximized() : false };
});

ipcMain.handle('window:open-detached', async (_event, payload = {}) => {
  const { type = 'mentor', urlPath = '', title = 'ReactLab Window', width = 900, height = 750 } = payload;
  const detachedWin = new BrowserWindow({
    width,
    height,
    minWidth: 480,
    minHeight: 400,
    backgroundColor: '#141413',
    icon: APP_ICON,
    title,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  detachedWin.setMenuBarVisibility(false);

  detachedWin.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (isDev) {
    const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:5180';
    detachedWin.loadURL(`${devUrl}${urlPath}`);
  } else {
    detachedWin.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: urlPath.replace(/^#?\/?/, '/'),
    });
  }

  detachedWin.on('closed', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('detached:closed', { type, urlPath });
    }
  });

  return { ok: true };
});

ipcMain.handle('mentor:get-status', async () => {
  try {
    return await getSupervisor().getStatus();
  } catch (error) {
    return {
      ok: true,
      status: 'error',
      available: false,
      serverRunning: false,
      modelInstalled: false,
      defaultModel: savedOllamaConfig.model || DEFAULT_MENTOR_MODEL,
      models: [],
    error: error.message || 'Ollama is not available.',
    };
  }
});

async function requestGeminiStream({ apiKey, prompt, history, onChunk, systemPrompt }) {
  const model = 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const effectiveSystemPrompt = cleanText(systemPrompt, 6_000) || MENTOR_SYSTEM_PROMPT;
  const contents = [
    ...cleanHistory(history).slice(-4).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: [{ text: prompt.slice(0, MAX_CONTEXT_CHARS) }],
    },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: effectiveSystemPrompt }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let errJson = null;
    try { errJson = JSON.parse(errText); } catch {}
    throw new Error(errJson?.error?.message || `Gemini API returned ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response stream from Gemini.');
  const decoder = new TextDecoder();
  let fullText = '';
  let streamBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    streamBuffer += decoder.decode(value, { stream: true });
    const lines = streamBuffer.split('\n');
    streamBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        if (!jsonStr || jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunk) {
            fullText += chunk;
            if (onChunk) onChunk(chunk);
          }
        } catch {}
      }
    }
  }

  return { ok: true, model: 'Gemini 3.6 Flash', content: fullText };
}

async function requestGroq({ apiKey, prompt, history, onChunk, systemPrompt }) {
  let targetModel = 'llama-3.3-70b-versatile';
  const effectiveSystemPrompt = cleanText(systemPrompt, 6_000) || MENTOR_SYSTEM_PROMPT;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  try {
    const listRes = await fetch('https://api.groq.com/openai/v1/models', { headers });
    if (listRes.ok) {
      const listData = await listRes.json();
      const ids = (listData.data || []).map((m) => m.id);
      
      const prioritized = [
        'llama-3.3-70b-versatile',
        'llama-3.1-70b-versatile',
        'llama3-70b-8192',
        'llama-3.1-8b-instant',
        'llama3-8b-8192',
        'gemma2-9b-it',
        'mixtral-8x7b-32768',
      ];

      const found = prioritized.find((p) => ids.includes(p));
      if (found) {
        targetModel = found;
      } else {
        const chatCandidate = ids.find((id) => (
          !id.includes('whisper') &&
          !id.includes('guard') &&
          !id.includes('tts') &&
          !id.includes('orpheus') &&
          !id.includes('vision') &&
          !id.includes('embed')
        ));
        if (chatCandidate) targetModel = chatCandidate;
      }
    }
  } catch (err) {
    console.error('Failed to list Groq models dynamically:', err);
  }

  const messages = [
    { role: 'system', content: effectiveSystemPrompt },
    ...cleanHistory(history).slice(-4),
    { role: 'user', content: prompt.slice(0, MAX_CONTEXT_CHARS) },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: targetModel,
      messages,
      max_tokens: 500,
      temperature: 0.3,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || `Groq returned HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No streaming body from Groq.');
  const decoder = new TextDecoder();
  let fullText = '';
  let streamBuffer = '';
  let emittedLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    streamBuffer += decoder.decode(value, { stream: true });
    const lines = streamBuffer.split('\n');
    streamBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed?.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            
            const visibleText = fullText
              .replace(/<think>[\s\S]*?<\/think>/g, '')
              .replace(/<think>[\s\S]*/g, '')
              .trimStart();

            if (visibleText.length > emittedLength) {
              const newChunk = visibleText.slice(emittedLength);
              emittedLength = visibleText.length;
              if (onChunk && newChunk) {
                onChunk(newChunk);
              }
            }
          }
        } catch {}
      }
    }
  }

  const cleanedFullText = fullText.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/<think>[\s\S]*/g, '').trim();
  return { ok: true, model: `Groq (${targetModel})`, content: cleanedFullText || fullText };
}

async function requestOpenAI({ apiKey, prompt, history, systemPrompt }) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const effectiveSystemPrompt = cleanText(systemPrompt, 6_000) || MENTOR_SYSTEM_PROMPT;
  const messages = [
    { role: 'system', content: effectiveSystemPrompt },
    ...cleanHistory(history),
    { role: 'user', content: prompt },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 600,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI API returned ${response.status}`);
  }
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error('No response received from OpenAI.');
  return { ok: true, model: 'GPT-4o Mini', content: reply };
}

ipcMain.handle('mentor:ask', async (event, payload = {}) => {
  const question = cleanText(payload.question, MAX_QUESTION_CHARS);
  if (!question) return { ok: false, error: 'Ask a question first.' };

  const provider = payload.provider || 'gemini';
  const systemPrompt = cleanText(payload.systemPrompt, 6_000) || MENTOR_SYSTEM_PROMPT;
  const prompt = buildUserPrompt({
    question,
    context: payload.context,
    budget: provider === 'ollama' ? LOCAL_CONTEXT_CHARS : MAX_CONTEXT_CHARS,
    language: payload.language === 'tr' ? 'tr' : 'en',
  });
  const senderWebContents = event.sender;
  const onChunk = (chunk) => {
    if (senderWebContents && !senderWebContents.isDestroyed()) {
      senderWebContents.send('mentor:chunk', chunk);
    }
  };

  // 1. Cloud Providers
  if (provider === 'gemini') {
    const key = payload.apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!key) return { ok: false, error: 'Please enter your Google Gemini API Key in Settings.' };
    try {
      return await requestGeminiStream({ apiKey: key, prompt, history: payload.history, onChunk, systemPrompt });
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  if (provider === 'groq') {
    const key = payload.apiKey?.trim() || process.env.GROQ_API_KEY;
    if (!key) return { ok: false, error: 'Please enter your Groq API Key in Settings.' };
    try {
      return await requestGroq({ apiKey: key, prompt, history: payload.history, onChunk, systemPrompt });
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  if (provider === 'openai') {
    const key = payload.apiKey?.trim() || process.env.OPENAI_API_KEY;
    if (!key) return { ok: false, error: 'Please enter your OpenAI API Key in Settings.' };
    try {
      return await requestOpenAI({ apiKey: key, prompt, history: payload.history, systemPrompt });
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // 2. Offline Ollama Fallback
  const supervisor = getSupervisor();
  const model = cleanText(payload.model, 200) || supervisor.model || DEFAULT_MENTOR_MODEL;
  try {
    let status = await supervisor.getStatus();
    if (!status.serverRunning) {
      status = await supervisor.startServer();
      if (!status.serverRunning) return { ok: false, error: 'The local mentor server could not be started.' };
    }
    if (!status.modelInstalled) {
      return { ok: false, error: `The local mentor is not ready. Install ${model} from Settings first.` };
    }

    const data = await ollamaRequest('/api/chat', {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...cleanHistory(payload.history, { maxMessages: 4, maxChars: 1_200 }),
        { role: 'user', content: prompt.slice(0, LOCAL_CONTEXT_CHARS + 2_000) },
      ],
      options: {
        // The prompt now carries the lesson itself (see buildUserPrompt), which
        // does not fit in the 2048 this used to ask for -- the tail of the
        // lesson, and sometimes the question, fell out of the window. Kept at
        // 6144 rather than 8192 because the KV cache is real memory on the
        // learner's machine, and LOCAL_CONTEXT_CHARS is sized to fit this.
        num_ctx: 6144,
        num_predict: 512,
        temperature: 0.3,
      },
      stream: false,
      keep_alive: '15m',
    });

    return {
      ok: true,
      model: data?.model || model,
      content: cleanText(data?.message?.content, 20_000),
    };
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'The local model took too long to respond.'
      : error.message || 'The local model request failed.';
    return { ok: false, error: message };
  }
});

async function createWindow() {
  if (isDev) {
    try {
      await session.defaultSession.clearCache();
    } catch (error) {
      console.error('Failed to clear cache', error);
    }
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#141413',
    icon: APP_ICON,
    title: 'ReactLab',
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] [${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron] Failed to load URL: ${validatedURL} (Error ${errorCode}: ${errorDescription})`);
  });

  if (isDev) {
    const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:5180';
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await loadOllamaConfig();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (ollamaSupervisor) ollamaSupervisor.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
