/**
 * useScrollLock Hook
 * Prevents body scroll when modal/drawer is open
 * Shared across WEB and APP
 */
import { useEffect } from 'react';

export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLocked]);
};

export default useScrollLock;
