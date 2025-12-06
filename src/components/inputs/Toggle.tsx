/**
 * Reusable toggle switch component with theme-aware styling and glow animations
 */

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGlowAnimation } from '@/hooks/useGlowAnimation';

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
  const { glowStyles, handleMouseEnter, handleMouseLeave, GlowOverlay } = useGlowAnimation({
    width: 60,
    duration: 0.6,
    rotation: 20,
    opacity: 50,
    enableScale: false,
    enableShadow: true,
    shadowBlur: 15,
  });

  return (
    <>
      <style>{glowStyles}</style>
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
          className="toggle-track w-full h-full rounded-full relative overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: checked ? colors.SUCCESS : colors.BACKGROUND_MEDIUM,
            border: `1px solid ${checked ? colors.SUCCESS : colors.BORDER}`,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              handleMouseEnter(e, disabled);
              // Force override styles after glow handler
              requestAnimationFrame(() => {
                e.currentTarget.style.backgroundColor = checked ? colors.SUCCESS : colors.BACKGROUND_MEDIUM;
                e.currentTarget.style.borderColor = checked ? colors.SUCCESS : colors.BORDER;
                e.currentTarget.style.color = 'transparent';
              });
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              handleMouseLeave(e, disabled);
              // Force override styles after glow handler
              requestAnimationFrame(() => {
                e.currentTarget.style.backgroundColor = checked ? colors.SUCCESS : colors.BACKGROUND_MEDIUM;
                e.currentTarget.style.borderColor = checked ? colors.SUCCESS : colors.BORDER;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.color = 'transparent';
              });
            }
          }}
        >
          {/* Glow effect overlay */}
          {!disabled && <GlowOverlay />}

          {/* Toggle knob */}
          <div
            className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white z-10"
            style={{
              transform: checked ? 'translateX(24px)' : 'translateX(0)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </label>
    </>
  );
};
