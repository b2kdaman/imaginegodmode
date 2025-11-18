/**
 * Settings view component
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export const SettingsView: React.FC = () => {
  const { theme, size, autoDownload, setTheme, setSize, setAutoDownload, getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

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
              backgroundColor: autoDownload ? '#10b981' : colors.BACKGROUND_MEDIUM,
              border: `2px solid ${autoDownload ? '#10b981' : colors.BORDER}`,
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

    </div>
  );
};
