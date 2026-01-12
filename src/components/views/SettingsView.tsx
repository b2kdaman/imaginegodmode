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
  mdiViewCompactOutline
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
  const { theme, size, autoDownload, rememberPostState, simpleShortcut, hideUnsave, enableThePit, enableSound, confirmCopyFrom, compactMakeTogglers, globalPromptAddonEnabled, globalPromptAddon, listLimit, maxBulkLimit, collapseSections, navigatePostsWithArrows, setPanelPosition, setTheme, setSize, setAutoDownload, setRememberPostState, setSimpleShortcut, setHideUnsave, setEnableThePit, setEnableSound, setConfirmCopyFrom, setCompactMakeTogglers, setGlobalPromptAddonEnabled, setGlobalPromptAddon, setListLimit, setMaxBulkLimit, setCollapseSections, setNavigatePostsWithArrows, getThemeColors } = useSettingsStore();
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
      <CollapsibleSection
        title={t('settings.packsAndPrompts')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
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
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content={t('settings.tooltips.rememberPostState')}
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
            data-tooltip-content={t('settings.tooltips.simpleShortcut')}
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
            data-tooltip-content={t('settings.tooltips.confirmCopyFrom')}
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="confirm-copy-from-toggle"
            >
              <Icon path={mdiAlertCircleOutline} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.confirmCopyFrom')}
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

          {/* Compact Make Togglers Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content="Show compact toggle buttons next to Make button instead of full row"
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="compact-make-togglers-toggle"
            >
              <Icon path={mdiViewCompactOutline} size={0.7} color={colors.TEXT_PRIMARY} />
              Compact Make Togglers
            </label>
            <Toggle
              id="compact-make-togglers-toggle"
              checked={compactMakeTogglers}
              onChange={(checked) => {
                setCompactMakeTogglers(checked);
              }}
            />
          </div>

          {/* Global Prompt Addon Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content={t('settings.tooltips.globalPromptAddon')}
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
      </CollapsibleSection>

      {/* Behavior Panel */}
      <CollapsibleSection
        title={t('settings.behavior')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        <div className="flex flex-col gap-3 mt-3">
          {/* Auto Download Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content={t('settings.tooltips.autoDownload')}
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
            data-tooltip-content={t('settings.tooltips.enableSound')}
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

          {/* Navigate Posts with Arrows Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content={t('help.tooltips.navigatePostsWithArrows')}
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="navigate-posts-arrows-toggle"
            >
              <Icon path={mdiKeyboard} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.navigatePostsWithArrows')}
            </label>
            <Toggle
              id="navigate-posts-arrows-toggle"
              checked={navigatePostsWithArrows}
              onChange={(checked) => {
                setNavigatePostsWithArrows(checked);
              }}
            />
          </div>

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
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
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
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content={t('settings.tooltips.hideUnsave')}
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
            data-tooltip-content={t('settings.tooltips.enableThePit')}
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="enable-pit-toggle"
            >
              <Icon path={mdiFlare} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.enableThePit')}
            </label>
            <Toggle
              id="enable-pit-toggle"
              checked={enableThePit}
              onChange={(checked) => {
                setEnableThePit(checked);
              }}
            />
          </div>

          {/* Collapse Sections Setting */}
          <div
            className="flex items-center justify-between gap-2 cursor-help"
            data-tooltip-content={t('settings.tooltips.collapseSections')}
          >
            <label
              className="text-sm cursor-pointer flex items-center gap-1.5"
              style={{ color: colors.TEXT_PRIMARY }}
              htmlFor="collapse-sections-toggle"
            >
              <Icon path={mdiResize} size={0.7} color={colors.TEXT_PRIMARY} />
              {t('settings.collapseSections')}
            </label>
            <Toggle
              id="collapse-sections-toggle"
              checked={collapseSections}
              onChange={(checked) => {
                setCollapseSections(checked);
              }}
            />
          </div>

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

      {/* Danger Zone Panel */}
      <CollapsibleSection
        title={t('settings.purge')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
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
