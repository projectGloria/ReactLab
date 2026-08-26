import { useState, useEffect } from 'react';

// True on narrow viewports, where the lesson switches from the side-by-side
// prose/editor split to a single stacked column.
export default function useCompactLayout() {
  const [isCompact, setIsCompact] = useState(() => window.matchMedia('(max-width: 850px)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 850px)');
    const updateLayout = () => setIsCompact(mediaQuery.matches);
    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);
    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  return isCompact;
}
