/**
 * Modal manager component for handling global modal behaviors
 *
 * This component should be included once in your app (typically in App.tsx)
 * to enable global modal features like ESC key handling.
 */

import { useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';

export const ModalManager: React.FC = () => {
  const { modals, closeModal } = useModalStore();

  /**
   * Global ESC key handler - closes top modal
   */
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.config.closeOnEscape !== false) {
          closeModal(topModal.id);
        }
      }
    };

    if (modals.length > 0) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [modals, closeModal]);

  // This component doesn't render anything
  return null;
};
