/**
 * Modal component for searching prompts across all packs
 */

import React, { useState, useEffect, useRef } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useTranslation } from '@/contexts/I18nContext';
import { Icon } from './Icon';
import { RatingSystem } from './RatingSystem';
import { mdiClose, mdiMagnify } from '@mdi/js';
import { trackPromptSearched } from '@/utils/analytics';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  getThemeColors: () => any;
}

interface SearchResult {
  packName: string;
  promptIndex: number;
  text: string;
  rating: number;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  getThemeColors,
}) => {
  const { packs, setCurrentPack, setCurrentIndex } = usePromptStore();
  const { t } = useTranslation();
  const colors = getThemeColors();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search whenever query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search through all packs
    Object.entries(packs).forEach(([packName, prompts]) => {
      prompts.forEach((prompt, index) => {
        if (prompt.text.toLowerCase().includes(query)) {
          searchResults.push({
            packName,
            promptIndex: index,
            text: prompt.text,
            rating: prompt.rating || 0,
          });
        }
      });
    });

    setResults(searchResults);

    // Track search with query length and result count
    if (searchQuery.trim()) {
      trackPromptSearched(searchQuery.length, searchResults.length);
    }
  }, [searchQuery, packs]);

  const handleSelectResult = (result: SearchResult) => {
    setCurrentPack(result.packName);
    setCurrentIndex(result.promptIndex);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={handleClose}
    >
      <div
        className="rounded-xl p-4 max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
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
            {t('modals.searchPrompts.title')}
          </h2>
          <button
            onClick={handleClose}
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

        {/* Search Input */}
        <div className="relative mb-3">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon path={mdiMagnify} size={0.7} color={colors.TEXT_SECONDARY} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('modals.searchPrompts.placeholder')}
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              backgroundColor: colors.BACKGROUND_MEDIUM,
              color: colors.TEXT_PRIMARY,
              border: `1px solid ${colors.BORDER}`,
            }}
          />
        </div>

        {/* Result Count */}
        {searchQuery && (
          <div
            className="text-xs mb-2"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            {t('modals.searchPrompts.resultCount', { count: results.length })}
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-scroll custom-scrollbar">
          {searchQuery && results.length === 0 ? (
            <div
              className="text-center py-8 text-sm"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              {t('modals.searchPrompts.noResults')}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((result, idx) => (
                <button
                  key={`${result.packName}-${result.promptIndex}-${idx}`}
                  onClick={() => handleSelectResult(result)}
                  className="text-left p-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: colors.BACKGROUND_MEDIUM,
                    border: `1px solid ${colors.BORDER}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
                    e.currentTarget.style.borderColor = colors.TEXT_SECONDARY;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
                    e.currentTarget.style.borderColor = colors.BORDER;
                  }}
                >
                  {/* Prompt Text */}
                  <div
                    className="text-sm mb-2 line-clamp-2"
                    style={{ color: colors.TEXT_PRIMARY }}
                  >
                    {result.text}
                  </div>

                  {/* Pack Name and Prompt Number */}
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="font-medium truncate"
                      style={{ color: colors.TEXT_SECONDARY }}
                    >
                      {result.packName}
                    </span>
                    <span
                      className="ml-2 flex-shrink-0"
                      style={{ color: colors.TEXT_SECONDARY, opacity: 0.5 }}
                    >
                      {t('modals.searchPrompts.promptNumber', { number: result.promptIndex + 1 })}
                    </span>
                  </div>

                  {/* Rating */}
                  {result.rating > 0 && (
                    <div className="mt-2">
                      <RatingSystem
                        rating={result.rating}
                        onChange={() => {}}
                        readonly
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
