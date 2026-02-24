import React, { useState } from 'react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/inputs/Button';
import { BaseModal } from '@/components/modals/BaseModal';
import { mdiStar, mdiDelete, mdiContentCopy } from '@mdi/js';

interface FavoritesPanelProps {
  onSelectPrompt?: (text: string) => void;
}

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ onSelectPrompt }) => {
  const { favorites, removeFavorite } = useFavoritesStore();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSelectPrompt = (text: string) => {
    onSelectPrompt?.(text);
    setIsModalOpen(false);
  };

  return (
    <div className="mt-3">
      <Button
        onClick={() => setIsModalOpen(true)}
        icon={mdiStar}
        className="w-full text-sm"
        tooltip="Open favorites"
      >
        Favorites ({favorites.length})
      </Button>

      <BaseModal
        isOpen={isModalOpen}
        title={`Favorites (${favorites.length})`}
        onClose={() => setIsModalOpen(false)}
        getThemeColors={getThemeColors}
        maxWidth="md"
        maxHeight="80vh"
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setIsModalOpen(false)} className="text-xs">
              Close
            </Button>
          </div>
        }
      >
        <div
          className="mt-1 rounded-lg p-2 max-h-[64vh] overflow-y-auto custom-scrollbar"
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
                      className="text-xs line-clamp-2"
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
      </BaseModal>
    </div>
  );
};
