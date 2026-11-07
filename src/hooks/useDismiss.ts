import { useEffect, type MouseEvent } from 'react';

/** Closes a modal with Esc while it is open. */
export function useDismiss(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
}

/** For modals without a form: a click on the backdrop itself closes them. */
export const closeOnBackdrop = (onClose: () => void) => (e: MouseEvent<HTMLElement>) => {
  if (e.target === e.currentTarget) onClose();
};
