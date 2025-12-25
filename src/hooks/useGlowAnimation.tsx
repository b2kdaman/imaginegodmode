/**
 * Universal glow animation hook for button hover effects
 * Provides a reusable glow light run effect with proper reset behavior
 */

import React, { useState, useRef } from 'react';

export interface GlowAnimationConfig {
  /** Width of the glow beam in pixels (default: 80px) */
  width?: number;
  /** Animation duration in seconds (default: 0.8s) */
  duration?: number;
  /** Rotation angle in degrees (default: 25deg) */
  rotation?: number;
  /** Enable scale transform on hover (default: true) */
  enableScale?: boolean;
  /** Scale factor (default: 1.05) */
  scaleFactor?: number;
  /** Enable shadow glow effect (default: true) */
  enableShadow?: boolean;
  /** Shadow blur intensity in pixels (default: 20px) */
  shadowBlur?: number;
}

export const useGlowAnimation = (config: GlowAnimationConfig = {}) => {
  const {
    width = 80,
    duration = 0.8,
    rotation = 25,
    enableScale = true,
    scaleFactor = 1.05,
    enableShadow = true,
    shadowBlur = 20,
  } = config;

  const [isHovered, setIsHovered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Generate unique keyframe name to avoid conflicts - use static counter
  const idRef = useRef<number>();
  if (idRef.current === undefined) {
    idRef.current = ++useGlowAnimation.counter;
  }
  const animationName = `glowRun-${idRef.current}`;

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

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, disabled = false) => {
    if (disabled) {
      return;
    }

    setIsHovered(true);
    setAnimationKey(prev => prev + 1);

    // Apply hover styles
    e.currentTarget.style.backgroundColor = `var(--color-bg-light)`;
    e.currentTarget.style.color = `var(--color-text-hover)`;

    if (enableShadow) {
      e.currentTarget.style.boxShadow = `0 0 ${shadowBlur}px var(--color-text-hover), 0 0 ${shadowBlur * 2}px var(--color-text-hover)`;
    }

    if (enableScale) {
      e.currentTarget.style.transform = `scale(${scaleFactor})`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>, disabled = false) => {
    if (disabled) {
      return;
    }

    setIsHovered(false);

    // Reset styles
    e.currentTarget.style.backgroundColor = `var(--color-bg-medium)`;
    e.currentTarget.style.color = `var(--color-text-secondary)`;
    e.currentTarget.style.boxShadow = 'none';

    if (enableScale) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const GlowOverlay: React.FC = () => {
    if (!isHovered) {
      return null;
    }

    return (
      <span
        key={animationKey}
        className="absolute pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, var(--color-text-hover) 50%, transparent 100%)`,
          width: `${width}px`,
          height: '200%',
          top: '-50%',
          left: '-150%',
          transform: `rotate(${rotation}deg)`,
          animation: `${animationName} ${duration}s ease-out forwards`,
          zIndex: 1,
        }}
      />
    );
  };

  return {
    glowStyles,
    handleMouseEnter,
    handleMouseLeave,
    GlowOverlay,
    isHovered,
    animationKey,
  };
};

/**
 * Multi-item glow animation hook for components with multiple interactive elements
 * Useful for tabs, dropdown options, lists, etc.
 */
export const useMultiGlowAnimation = (config: GlowAnimationConfig = {}) => {
  const {
    width = 60,
    duration = 0.8,
    rotation = 25,
    enableScale = true,
    scaleFactor = 1.03,
    enableShadow = true,
    shadowBlur = 15,
  } = config;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [animationKeys, setAnimationKeys] = useState<Record<string, number>>({});

  // Generate unique keyframe name - use static counter
  const idRef = useRef<number>();
  if (idRef.current === undefined) {
    idRef.current = ++useMultiGlowAnimation.counter;
  }
  const animationName = `multiGlowRun-${idRef.current}`;

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

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    id: string,
    disabled = false,
    customStyles?: { backgroundColor?: string; color?: string }
  ) => {
    if (disabled) {
      return;
    }

    setHoveredId(id);
    setAnimationKeys(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

    // Apply hover styles
    e.currentTarget.style.backgroundColor = customStyles?.backgroundColor || `var(--color-bg-light)`;
    e.currentTarget.style.color = customStyles?.color || `var(--color-text-hover)`;

    if (enableShadow) {
      e.currentTarget.style.boxShadow = `0 0 ${shadowBlur}px var(--color-text-hover)`;
    }

    if (enableScale) {
      e.currentTarget.style.transform = `scale(${scaleFactor})`;
    }
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLElement>,
    disabled = false,
    resetStyles?: { backgroundColor?: string; color?: string }
  ) => {
    if (disabled) {
      return;
    }

    setHoveredId(null);

    // Reset styles
    e.currentTarget.style.backgroundColor = resetStyles?.backgroundColor || `var(--color-bg-medium)`;
    e.currentTarget.style.color = resetStyles?.color || `var(--color-text-secondary)`;
    e.currentTarget.style.boxShadow = 'none';

    if (enableScale) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const getGlowOverlay = (id: string) => {
    if (hoveredId !== id) {
      return null;
    }

    return (
      <span
        key={animationKeys[id]}
        className="absolute pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, var(--color-text-hover) 50%, transparent 100%)`,
          width: `${width}px`,
          height: '200%',
          top: '-50%',
          left: '-150%',
          transform: `rotate(${rotation}deg)`,
          animation: `${animationName} ${duration}s ease-out forwards`,
        }}
      />
    );
  };

  return {
    glowStyles,
    handleMouseEnter,
    handleMouseLeave,
    getGlowOverlay,
    hoveredId,
    animationKeys,
  };
};

// Static counters for unique ID generation
useGlowAnimation.counter = 0;
useMultiGlowAnimation.counter = 0;
