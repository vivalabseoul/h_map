import { useEffect } from 'react';

export function useModalHistory(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    // Push a state when the modal opens
    window.history.pushState({ modalOpen: true }, '', window.location.href);

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modalOpen) {
        (window as any)._ignoreNextPopState = true;
        window.history.back();
        setTimeout(() => {
          (window as any)._ignoreNextPopState = false;
        }, 100);
      }
    };
  }, [isOpen, onClose]);
}
