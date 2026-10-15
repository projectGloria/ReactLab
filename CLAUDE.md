# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ReactLab is an **offline-first Electron desktop app** that teaches React through 95 data-driven lessons across 21 modules, live Sandpack playgrounds, graded challenges, spaced-repetition review, and an AI mentor (local Ollama or a cloud provider). The renderer is a plain Vite + React 19 SPA; Electron adds a frameless window, detached windows, and the mentor/Ollama IPC surface.

## Commands

```bash
npm run dev                  # Vite dev server on port 5180 (strictPort)
npm run electron:dev         # Vite + Electron shell together
npm run build                # Vite build to dist/
npm run package:win          # build + electron-builder (NSIS + portable) to release/
npm test                     # Vitest, single run
npm run test:watch
npm run validate:curriculum  # the gate that matters — see below
npm run audio:manifest       # regenerate src/curriculum/audioManifest.json
```

Run a single test file or one test:

```bash
npx vitest run src/lib/__tests__/progression.test.js
npx vitest run -t "keeps every prose code block parseable"
```

Linting is `npm run lint` (`oxlint src`; no config file, defaults only). The content audits are `npm run validate:curriculum` and `npm run audit:walkthroughs`. There is no `audit:pedagogy` — an earlier script entry pointed at a file that never existed and has been removed.

Tests run in a `node` environment with `globals: false` — import `describe`/`it`/`expect` from `vitest` explicitly. Only `src/**/*.test.{js,jsx}` and `src/**/__tests__/**` are collected, so the suite covers pure logic and curriculum data, not rendered components.

## The curriculum is the product

Lessons are **data, not files of JSX**. Understanding the layering here is the fastest way to be productive:

- `src/curriculum/index.js` — the registry: module order, lesson order, `TOTAL_LESSONS`. **This array is the single source of truth** for the sidebar, for linear unlocking in `progression.js`, and for module numbering. Reordering it changes what is taught when.
- `src/curriculum/modules/<module>.js` — the payload: one big default-exported object per module whose `lessons[]` entries carry `content` (lecture markdown), `starterCode`, `solutionCode`, `exampleWalkthrough`, `walkthrough`, `insights[]`, and optional `dependencies` (npm packages for Sandpack). These files are large (50–90KB); edit them surgically.
- `src/lib/lessonContent.js` — `parseLessonContent()` splits one lesson's markdown into the pieces the UI renders separately. The parser depends on **exact headings**: `### Example` (the runnable playground, in a jsx/js/tsx/ts fence), `### Hints`, `### Your Task` / `### Challenge` / `### Challenge and Solution`, and `**Solution:**`. Rename a heading and that section silently disappears from the UI.
- `src/curriculum/validators.js` — per-lesson challenge grading. Either an array of `{ message, test(code) }` rules, or `{ rules, requiresObservation, runtimeTests }`. Rules are mostly regex over whitespace-stripped code plus AST helpers from `ast.js`; `runtimeTests` are DOM assertions executed against the live Sandpack iframe by `src/lib/runtimeTestHarness.js`.
- `src/curriculum/learningChecks.js` + `learningCheckExtensions.js` — retrieval-practice questions keyed by lesson id, staged `prediction` / `explain` / `transfer`.
- `src/curriculum/teachingGraph.js` — `CONCEPTS` maps each React concept to the lesson that teaches it plus a regex detector, and `ALLOWANCES` lists the documented exceptions.

### Invariants enforced by `validate:curriculum`

Treat this script as the contract for curriculum edits; it exits non-zero on violations:

- Registry lesson order must match each module payload's lesson order, exactly.
- A lesson's `### Example` code must be **character-identical** to its `exampleWalkthrough.code` — the playground and the step-by-step must run the same program.
- **No lesson may use a concept in code before the lesson that teaches it** (checked across playground, starter, solution, and walkthrough code via `teachingGraph.js`). Fix by reordering, rewriting the code, or adding a documented `ALLOWANCES` entry.
- Learning checks must be complete and well-formed; choice answers must index into `options`.
- An `ALLOWANCES` entry that never fires is reported as stale and should be deleted.

`scripts/audit-walkthroughs.mjs` separately checks that `highlightLines` are in range for the walkthrough's code and that post-challenge walkthroughs explain the solution rather than the starter.

### Translations are overlays, never copies

`src/curriculum/modules-tr/` carries **prose only** — title, lecture markdown, and walkthrough step descriptions. It must never carry `starterCode`, `solutionCode`, `highlightLines`, `dependencies`, or `id`; those are inherited from English by `localizedCurriculum.js`, so a translation cannot drift the code or the grading. The one exception is the `### Example` block (the parser reads the playground out of markdown), which the validator compares character-for-character against English. Untranslated lessons fall back to English individually, so a module can ship half-translated. UI chrome strings live separately in `src/lib/uiStrings.js` as a flat dictionary (deliberately no i18n library).

## Runtime architecture

**Two sandbox paths, and they are both live.** Online, lesson playgrounds and challenges use `@codesandbox/sandpack-react`, which compiles through a hosted bundler (`https://<version>-sandpack.codesandbox.io/` — there is deliberately no `bundlerURL` override). Offline, `SandpackOfflineFallback` swaps the preview for `OfflinePreview`, which runs `src/lib/localBundler.js`: Babel-standalone transpiles each file to CommonJS, and a `require` shim inside a same-origin iframe resolves relative imports between the lesson's files and bare specifiers out of `BUILTIN_MODULES` — a registry of packages the app already bundles. `canRunOffline(lesson.dependencies)` gates it; a lesson importing something outside the registry keeps the hosted path and says so. Keep `BUILTIN_MODULES` in step with the `dependencies` fields in `src/curriculum/modules/`, or offline lessons start failing silently. React 19 is pinned explicitly in every Sandpack `customSetup` because the curriculum covers `useActionState`/`useOptimistic`.

**TypeScript diagnostics.** Sandpack strips types with Babel and runs the JavaScript underneath, so the TypeScript modules would otherwise be the one place where the thing being taught is invisible. `src/workers/typecheck.worker.js` runs a real `ts.createLanguageService` against the file in the editor, with the compiler, the ES2020 + DOM lib declarations and `@types/react` all bundled at build time so it works offline. It is imported as `?worker&inline` **on purpose**: a packaged build is served over `file://`, where the page origin is `null` and a worker loaded from a `file://` URL is refused — a blob URL built by the page is not. `isTypeScriptModule()` in `useLessonSandpack.js` is the single list of modules that get `.tsx`, the `react-ts` template and this panel; add a TypeScript module there and nowhere else. The panel reports and never blocks: Check Answer still grades whatever the learner wrote.

**Playground files in dev.** `vite.config.js` registers middleware serving `/api/playground/<moduleId>/<lessonId>` from `src/playground/<moduleId>/<lessonId>/`, plus an HMR hook that broadcasts a `playground-update` custom event. `ChallengeModal.jsx` consumes both — **dev only**; packaged builds fall back to the `starterCode` embedded in the lesson data. It must stay a path, not a query string, or Vite's SPA fallback returns HTML with a 200.

**Sandpack file assembly** lives in `src/components/lesson/useLessonSandpack.js`, not in the view: it builds the file map, layers the learner's cached edits over *only* the lesson's own files (the template's placeholder `/App.js` must never win), orders the tabs, and decides `isRunnable` by looking for `export default` (test-file lessons show the editor with no preview).

**State.** Two Zustand stores with `persist`: `useProgressStore` (`reactlab_progress` — completions, per-lesson `lessonState`, learning-check results, SM-2-ish review scheduling, calibration log) and `useUIStore` (`reactlab-ui-storage` — settings, mentor persona, API keys). Both re-hydrate on the `storage` event so detached Electron windows stay in sync. Mentor conversations are deliberately **not** persisted (localStorage quota).

Zustand 5 selectors use `useSyncExternalStore` referential equality: a selector returning a fresh `{}` or `[]` literal causes an infinite render loop. Select the raw value and memoize, or return a module-level singleton — see `EMPTY_LESSON_STATE` in `src/pages/LessonView.jsx`.

**Progression.** `src/lib/progression.js` derives a flat ordered lesson list from the registry. Unlocking is strictly linear (finish N to unlock N+1), overridable by the `unlockAllLessons` UI setting. `getWeakPrerequisites` / `getModuleReadiness` surface shaky prior lessons using the same signals as Review Lab's priority score.

**Audio narration.** MP3s in `public/audio/` follow `<lessonId>-<type>-step-<i>.mp3` where type is `example`, `challenge`, or `insight-<n>`. `StepThrough.jsx` builds that URL directly; `src/curriculum/audioManifest.json` is generated coverage data (`expected`/`present` per lesson) that the sidebar reads. Regenerate with `npm run audio:manifest` after adding or removing walkthrough steps; `scripts/generate-english-audio.mjs` synthesizes the files via `msedge-tts`.

## Electron layer

`electron/main.cjs` holds all IPC handlers; `preload.cjs` exposes a deliberately narrow `window.electronAPI` (window controls, detached windows, `mentor.*`, `ollama.*`) under `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`. Keep it that way — no shell access, no arbitrary IPC, no direct fs from the renderer.

The mentor supports four providers (`gemini`, `groq`, `openai`, `ollama`). **All network calls happen in the main process**, never the renderer; API keys travel in the IPC payload and streaming replies come back as `mentor:chunk` events. `src/lib/mentorContext.js` (renderer) assembles the lesson context as plain data and `electron/mentorPrompt.cjs` (main) decides how much fits the model's budget — Ollama gets a smaller budget than cloud. `electron/ollamaSupervisor.cjs` downloads, starts, and supervises a managed local Ollama runtime with user-chosen runtime/model directories persisted in `userData/ollama-config.json`.

`MENTOR_SYSTEM_PROMPT` in `main.cjs` is a fallback copy that must stay word-for-word in sync with `DEFAULT_MENTOR_PROMPT` in `src/lib/mentorPersonas.js`, which is what Settings shows and edits. Model ids for cloud providers are duplicated: the table in `src/lib/aiProviders.js` is for display, the actual request strings are in `main.cjs`.

`vite.config.js` sets `base: './'` so the packaged build loads assets over `file://`. Routing uses `BrowserRouter`; detached windows are loaded with a hash, and `/detached/:type/:moduleId/:lessonId` is routed outside `AppLayout`.

## Conventions

- Comments in this codebase explain *why*, often naming the bug a line prevents. When changing such code, update or preserve that reasoning rather than deleting it.
- Several files carry a `// vN — <date> — <what changed>` header log; follow that pattern when editing one that has it.
- `stubs/intersection-observer/` is a deliberate no-op override (see `overrides` in `package.json`) replacing a deprecated transitive polyfill. Don't "fix" it by installing the real package.
- `build/` (the electron-builder resources dir, holding `icon.ico`) is gitignored, so `APP_ICON` in `main.cjs` must tolerate its absence.
