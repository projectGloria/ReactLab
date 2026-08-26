import { useEffect, useMemo, useRef } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';
import reactIcon from '../../assets/react.png';
import cssIcon from '../../assets/css.png';
import { isInternalSandpackFile, orderLessonFiles } from './useLessonSandpack.js';

// The editor tab strip. Sandpack ships its own, but this one filters out the
// template's internal files, orders component files before styles.css, and
// matches the app chrome.
export default function SandpackFileTabs({ lessonId }) {
  const { sandpack } = useSandpack();
  const { files, activeFile, setActiveFile } = sandpack;

  // Memoized on the file *names*, not the file objects: the objects change on
  // every keystroke, and an unmemoized array here made both effects below run
  // on every render.
  const fileNameKey = Object.keys(files || {}).join('|');
  const visibleFiles = useMemo(
    () => orderLessonFiles(Object.keys(files || {}).filter((f) => !isInternalSandpackFile(f))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileNameKey],
  );

  // Only repair an invalid active file. Do not force users away from styles.css
  // after they intentionally click it.
  useEffect(() => {
    if (visibleFiles.length > 0 && !visibleFiles.includes(activeFile)) {
      setActiveFile(visibleFiles[0]);
    }
  }, [activeFile, setActiveFile, visibleFiles]);

  // A new lesson opens on its component file, never on styles.css -- the code
  // is the point, the stylesheet is scaffolding. Guarded by lesson id rather
  // than run on every change so that clicking styles.css within a lesson still
  // sticks, which is what the rule above deliberately preserves.
  const openedForLesson = useRef(null);
  useEffect(() => {
    if (!lessonId || openedForLesson.current === lessonId) return;
    const firstComponent = visibleFiles.find((filePath) => !filePath.endsWith('.css'));
    if (!firstComponent) return;
    openedForLesson.current = lessonId;
    if (activeFile !== firstComponent) {
      setActiveFile(firstComponent);
    }
  }, [lessonId, visibleFiles, activeFile, setActiveFile]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '36px',
        backgroundColor: '#181816',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingRight: '210px',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {visibleFiles.map((filePath) => {
        const isActive = activeFile === filePath;
        const fileName = filePath.replace(/^\//, '');
        const isCss = fileName.endsWith('.css');

        return (
          <button
            key={filePath}
            type="button"
            onClick={() => setActiveFile(filePath)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              height: '100%',
              padding: '0 14px',
              background: isActive ? 'rgba(217, 119, 87, 0.08)' : 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--accent-primary, #d97757)' : '2px solid transparent',
              color: isActive ? 'var(--accent-primary, #d97757)' : 'var(--text-secondary, #a8a29e)',
              fontSize: '0.8rem',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.15s ease',
              margin: 0,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
              }
            }}
          >
            <img
              src={isCss ? cssIcon : reactIcon}
              alt=""
              style={{
                width: '17px',
                height: '17px',
                objectFit: 'contain',
                flexShrink: 0,
                display: 'block',
              }}
            />
            <span>{fileName}</span>
          </button>
        );
      })}
    </div>
  );
}
