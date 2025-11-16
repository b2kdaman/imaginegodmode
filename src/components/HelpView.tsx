/**
 * Help view component
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { VERSION } from '@/utils/constants';

export const HelpView: React.FC = () => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

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
          <ul className="space-y-1 ml-3" style={{ listStyleType: 'disc' }}>
            <li>Save and organize prompts with categories</li>
            <li>Rate prompts with 1-5 star ratings</li>
            <li>Navigate prompts with arrow keys</li>
            <li>Download images and videos</li>
            <li>Upscale videos to HD quality</li>
            <li>Real-time video generation progress</li>
            <li>Fullscreen video playback</li>
            <li>Theme customization (Dark, Light, Dracula)</li>
            <li>UI size scaling (Tiny to Large)</li>
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
            <strong style={{ color: colors.TEXT_PRIMARY }}>GrokGoonify v{VERSION}</strong>
          </p>
          <p>Chrome extension for Grok media management</p>
          <p className="mt-2">by b2kdaman</p>
        </div>
      </div>
    </div>
  );
};
