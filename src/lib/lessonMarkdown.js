import React from 'react';

// Markdown helpers shared by the lesson view: turning heading text into stable
// anchor ids, flattening React children back to plain text, and splitting a
// lesson's markdown into the section list the in-lesson navigation renders.

export function sectionSlug(value, fallback = 'overview') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

export function markdownText(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(markdownText).join('');
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (React.isValidElement(value)) return markdownText(value.props.children);
  return '';
}

export function extractLessonSections(markdown, lessonTitle) {
  const lines = String(markdown || '').split('\n');
  const sections = [];
  let current = { id: 'overview', title: 'Lesson overview', level: 1, lines: [] };
  let inFence = false;

  const commit = () => {
    const content = current.lines.join('\n').trim();
    if (content || current.id === 'overview') {
      sections.push({
        id: current.id,
        title: current.title,
        level: current.level,
        content: content || lessonTitle || 'Lesson overview',
      });
    }
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      current.lines.push(line);
      continue;
    }
    const heading = !inFence ? line.match(/^(#{2,6})\s+(.+?)\s*#*\s*$/) : null;
    if (heading) {
      commit();
      const title = heading[2].trim();
      current = {
        id: sectionSlug(title, `section-${sections.length + 1}`),
        title,
        level: heading[1].length,
        lines: [line],
      };
    } else {
      current.lines.push(line);
    }
  }
  commit();
  return sections;
}
