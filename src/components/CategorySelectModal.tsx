/**
 * Modal component for selecting category to export
 */

import React from 'react';
import { Button } from './Button';
import { mdiClose, mdiDownload } from '@mdi/js';
import { Icon } from './Icon';

interface CategorySelectModalProps {
  isOpen: boolean;
  categories: string[];
  currentCategory: string;
  onClose: () => void;
  onSelectCategory: (categoryName: string) => void;
  getThemeColors: () => any;
}

export const CategorySelectModal: React.FC<CategorySelectModalProps> = ({
  isOpen,
  categories,
  currentCategory,
  onClose,
  onSelectCategory,
  getThemeColors,
}) => {
  const colors = getThemeColors();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-4 max-w-xs w-full mx-4"
        style={{
          backgroundColor: colors.BACKGROUND_DARK,
          border: `1px solid ${colors.BORDER}`,
          boxShadow: `0 8px 32px ${colors.SHADOW}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: colors.TEXT_PRIMARY }}
          >
            Select Category
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: colors.TEXT_SECONDARY,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
              e.currentTarget.style.color = colors.TEXT_PRIMARY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.TEXT_SECONDARY;
            }}
          >
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>

        {/* Category List */}
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto mb-3">
          {categories.map((categoryName) => (
            <button
              key={categoryName}
              onClick={() => onSelectCategory(categoryName)}
              className="text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between group text-sm"
              style={{
                backgroundColor:
                  categoryName === currentCategory
                    ? colors.BACKGROUND_MEDIUM
                    : colors.BACKGROUND_DARK,
                border: `1px solid ${
                  categoryName === currentCategory
                    ? colors.TEXT_SECONDARY
                    : colors.BORDER
                }`,
                color: colors.TEXT_PRIMARY,
              }}
              onMouseEnter={(e) => {
                if (categoryName !== currentCategory) {
                  e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
                  e.currentTarget.style.borderColor = colors.TEXT_SECONDARY;
                }
              }}
              onMouseLeave={(e) => {
                if (categoryName !== currentCategory) {
                  e.currentTarget.style.backgroundColor = colors.BACKGROUND_DARK;
                  e.currentTarget.style.borderColor = colors.BORDER;
                }
              }}
            >
              <span className="font-medium truncate">{categoryName}</span>
              {categoryName === currentCategory && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0"
                  style={{
                    backgroundColor: colors.SUCCESS,
                    color: '#fff',
                  }}
                >
                  Current
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <Button onClick={onClose} className="text-xs">Cancel</Button>
        </div>
      </div>
    </div>
  );
};
