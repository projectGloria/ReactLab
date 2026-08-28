// Prompt assembly for the AI mentor: the learner's question plus as much of the
// lesson as the model's budget allows. Pure string work, deliberately free of
// Electron imports so it can be exercised on its own.

const MAX_CONTEXT_CHARS = 24_000;

function cleanText(value, maxChars) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxChars);
}

// The local model reads the whole lesson now, so its share of the window has to
// leave room for it: the ollama path asks for a shorter history than the cloud.
function cleanHistory(history, { maxMessages = 8, maxChars = 8_000 } = {}) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-maxMessages)
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message) => ({
      role: message.role,
      content: cleanText(message.content, maxChars),
    }))
    .filter((message) => message.content);
}

// How much lesson material rides along with a question. The local models run at
// num_ctx 6144 (see electron/main.cjs), so they get a smaller slice than a cloud
// model with room to spare: 9 000 characters is roughly 2 500 tokens, which
// leaves the system prompt, four turns of history and the reply their room.
// Every lesson in the curriculum fits; only the longest lose a trailing section.
const LOCAL_CONTEXT_CHARS = 9_000;

// Rendered in this order, dropped in reverse-priority order when the budget is
// tight: the question and the learner's own code outlive the reference solution.
const CONTEXT_SECTIONS = [
  { key: 'files', title: "Playground files the learner is working in", cap: 6_000, priority: 2 },
  { key: 'runtimeError', title: 'Runtime error currently shown by the preview', cap: 1_200, priority: 1 },
  { key: 'activeSection', title: 'Section of the lesson the learner is reading', cap: 1_800, priority: 3 },
  { key: 'challenge', title: "The lesson's challenge", cap: 1_200, priority: 3 },
  { key: 'lecture', title: 'Full lesson text', cap: 7_000, priority: 4 },
  { key: 'hints', title: 'Hints the lesson offers', cap: 900, priority: 6 },
  { key: 'insights', title: 'Common misconceptions this lesson calls out', cap: 2_400, priority: 6 },
  { key: 'walkthrough', title: 'Step-by-step notes for the playground example', cap: 2_400, priority: 7 },
  { key: 'solutionExplanation', title: "The lesson's own solution explanation", cap: 1_000, priority: 8 },
  { key: 'referenceSolution', title: 'Reference solution (do not paste it verbatim unless asked outright)', cap: 1_000, priority: 9 },
];

function renderContextSection(key, context) {
  const value = context[key];
  if (!value || (Array.isArray(value) && value.length === 0)) return '';

  if (key === 'files') {
    const files = Array.isArray(value) ? value : [];
    if (files.length === 0) return cleanText(context.code, 4_000);
    return files
      .map((file) => `--- ${file.path} ---\n${cleanText(file.code, 4_000)}`)
      .join('\n\n');
  }
  if (key === 'activeSection') {
    const title = cleanText(value.title, 150);
    const body = cleanText(value.content, 1_600);
    return [title, body].filter(Boolean).join('\n');
  }
  if (key === 'hints') {
    return value.map((hint, index) => `${index + 1}. ${cleanText(hint, 400)}`).join('\n');
  }
  if (key === 'insights') {
    return value
      .map((insight) => [cleanText(insight.title, 200), ...(insight.notes || []).map((note) => `  - ${cleanText(note, 500)}`)].filter(Boolean).join('\n'))
      .join('\n');
  }
  if (key === 'walkthrough') {
    return value.map((step, index) => `${index + 1}. ${cleanText(step, 500)}`).join('\n');
  }
  return cleanText(value, 8_000);
}

/**
 * Turns the learner's question plus the lesson context the renderer collected
 * (see src/lib/mentorContext.js) into one prompt.
 *
 * The lesson text used to be thrown away here: the renderer sent it, this
 * function read only the title, the active section and 2 000 characters of code,
 * so the mentor answered questions about a lesson it had never read.
 */
function buildUserPrompt({ question, context = {}, budget = MAX_CONTEXT_CHARS }) {
  const header = [
    cleanText(context.lessonTitle, 150) && `Lesson: ${cleanText(context.lessonTitle, 150)}`,
    cleanText(context.moduleTitle, 150) && `Module: ${cleanText(context.moduleTitle, 150)}${context.position ? ` (${cleanText(context.position, 60)})` : ''}`,
  ].filter(Boolean).join('\n');

  const rendered = CONTEXT_SECTIONS
    .map((section) => ({ ...section, body: cleanText(renderContextSection(section.key, context), section.cap) }))
    .filter((section) => section.body);

  // Trim from the least important end until the whole thing fits.
  const size = (sections) => sections.reduce((total, section) => total + section.title.length + section.body.length + 8, 0);
  const kept = [...rendered];
  while (size(kept) > budget && kept.length > 0) {
    let worstIndex = 0;
    for (let index = 1; index < kept.length; index += 1) {
      if (kept[index].priority >= kept[worstIndex].priority) worstIndex = index;
    }
    kept.splice(worstIndex, 1);
  }

  const blocks = [
    `Learner question: ${cleanText(question, 1_000)}`,
    header,
    ...kept.map((section) => `## ${section.title}\n${section.body}`),
  ].filter(Boolean);

  return blocks.join('\n\n');
}

module.exports = {
  cleanText,
  cleanHistory,
  buildUserPrompt,
  renderContextSection,
  CONTEXT_SECTIONS,
  MAX_CONTEXT_CHARS,
  LOCAL_CONTEXT_CHARS,
};
