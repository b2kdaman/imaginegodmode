/**
 * Custom hook for handling shift-click multi-selection
 */

import { useState, useCallback } from 'react';

export const useShiftSelection = <T extends { id: string }>(posts: T[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const toggleSelection = useCallback((postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const currentIndex = posts.findIndex((p) => p.id === postId);

    // Handle shift-click for batch selection/deselection
    if (e?.shiftKey && lastClickedIndex !== null && currentIndex !== -1) {
      const newSelected = new Set(selectedIds);
      const start = Math.min(lastClickedIndex, currentIndex);
      const end = Math.max(lastClickedIndex, currentIndex);

      // Determine whether to select or deselect based on the current item's state
      const shouldSelect = !selectedIds.has(postId);

      // Apply the same action to all items in the range
      for (let i = start; i <= end; i++) {
        if (shouldSelect) {
          newSelected.add(posts[i].id);
        } else {
          newSelected.delete(posts[i].id);
        }
      }

      setSelectedIds(newSelected);
    } else {
      // Normal click - toggle single item
      const newSelected = new Set(selectedIds);
      if (newSelected.has(postId)) {
        newSelected.delete(postId);
      } else {
        newSelected.add(postId);
      }
      setSelectedIds(newSelected);
    }

    // Update last clicked index
    if (currentIndex !== -1) {
      setLastClickedIndex(currentIndex);
    }
  }, [posts, selectedIds, lastClickedIndex]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(posts.map((p) => p.id)));
  }, [posts]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastClickedIndex(null);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
    clearSelection,
  };
};
