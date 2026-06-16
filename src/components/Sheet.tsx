'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Sheet.module.css';

interface SheetProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Sheet({ children, onClose }: SheetProps) {
  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-modal="true">
        <div className={styles.handle}>
          <div className={styles.handleBar} />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
}
