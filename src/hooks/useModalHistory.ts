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
      // If we close the modal through a button (not back button),
      // the dummy state is still in history. We should clean it up.
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);
}
