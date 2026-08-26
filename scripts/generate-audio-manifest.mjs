// Generates src/curriculum/audioManifest.json — audio coverage report
// Checks audio presence in public/audio and public/audio/en

import { readdirSync, existsSync, writeFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const audioDir = path.join(root, 'public', 'audio');
const modulesDir = path.join(root, 'src', 'curriculum', 'modules');
const outPath = path.join(root, 'src', 'curriculum', 'audioManifest.json');

const existingFiles = new Set(
  existsSync(audioDir) ? readdirSync(audioDir).filter(f => f.endsWith('.mp3')) : []
);

function expectedAudioKeys(lesson) {
  const keys = [];
  const addWalkthrough = (type, walkthrough) => {
    if (walkthrough && Array.isArray(walkthrough.steps)) {
      walkthrough.steps.forEach((_, i) => keys.push(`${type}-step-${i}`));
    }
  };
  addWalkthrough('challenge', lesson.walkthrough);
  addWalkthrough('example', lesson.exampleWalkthrough);
  (lesson.insights || []).forEach((insight, idx) => addWalkthrough(`insight-${idx}`, insight.walkthrough));
  return keys;
}

async function main() {
  const manifest = {};
  const moduleFiles = readdirSync(modulesDir).filter((f) => f.endsWith('.js'));

  for (const file of moduleFiles) {
    const mod = await import(pathToFileURL(path.join(modulesDir, file)).href);
    const moduleData = mod.default || mod;
    const lessons = moduleData.lessons || [];
    lessons.forEach((lesson) => {
      const expectedKeys = expectedAudioKeys(lesson);
      const expected = expectedKeys.length;
      const present = expectedKeys.filter((key) => existingFiles.has(`${lesson.id}-${key}.mp3`)).length;
      manifest[lesson.id] = { expected, present };
    });
  }

  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
  const totalLessons = Object.keys(manifest).length;
  const fullyNarrated = Object.values(manifest).filter((m) => m.expected > 0 && m.present === m.expected).length;
  const silent = Object.values(manifest).filter((m) => m.expected > 0 && m.present === 0).length;
  console.log(`Audio manifest written: ${totalLessons} lessons, ${fullyNarrated} fully narrated, ${silent} silent.`);
}

main();
