/**
 * Modal component for searching prompts across all packs
 */

import React, { useState, useEffect, useRef } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useTranslation } from '@/contexts/I18nContext';
import { Icon } from '../common/Icon';
import { RatingSystem } from '../inputs/RatingSystem';
import { mdiMagnify } from '@mdi/js';
import { trackPromptSearched } from '@/utils/analytics';
import { BaseModal } from './BaseModal';
import { ThemeColors } from '@/utils/themeLoader';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  getThemeColors: () => ThemeColors;
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
      // Use setTimeout to avoid synchronous setState in effect
      const clearTimer = setTimeout(() => {
        setResults([]);
      }, 0);
      return () => clearTimeout(clearTimer);
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

    // Use setTimeout to avoid synchronous setState in effect
    const updateTimer = setTimeout(() => {
      setResults(searchResults);
    }, 0);

    // Track search with query length and result count
    if (searchQuery.trim()) {
      trackPromptSearched(searchQuery.length, searchResults.length);
    }

    return () => clearTimeout(updateTimer);
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

  return (
    <BaseModal
      isOpen={isOpen}
      title={t('modals.searchPrompts.title')}
      onClose={handleClose}
      getThemeColors={getThemeColors}
      maxWidth="md"
      maxHeight="80vh"
    >
      <>

      {/* Search Input */}
      <div className="relative mb-3">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon path={mdiMagnify} size={0.7} color="var(--theme-text-secondary)" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('modals.searchPrompts.placeholder')}
          className="w-full pl-10 pr-3 py-2 rounded-lg text-sm focus:outline-none bg-theme-bg-medium text-theme-text-primary border border-theme-border"
        />
      </div>

      {/* Result Count */}
      {searchQuery && (
        <div className="text-xs mb-2 text-theme-text-secondary">
          {t('modals.searchPrompts.resultCount', { count: results.length })}
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-scroll custom-scrollbar">
        {searchQuery && results.length === 0 ? (
          <div className="text-center py-8 text-sm text-theme-text-secondary">
            {t('modals.searchPrompts.noResults')}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {results.map((result, idx) => (
              <button
                key={`${result.packName}-${result.promptIndex}-${idx}`}
                onClick={() => handleSelectResult(result)}
                className="text-left p-3 rounded-lg transition-colors bg-theme-bg-medium border border-theme-border hover:bg-theme-bg-light hover:border-theme-text-secondary"
              >
                {/* Prompt Text */}
                <div className="text-sm mb-2 line-clamp-2 text-theme-text-primary">
                  {result.text}
                </div>

                {/* Pack Name and Prompt Number */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate text-theme-text-secondary">
                    {result.packName}
                  </span>
                  <span className="ml-2 flex-shrink-0 text-theme-text-secondary opacity-50">
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
      </>
    </BaseModal>
  );
};
