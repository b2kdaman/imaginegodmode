/**
 * Settings view component
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export const SettingsView: React.FC = () => {
  const { theme, size, setTheme, setSize, getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Theme Setting */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          style={{ color: colors.TEXT_PRIMARY }}
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
          className="text-sm font-medium"
          style={{ color: colors.TEXT_PRIMARY }}
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

      {/* Help Section */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          style={{ color: colors.TEXT_PRIMARY }}
        >
          Help
        </label>
        <div
          className="text-xs p-3 rounded-lg"
          style={{
            backgroundColor: colors.BACKGROUND_LIGHT,
            color: colors.TEXT_SECONDARY,
          }}
        >
          <p className="mb-2">
            <strong style={{ color: colors.TEXT_PRIMARY }}>Available Features:</strong>
          </p>
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
          <p className="mt-3 mb-1">
            <strong style={{ color: colors.TEXT_PRIMARY }}>Keyboard Shortcuts:</strong>
          </p>
          <ul className="space-y-1 ml-3" style={{ listStyleType: 'disc' }}>
            <li><code>Ctrl/Cmd + Enter</code> - Make a Video</li>
            <li><code>Ctrl/Cmd + Shift + Enter</code> - Copy & Make</li>
            <li><code>Left/Right Arrow</code> - Navigate videos</li>
          </ul>
        </div>
      </div>

      {/* Info Section */}
      <div
        className="text-xs p-3 rounded-lg"
        style={{
          backgroundColor: colors.BACKGROUND_LIGHT,
          color: colors.TEXT_SECONDARY,
        }}
      >
        <p className="mb-1">
          <strong style={{ color: colors.TEXT_PRIMARY }}>GrokGoonify v2.0</strong>
        </p>
        <p>Chrome extension for Grok media management</p>
        <p className="mt-2">by b2kdaman</p>
      </div>
    </div>
  );
};
