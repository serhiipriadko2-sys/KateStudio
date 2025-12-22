import { useEffect, type RefObject } from 'react';

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const useFocusTrap = (
  containerRef: RefObject<HTMLElement>,
  isActive: boolean,
  initialFocusRef?: RefObject<HTMLElement>
) => {
  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((element) => !element.hasAttribute('disabled'));

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusTarget = initialFocusRef?.current || first;
    if (focusTarget) {
      focusTarget.focus();
    } else {
      container.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!activeElement || activeElement === first || !container.contains(activeElement)) {
          event.preventDefault();
          last?.focus();
        }
      } else {
        if (!activeElement || activeElement === last || !container.contains(activeElement)) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef, initialFocusRef, isActive]);
};
