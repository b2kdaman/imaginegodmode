/**
 * Help view component
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/contexts/I18nContext';
import { VERSION } from '@/utils/constants';
import { mdiInformationOutline } from '@mdi/js';
import { Icon } from '../common/Icon';

export const HelpView: React.FC = () => {
  const { getThemeColors } = useSettingsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();

  const features = [
    { text: 'Firefox and Chrome cross-browser support', tooltip: t('help.tooltips.crossBrowser') },
    { text: 'Save and organize prompts with packs', tooltip: t('help.tooltips.saveOrganize') },
    { text: 'Create, delete, and switch between packs', tooltip: t('help.tooltips.packManagement') },
    { text: 'Rate prompts with 1-5 star ratings', tooltip: t('help.tooltips.ratePrompts') },
    { text: 'Navigate prompts with arrow keys', tooltip: t('help.tooltips.arrowKeys') },
    { text: 'Import and export packs (add or replace mode)', tooltip: t('help.tooltips.importExport') },
    { text: 'Generate new packs with AI using Grok prompt templates', tooltip: t('help.tooltips.aiGenerate') },
    { text: 'Download images and videos (when all videos are HD)', tooltip: t('help.tooltips.downloadMedia') },
    { text: 'Parallel video upscaling to HD quality', tooltip: t('help.tooltips.parallelUpscale') },
    { text: 'Bulk operations: Delete, upscale, relike, unlike posts', tooltip: t('help.tooltips.bulkOperations') },
    { text: 'Purge all data feature for complete data cleanup', tooltip: t('help.tooltips.purgeData') },
    { text: 'Shift-click batch selection in bulk operations modal', tooltip: t('help.tooltips.batchSelection') },
    { text: 'Make + Next: Automate prompt application and post navigation', tooltip: t('help.tooltips.makeNext') },
    { text: 'Real-time video generation progress', tooltip: t('help.tooltips.realtimeProgress') },
    { text: 'Play/pause video control', tooltip: t('help.tooltips.playPause') },
    { text: 'Fullscreen video playback', tooltip: t('help.tooltips.fullscreen') },
    { text: 'Hide unsave button option', tooltip: t('help.tooltips.hideUnsave') },
    { text: 'Theme customization (Dark, Light, Dracula, Winamp, LimeWire, Steam, Discord)', tooltip: t('help.tooltips.themeCustomization') },
    { text: 'UI size scaling (Tiny to Large)', tooltip: t('help.tooltips.uiScaling') },
    { text: 'Auto-download media when generation completes', tooltip: t('help.tooltips.autoDownloadMedia') },
    { text: 'Multi-language support (English, Spanish, Russian)', tooltip: t('help.tooltips.multiLanguage') },
  ];

  return (
    <div
      className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-scroll custom-scrollbar pr-2 p-2"
      style={{
        scrollbarGutter: 'stable',
      }}
    >
      {/* Features Section */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          style={{ color: colors.TEXT_PRIMARY }}
        >
          Available Features
        </label>
        <div
          className="text-xs p-3 rounded-lg"
          style={{
            backgroundColor: colors.BACKGROUND_LIGHT,
            color: colors.TEXT_SECONDARY,
          }}
        >
          <ul className="space-y-1 ml-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span style={{ color: colors.TEXT_SECONDARY, marginTop: '2px' }}>•</span>
                <span
                  className="flex items-center gap-1 group cursor-help flex-1"
                  data-tooltip-id="app-tooltip"
                  data-tooltip-content={feature.tooltip}
                >
                  <span>{feature.text}</span>
                  <span className="inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon
                      path={mdiInformationOutline}
                      size={0.5}
                      color={colors.TEXT_SECONDARY}
                    />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keyboard Shortcuts Section */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          style={{ color: colors.TEXT_PRIMARY }}
        >
          Keyboard Shortcuts
        </label>
        <div
          className="text-xs p-3 rounded-lg flex flex-col gap-2"
          style={{
            backgroundColor: colors.BACKGROUND_LIGHT,
            color: colors.TEXT_SECONDARY,
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Ctrl
              </span>
              <span className="text-[10px]">/</span>
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Cmd
              </span>
              <span className="text-[10px]">+</span>
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Enter
              </span>
            </div>
            <span>Make a Video</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Ctrl
              </span>
              <span className="text-[10px]">/</span>
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Cmd
              </span>
              <span className="text-[10px]">+</span>
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Shift
              </span>
              <span className="text-[10px]">+</span>
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Enter
              </span>
            </div>
            <span>Copy & Make</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                ←
              </span>
              <span className="text-[10px]">/</span>
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                →
              </span>
            </div>
            <span>Navigate videos</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                F
              </span>
            </div>
            <span>Toggle fullscreen</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: colors.BACKGROUND_MEDIUM,
                  color: colors.TEXT_PRIMARY,
                  border: `1px solid ${colors.BORDER}`,
                }}
              >
                Space
              </span>
            </div>
            <span>Play/pause video</span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          style={{ color: colors.TEXT_PRIMARY }}
        >
          About
        </label>
        <div
          className="text-xs p-3 rounded-lg"
          style={{
            backgroundColor: colors.BACKGROUND_LIGHT,
            color: colors.TEXT_SECONDARY,
          }}
        >
          <p className="mb-1">
            <strong style={{ color: colors.TEXT_PRIMARY }}>ImagineGodMode v{VERSION}</strong>
          </p>
          <p>Chrome/Firefox extension for Grok media management</p>
          <p className="mt-2">by b2kdaman</p>
          <p className="mt-1 text-[11px]">Firefox support by wyntre</p>
        </div>
      </div>
    </div>
  );
};
