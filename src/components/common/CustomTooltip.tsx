/**
 * Custom tooltip component with smart positioning
 * Always appears at top, adjusts horizontally to stay in viewport
 * Arrow remains centered on trigger element
 */

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '@/utils/constants';
import { useSettingsStore } from '@/store/useSettingsStore';

interface TooltipPosition {
  top: number;
  left: number;
  arrowLeft: number;
}

export const CustomTooltip: React.FC = () => {
  const { getScale } = useSettingsStore();
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState('');
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0, arrowLeft: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const currentTargetRef = useRef<HTMLElement | null>(null);

  // Calculate position when tooltip becomes visible
  useEffect(() => {
    if (!isVisible || !currentTargetRef.current) {
      return;
    }

    const calculatePosition = () => {
      if (!currentTargetRef.current || !tooltipRef.current) {
        return;
      }

      const target = currentTargetRef.current;
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const offset = 4; // Distance from target element
      const arrowSize = 6; // Half of arrow size

      // Calculate vertical position (always at top)
      const top = targetRect.top - tooltipRect.height - offset - arrowSize;

      // Calculate horizontal position
      // Center tooltip on target element
      let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

      // Arrow position relative to tooltip (centered on target)
      const targetCenter = targetRect.left + (targetRect.width / 2);
      let arrowLeft = targetCenter - left - arrowSize;

      // Adjust if tooltip goes off-screen horizontally
      const viewportPadding = 10;
      if (left < viewportPadding) {
        // Too far left - shift right
        const shift = viewportPadding - left;
        left += shift;
        arrowLeft -= shift; // Arrow moves left relative to tooltip
      } else if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
        // Too far right - shift left
        const shift = (left + tooltipRect.width) - (window.innerWidth - viewportPadding);
        left -= shift;
        arrowLeft += shift; // Arrow moves right relative to tooltip
      }

      setPosition({ top, left, arrowLeft });
    };

    // Wait for tooltip to render, then calculate position
    // Use setTimeout to ensure tooltip is fully painted
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(calculatePosition);
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isVisible]);

  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      const tooltipContent = target.getAttribute('data-tooltip-content');

      if (!tooltipContent) {
        return;
      }

      currentTargetRef.current = target;
      setContent(tooltipContent);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      currentTargetRef.current = null;
      setPosition({ top: 0, left: 0, arrowLeft: 0 }); // Reset position
    };

    // Find all elements with data-tooltip-content attribute
    const updateTooltipElements = () => {
      const elements = document.querySelectorAll('[data-tooltip-content]');

      elements.forEach((element) => {
        element.addEventListener('mouseenter', handleMouseEnter as never);
        element.addEventListener('mouseleave', handleMouseLeave as never);
      });

      return () => {
        elements.forEach((element) => {
          element.removeEventListener('mouseenter', handleMouseEnter as never);
          element.removeEventListener('mouseleave', handleMouseLeave as never);
        });
      };
    };

    // Initial setup
    const cleanup = updateTooltipElements();

    // Re-scan for new elements periodically (for dynamic content)
    const interval = setInterval(updateTooltipElements, 1000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  if (!isVisible || !content) {
    return null;
  }

  const scale = getScale();
  const baseFontSize = 0.75; // text-xs = 0.75rem (12px)
  const scaledFontSize = baseFontSize * scale;

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: Z_INDEX.MODAL_TOOLTIP,
        opacity: position.top === 0 ? 0 : 1, // Hide until positioned
        transition: 'opacity 0.1s ease-in-out',
      }}
    >
      <div
        className="relative px-3 py-2 max-w-[20rem] rounded-lg shadow-lg"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          fontSize: `${scaledFontSize}rem`,
        }}
      >
        {content}

        {/* Arrow pointing down to the trigger element */}
        <div
          className="absolute"
          style={{
            bottom: '-6px',
            left: `${position.arrowLeft}px`,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(0, 0, 0, 0.9)',
          }}
        />
      </div>
    </div>,
    document.body
  );
};
