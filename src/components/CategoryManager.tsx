/**
 * Category management component
 */

import React, { useState, useRef, useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { Icon } from './Icon';
import { mdiPlus, mdiClose, mdiCheck, mdiDelete } from '@mdi/js';

export const CategoryManager: React.FC = () => {
  const {
    categories,
    currentCategory,
    setCurrentCategory,
    addCategory,
    deleteCategory,
  } = usePromptStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [lastDeleteClickTime, setLastDeleteClickTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const categoryNames = Object.keys(categories);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryNames.length <= 1) return;

    const now = Date.now();
    const timeSinceLastClick = now - lastDeleteClickTime;

    if (timeSinceLastClick < 500) {
      // Double click confirmed - delete
      deleteCategory(currentCategory);
      setLastDeleteClickTime(0);
    } else {
      // First click
      setLastDeleteClickTime(now);
      setTimeout(() => setLastDeleteClickTime(0), 500);
    }
  };

  const isDeleteHighlighted = Date.now() - lastDeleteClickTime < 500;

  return (
    <div className="flex items-center gap-2 mb-3">
      {!isAdding ? (
        <>
          <select
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
            className="flex-1 px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-sm cursor-pointer focus:outline-none focus:border-white/40"
          >
            {categoryNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors flex items-center justify-center"
            title="Add category"
          >
            <Icon path={mdiPlus} size={0.7} />
          </button>

          <button
            onClick={handleDeleteCategory}
            disabled={categoryNames.length <= 1}
            className="px-3 py-2 rounded-full border border-white/20 text-xs transition-colors disabled:opacity-30 flex items-center justify-center"
            style={{
              backgroundColor: isDeleteHighlighted ? '#ff4444' : '#2a2a2a',
              color: 'white',
            }}
            title={
              categoryNames.length <= 1
                ? 'Cannot delete last category'
                : 'Double-click to delete category'
            }
          >
            <Icon path={mdiDelete} size={0.7} />
          </button>
        </>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCategory();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewCategoryName('');
              }
            }}
            placeholder="Category name..."
            className="flex-1 px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-sm focus:outline-none focus:border-white/40"
          />

          <button
            onClick={handleAddCategory}
            className="px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors flex items-center justify-center"
          >
            <Icon path={mdiCheck} size={0.7} />
          </button>

          <button
            onClick={() => {
              setIsAdding(false);
              setNewCategoryName('');
            }}
            className="px-3 py-2 rounded-full bg-grok-gray text-white border border-white/20 text-xs hover:bg-grok-light transition-colors flex items-center justify-center"
          >
            <Icon path={mdiClose} size={0.7} />
          </button>
        </>
      )}
    </div>
  );
};
