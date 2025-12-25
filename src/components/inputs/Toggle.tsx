/**
 * Reusable toggle switch component with theme-aware styling and glow animations
 */

import React, { useState, useRef } from 'react';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// Static counter for unique IDs
let toggleCounter = 0;

export const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
}) => {

  // Custom glow state management
  const [isHovered, setIsHovered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Generate unique ID for animation (lazy initialization)
  const idRef = useRef<number>();
  if (idRef.current === undefined) {
    idRef.current = ++toggleCounter;
  }
  const animationName = `toggleGlow-${idRef.current}`;

  const glowStyles = `
    @keyframes ${animationName} {
      0% {
        left: -150%;
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        left: 150%;
        opacity: 0;
      }
    }
  `;

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
          className={`toggle-track w-full h-full rounded-full relative overflow-hidden transition-all duration-300 border ${
            checked
              ? 'bg-theme-success border-theme-success'
              : 'bg-theme-bg-medium border-theme-border'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            boxShadow: isHovered && !disabled ? `0 0 15px var(--color-success)` : 'none',
          }}
          onMouseEnter={() => {
            if (!disabled) {
              setIsHovered(true);
              setAnimationKey(prev => prev + 1);
            }
          }}
          onMouseLeave={() => {
            if (!disabled) {
              setIsHovered(false);
            }
          }}
        >
          {/* Glow effect overlay */}
          {isHovered && !disabled && (
            <span
              key={animationKey}
              className="absolute pointer-events-none"
              style={{
                background: checked
                  ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)'
                  : `linear-gradient(90deg, transparent 0%, var(--color-success) 50%, transparent 100%)`,
                width: '60px',
                height: '200%',
                top: '-50%',
                left: '-150%',
                transform: 'rotate(20deg)',
                animation: `${animationName} 0.6s ease-out forwards`,
                zIndex: 1,
              }}
            />
          )}

          {/* Toggle knob */}
          <div
            className="absolute top-[1px] left-[1px] w-5 h-5 rounded-full bg-white z-10"
            style={{
              transform: checked ? 'translateX(26px)' : 'translateX(0)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </label>
    </>
  );
};
