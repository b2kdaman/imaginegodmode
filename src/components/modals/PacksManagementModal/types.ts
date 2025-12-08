/**
 * TypeScript type definitions for Packs Management Modal
 */

import type { ThemeColors } from '@/utils/themeLoader';
import type { PromptItem } from '@/types';

// Drag and Drop types
export const ItemTypes = {
  PROMPT: 'prompt',
} as const;

export interface DragItem {
  type: typeof ItemTypes.PROMPT;
  promptIndex: number;
  sourcePack: string;
}

export interface PackListItemProps {
  packName: string;
  index?: number;
  promptCount: number;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
  onDropPrompt: (promptIndex: number, sourcePack: string) => void;
  onPackMove?: (dragIndex: number, hoverIndex: number) => void;
  getThemeColors: () => ThemeColors;
}

export interface PromptListItemProps {
  prompt: PromptItem;
  index: number;
  packName: string;
  isDraggable: boolean;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onPromptMove?: (dragIndex: number, hoverIndex: number) => void;
  getThemeColors: () => ThemeColors;
}

export interface PacksPanelProps {
  onAddPack: (name: string) => void;
  onRenamePack: (oldName: string, newName: string) => void;
  onDeletePack: (name: string) => void;
  onDropPrompt: (packName: string, promptIndex: number, sourcePack: string) => void;
  importMode: 'add' | 'replace';
  onImportModeChange: (mode: 'add' | 'replace') => void;
  onImport: () => void;
  onExport: () => void;
  onCopyGrokPrompt: () => void;
  getThemeColors: () => ThemeColors;
}

export interface PromptsPanelProps {
  onReorderPrompts?: (dragIndex: number, hoverIndex: number) => void;
  getThemeColors: () => ThemeColors;
}

export interface PacksManagementFooterProps {
  importMode: 'add' | 'replace';
  onImportModeChange: (mode: 'add' | 'replace') => void;
  onImport: () => void;
  onExport: () => void;
  onCopyGrokPrompt: () => void;
  getThemeColors: () => ThemeColors;
}

export interface PacksManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  getThemeColors: () => ThemeColors;
}
