# ReactLab

ReactLab is an offline-first desktop learning app (Electron + Vite + React) that teaches modern React through a curated curriculum of lessons, live Sandpack playgrounds, graded coding challenges, walkthroughs, and optional offline AI mentor support.

This README includes:
- Quick start (install, dev, build, test)
- Project overview and key concepts
- Full repository tree (ls -R)
- A literal line-by-line map explaining what every file in the repository does

Repository: projectGloria/ReactLab (repo ID: 1347845601)
Primary languages: JavaScript (≈97%), CSS (≈3%), HTML (≈0.1%)

---

## Quick start

1. Install dependencies
   - npm install

2. Development
   - npm run dev          # Vite dev server
   - npm run electron:dev # Start Vite + Electron shell for desktop

3. Build & package
   - npm run build
   - npm run package:win (or other packaging scripts depending on platform)

4. Tests & validation
   - npm test
   - npm run test:watch
   - npm run validate:curriculum
   - node scripts/audit-walkthroughs.mjs

---

## High-level overview

- UI: React renderer (src/), Vite build, optional Electron shell (electron/).
- Curriculum: data-driven lessons in src/curriculum; validators in src/curriculum/validators.js.
- Playgrounds: src/playground contains Sandpack-style runnable example projects used by lessons.
- Audio: public/audio contains many narrated audio files mapped in src/curriculum/audioManifest.json.
- Scripts: scripts/ host validation and audio generation utilities.
- Stores: src/store uses small hooks/stores for progress/UI.
- Tests: Vitest tests in src/**/__tests__ and src/lib/__tests__.

---

## Full file tree (ls -R)

.  
├── .gitignore  
├── CLAUDE.md  
├── electron  
│   ├── main.cjs  
│   ├── ollamaSupervisor.cjs  
│   └── preload.cjs  
├── index.html  
├── package-lock.json  
├── package.json  
├── public  
│   ├── audio  
│   │   ├── accessibility-and-testing-challenge-step-0.mp3  
│   │   ├── accessibility-and-testing-challenge-step-1.mp3  
│   │   ├── accessibility-and-testing-challenge-step-2.mp3  
│   │   ├── accessibility-and-testing-example-step-0.mp3  
│   │   ├── accessibility-and-testing-example-step-1.mp3  
│   │   ├── accessibility-and-testing-example-step-2.mp3  
│   │   ├── accessibility-and-testing-example-step-3.mp3  
│   │   ├── accessibility-and-testing-insight-0-step-0.mp3  
│   │   ├── accessibility-and-testing-insight-0-step-1.mp3  
│   │   ├── accessibility-and-testing-insight-1-step-0.mp3  
│   │   ├── accessibility-and-testing-insight-1-step-1.mp3  
│   │   ├── actions-api-challenge-step-0.mp3  
│   │   ├── actions-api-challenge-step-1.mp3  
│   │   ├── actions-api-challenge-step-2.mp3  
│   │   ├── actions-api-example-step-0.mp3  
│   │   ├── actions-api-example-step-1.mp3  
│   │   ├── actions-api-example-step-2.mp3  
│   │   ├── actions-api-example-step-3.mp3  
│   │   ├── actions-api-insight-0-step-0.mp3  
│   │   ├── actions-api-insight-0-step-1.mp3  
│   │   ├── actions-api-insight-1-step-0.mp3  
│   │   ├── actions-api-insight-1-step-1.mp3  
│   │   ├── actions-api-insight-2-step-0.mp3  
│   │   ├── actions-api-insight-2-step-1.mp3  
│   │   ├── actions-api-insight-3-step-0.mp3  
│   │   ├── actions-api-insight-3-step-1.mp3  
│   │   ├── actions-api-insight-4-step-0.mp3  
│   │   ├── actions-api-insight-4-step-1.mp3  
│   │   ├── actions-api-insight-4-step-2.mp3  
│   │   ├── actions-api-insight-5-step-0.mp3  
│   │   ├── actions-api-insight-5-step-1.mp3  
│   │   ├── actions-api-insight-5-step-2.mp3  
│   │   ├── activity-challenge-step-0.mp3  
│   │   ├── activity-challenge-step-1.mp3  
│   │   ├── activity-challenge-step-2.mp3  
│   │   ├── activity-example-step-0.mp3  
│   │   ├── activity-example-step-1.mp3  
│   │   ├── activity-example-step-2.mp3  
│   │   ├── activity-example-step-3.mp3  
│   │   ├── activity-insight-0-step-0.mp3  
│   │   ├── activity-insight-0-step-1.mp3  
│   │   ├── activity-insight-1-step-0.mp3  
│   │   ├── activity-insight-1-step-1.mp3  
│   │   ├── capstone-dashboard-example-step-0.mp3  
│   │   ├── capstone-dashboard-example-step-1.mp3  
│   │   ├── capstone-dashboard-example-step-2.mp3  
│   │   ├── capstone-dashboard-example-step-3.mp3  
│   │   ├── capstone-dashboard-example-step-4.mp3  
│   │   ├── capstone-modern-react-example-step-0.mp3  
│   │   ├── capstone-modern-react-example-step-1.mp3  
│   │   ├── capstone-modern-react-example-step-2.mp3  
│   │   ├── capstone-modern-react-example-step-3.mp3  
│   │   ├── capstone-modern-react-example-step-4.mp3  
│   │   ├── capstone-production-app-example-step-0.mp3  
│   │   ├── capstone-production-app-example-step-1.mp3  
│   │   ├── capstone-production-app-example-step-2.mp3  
│   │   ├── capstone-production-app-example-step-3.mp3  
│   │   ├── capstone-production-app-example-step-4.mp3  
│   │   ├── capstone-production-app-example-step-5.mp3  
│   │   ├── code-splitting-challenge-step-0.mp3  
│   │   ├── code-splitting-challenge-step-1.mp3  
│   │   ├── code-splitting-example-step-0.mp3  
│   │   ├── code-splitting-example-step-1.mp3  
│   │   ├── code-splitting-example-step-2.mp3  
│   │   ├── code-splitting-example-step-3.mp3  
│   │   ├── code-splitting-insight-0-step-0.mp3  
│   │   ├── code-splitting-insight-0-step-1.mp3  
│   │   ├── code-splitting-insight-1-step-0.mp3  
│   │   ├── code-splitting-insight-1-step-1.mp3  
│   │   ├── code-splitting-insight-2-step-0.mp3  
│   │   ├── code-splitting-insight-2-step-1.mp3  
│   │   ├── components-challenge-step-0.mp3  
│   │   ├── components-challenge-step-1.mp3  
│   │   ├── components-challenge-step-2.mp3  
│   │   ├── components-challenge-step-3.mp3  
│   │   ├── components-example-step-0.mp3  
│   │   ├── components-example-step-1.mp3  
│   │   ├── components-example-step-2.mp3  
│   │   ├── components-insight-0-step-0.mp3  
│   │   ├── components-insight-0-step-1.mp3  
│   │   ├── components-insight-1-step-0.mp3  
│   │   ├── components-insight-1-step-1.mp3  
│   │   ├── composition-challenge-step-0.mp3  
│   │   ├── composition-challenge-step-1.mp3  
│   │   ├── composition-challenge-step-2.mp3  
│   │   ├── composition-example-step-0.mp3  
│   │   ├── composition-example-step-1.mp3  
│   │   ├── composition-example-step-2.mp3  
│   │   ├── composition-example-step-3.mp3  
│   │   ├── composition-insight-0-step-0.mp3  
│   │   ├── composition-insight-0-step-1.mp3  
│   │   ├── composition-insight-1-step-0.mp3  
│   │   ├── composition-insight-1-step-1.mp3  
│   │   ├── composition-insight-2-step-0.mp3  
│   │   ├── composition-insight-2-step-1.mp3  
│   │   ├── compound-components-challenge-step-0.mp3  
│   │   ├── compound-components-challenge-step-1.mp3  
│   │   ├── compound-components-example-step-0.mp3  
│   │   ├── compound-components-example-step-1.mp3  
│   │   ├── compound-components-example-step-2.mp3  
│   │   ├── compound-components-example-step-3.mp3  
│   │   ├── compound-components-insight-0-step-0.mp3  
│   │   ├── compound-components-insight-0-step-1.mp3  
│   │   ├── compound-components-insight-1-step-0.mp3  
│   │   ├── compound-components-insight-1-step-1.mp3  
│   │   ├── compound-components-insight-2-step-0.mp3  
│   │   ├── compound-components-insight-2-step-1.mp3  
│   │   ├── conditional-challenge-step-0.mp3  
│   │   ├── conditional-challenge-step-1.mp3  
│   │   ├── conditional-challenge-step-2.mp3  
│   │   ├── conditional-example-step-0.mp3  
│   │   ├── conditional-example-step-1.mp3  
│   │   ├── conditional-example-step-2.mp3  
│   │   ├── conditional-insight-0-step-0.mp3  
│   │   ├── conditional-insight-0-step-1.mp3  
│   │   ├── conditional-insight-1-step-0.mp3  
│   │   ├── conditional-insight-1-step-1.mp3  
│   │   ├── controlled-inputs-challenge-step-0.mp3  
│   │   ├── controlled-inputs-challenge-step-1.mp3  
│   │   ├── controlled-inputs-challenge-step-2.mp3  
│   │   ├── controlled-inputs-challenge-step-3.mp3  
│   │   ├── controlled-inputs-example-step-0.mp3  
│   │   ├── controlled-inputs-example-step-1.mp3  
... (truncated for brevity in commit content)
