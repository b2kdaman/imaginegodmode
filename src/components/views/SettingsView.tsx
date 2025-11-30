/**
 * Settings view component
 */

import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePromptStore } from '@/store/usePromptStore';
import { exportPack } from '@/utils/storage';
import { Button } from '../inputs/Button';
import { Icon } from '../common/Icon';
import { PackSelectModal } from '../modals/PackSelectModal';
import { ImportPackModal } from '../modals/ImportPackModal';
import {
  mdiDownload,
  mdiUpload,
  mdiContentCopy,
  mdiPalette,
  mdiResize,
  mdiTranslate,
  mdiDownloadCircle,
  mdiDatabase,
  mdiSwapHorizontal,
  mdiKeyboard
} from '@mdi/js';
import { useTranslation } from '@/contexts/I18nContext';
import {
  trackThemeChanged,
  trackSizeChanged,
  trackLanguageChanged,
  trackAutoDownloadToggled,
  trackRememberPostStateToggled,
  trackSimpleShortcutToggled,
} from '@/utils/analytics';

export const SettingsView: React.FC = () => {
  const { theme, size, autoDownload, rememberPostState, simpleShortcut, setTheme, setSize, setAutoDownload, setRememberPostState, setSimpleShortcut, getThemeColors } = useSettingsStore();
  const { importPack, currentPack, packs } = usePromptStore();
  const { t, locale, setLocale } = useTranslation();
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
    <div
      className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-scroll custom-scrollbar pr-2 p-2"
      style={{
        scrollbarGutter: 'stable',
      }}
    >
      {/* Theme Setting */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs flex items-center gap-1.5"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          <Icon path={mdiPalette} size={0.6} color={colors.TEXT_SECONDARY} />
          {t('settings.theme')}
        </label>
        <select
          value={theme}
          onChange={(e) => {
            const newTheme = e.target.value as 'dark' | 'light' | 'dracula' | 'winamp' | 'limewire' | 'steam' | 'discord';
            setTheme(newTheme);
            trackThemeChanged(newTheme);
          }}
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
          <option value="dark">{t('settings.themes.dark')}</option>
          <option value="light">{t('settings.themes.light')}</option>
          <option value="dracula">{t('settings.themes.dracula')}</option>
          <option value="winamp">{t('settings.themes.winamp')}</option>
          <option value="limewire">{t('settings.themes.limewire')}</option>
          <option value="steam">{t('settings.themes.steam')}</option>
          <option value="discord">{t('settings.themes.discord')}</option>
        </select>
      </div>

      {/* Size Setting */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs flex items-center gap-1.5"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          <Icon path={mdiResize} size={0.6} color={colors.TEXT_SECONDARY} />
          {t('settings.size')}
        </label>
        <select
          value={size}
          onChange={(e) => {
            const newSize = e.target.value as 'tiny' | 'small' | 'medium' | 'large';
            setSize(newSize);
            trackSizeChanged(newSize);
          }}
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
          <option value="tiny">{t('settings.sizes.tiny')}</option>
          <option value="small">{t('settings.sizes.small')}</option>
          <option value="medium">{t('settings.sizes.medium')}</option>
          <option value="large">{t('settings.sizes.large')}</option>
        </select>
      </div>

      {/* Language Setting */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs flex items-center gap-1.5"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          <Icon path={mdiTranslate} size={0.6} color={colors.TEXT_SECONDARY} />
          {t('settings.language')}
        </label>
        <select
          value={locale}
          onChange={(e) => {
            const newLocale = e.target.value;
            setLocale(newLocale);
            trackLanguageChanged(newLocale);
          }}
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
          <option value="en">{t('settings.languages.en')}</option>
          <option value="es">{t('settings.languages.es')}</option>
          <option value="ru">{t('settings.languages.ru')}</option>
        </select>
      </div>

      {/* Auto Download Setting */}
      <div className="flex items-center justify-between gap-2">
        <label
          className="text-sm cursor-pointer flex items-center gap-1.5"
          style={{ color: colors.TEXT_PRIMARY }}
          htmlFor="auto-download-toggle"
        >
          <Icon path={mdiDownloadCircle} size={0.7} color={colors.TEXT_PRIMARY} />
          {t('settings.autoDownload')}
        </label>
        <label className="relative inline-block w-12 h-6 cursor-pointer">
          <input
            id="auto-download-toggle"
            type="checkbox"
            checked={autoDownload}
            onChange={(e) => {
              const newValue = e.target.checked;
              setAutoDownload(newValue);
              trackAutoDownloadToggled(newValue);
            }}
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

      {/* Remember Post State Setting */}
      <div className="flex items-center justify-between gap-2">
        <label
          className="text-sm cursor-pointer flex items-center gap-1.5"
          style={{ color: colors.TEXT_PRIMARY }}
          htmlFor="remember-post-state-toggle"
        >
          <Icon path={mdiDatabase} size={0.7} color={colors.TEXT_PRIMARY} />
          {t('settings.rememberPostState')}
        </label>
        <label className="relative inline-block w-12 h-6 cursor-pointer">
          <input
            id="remember-post-state-toggle"
            type="checkbox"
            checked={rememberPostState}
            onChange={(e) => {
              const newValue = e.target.checked;
              setRememberPostState(newValue);
              trackRememberPostStateToggled(newValue);
            }}
            className="sr-only peer"
          />
          <div
            className="w-full h-full rounded-full transition-colors peer-checked:bg-green-500"
            style={{
              backgroundColor: rememberPostState ? colors.SUCCESS : colors.BACKGROUND_MEDIUM,
              border: `2px solid ${rememberPostState ? colors.SUCCESS : colors.BORDER}`,
            }}
          >
            <div
              className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-transform"
              style={{
                backgroundColor: colors.TEXT_PRIMARY,
                transform: rememberPostState ? 'translateX(24px)' : 'translateX(0)',
              }}
            />
          </div>
        </label>
      </div>

      {/* Simple Shortcut Setting */}
      <div className="flex items-center justify-between gap-2">
        <label
          className="text-sm cursor-pointer flex items-center gap-1.5"
          style={{ color: colors.TEXT_PRIMARY }}
          htmlFor="simple-shortcut-toggle"
          data-tooltip-id="app-tooltip"
          data-tooltip-content="Use Ctrl/Cmd+Enter instead of Ctrl/Cmd+Shift+Enter to apply prompt"
        >
          <Icon path={mdiKeyboard} size={0.7} color={colors.TEXT_PRIMARY} />
          {t('settings.simpleShortcut')}
        </label>
        <label className="relative inline-block w-12 h-6 cursor-pointer">
          <input
            id="simple-shortcut-toggle"
            type="checkbox"
            checked={simpleShortcut}
            onChange={(e) => {
              const newValue = e.target.checked;
              setSimpleShortcut(newValue);
              trackSimpleShortcutToggled(newValue);
            }}
            className="sr-only peer"
          />
          <div
            className="w-full h-full rounded-full transition-colors peer-checked:bg-green-500"
            style={{
              backgroundColor: simpleShortcut ? colors.SUCCESS : colors.BACKGROUND_MEDIUM,
              border: `2px solid ${simpleShortcut ? colors.SUCCESS : colors.BORDER}`,
            }}
          >
            <div
              className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-transform"
              style={{
                backgroundColor: colors.TEXT_PRIMARY,
                transform: simpleShortcut ? 'translateX(24px)' : 'translateX(0)',
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
          className="text-xs flex items-center gap-1.5"
          style={{ color: colors.TEXT_SECONDARY }}
        >
          <Icon path={mdiDatabase} size={0.6} color={colors.TEXT_SECONDARY} />
          {t('settings.dataManagement')}
        </label>

        {/* Import Mode Selection */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs flex items-center gap-1.5"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            <Icon path={mdiSwapHorizontal} size={0.6} color={colors.TEXT_SECONDARY} />
            {t('settings.importMode')}
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
              {t('settings.importModeAdd')}
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
              {t('settings.importModeReplace')}
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
            {t('common.export')}
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
            {t('common.import')}
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
