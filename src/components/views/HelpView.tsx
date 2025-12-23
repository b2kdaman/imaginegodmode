/**
 * Help view component
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/contexts/I18nContext';
import { VERSION } from '@/utils/constants';
import { mdiInformationOutline, mdiLogin } from '@mdi/js';
import { Icon } from '../common/Icon';
import { CollapsibleSection } from '../common/CollapsibleSection';
import { isIOSDevice } from '@/utils/deviceDetection';

export const HelpView: React.FC = () => {
  const { getThemeColors } = useSettingsStore();
  const { t } = useTranslation();
  const colors = getThemeColors();
  const isIOS = isIOSDevice();

  const features = [
    { text: t('help.features.crossBrowser'), tooltip: t('help.tooltips.crossBrowser') },
    { text: t('help.features.saveOrganize'), tooltip: t('help.tooltips.saveOrganize') },
    { text: t('help.features.packManagement'), tooltip: t('help.tooltips.packManagement') },
    { text: t('help.features.ratePromptsStars'), tooltip: t('help.tooltips.ratePrompts') },
    { text: t('help.features.arrowKeys'), tooltip: t('help.tooltips.arrowKeys') },
    { text: t('help.features.importExportPacks'), tooltip: t('help.tooltips.importExport') },
    { text: t('help.features.aiGenerate'), tooltip: t('help.tooltips.aiGenerate') },
    { text: t('help.features.downloadMedia'), tooltip: t('help.tooltips.downloadMedia') },
    { text: t('help.features.parallelUpscale'), tooltip: t('help.tooltips.parallelUpscale') },
    { text: t('help.features.bulkOperations'), tooltip: t('help.tooltips.bulkOperations') },
    { text: t('help.features.purgeData'), tooltip: t('help.tooltips.purgeData') },
    { text: t('help.features.batchSelection'), tooltip: t('help.tooltips.batchSelection') },
    { text: t('help.features.makeNext'), tooltip: t('help.tooltips.makeNext') },
    { text: t('help.features.realtimeProgress'), tooltip: t('help.tooltips.realtimeProgress') },
    { text: t('help.features.playPause'), tooltip: t('help.tooltips.playPause') },
    { text: t('help.features.fullscreen'), tooltip: t('help.tooltips.fullscreen') },
    { text: t('help.features.hideUnsave'), tooltip: t('help.tooltips.hideUnsave') },
    { text: t('help.features.themeCustomization'), tooltip: t('help.tooltips.themeCustomization') },
    { text: t('help.features.uiScaling'), tooltip: t('help.tooltips.uiScaling') },
    { text: t('help.features.autoDownloadMedia'), tooltip: t('help.tooltips.autoDownloadMedia') },
    { text: t('help.features.multiLanguage'), tooltip: t('help.tooltips.multiLanguage') },
  ];

  return (
    <div
      className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-scroll custom-scrollbar pr-2"
      style={{
        scrollbarGutter: 'stable',
      }}
    >
      {/* Features Section */}
      <CollapsibleSection
        title={t('help.sections.availableFeatures')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        <div className="flex flex-col gap-2 mt-3">
          <ul className="space-y-1 ml-3 text-xs" style={{ color: colors.TEXT_SECONDARY }}>
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span style={{ color: colors.TEXT_SECONDARY, marginTop: '2px' }}>•</span>
                <span
                  className="flex items-center gap-1 group cursor-help flex-1"
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
      </CollapsibleSection>

      {/* Keyboard Shortcuts Section */}
      <CollapsibleSection
        title={t('help.sections.keyboardShortcuts')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        <div className="flex flex-col gap-2 mt-3">
          <div className="text-xs flex flex-col gap-2" style={{ color: colors.TEXT_SECONDARY }}>
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
                {t('help.shortcuts.keys.ctrl')}
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
                {t('help.shortcuts.keys.cmd')}
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
                {t('help.shortcuts.keys.enter')}
              </span>
            </div>
            <span>{t('help.shortcuts.descriptions.makeVideo')}</span>
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
                {t('help.shortcuts.keys.ctrl')}
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
                {t('help.shortcuts.keys.cmd')}
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
                {t('help.shortcuts.keys.shift')}
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
                {t('help.shortcuts.keys.enter')}
              </span>
            </div>
            <span>{t('help.shortcuts.descriptions.copyMake')}</span>
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
                {t('help.shortcuts.keys.arrowLeft')}
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
                {t('help.shortcuts.keys.arrowRight')}
              </span>
            </div>
            <span>{t('help.shortcuts.descriptions.navigateVideos')}</span>
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
                {t('help.shortcuts.keys.f')}
              </span>
            </div>
            <span>{t('help.shortcuts.descriptions.toggleFullscreen')}</span>
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
                {t('help.shortcuts.keys.space')}
              </span>
            </div>
            <span>{t('help.shortcuts.descriptions.playPause')}</span>
          </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* About Section */}
      <CollapsibleSection
        title={t('help.sections.about')}
        className="rounded-xl p-4 backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
          borderColor: `${colors.BORDER}50`,
          boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
        }}
      >
        <div className="flex flex-col gap-2 mt-3">
          <div className="text-xs" style={{ color: colors.TEXT_SECONDARY }}>
            <p className="mb-1">
              <strong style={{ color: colors.TEXT_PRIMARY }}>ImagineGodMode v{VERSION}</strong>
            </p>
            <p>{t('help.about.description')}</p>
            <p className="mt-2">{t('help.about.author')}</p>
            <p className="mt-1 text-[11px]">{t('help.about.firefoxSupport')}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* iOS Sign-in Link */}
      {isIOS && (
        <CollapsibleSection
          title={t('help.sections.signIn')}
          className="rounded-xl p-4 backdrop-blur-md border"
          style={{
            background: `linear-gradient(135deg, ${colors.BACKGROUND_MEDIUM}e6 0%, ${colors.BACKGROUND_DARK}f2 100%)`,
            borderColor: `${colors.BORDER}50`,
            boxShadow: `0 8px 32px 0 ${colors.BACKGROUND_DARK}66, inset 0 1px 0 0 ${colors.TEXT_SECONDARY}0d`,
          }}
        >
          <div className="mt-3">
            <a
              href="https://accounts.x.ai/sign-in?redirect=grok-com"
              className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity"
              style={{ color: colors.TEXT_PRIMARY }}
            >
              <Icon path={mdiLogin} size={0.6} color={colors.TEXT_PRIMARY} />
              <span>{t('help.signIn.linkText')}</span>
            </a>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};
