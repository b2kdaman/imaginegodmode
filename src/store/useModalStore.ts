/**
 * Modal store for centralized modal state management
 */

import { create } from 'zustand';
import type { ModalStackItem, ModalConfig } from '@/components/modals/types/modal.types';
import { generateModalId } from '@/components/modals/types/modalHelpers';
import { Z_INDEX } from '@/utils/constants';

interface ModalState {
  modals: ModalStackItem[];
  openModal: (config: ModalConfig, component: React.ReactNode) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
  getZIndex: (id: string) => number;
  isModalOpen: (id: string) => boolean;
  getTopModal: () => ModalStackItem | null;
}

export const useModalStore = create<ModalState>((set, get) => ({
  modals: [],

  /**
   * Open a modal and add it to the stack
   */
  openModal: (config: ModalConfig, component: React.ReactNode): string => {
    const id = config.id || generateModalId();
    const state = get();
    const stackIndex = state.modals.length;
    const zIndex = Z_INDEX.MODAL + (stackIndex * 10);

    const modalItem: ModalStackItem = {
      id,
      component,
      config: { ...config, id },
      onClose: () => state.closeModal(id),
      zIndex,
    };

    set({ modals: [...state.modals, modalItem] });
    return id;
  },

  /**
   * Close a specific modal by ID
   */
  closeModal: (id: string) => {
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    }));
  },

  /**
   * Close all modals
   */
  closeAll: () => {
    set({ modals: [] });
  },

  /**
   * Get the z-index for a specific modal
   */
  getZIndex: (id: string): number => {
    const state = get();
    const index = state.modals.findIndex((modal) => modal.id === id);
    if (index === -1) {
      return Z_INDEX.MODAL;
    }
    return Z_INDEX.MODAL + (index * 10);
  },

  /**
   * Check if a modal is currently open
   */
  isModalOpen: (id: string): boolean => {
    const state = get();
    return state.modals.some((modal) => modal.id === id);
  },

  /**
   * Get the top (most recent) modal in the stack
   */
  getTopModal: (): ModalStackItem | null => {
    const state = get();
    if (state.modals.length === 0) {
      return null;
    }
    return state.modals[state.modals.length - 1];
  },
}));
