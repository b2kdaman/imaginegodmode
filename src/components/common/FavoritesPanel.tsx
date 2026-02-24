import React, { useState } from 'react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/inputs/Button';
import { Icon } from '@/components/common/Icon';
import { mdiStar, mdiDelete, mdiContentCopy } from '@mdi/js';

interface FavoritesPanelProps {
  onSelectPrompt?: (text: string) => void;
}

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ onSelectPrompt }) => {
  const { favorites, removeFavorite } = useFavoritesStore();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);

  if (favorites.length === 0 && !isExpanded) {
    return null;
  }

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSelectPrompt = (text: string) => {
    onSelectPrompt?.(text);
    setIsExpanded(false);
  };

  return (
    <div className="mt-3">
      <div
        className="flex items-center justify-between cursor-pointer py-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon path={mdiStar} size={0.8} color={colors.TEXT_SECONDARY} />
          <span
            className="text-xs font-medium"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            Favorites ({favorites.length})
          </span>
        </div>
        <span
          className="text-xs"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div
          className="mt-2 rounded-lg p-2 max-h-48 overflow-y-auto custom-scrollbar"
          style={{
            backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          {favorites.length === 0 ? (
            <p
              className="text-xs text-center py-2"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              No favorites yet. Star prompts to add them here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-start gap-2 p-2 rounded"
                  style={{
                    backgroundColor: `${colors.BACKGROUND_LIGHT}50`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs truncate"
                      style={{ color: colors.TEXT_PRIMARY }}
                      title={fav.text}
                    >
                      {fav.text}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: colors.TEXT_SECONDARY }}
                    >
                      {fav.packName} • {new Date(fav.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="icon"
                      icon={mdiContentCopy}
                      onClick={() => handleCopyPrompt(fav.text)}
                      tooltip="Copy to clipboard"
                    />
                    {onSelectPrompt && (
                      <Button
                        variant="icon"
                        icon={mdiStar}
                        onClick={() => handleSelectPrompt(fav.text)}
                        tooltip="Use this prompt"
                      />
                    )}
                    <Button
                      variant="icon"
                      icon={mdiDelete}
                      onClick={() => removeFavorite(fav.id)}
                      tooltip="Remove from favorites"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
