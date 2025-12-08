/**
 * Main Packs Management Modal component
 * Provides split-panel interface for managing packs and prompts
 */

import React, { useState } from 'react';
import { BaseModal } from '../BaseModal';
import { Button } from '@/components/inputs/Button';
import { PacksPanel } from './PacksPanel';
import { PromptsPanel } from './PromptsPanel';
import { PackSelectModal } from '../PackSelectModal';
import { ImportPackModal } from '../ImportPackModal';
import { usePromptStore } from '@/store/usePromptStore';
import { usePacksManagementStore } from './usePacksManagementStore';
import { exportAllPacks, exportPack } from '@/utils/storage';
import type { PacksManagementModalProps } from './types';

export const PacksManagementModal: React.FC<PacksManagementModalProps> = ({
  isOpen,
  onClose,
  getThemeColors,
}) => {
  const { packs, currentPack, addPack, renamePack, deletePack, importPack, movePromptToPack, reorderPrompts } = usePromptStore();
  const {
    selectedPackName,
    setSelectedPackName,
    statusMessage,
    setStatusMessage,
    isNotificationVisible,
    setIsNotificationVisible,
    resetState,
  } = usePacksManagementStore();

  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [packToDelete, setPackToDelete] = useState<string | null>(null);

  // Update selected pack when current pack changes
  React.useEffect(() => {
    if (isOpen && !selectedPackName) {
      setSelectedPackName(currentPack);
    }
  }, [isOpen, currentPack, selectedPackName, setSelectedPackName]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  // Manage notification visibility and animations
  React.useEffect(() => {
    if (statusMessage) {
      // Show notification with slide-in animation
      setIsNotificationVisible(true);

      // Start fade-out after 2.5 seconds
      const fadeOutTimer = setTimeout(() => {
        setIsNotificationVisible(false);
      }, 2500);

      // Clear the message after animation completes
      const clearTimer = setTimeout(() => {
        setStatusMessage('');
      }, 3000);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(clearTimer);
      };
    } else {
      setIsNotificationVisible(false);
    }
  }, [statusMessage, setIsNotificationVisible, setStatusMessage]);

  const handleAddPack = (name: string) => {
    addPack(name);
    setSelectedPackName(name);
    setStatusMessage(`Pack "${name}" created`);
  };

  const handleRenamePack = (oldName: string, newName: string) => {
    renamePack(oldName, newName);
    if (selectedPackName === oldName) {
      setSelectedPackName(newName);
    }
    setStatusMessage(`Pack renamed to "${newName}"`);
  };

  const handleDeletePack = (name: string) => {
    const packNames = Object.keys(packs);
    if (packNames.length <= 1) {
      setStatusMessage('Cannot delete the last pack');
      return;
    }

    // Show confirmation modal
    setPackToDelete(name);
  };

  const confirmDeletePack = () => {
    if (!packToDelete) {
      return;
    }

    deletePack(packToDelete);

    // Switch to first available pack if deleted pack was selected
    if (selectedPackName === packToDelete) {
      const remainingPacks = Object.keys(packs).filter(p => p !== packToDelete);
      setSelectedPackName(remainingPacks[0] || currentPack);
    }

    setStatusMessage(`Pack "${packToDelete}" deleted`);
    setPackToDelete(null);
  };

  const cancelDeletePack = () => {
    setPackToDelete(null);
  };

  const handleDropPrompt = (targetPack: string, promptIndex: number, sourcePack: string) => {
    if (targetPack === sourcePack) {
      setStatusMessage('Prompt already in this pack');
      return;
    }

    movePromptToPack(promptIndex, sourcePack, targetPack);
    setStatusMessage(`Prompt moved from "${sourcePack}" to "${targetPack}"`);
  };

  const handlePromptReorder = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex || !selectedPackName) {
      return;
    }

    reorderPrompts(selectedPackName, dragIndex, hoverIndex);
  };

  const handleExport = (packNames: string[]) => {
    if (packNames.length === 0) {
      return;
    }

    if (packNames.length === 1) {
      // Single pack export
      const packName = packNames[0];
      const prompts = packs[packName] || [];
      exportPack(packName, prompts);
      setStatusMessage(`Pack "${packName}" exported successfully!`);
    } else {
      // Multi-pack export
      const selectedPacks = Object.fromEntries(
        packNames.map(name => [name, packs[name] || []])
      );
      exportAllPacks(selectedPacks);
      setStatusMessage(`${packNames.length} packs exported successfully!`);
    }

    setIsExportModalOpen(false);
  };

  const handleImport = async (file: File) => {
    const result = await importPack(file, importMode);

    if (result.success) {
      if (result.importedCount && result.importedCount > 1) {
        setStatusMessage(`${result.importedCount} packs imported successfully!`);
      } else if (result.packName) {
        setStatusMessage(`Pack "${result.packName}" imported successfully!`);
      } else {
        setStatusMessage('Import successful!');
      }
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  };

  const handleCopyGrokPrompt = async () => {
    const grokPrompt = `You are a SFW video prompt pack generator for a Chrome extension. Your task is to create a JSON file containing safe, creative, and professional video generation prompts organized in a pack.

**OUTPUT FORMAT (STRICT):**
\`\`\`json
{
  "version": "1.0",
  "exportDate": "${new Date().toISOString()}",
  "packName": "Pack Name Here",
  "prompts": [
    { "text": "Detailed SFW video generation prompt", "rating": 4 },
    { "text": "Another creative SFW prompt", "rating": 5 }
  ]
}
\`\`\`

**FIELD REQUIREMENTS:**
- \`version\`: Must be exactly "1.0"
- \`exportDate\`: ISO 8601 timestamp (use current date/time)
- \`packName\`: Creative pack name matching the theme
- \`prompts\`: Array of 10-15 prompt objects
- Each prompt object:
  - \`text\`: Detailed, creative SFW video generation prompt (include camera angles, lighting, movement, style, mood, setting)
  - \`rating\`: Integer 0-5 (0=unrated, 1-2=basic, 3=good, 4=great, 5=exceptional)

**CONTENT GUIDELINES (IMPORTANT - SFW ONLY):**
- ALL prompts must be Safe For Work (SFW)
- NO adult content, violence, gore, or disturbing imagery
- Focus on: nature, landscapes, cityscapes, abstract art, technology, food, architecture, animals, space, weather, emotions (positive), everyday life, sports, travel, culture
- Keep content appropriate for all audiences
- Emphasize beauty, creativity, and artistic expression

**PROMPT QUALITY GUIDELINES:**
- Be specific and descriptive (mention camera movements, lighting conditions, time of day, weather, mood)
- Include cinematic details (focal length, framing, speed, effects)
- Vary complexity and style across prompts
- Mix different types (establishing shots, close-ups, actions, abstract, landscapes)
- Distribute ratings realistically (not all 5s, show variety)

**EXAMPLE SFW PACKS:**
Cinematic Landscapes, Abstract Art, Nature & Wildlife, Sci-Fi Technology, Urban Architecture, Serene Underwater, Cosmic Space, Seasonal Weather, Food & Cuisine, Cultural Celebrations, Sports Action, Minimalist Design, Retro Aesthetic, Emotional Moments, Travel Destinations

**RESPONSE RULE:**
Return ONLY the valid JSON. No explanations, no markdown, no code blocks. Just the raw JSON object.

---

What type of SFW video prompt pack would you like me to create? (Describe the theme, style, or mood you want)`;

    try {
      await navigator.clipboard.writeText(grokPrompt);
      setStatusMessage('Grok prompt copied to clipboard!');
    } catch (_error) {
      setStatusMessage('Failed to copy prompt');
    }
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        title="Packs Management"
        onClose={onClose}
        getThemeColors={getThemeColors}
        width="95vw"
        maxWidth="full"
        height="85vh"
        maxHeight="900px"
        padding="p-4"
        overlayOpacity={0.7}
      >
        {/* Drop Notification */}
        {statusMessage && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md shadow-lg text-sm font-medium whitespace-nowrap"
            style={{
              backgroundColor: getThemeColors().BACKGROUND_MEDIUM,
              color: getThemeColors().TEXT_PRIMARY,
              border: `1px solid ${getThemeColors().BORDER}`,
              boxShadow: `0 4px 6px ${getThemeColors().SHADOW}`,
              maxWidth: '300px',
              top: isNotificationVisible ? '16px' : '-60px',
              opacity: isNotificationVisible ? 0.95 : 0,
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {statusMessage}
          </div>
        )}

        <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
          <PacksPanel
            onAddPack={handleAddPack}
            onRenamePack={handleRenamePack}
            onDeletePack={handleDeletePack}
            onDropPrompt={handleDropPrompt}
            importMode={importMode}
            onImportModeChange={setImportMode}
            onImport={() => setIsImportModalOpen(true)}
            onExport={() => setIsExportModalOpen(true)}
            onCopyGrokPrompt={handleCopyGrokPrompt}
            getThemeColors={getThemeColors}
          />
          <PromptsPanel
            onReorderPrompts={handlePromptReorder}
            getThemeColors={getThemeColors}
          />
        </div>
      </BaseModal>

      {/* Pack Select Modal for Export */}
      <PackSelectModal
        isOpen={isExportModalOpen}
        packs={Object.keys(packs)}
        currentPack={currentPack}
        onClose={() => setIsExportModalOpen(false)}
        onSelectPack={handleExport}
        getThemeColors={getThemeColors}
      />

      {/* Import Pack Modal */}
      <ImportPackModal
        isOpen={isImportModalOpen}
        importMode={importMode}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        getThemeColors={getThemeColors}
      />

      {/* Delete Confirmation Modal */}
      {packToDelete && (
        <BaseModal
          isOpen={true}
          title="Confirm Delete"
          onClose={cancelDeletePack}
          getThemeColors={getThemeColors}
          maxWidth="sm"
        >
          <div className="flex flex-col gap-4">
            <p style={{ color: getThemeColors().TEXT_PRIMARY }}>
              Are you sure you want to delete the pack <strong>&quot;{packToDelete}&quot;</strong>?
              {packs[packToDelete]?.length > 0 && (
                <span> This will delete {packs[packToDelete].length} prompt{packs[packToDelete].length !== 1 ? 's' : ''}.</span>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={cancelDeletePack}
                variant="default"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeletePack}
                variant="default"
                style={{
                  backgroundColor: getThemeColors().DANGER,
                  color: '#fff',
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </BaseModal>
      )}
    </>
  );
};
