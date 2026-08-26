import React, { useEffect } from 'react';
import { sectionSlug, markdownText } from '../../lib/lessonMarkdown.js';

// In-lesson navigation: headings tag themselves with a section id, and the
// tracker reports whichever one is currently at the top of the scroll area.

export function SectionHeading({ level, children, ...props }) {
  const Tag = `h${level}`;
  const title = markdownText(children).trim();
  return <Tag {...props} data-lesson-section-id={sectionSlug(title)}>{children}</Tag>;
}

export function LessonSectionTracker({ containerRef, sections, onActiveSection }) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sections?.length) return undefined;

    const updateActiveSection = () => {
      const headings = [...container.querySelectorAll('[data-lesson-section-id]')];
      const threshold = container.getBoundingClientRect().top + 72;
      let active = sections[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= threshold) {
          const match = sections.find((section) => section.id === heading.dataset.lessonSectionId);
          if (match) active = match;
        }
      }
      onActiveSection(active);
    };

    updateActiveSection();
    container.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      container.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [containerRef, sections, onActiveSection]);

  return null;
}
