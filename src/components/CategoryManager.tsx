/**
 * Category management component
 */

import React, { useState, useRef, useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { Button } from './Button';
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

          <Button
            onClick={() => setIsAdding(true)}
            icon={mdiPlus}
            iconSize={0.7}
            title="Add category"
          />

          <Button
            onClick={handleDeleteCategory}
            icon={mdiDelete}
            iconSize={0.7}
            disabled={categoryNames.length <= 1}
            style={{
              backgroundColor: isDeleteHighlighted ? '#ff4444' : '#2a2a2a',
              color: 'white',
            }}
            title={
              categoryNames.length <= 1
                ? 'Cannot delete last category'
                : 'Double-click to delete category'
            }
          />
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

          <Button
            onClick={handleAddCategory}
            icon={mdiCheck}
            iconSize={0.7}
          />

          <Button
            onClick={() => {
              setIsAdding(false);
              setNewCategoryName('');
            }}
            icon={mdiClose}
            iconSize={0.7}
          />
        </>
      )}
    </div>
  );
};
