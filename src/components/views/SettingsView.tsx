/**
 * Settings view component
 */

import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePromptStore } from '@/store/usePromptStore';
import { useUserStore } from '@/store/useUserStore';
import { clearUnlikedPosts } from '@/utils/storage';
import { fetchLikedPosts, unlikePost } from '@/api/grokApi';
import { Button } from '../inputs/Button';
import { Toggle } from '../inputs/Toggle';
import { Dropdown } from '../inputs/Dropdown';
import { Icon } from '../common/Icon';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { PurgeModal } from '../modals/PurgeModal';
import { PacksManagementModal } from '../modals/PacksManagementModal';
import {
  mdiPalette,
  mdiResize,
  mdiTranslate,
  mdiDownloadCircle,
  mdiDatabase,
  mdiKeyboard,
  mdiEyeOff,
  mdiFlare,
  mdiDeleteForever,
  mdiVolumeHigh,
  mdiAlertCircleOutline,
  mdiPackageVariant,
  mdiTextBoxPlus,
  mdiFormatListNumbered,
  mdiRestartOff,
  mdiViewCompactOutline,
  mdiExport,
  mdiImport
} from '@mdi/js';
import { useTranslation } from '@/contexts/I18nContext';
import {
  trackThemeChanged,
  trackSizeChanged,
  trackLanguageChanged,
  trackAutoDownloadToggled,
  trackRememberPostStateToggled,
  trackSimpleShortcutToggled,
  trackHideUnsaveToggled,
  trackSoundToggled,
  trackConfirmCopyFromToggled,
} from '@/utils/analytics';

export const SettingsView: React.FC = () => {
  const { theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableThePit, enableSound, confirmCopyFrom, compactMakeTogglers, globalPromptPrefixEnabled, globalPromptPrefix, globalPromptSuffixEnabled, globalPromptSuffix, listLimit, maxBulkLimit, collapseSections, navigatePostsWithArrows, setPanelPosition, setTheme, setSize, setAutoDownload, setRememberPostState, setSimpleShortcut, setHideUnsave, setEnableThePit, setEnableSound, setConfirmCopyFrom, setCompactMakeTogglers, setGlobalPromptPrefixEnabled, setGlobalPromptPrefix, setGlobalPromptSuffixEnabled, setGlobalPromptSuffix, setListLimit, setMaxBulkLimit, setCollapseSections, setNavigatePostsWithArrows, getThemeColors } = useSettingsStore();
  const { clearAllPacks } = usePromptStore();
  const { userId } = useUserStore();
  const { t, locale, setLocale } = useTranslation();
  const colors = getThemeColors();

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPacksModalOpen, setIsPacksModalOpen] = useState(false);
  const [purgeClickCount, setPurgeClickCount] = useState(0);
  const [isPurgeButtonHovered, setIsPurgeButtonHovered] = useState(false);

  const panelStyle = {
    background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
    borderColor: `${colors.BORDER}50`,
    boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
  };

  const promptTextAreaStyle = {
    backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
    color: colors.TEXT_PRIMARY,
    border: `1px solid ${colors.BORDER}`,
    WebkitBackdropFilter: 'blur(12px)',
    backdropFilter: 'blur(12px)',
  };

  const renderToggleRow = ({
    id,
    label,
    tooltip,
    icon,
    checked,
    onChange,
  }: {
    id: string;
    label: string;
    tooltip: string;
    icon: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div
      className="flex items-center justify-between gap-2 cursor-help"
      data-tooltip-content={tooltip}
    >
      <label
        className="text-sm cursor-pointer flex items-center gap-1.5"
        style={{ color: colors.TEXT_PRIMARY }}
        htmlFor={id}
      >
        <Icon path={icon} size={0.7} color={colors.TEXT_PRIMARY} />
        {label}
      </label>
      <Toggle
        id={id}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );

  const handleExportSettings = () => {
    const settings = {
      theme,
      size,
      autoDownload,
      rememberPostState,
      simpleShortcut,
      hideUnsave,
      enableThePit,
      enableSound,
      confirmCopyFrom,
      compactMakeTogglers,
      globalPromptPrefixEnabled,
      globalPromptPrefix,
      globalPromptSuffixEnabled,
      globalPromptSuffix,
      listLimit,
      maxBulkLimit,
      collapseSections,
      navigatePostsWithArrows,
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imagine-god-mode-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {return;}
      
      try {
        const text = await file.text();
        const settings = JSON.parse(text);

        if (settings.theme) {setTheme(settings.theme);}
        if (settings.size) {setSize(settings.size);}
        if (typeof settings.autoDownload === 'boolean') {setAutoDownload(settings.autoDownload);}
        if (typeof settings.rememberPostState === 'boolean') {setRememberPostState(settings.rememberPostState);}
        if (typeof settings.simpleShortcut === 'boolean') {setSimpleShortcut(settings.simpleShortcut);}
        if (typeof settings.hideUnsave === 'boolean') {setHideUnsave(settings.hideUnsave);}
        if (typeof settings.enableThePit === 'boolean') {setEnableThePit(settings.enableThePit);}
        if (typeof settings.enableSound === 'boolean') {setEnableSound(settings.enableSound);}
        if (typeof settings.confirmCopyFrom === 'boolean') {setConfirmCopyFrom(settings.confirmCopyFrom);}
        if (typeof settings.compactMakeTogglers === 'boolean') {setCompactMakeTogglers(settings.compactMakeTogglers);}
        if (typeof settings.globalPromptPrefixEnabled === 'boolean') {setGlobalPromptPrefixEnabled(settings.globalPromptPrefixEnabled);}
        if (typeof settings.globalPromptPrefix === 'string') {setGlobalPromptPrefix(settings.globalPromptPrefix);}
        if (typeof settings.globalPromptSuffixEnabled === 'boolean') {setGlobalPromptSuffixEnabled(settings.globalPromptSuffixEnabled);}
        if (typeof settings.globalPromptSuffix === 'string') {setGlobalPromptSuffix(settings.globalPromptSuffix);}
        if (settings.listLimit) {setListLimit(settings.listLimit);}
        if (settings.maxBulkLimit) {setMaxBulkLimit(settings.maxBulkLimit);}
        if (typeof settings.collapseSections === 'boolean') {setCollapseSections(settings.collapseSections);}
        if (typeof settings.navigatePostsWithArrows === 'boolean') {setNavigatePostsWithArrows(settings.navigatePostsWithArrows);}
        
        alert('Settings imported successfully!');
      } catch {
        alert('Failed to import settings. Make sure the file is valid JSON.');
      }
    };
    input.click();
  };

  const handlePurgeClick = () => {
    const newCount = purgeClickCount + 1;
    setPurgeClickCount(newCount);

    if (newCount >= 5) {
      setIsPurgeModalOpen(true);
      setPurgeClickCount(0); // Reset counter
    }
  };

  const handlePurgeConfirm = async () => {
    try {
      // Clear all packs
      clearAllPacks();

      // Clear unliked archive
      await clearUnlikedPosts(userId ?? undefined);

      // Unlike all liked posts
      const likedPostsResponse = await fetchLikedPosts(1000);
      if (likedPostsResponse.posts && likedPostsResponse.posts.length > 0) {
        for (const post of likedPostsResponse.posts) {
          try {
            await unlikePost(post.id);
          } catch (error) {
            console.error(`Failed to unlike post ${post.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Purge failed:', error);
    }
  };

  return (
    <div
      className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-scroll custom-scrollbar pr-2"
      style={{
        scrollbarGutter: 'stable',
      }}
    >
      {/* Packs + Prompts Panel */}
      <CollapsibleSection
        title={t('settings.packsAndPrompts')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={panelStyle}
      >
        <div className="flex flex-col gap-3 mt-3">
          <Button
            onClick={() => setIsPacksModalOpen(true)}
            icon={mdiPackageVariant}
            className="w-full"
            tooltip={t('settings.tooltips.packsManagement')}
          >
            {t('settings.openPacksManagement')}
          </Button>

          {/* Remember Post State Setting */}
          {renderToggleRow({
            id: 'remember-post-state-toggle',
            label: t('settings.rememberPostState'),
            tooltip: t('settings.tooltips.rememberPostState'),
            icon: mdiDatabase,
            checked: rememberPostState,
            onChange: (checked) => {
              setRememberPostState(checked);
              trackRememberPostStateToggled(checked);
            },
          })}

          {/* Simple Shortcut Setting */}
          {renderToggleRow({
            id: 'simple-shortcut-toggle',
            label: t('settings.simpleShortcut'),
            tooltip: t('settings.tooltips.simpleShortcut'),
            icon: mdiKeyboard,
            checked: simpleShortcut,
            onChange: (checked) => {
              setSimpleShortcut(checked);
              trackSimpleShortcutToggled(checked);
            },
          })}

          {/* Confirm Copy From Setting */}
          {renderToggleRow({
            id: 'confirm-copy-from-toggle',
            label: t('settings.confirmCopyFrom'),
            tooltip: t('settings.tooltips.confirmCopyFrom'),
            icon: mdiAlertCircleOutline,
            checked: confirmCopyFrom,
            onChange: (checked) => {
              setConfirmCopyFrom(checked);
              trackConfirmCopyFromToggled(checked);
            },
          })}

          {/* Compact Make Togglers Setting */}
          {renderToggleRow({
            id: 'compact-make-togglers-toggle',
            label: 'Compact Make Togglers',
            tooltip: 'Show compact toggle buttons next to Make button instead of full row',
            icon: mdiViewCompactOutline,
            checked: compactMakeTogglers,
            onChange: (checked) => {
              setCompactMakeTogglers(checked);
            },
          })}

          {/* Global Prompt Prefix Setting */}
          {renderToggleRow({
            id: 'global-prompt-prefix-toggle',
            label: 'Global Prefix',
            tooltip: 'Text added BEFORE your prompt',
            icon: mdiTextBoxPlus,
            checked: globalPromptPrefixEnabled,
            onChange: (checked) => {
              setGlobalPromptPrefixEnabled(checked);
            },
          })}

          {/* Global Prompt Prefix Textarea */}
          {globalPromptPrefixEnabled && (
            <textarea
              value={globalPromptPrefix}
              onChange={(e) => setGlobalPromptPrefix(e.target.value)}
              placeholder="e.g. cinematic, 4k, high quality"
              className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none custom-scrollbar backdrop-blur-xl"
              rows={2}
              style={promptTextAreaStyle}
            />
          )}

          {/* Global Prompt Suffix Setting */}
          {renderToggleRow({
            id: 'global-prompt-suffix-toggle',
            label: 'Global Suffix',
            tooltip: 'Text added AFTER your prompt',
            icon: mdiTextBoxPlus,
            checked: globalPromptSuffixEnabled,
            onChange: (checked) => {
              setGlobalPromptSuffixEnabled(checked);
            },
          })}

          {/* Global Prompt Suffix Textarea */}
          {globalPromptSuffixEnabled && (
            <textarea
              value={globalPromptSuffix}
              onChange={(e) => setGlobalPromptSuffix(e.target.value)}
              placeholder="e.g. --style raw --v 6"
              className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none custom-scrollbar backdrop-blur-xl"
              rows={2}
              style={promptTextAreaStyle}
            />
          )}
        </div>
      </CollapsibleSection>

      {/* Behavior Panel */}
      <CollapsibleSection
        title={t('settings.behavior')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={panelStyle}
      >
        <div className="flex flex-col gap-3 mt-3">
          {/* Auto Download Setting */}
          {renderToggleRow({
            id: 'auto-download-toggle',
            label: t('settings.autoDownload'),
            tooltip: t('settings.tooltips.autoDownload'),
            icon: mdiDownloadCircle,
            checked: autoDownload,
            onChange: (checked) => {
              setAutoDownload(checked);
              trackAutoDownloadToggled(checked);
            },
          })}

          {/* Enable Sound Setting */}
          {renderToggleRow({
            id: 'enable-sound-toggle',
            label: t('settings.enableSound'),
            tooltip: t('settings.tooltips.enableSound'),
            icon: mdiVolumeHigh,
            checked: enableSound,
            onChange: (checked) => {
              setEnableSound(checked);
              trackSoundToggled(checked);
            },
          })}

          {/* Navigate Posts with Arrows Setting */}
          {renderToggleRow({
            id: 'navigate-posts-arrows-toggle',
            label: t('settings.navigatePostsWithArrows'),
            tooltip: t('help.tooltips.navigatePostsWithArrows'),
            icon: mdiKeyboard,
            checked: navigatePostsWithArrows,
            onChange: (checked) => {
              setNavigatePostsWithArrows(checked);
            },
          })}

          {/* List Limit Setting */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs flex items-center gap-1.5"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              <Icon path={mdiFormatListNumbered} size={0.6} color={colors.TEXT_SECONDARY} />
              {t('settings.listLimit')}
            </label>
            <Dropdown
              value={listLimit.toString()}
              onChange={(value) => {
                setListLimit(parseInt(value) as 100 | 200 | 500 | 1000);
              }}
              options={[
                { value: '100', label: '100' },
                { value: '200', label: '200' },
                { value: '500', label: '500' },
                { value: '1000', label: '1000' },
              ]}
              className="w-full"
            />
            {listLimit !== 100 && (
              <div
                className="text-xs px-2 py-1.5 rounded flex items-center gap-1.5"
                style={{
                  backgroundColor: '#dc262620',
                  color: '#ef4444',
                  border: '1px solid #ef444440',
                }}
              >
                <div className="flex-shrink-0">
                  <Icon path={mdiAlertCircleOutline} size={0.75} color="#ef4444" />
                </div>
                {t('settings.listLimitWarning')}
              </div>
            )}
          </div>

          {/* Max Bulk Limit Setting */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs flex items-center gap-1.5"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              <Icon path={mdiFormatListNumbered} size={0.6} color={colors.TEXT_SECONDARY} />
              {t('settings.maxBulkLimit')}
            </label>
            <Dropdown
              value={maxBulkLimit.toString()}
              onChange={(value) => {
                setMaxBulkLimit(value === 'unlimited' ? 'unlimited' : parseInt(value) as 5 | 10 | 20 | 50);
              }}
              options={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
                { value: 'unlimited', label: t('settings.unlimited') },
              ]}
              className="w-full"
            />
            {maxBulkLimit !== 'unlimited' && (
              <div
                className="text-xs px-2 py-1.5 rounded flex items-center gap-1.5"
                style={{
                  backgroundColor: `${colors.BACKGROUND_MEDIUM}80`,
                  color: colors.TEXT_SECONDARY,
                  border: `1px solid ${colors.BORDER}40`,
                }}
              >
                <div className="flex-shrink-0">
                  <Icon path={mdiAlertCircleOutline} size={0.75} color={colors.TEXT_SECONDARY} />
                </div>
                {t('settings.maxBulkLimitInfo')}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Appearance Panel */}
      <CollapsibleSection
        title={t('settings.appearance')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={panelStyle}
      >
        <div className="flex flex-col gap-3 mt-3">
          {/* Theme Setting */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs flex items-center gap-1.5"
              style={{ color: colors.TEXT_SECONDARY }}
            >
              <Icon path={mdiPalette} size={0.6} color={colors.TEXT_SECONDARY} />
              {t('settings.theme')}
            </label>
            <Dropdown
              value={theme}
              onChange={(value) => {
                const newTheme = value as 'dark' | 'light' | 'dracula' | 'winamp' | 'limewire' | 'steam' | 'discord' | 'champagne' | 'newyearseve';
                setTheme(newTheme);
                trackThemeChanged(newTheme);
              }}
              options={[
                { value: 'dark', label: t('settings.themes.dark') },
                { value: 'light', label: t('settings.themes.light') },
                { value: 'dracula', label: t('settings.themes.dracula') },
                { value: 'winamp', label: t('settings.themes.winamp') },
                { value: 'limewire', label: t('settings.themes.limewire') },
                { value: 'steam', label: t('settings.themes.steam') },
                { value: 'discord', label: t('settings.themes.discord') },
                { value: 'champagne', label: t('settings.themes.champagne') },
                { value: 'newyearseve', label: t('settings.themes.newyearseve') },
              ]}
              className="w-full"
            />
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
            <Dropdown
              value={size}
              onChange={(value) => {
                const newSize = value as 'tiny' | 'small' | 'medium' | 'large';
                setSize(newSize);
                trackSizeChanged(newSize);
              }}
              options={[
                { value: 'tiny', label: t('settings.sizes.tiny') },
                { value: 'small', label: t('settings.sizes.small') },
                { value: 'medium', label: t('settings.sizes.medium') },
                { value: 'large', label: t('settings.sizes.large') },
              ]}
              className="w-full"
            />
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
            <Dropdown
              value={locale}
              onChange={(value) => {
                setLocale(value);
                trackLanguageChanged(value);
              }}
              options={[
                { value: 'en', label: t('settings.languages.en') },
                { value: 'es', label: t('settings.languages.es') },
                { value: 'ru', label: t('settings.languages.ru') },
                { value: 'de', label: t('settings.languages.de') },
              ]}
              className="w-full"
            />
          </div>

          {/* Hide Unsave Setting */}
          {renderToggleRow({
            id: 'hide-unsave-toggle',
            label: t('settings.hideUnsave'),
            tooltip: t('settings.tooltips.hideUnsave'),
            icon: mdiEyeOff,
            checked: hideUnsave,
            onChange: (checked) => {
              setHideUnsave(checked);
              trackHideUnsaveToggled(checked);
            },
          })}

          {/* Enable The Pit Setting */}
          {renderToggleRow({
            id: 'enable-pit-toggle',
            label: t('settings.enableThePit'),
            tooltip: t('settings.tooltips.enableThePit'),
            icon: mdiFlare,
            checked: enableThePit,
            onChange: (checked) => {
              setEnableThePit(checked);
            },
          })}

          {/* Collapse Sections Setting */}
          {renderToggleRow({
            id: 'collapse-sections-toggle',
            label: t('settings.collapseSections'),
            tooltip: t('settings.tooltips.collapseSections'),
            icon: mdiResize,
            checked: collapseSections,
            onChange: (checked) => {
              setCollapseSections(checked);
            },
          })}

          {/* Reset Panel Position Button */}
          <Button
            onClick={() => setPanelPosition(null)}
            icon={mdiRestartOff}
            className="w-full"
            tooltip="Reset panel to default position"
          >
            Reset Position
          </Button>
        </div>
      </CollapsibleSection>

      {/* Backup & Restore Panel */}
      <CollapsibleSection
        title="Backup & Restore"
        className="rounded-xl p-4 backdrop-blur-md border"
        style={panelStyle}
      >
        <div className="flex flex-col gap-2 mt-3">
          <div className="flex gap-2">
            <Button
              onClick={handleExportSettings}
              icon={mdiExport}
              className="flex-1"
            >
              Export Settings
            </Button>
            <Button
              onClick={handleImportSettings}
              icon={mdiImport}
              className="flex-1"
            >
              Import Settings
            </Button>
          </div>
          <div
            className="text-xs text-center"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            Export your settings to restore them after updates
          </div>
        </div>
      </CollapsibleSection>

      {/* Danger Zone Panel */}
      <CollapsibleSection
        title={t('settings.purge')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={panelStyle}
      >
        {/* Purge All Button */}
        <div className="flex flex-col gap-2 mt-3">
          <button
            onClick={handlePurgeClick}
            className="w-full px-3 py-2 text-xs rounded-full transition-all flex items-center justify-center gap-1"
            style={{
              backgroundColor: isPurgeButtonHovered ? '#fff' : '#ef4444',
              color: isPurgeButtonHovered ? '#ef4444' : '#fff',
              border: '1px solid #ef4444',
            }}
            onMouseEnter={() => setIsPurgeButtonHovered(true)}
            onMouseLeave={() => setIsPurgeButtonHovered(false)}
          >
            <Icon path={mdiDeleteForever} size={0.6} color={isPurgeButtonHovered ? '#ef4444' : '#fff'} />
            {purgeClickCount > 0 && purgeClickCount < 5
              ? `${t('settings.purgeAllData')} (${purgeClickCount}/5)`
              : t('settings.purgeAllData')}
          </button>
          <div
            className="text-xs text-center"
            style={{ color: colors.TEXT_SECONDARY }}
          >
            {t('settings.purgeClickHint')}
          </div>
        </div>
      </CollapsibleSection>

      {/* Purge Modal */}
      <PurgeModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirm={handlePurgeConfirm}
        getThemeColors={getThemeColors}
      />

      {/* Packs Management Modal */}
      <PacksManagementModal
        isOpen={isPacksModalOpen}
        onClose={() => setIsPacksModalOpen(false)}
        getThemeColors={getThemeColors}
      />

    </div>
  );
};
