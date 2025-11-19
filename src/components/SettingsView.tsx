/**
 * Settings view component
 */

import React, { useState, useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePromptStore } from '@/store/usePromptStore';
import { exportPack } from '@/utils/storage';
import { Button } from './Button';
import { Icon } from './Icon';
import { PackSelectModal } from './PackSelectModal';
import { ImportPackModal } from './ImportPackModal';
import { mdiDownload, mdiUpload, mdiContentCopy } from '@mdi/js';

export const SettingsView: React.FC = () => {
  const { theme, size, autoDownload, setTheme, setSize, setAutoDownload, getThemeColors } = useSettingsStore();
  const { exportCurrentPack, importPack, currentPack, packs } = usePromptStore();
  const colors = getThemeColors();

  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleExportPack = (packName: string) => {
    const prompts = packs[packName] || [];
    exportPack(packName, prompts);
    setStatusMessage(`Pack "${packName}" exported successfully!`);
    setTimeout(() => setStatusMessage(''), 3000);
    setIsExportModalOpen(false);
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
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage('Failed to copy prompt');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleImport = async (file: File) => {
    const result = await importPack(file, importMode);

    if (result.success && result.packName) {
      setStatusMessage(`Pack "${result.packName}" imported successfully (${importMode} mode)!`);
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Theme Setting */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          Theme
        </label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'dracula')}
          className="pl-3 pr-8 py-2 rounded-full text-sm cursor-pointer focus:outline-none transition-colors"
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
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="dracula">Dracula</option>
        </select>
      </div>

      {/* Size Setting */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          Size
        </label>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value as 'tiny' | 'small' | 'medium' | 'large')}
          className="pl-3 pr-8 py-2 rounded-full text-sm cursor-pointer focus:outline-none transition-colors"
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
          <option value="tiny">Tiny (70%)</option>
          <option value="small">Small (85%)</option>
          <option value="medium">Medium (100%)</option>
          <option value="large">Large (115%)</option>
        </select>
      </div>

      {/* Auto Download Setting */}
      <div className="flex items-center justify-between gap-2">
        <label
          className="text-sm cursor-pointer"
          style={{ color: colors.TEXT_PRIMARY }}
          htmlFor="auto-download-toggle"
        >
          Auto Download
        </label>
        <label className="relative inline-block w-12 h-6 cursor-pointer">
          <input
            id="auto-download-toggle"
            type="checkbox"
            checked={autoDownload}
            onChange={(e) => setAutoDownload(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className="w-full h-full rounded-full transition-colors peer-checked:bg-green-500"
            style={{
              backgroundColor: autoDownload ? colors.SUCCESS : colors.BACKGROUND_MEDIUM,
              border: `2px solid ${autoDownload ? colors.SUCCESS : colors.BORDER}`,
            }}
          >
            <div
              className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-transform"
              style={{
                backgroundColor: colors.TEXT_PRIMARY,
                transform: autoDownload ? 'translateX(24px)' : 'translateX(0)',
              }}
            />
          </div>
        </label>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px"
        style={{ backgroundColor: colors.BORDER }}
      />

      {/* Data Management Section */}
      <div className="flex flex-col gap-3">
        <label
          className="text-xs"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          Data Management
        </label>

        {/* Import Mode Selection */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            Import Mode
          </label>
          <div className="flex gap-2">
            <label
              className="flex items-center gap-2 cursor-pointer text-sm"
              style={{ color: colors.TEXT_PRIMARY }}
            >
              <input
                type="radio"
                name="import-mode"
                value="add"
                checked={importMode === 'add'}
                onChange={(e) => setImportMode(e.target.value as 'add')}
                className="cursor-pointer"
                style={{ accentColor: colors.SUCCESS }}
              />
              Add
            </label>
            <label
              className="flex items-center gap-2 cursor-pointer text-sm"
              style={{ color: colors.TEXT_PRIMARY }}
            >
              <input
                type="radio"
                name="import-mode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={(e) => setImportMode(e.target.value as 'replace')}
                className="cursor-pointer"
                style={{ accentColor: colors.SUCCESS }}
              />
              Replace
            </label>
          </div>
        </div>

        {/* Export/Import Buttons */}
        <div className="flex gap-2 items-center">
          <Button
            onClick={handleExportClick}
            icon={mdiDownload}
            className="flex-1"
            tooltip={`Export pack to JSON
For backup or sharing`}
          >
            Export
          </Button>
          <button
            onClick={handleCopyGrokPrompt}
            className="flex items-center justify-center transition-all rounded-full"
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              minHeight: '36px',
              backgroundColor: colors.BACKGROUND_MEDIUM,
              border: `1px solid ${colors.BORDER}`,
              color: colors.TEXT_PRIMARY,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_LIGHT;
              e.currentTarget.style.borderColor = colors.TEXT_SECONDARY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.BACKGROUND_MEDIUM;
              e.currentTarget.style.borderColor = colors.BORDER;
            }}
            data-tooltip-id="app-tooltip"
            data-tooltip-content={`Copy Grok system prompt
Paste → describe pack theme
Grok generates JSON (10-15 prompts)
Includes: format, quality rules, ratings`}
          >
            <Icon path={mdiContentCopy} size={0.6} color={colors.TEXT_PRIMARY} />
          </button>
          <Button
            onClick={handleImportClick}
            icon={mdiUpload}
            className="flex-1"
            tooltip={`Import pack from JSON
Mode: ${importMode}
${importMode === 'add' ? 'Add: Creates new (fails if exists)' : 'Replace: Overwrites or creates new'}`}
          >
            Import
          </Button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className="text-xs text-center p-2 rounded-lg"
            style={{
              backgroundColor: colors.BACKGROUND_MEDIUM,
              color: statusMessage.includes('failed') ? colors.TEXT_SECONDARY : colors.SUCCESS,
              border: `1px solid ${colors.BORDER}`,
            }}
          >
            {statusMessage}
          </div>
        )}
      </div>

      {/* Pack Select Modal */}
      <PackSelectModal
        isOpen={isExportModalOpen}
        packs={Object.keys(packs)}
        currentPack={currentPack}
        onClose={() => setIsExportModalOpen(false)}
        onSelectPack={handleExportPack}
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

    </div>
  );
};
