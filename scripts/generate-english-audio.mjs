import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const modulesDir = path.join(root, 'src', 'curriculum', 'modules');
const outDir = path.join(root, 'public', 'audio');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

export function sanitizeForTTS(text) {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function collectAllTasks() {
  const files = fs.readdirSync(modulesDir).filter((f) => f.endsWith('.js'));
  const tasks = [];

  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(modulesDir, file)).href);
    const lessons = (mod.default || mod).lessons || [];

    for (const lesson of lessons) {
      if (lesson.exampleWalkthrough?.steps) {
        lesson.exampleWalkthrough.steps.forEach((step, i) => {
          const rawText = step.description || step.explanation || '';
          const filename = `${lesson.id}-example-step-${i}.mp3`;
          tasks.push({ lessonId: lesson.id, type: 'example', step: i, filename, rawText });
        });
      }

      if (lesson.walkthrough?.steps) {
        lesson.walkthrough.steps.forEach((step, i) => {
          const rawText = step.description || step.explanation || '';
          const filename = `${lesson.id}-challenge-step-${i}.mp3`;
          tasks.push({ lessonId: lesson.id, type: 'challenge', step: i, filename, rawText });
        });
      }

      if (lesson.insights) {
        lesson.insights.forEach((insight, idx) => {
          if (insight.walkthrough?.steps) {
            insight.walkthrough.steps.forEach((step, i) => {
              const rawText = step.description || step.explanation || '';
              const filename = `${lesson.id}-insight-${idx}-step-${i}.mp3`;
              tasks.push({ lessonId: lesson.id, type: `insight-${idx}`, step: i, filename, rawText });
            });
          }
        });
      }
    }
  }

  return tasks;
}

// Generate sequentially or with tiny pause to avoid Microsoft Edge TTS socket resets
async function main() {
  const tasks = await collectAllTasks();
  console.log(`[Audio Generator] Processing ${tasks.length} walkthrough steps.`);

  const tts = new MsEdgeTTS();
  await tts.setMetadata('en-GB-SoniaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const tmpWorkingDir = path.join(root, 'public', 'audio_temp_single');
  if (!fs.existsSync(tmpWorkingDir)) fs.mkdirSync(tmpWorkingDir, { recursive: true });

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (let idx = 0; idx < tasks.length; idx++) {
    const task = tasks[idx];
    const targetPath = path.join(outDir, task.filename);

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1000) {
      skipped++;
      continue;
    }

    const spokenText = sanitizeForTTS(task.rawText);
    if (!spokenText || spokenText.length < 2) {
      console.warn(`[Skip] Empty text for ${task.filename}`);
      continue;
    }

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await tts.toFile(tmpWorkingDir, spokenText);
        if (res && res.audioFilePath && fs.existsSync(res.audioFilePath)) {
          fs.copyFileSync(res.audioFilePath, targetPath);
          try {
            fs.unlinkSync(res.audioFilePath);
          } catch {}
          completed++;
          success = true;
          break;
        }
      } catch (err) {
        if (attempt === 3) {
          console.error(`[Error] Failed ${task.filename}:`, err.message);
          failed++;
        } else {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    // Small delay between requests to keep connection stable
    await new Promise((r) => setTimeout(r, 80));

    const totalDone = completed + skipped + failed;
    if (totalDone % 25 === 0 || totalDone === tasks.length) {
      console.log(`[Progress] ${totalDone}/${tasks.length} (New: ${completed}, Skipped: ${skipped}, Failed: ${failed})`);
    }
  }

  try {
    if (fs.existsSync(tmpWorkingDir)) fs.rmSync(tmpWorkingDir, { recursive: true, force: true });
  } catch {}

  console.log(`\n🎉 Finished English narration generation!`);
  console.log(`Total: ${tasks.length} | Generated: ${completed} | Already Present: ${skipped} | Failed: ${failed}`);
}

main().catch((err) => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});
