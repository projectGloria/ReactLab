import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Modal behavior for a dialog: lock body scroll, trap Tab inside it, close on
 * Escape, and hand focus back to whatever had it when the dialog opened.
 *
 * `isOpen` matters more than it looks. This hook's cleanup calls
 * `previousFocus.focus()`, so anything that re-runs the effect steals focus back
 * to a remembered element. Two things used to cause that:
 *
 *   1. `onClose` is written inline at every call site, so it was a new function
 *      on every render and `[dialogRef, onClose]` invalidated constantly. It now
 *      lives in a ref and is deliberately not a dependency.
 *   2. LessonView calls this hook unconditionally for its speech modal, so the
 *      effect was live the whole time a lesson was open, not just while a dialog
 *      was up. Typing in the playground re-rendered LessonView, the cleanup ran,
 *      and focus jumped out of the editor and onto whichever sidebar link had
 *      been clicked last -- which is why a single keystroke could land you on
 *      the Glossary Codex link and stop you typing.
 */
export default function useModalDialog(dialogRef, onClose, isOpen = true) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousFocus = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let tookFocus = false;
    const focusDialog = () => {
      if (!dialogRef.current) return;
      dialogRef.current.focus();
      tookFocus = true;
    };
    const focusTimer = window.setTimeout(focusDialog, 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        focusDialog();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      // Only restore if this hook actually moved focus into a dialog. Handing
      // focus back when it was never taken is how a keystroke in the playground
      // ended up selecting a sidebar link.
      if (tookFocus && previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, [dialogRef, isOpen]);
}
