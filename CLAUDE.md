# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ReactLab — an offline-first desktop app (Electron + Vite + React 19) that teaches React through 84 lessons. Each lesson is markdown prose plus a live Sandpack playground, a graded challenge, step-by-step walkthroughs, and learning checks. An optional AI mentor runs against a **locally supervised Ollama instance** — no cloud calls anywhere in the app.

## Commands

`node_modules` is not checked in; run `npm install` before anything else.

```bash
npm run dev              # Vite dev server on http://localhost:5180 (strictPort)
npm run electron:dev     # Vite + Electron shell together
npm run build            # Production bundle to dist/ (base: './' for file:// loading)
npm run package:win      # build + electron-builder → release/

npm test                 # vitest run (node environment)
npm run test:watch
npx vitest run src/lib/__tests__/progression.test.js   # one file
npx vitest run -t "keeps the first lesson unlocked"    # one test by name

npm run validate:curriculum   # structural + consistency checks; exits 1 on error
node scripts/audit-walkthroughs.mjs   # walkthrough highlightLines / solution alignment (no npm script)
npm run audit:pedagogy        # teaching-quality defect counts; --strict to gate, --json for a worklist
npm run audio:manifest        # regenerate src/curriculum/audioManifest.json from public/audio
node scripts/generate-english-audio.mjs   # msedge-tts narration → public/audio (not committed)

npx oxlint src            # oxlint is a devDependency but has no npm script or config file
```

Vitest uses `globals: false` — import `describe`/`it`/`expect` from `vitest` explicitly. Tests are `src/**/*.test.{js,jsx}` and `src/**/__tests__/**`; they run in `node`, so anything touching `localStorage`/`document` must guard for its absence (see `src/lib/exampleEditCache.js`).

**Run `npm run validate:curriculum` after any curriculum edit.** It is the only thing that catches the cross-file drift described below.

## Curriculum data model

Lesson content is data, not files-per-lesson. Three layers must stay in sync:

1. `src/curriculum/index.js` — the registry: module id/title/description/icon plus an ordered lesson id+title list, and `TOTAL_LESSONS`.
2. `src/curriculum/modules/<moduleId>.js` — the full payload for that module's lessons.
3. `src/curriculum/registry.js` — static `MODULES_MAP` import table; `getModuleData(moduleId)`.

The lesson **sequence in `index.js` must match the payload's lesson order exactly** (validated), and lesson ids are globally unique. Adding a module means touching all three files.

A lesson object carries: `content` (markdown lecture), `starterCode`, `solutionCode`, `exampleWalkthrough` and `walkthrough` (`{ code, steps: [{ highlightLines, description, stateSnapshot }] }`), `insights[]` (each with its own walkthrough), and optional `dependencies`.

Side tables keyed by lesson id live alongside: `validators.js`, `learningChecks.js` (+ `learningCheckExtensions.js`), `lessonEnhancements.js` (+ `…Extended.js`), `moduleOverviews.js`, `motivationalMessages.js`, `audioManifest.json`. Keys referencing an unknown lesson id are a validation failure.

### Markdown is a contract

`src/lib/lessonContent.js#parseLessonContent` splits one lesson's markdown into the pieces the UI renders separately. The section headings it recognizes are load-bearing:

- `### Hints` — bullet list, moved into the hint UI (legacy `*Hint: …*` inline form still parsed).
- `### Your Task` / `### Challenge` / `### Challenge and Solution` — challenge brief; a `**Solution:**` block inside it becomes the solution explanation.
- `### Example` — the fenced code block becomes `executableExample`, the Sandpack playground. **Only this spelling** (a test enforces it); the section is stripped from the prose so it isn't rendered twice.

Two invariants the validator enforces as hard errors:
- `executableExample` must equal `exampleWalkthrough.code` **character for character** — the playground and the step-by-step must run the same program.
- Every lesson needs an `exampleWalkthrough`.

It also warns when the playground is the challenge solution verbatim (opening the lesson would spoil it), and when a challenge lesson has no validator.

### Validators

`src/curriculum/validators.js` maps lesson id → either an array of `{ message, test(code, files) }` rules or `{ rules, requiresObservation, runtimeTests }`. Tests receive comment-stripped code; `clean()` additionally strips whitespace, so patterns are written without spaces (`/consthandleSubmit=/`). Structural checks prefer the acorn/acorn-jsx helpers in `src/curriculum/ast.js` (`parseAST`, `hasHookCall`, `hasJSXAttribute`, `findNode`, position-aware `collect`/`effectRanges`) over regex when position or nesting matters.

The same rules are graded in two places: `CodeActions.jsx` (live challenge — **all** rules must pass) and `ReviewDashboard.jsx` (from-memory code recall — also all-or-nothing, deliberately unlike the partial-credit prose grading in that file). `runtimeTests` are executed against the live preview iframe by `src/lib/runtimeTestHarness.js`.

## Runtime architecture

**Routing/shell** — `App.jsx` mounts a splash screen driven by `src/lib/warmup.js` (pre-warms Babel, Prettier, and every curriculum module so navigation is instant), then a router **chosen by protocol**: `BrowserRouter` over http (dev server), `HashRouter` over `file:` (the packaged app). This is not cosmetic — under `file:` `location.pathname` is the bundle's own path (`/C:/…/dist/index.html`), which matches no route, so a `BrowserRouter` build opens straight onto `NotFound` and every navigation stays there. `main.cjs` already loads detached windows with `loadFile(..., { hash })`, which only a hash router can read. `/detached/:type/:moduleId/:lessonId` deliberately sits *outside* `AppLayout`: it is what a popped-out Electron window loads.

**Sandpack** — `src/components/lesson/useLessonSandpack.js` is the single place that decides a lesson's file map, tab order, active file, and dependencies. It picks `/App.tsx` vs `/App.js` from a TypeScript heuristic, adds `/styles.css`, and layers the learner's saved edits over the lesson's own files *only* (the Sandpack react template contributes its own placeholder `/App.js`; restoring the cache wholesale is what once made lessons open on "Hello world"). `isRunnable` hides the preview for lessons that cannot run: no `export default`, or a test file (one importing a testing library, or calling `test`/`it`/`describe` at top level — `rtl-basics` exports the component under test *and* is a test file, so the export check alone let it through and its preview died on a missing `@testing-library` import). React 19 is pinned into `customSetup`; **any lesson importing a third-party package must declare it in `lesson.dependencies`** or the bundle fails to resolve.

`SandpackBridges.jsx` holds render-nothing components that live inside `<SandpackProvider>` purely to read its context: `SandpackCacher` (persist edits), `SandpackContextReporter` (feed code + runtime error to the mentor), `SandpackCssFormatter`. Learner edits persist through `src/lib/exampleEditCache.js` (in-memory Map read path, localStorage write-through, LRU cap 60).

**Preview: two bundlers** — Sandpack loads its bundler from `https://<version>-sandpack.codesandbox.io/`, so it needs the network. `src/components/lesson/AdaptivePreview.jsx` is what all three preview sites render: it probes reachability once per session (`src/lib/bundlerReachability.js`) and falls back to the local bundler, showing an "Offline preview — running locally" strip. Keep it inside `<SandpackProvider>` — it reads the learner's live files from Sandpack context.

**Local bundler** — `src/lib/localBundler.js` transpiles with `@babel/standalone` and builds a self-contained sandbox document: a CommonJS module map plus a `require` shim, mounted like Sandpack's react template (StrictMode included — `debug-strict-mode` depends on the double invocation). Four constraints are load-bearing and each cost a silent failure to find:

- **Automatic JSX runtime only.** Lesson code imports hooks without importing React, so the classic runtime's bare `React.createElement` throws `ReferenceError`.
- **`react-dom` and `react-dom/client` are different modules.** `createPortal` is on the former, `createRoot` on the latter; mapping both to the client entry made `portals` render nothing, silently.
- **`createRoot` needs `onUncaughtError`.** React reports render-phase failures through it rather than by throwing, so without it a component that dies mid-render leaves an empty `#root` and no message.
- **The sandbox is `about:srcdoc`**, whose pathname is the literal string `"srcdoc"` and whose URL the browser refuses to rewrite. History routers match nothing there, so `BrowserRouter`/`createBrowserRouter` are aliased to their memory equivalents; and `.css` imports resolve to `{}`, since stylesheets are injected into the head.

Every package a lesson declares in `dependencies` must appear in `BUILTIN_MODULES` or that lesson cannot run offline. The testing packages are deliberately absent — `isRunnable` hides the preview for test-file lessons.

**Dev-only playground files** — `src/playground/<moduleId>/<lessonId>/App.jsx` are curated starter files served by the Vite middleware in `vite.config.js` at `/api/playground/<moduleId>/<lessonId>` and fetched by `ChallengeModal.jsx` under `import.meta.env.DEV`. Editing them triggers a custom `playground-update` HMR event. The path form matters — a query string falls through Vite's SPA fallback and silently returns HTML.

**State** — two Zustand stores, both `persist`ed: `useProgressStore` (key `reactlab_progress`: completions, per-lesson `lessonState`, SM-2-style review scheduling in `recordReview`, append-only `calibrationLog` capped at 200, manual export/import) and `useUIStore` (sidebar, zen mode, sound, mentor conversations/drafts per lesson). Progress lives only in localStorage — no sync, no server. A `storage` event listener rehydrates across detached windows.

> **Recurring bug — read before writing a selector.** Zustand 5 uses `useSyncExternalStore` referential equality. A selector returning a fresh literal (`state.lessonState?.[id] || {}`) never equals the previous snapshot and renders forever. Select the raw value and `useMemo` it against a module-level `EMPTY_*` singleton — see the headers of `LessonView.jsx` and `CodeActions.jsx`.

**Gating** — `src/lib/progression.js` flattens the curriculum into `ALL_ORDERED_LESSONS` and enforces strictly linear unlocking (lesson N needs lesson N−1 complete), overridable by the `unlockAllLessons` UI flag. It also computes weak-prerequisite signals shared with Review Lab's priority scoring.

## Electron layer

`electron/main.cjs` (main) ↔ `electron/preload.cjs` (narrow `window.electronAPI` bridge — window controls, detached windows, `mentor.*`, `ollama.*`) ↔ renderer. The renderer never gets shell, filesystem, or arbitrary IPC access; keep it that way when adding IPC.

`electron/ollamaSupervisor.cjs` is an EventEmitter that locates or downloads an Ollama runtime, resolves a model directory, spawns and health-checks the server, pulls the model, and streams status to the renderer. Defaults: `http://127.0.0.1:11434`, model `qwen2.5-coder:3b`; runtime download is Windows-only. Overrides: `REACTLAB_OLLAMA_URL`, `REACTLAB_OLLAMA_MODEL`, `REACTLAB_OLLAMA_BIN`, `REACTLAB_OLLAMA_MODELS`; user-chosen paths persist to `ollama-config.json` in `app.getPath('userData')`.

**App icon** — `build/icon.svg` is the master art; `npm run icon` (`scripts/generate-icon.cjs`) rasterizes it and writes `build/icon.ico` (16/24/32/48/64 as DIBs, 128/256 as PNG entries), `build/icon.png`, and `public/favicon.svg`. Edit the SVG and re-run — never hand-edit the rasters. The repo has no image library, so the script rasterizes by loading the SVG in an **offscreen** Electron window and keeping the last `paint` frame: `capturePage()` on a hidden window returns blank on Windows, and the first paint is Chromium's empty pre-render frame. `build/` is otherwise gitignored; the three icon files are negated back in. electron-builder keeps `build/` (its buildResources dir) out of the asar, so `APP_ICON` in `main.cjs` is dev-only — packaged windows inherit the .exe icon.

The mentor system prompt lives in `main.cjs`, along with input clamping (`MAX_QUESTION_CHARS`, `MAX_CONTEXT_CHARS`, last 8 history messages). In a plain browser `window.electronAPI` is absent — mentor and window-control features must degrade, not throw.

## Styling

No Tailwind, no CSS-in-JS library. Design tokens are CSS custom properties in `src/index.css` (`--bg-*`, `--text-*`, `--accent-*`, `--font-*`); shared classes live in `src/styles/components.css`, which is the **sole owner** of sidebar rules (duplicated selectors across both files previously merged per-property into a layout neither described). Component-local one-offs are inline styles. Prefer extending `components.css` over adding a third stylesheet.

## Conventions

- Several long-lived files carry a version-history comment header (`// v5 — 2026-08-18 — <what changed and why>`) above the imports. If a file has one, prepend a new line when you change its behavior.
- Comments here explain *why*, often naming the bug a line prevents. Preserve them; they are the only record of several non-obvious constraints.
- `.gitattributes` normalizes everything to LF. A few files carry a UTF-8 BOM — leave it rather than producing a whole-file diff.
- Audio narration (`public/audio/*.mp3`) is generated, not committed; `audioManifest.json` records expected-vs-present counts per lesson and is currently all-zero for `present`.
