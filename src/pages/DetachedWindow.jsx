import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MentorPanel from '../components/mentor/MentorPanel.jsx';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Code2 } from 'lucide-react';
import TitleBar from '../components/layout/TitleBar.jsx';
import { parseLessonContent } from '../lib/lessonContent.js';
import useLessonSandpack from '../components/lesson/useLessonSandpack.js';
import { getModuleData } from '../curriculum/registry.js';
import React from 'react';
import { wrapGlossaryTerms } from '../components/common/TermExplainerTooltip.jsx';
import SANDPACK_THEME from '../lib/sandpackTheme.js';
import PlainCodeBlock, { codeTextFromPre } from '../components/common/PlainCodeBlock.jsx';

const sandpackTheme = SANDPACK_THEME;

export default function DetachedWindow() {
  const { type = 'mentor', moduleId, lessonId } = useParams();
  const moduleData = useMemo(() => getModuleData(moduleId), [moduleId]);

  // Shares LessonView's parser rather than reimplementing it. The two copies had
  // already drifted -- the detached editor named its entry file /App.jsx while
  // the docked one used /App.js, so popping the editor out renamed the tab.
  const parsedLesson = useMemo(() => {
    if (!moduleData) return null;
    const l = moduleData.lessons?.find((x) => x.id === lessonId);
    if (!l) return null;
    // The mentor excerpt wants the whole lesson, headings included, not the
    // prose-only view LessonView renders.
    return { ...parseLessonContent(l, moduleId), displayContent: l.content || '' };
  }, [moduleData, lessonId, moduleId]);

  const {
    files: sandpackFiles,
    visibleFiles: sandpackVisibleFiles,
    activeFile: sandpackActiveFile,
    customSetup: sandpackCustomSetup,
    isRunnable: isPlaygroundRunnable,
  } = useLessonSandpack(parsedLesson, moduleId);

  if (type === 'mentor') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#141413', overflow: 'hidden' }}>
        <TitleBar title="AI Mentor" subtitle={parsedLesson?.title || 'Lesson Tutor'} />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <MentorPanel
            lessonId={lessonId}
            moduleId={moduleId}
            lessonTitle={parsedLesson?.title || 'Lesson Tutor'}
            lessonExcerpt={parsedLesson?.displayContent || ''}
            lesson={parsedLesson}
            activeSection={null}
            code={typeof parsedLesson?.executableExample === 'string' ? parsedLesson.executableExample : ''}
            /* The same file map the playground runs, learner edits included, so a
               popped-out chat knows as much about the code as the docked one. */
            files={sandpackFiles}
            runtimeError=""
            isDetached={true}
          />
        </div>
      </div>
    );
  }

  if (type === 'editor') {
    const isTS = sandpackVisibleFiles.some((f) => f.endsWith('.tsx'));

    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#141413' }}>
        <TitleBar title="Workspace" subtitle={parsedLesson?.title || 'Sandbox'} />
        <header style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
          <Code2 size={18} color="var(--accent-primary)" />
          <span>Live Workspace: {parsedLesson?.title || 'Sandbox'}</span>
        </header>
        <div style={{ flex: 1, display: 'flex' }}>
          <SandpackProvider
            key={parsedLesson?.id}
            template={isTS || moduleId === 'typescript' ? 'react-ts' : 'react'}
            theme={sandpackTheme}
            files={sandpackFiles}
            customSetup={sandpackCustomSetup}
            options={{
              classes: {
                'sp-wrapper': 'custom-sandpack-wrapper',
                'sp-layout': 'custom-sandpack-layout',
                'sp-tab-button': 'custom-sandpack-tab',
              },
              visibleFiles: sandpackVisibleFiles,
              activeFile: sandpackActiveFile,
            }}
          >
            <SandpackLayout style={{ height: '100%', width: '100%', border: 'none' }}>
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                showTabs={true}
                closableTabs={false}
                wrapContent
                style={{ height: '100%', flex: 1 }}
              />
              {/* Test-file examples export no component, so there is nothing to
                  preview -- see the isRunnable note in useLessonSandpack. */}
              {isPlaygroundRunnable && (
                <SandpackPreview
                  showNavigator={false}
                  showRefreshButton={true}
                  style={{ height: '100%', flex: 1 }}
                />
              )}
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    );
  }

  if (type === 'content') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
        <TitleBar title="Lesson Notes" subtitle={parsedLesson?.title || 'Lesson'} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
              <BookOpen size={16} /> Detached Lesson Content
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '24px' }}>{parsedLesson?.title || 'Lesson'}</h1>
            <div className="markdown-body" style={{ lineHeight: 1.6, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
              <ReactMarkdown
                components={{
                  pre: ({ children }) => <PlainCodeBlock code={codeTextFromPre(children)} />,
                  p: ({ children }) => (
                    <p style={{ marginBottom: '16px', lineHeight: 1.65 }}>
                      {Array.isArray(children)
                        ? children.map((child, idx) => typeof child === 'string' ? <React.Fragment key={idx}>{wrapGlossaryTerms(child)}</React.Fragment> : child)
                        : typeof children === 'string' ? wrapGlossaryTerms(children) : children}
                    </p>
                  ),
                  li: ({ children }) => (
                    <li style={{ marginBottom: '6px', lineHeight: 1.6 }}>
                      {Array.isArray(children)
                        ? children.map((child, idx) => typeof child === 'string' ? <React.Fragment key={idx}>{wrapGlossaryTerms(child)}</React.Fragment> : child)
                        : typeof children === 'string' ? wrapGlossaryTerms(children) : children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {typeof children === 'string' ? wrapGlossaryTerms(children) : children}
                    </strong>
                  ),
                }}
              >
                {parsedLesson?.displayContent || 'Loading lesson content...'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Unknown detached window type</div>;
}
