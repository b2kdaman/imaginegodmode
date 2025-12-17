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
  mdiTextBoxPlus
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
  const { theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableThePit, enableSound, confirmCopyFrom, globalPromptAddonEnabled, globalPromptAddon, setTheme, setSize, setAutoDownload, setRememberPostState, setSimpleShortcut, setHideUnsave, setEnableThePit, setEnableSound, setConfirmCopyFrom, setGlobalPromptAddonEnabled, setGlobalPromptAddon, getThemeColors } = useSettingsStore();
  const { clearAllPacks } = usePromptStore();
  const { userId } = useUserStore();
  const { t, locale, setLocale } = useTranslation();
  const colors = getThemeColors();

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPacksModalOpen, setIsPacksModalOpen] = useState(false);
  const [purgeClickCount, setPurgeClickCount] = useState(0);
  const [isPurgeButtonHovered, setIsPurgeButtonHovered] = useState(false);

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
      <div
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        {/* Panel Header */}
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
          style={{
            color: colors.TEXT_SECONDARY,
            borderColor: `${colors.BORDER}40`,
          }}
        >
          Packs + Prompts
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => setIsPacksModalOpen(true)}
            icon={mdiPackageVariant}
            className="w-full"
            tooltip="Manage packs: import/export, rename, organize prompts with drag & drop"
          >
            Open Packs Management
          </Button>

          {/* Remember Post State Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Remember which prompt pack was used for each post, automatically switching packs when navigating between posts"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="remember-post-state-toggle"
            >
              <Icon path={mdiDatabase} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.rememberPostState')}
            </label>
            <Toggle
              id="remember-post-state-toggle"
              checked={rememberPostState}
              onChange={(checked) => {
                setRememberPostState(checked);
                trackRememberPostStateToggled(checked);
              }}
            />
          </div>

          {/* Simple Shortcut Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Use Ctrl/Cmd+Enter instead of Ctrl/Cmd+Shift+Enter to apply prompt"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="simple-shortcut-toggle"
            >
              <Icon path={mdiKeyboard} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.simpleShortcut')}
            </label>
            <Toggle
              id="simple-shortcut-toggle"
              checked={simpleShortcut}
              onChange={(checked) => {
                setSimpleShortcut(checked);
                trackSimpleShortcutToggled(checked);
              }}
            />
          </div>

          {/* Confirm Copy From Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Show confirmation dialog when copying from page would replace existing prompt text"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="confirm-copy-from-toggle"
            >
              <Icon path={mdiAlertCircleOutline} size={0.7} color={colors.TEXT_PRIMARY} />
              Confirm Copy From
            </label>
            <Toggle
              id="confirm-copy-from-toggle"
              checked={confirmCopyFrom}
              onChange={(checked) => {
                setConfirmCopyFrom(checked);
                trackConfirmCopyFromToggled(checked);
              }}
            />
          </div>

          {/* Global Prompt Addon Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Add custom text that will be automatically appended to every prompt when pressing Make or Make+Next"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="global-prompt-addon-toggle"
            >
              <Icon path={mdiTextBoxPlus} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.globalPromptAddon')}
            </label>
            <Toggle
              id="global-prompt-addon-toggle"
              checked={globalPromptAddonEnabled}
              onChange={(checked) => {
                setGlobalPromptAddonEnabled(checked);
              }}
            />
          </div>

          {/* Global Prompt Addon Textarea */}
          {globalPromptAddonEnabled && (
            <textarea
              value={globalPromptAddon}
              onChange={(e) => setGlobalPromptAddon(e.target.value)}
              placeholder={t('settings.globalPromptAddonPlaceholder')}
              className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none custom-scrollbar backdrop-blur-xl"
              rows={3}
              style={{
                backgroundColor: `${colors.BACKGROUND_MEDIUM}aa`,
                color: colors.TEXT_PRIMARY,
                border: `1px solid ${colors.BORDER}`,
                WebkitBackdropFilter: 'blur(12px)',
                backdropFilter: 'blur(12px)',
              }}
            />
          )}
        </div>
      </div>

      {/* Behavior Panel */}
      <div
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        {/* Panel Header */}
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
          style={{
            color: colors.TEXT_SECONDARY,
            borderColor: `${colors.BORDER}40`,
          }}
        >
          Behavior
        </div>

        <div className="flex flex-col gap-3">
          {/* Auto Download Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Automatically download media files when video generation completes"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="auto-download-toggle"
            >
              <Icon path={mdiDownloadCircle} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.autoDownload')}
            </label>
            <Toggle
              id="auto-download-toggle"
              checked={autoDownload}
              onChange={(checked) => {
                setAutoDownload(checked);
                trackAutoDownloadToggled(checked);
              }}
            />
          </div>

          {/* Enable Sound Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Enable sound effects for UI interactions"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="enable-sound-toggle"
            >
              <Icon path={mdiVolumeHigh} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.enableSound')}
            </label>
            <Toggle
              id="enable-sound-toggle"
              checked={enableSound}
              onChange={(checked) => {
                setEnableSound(checked);
                trackSoundToggled(checked);
              }}
            />
          </div>
        </div>
      </div>

      {/* Appearance Panel */}
      <div
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        {/* Panel Header */}
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
          style={{
            color: colors.TEXT_SECONDARY,
            borderColor: `${colors.BORDER}40`,
          }}
        >
          Appearance
        </div>

        <div className="flex flex-col gap-3">
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
                const newTheme = value as 'dark' | 'light' | 'dracula' | 'winamp' | 'limewire' | 'steam' | 'discord';
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
              ]}
              className="w-full"
            />
          </div>

          {/* Hide Unsave Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Hide the Unsave button from the page"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="hide-unsave-toggle"
            >
              <Icon path={mdiEyeOff} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.hideUnsave')}
            </label>
            <Toggle
              id="hide-unsave-toggle"
              checked={hideUnsave}
              onChange={(checked) => {
                setHideUnsave(checked);
                trackHideUnsaveToggled(checked);
              }}
            />
          </div>

          {/* Enable The Pit Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Show The Pit tab for accessing deleted posts"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="enable-pit-toggle"
            >
              <Icon path={mdiFlare} size={0.7} color={colors.TEXT_PRIMARY} />
              Enable The Pit
            </label>
            <Toggle
              id="enable-pit-toggle"
              checked={enableThePit}
              onChange={(checked) => {
                setEnableThePit(checked);
              }}
            />
          </div>
        </div>
      </div>

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

      {/* Danger Zone Panel */}
      <div
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        {/* Panel Header */}
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
          style={{
            color: colors.TEXT_SECONDARY,
            borderColor: `${colors.BORDER}40`,
          }}
        >
          {t('settings.purge')}
        </div>

        {/* Purge All Button */}
        <div className="flex flex-col gap-2">
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
      </div>

    </div>
  );
};
