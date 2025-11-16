/**
 * Category management component
 */

import React, { useState, useRef, useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from './Button';
import { UI_COLORS } from '@/utils/constants';
import { mdiPlus, mdiClose, mdiCheck, mdiDelete } from '@mdi/js';

export const CategoryManager: React.FC = () => {
  const {
    categories,
    currentCategory,
    setCurrentCategory,
    addCategory,
    deleteCategory,
  } = usePromptStore();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

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
            className="flex-1 pl-3 pr-8 py-2 rounded-full text-sm cursor-pointer focus:outline-none"
            style={{
              backgroundColor: colors.BACKGROUND_MEDIUM,
              color: colors.TEXT_PRIMARY,
              border: `1px solid ${colors.BORDER}`,
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.TEXT_PRIMARY)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
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
            variant="icon"
            title="Add category"
          />

          <Button
            onClick={handleDeleteCategory}
            icon={mdiDelete}
            iconSize={0.7}
            variant="icon"
            disabled={categoryNames.length <= 1}
            style={{
              backgroundColor: isDeleteHighlighted ? UI_COLORS.DANGER : UI_COLORS.BACKGROUND_MEDIUM,
              color: UI_COLORS.WHITE,
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
            className="flex-1 px-3 py-2 rounded-full text-sm focus:outline-none"
            style={{
              backgroundColor: colors.BACKGROUND_MEDIUM,
              color: colors.TEXT_PRIMARY,
              border: `1px solid ${colors.BORDER}`,
            }}
          />

          <Button
            onClick={handleAddCategory}
            icon={mdiCheck}
            iconSize={0.7}
            variant="icon"
          />

          <Button
            onClick={() => {
              setIsAdding(false);
              setNewCategoryName('');
            }}
            icon={mdiClose}
            iconSize={0.7}
            variant="icon"
          />
        </>
      )}
    </div>
  );
};
