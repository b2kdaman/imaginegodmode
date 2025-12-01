/**
 * Reusable toggle switch component with theme-aware styling
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
}) => {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  return (
    <label className="relative inline-block w-12 h-6 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className="toggle-track w-full h-full rounded-full"
        style={{
          '--toggle-bg': checked ? colors.SUCCESS : colors.BACKGROUND_MEDIUM,
          '--toggle-border': checked ? colors.SUCCESS : colors.BORDER,
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        } as React.CSSProperties}
      >
        <div
          className="toggle-knob absolute top-[2px] left-[2px] w-5 h-5 rounded-full"
          style={{
            '--toggle-knob': '#ffffff',
            transform: checked ? 'translateX(24px)' : 'translateX(0)',
            transition: 'transform 0.2s ease',
          } as React.CSSProperties}
        />
      </div>
    </label>
  );
};
