/**
 * DEMO FILE - Examples of Tailwind theme classes in action
 *
 * This file demonstrates how to use the new Tailwind theme classes.
 * Delete this file after reviewing the examples.
 */

import React from 'react';

export const TailwindThemeDemo: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      {/* Example 1: Simple background and text */}
      <div className="bg-theme-bg-dark text-theme-text-primary p-4 rounded-lg">
        Dark background with primary text
      </div>

      {/* Example 2: Medium background with secondary text */}
      <div className="bg-theme-bg-medium text-theme-text-secondary p-4 rounded-lg">
        Medium background with secondary text
      </div>

      {/* Example 3: Border example */}
      <div className="border-2 border-theme-border p-4 rounded-lg">
        Themed border
      </div>

      {/* Example 4: Background with opacity */}
      <div className="bg-theme-bg-medium/80 text-theme-text-primary p-4 rounded-lg backdrop-blur-sm">
        80% opacity background with blur
      </div>

      {/* Example 5: Hover states */}
      <button className="bg-theme-bg-medium text-theme-text-secondary hover:bg-theme-bg-light hover:text-theme-text-hover transition-colors p-4 rounded-lg w-full">
        Hover me to see theme colors change
      </button>

      {/* Example 6: Accent color button (like Make button) */}
      <button className="bg-theme-text-primary text-theme-bg-dark hover:opacity-90 transition-opacity p-4 rounded-lg w-full font-bold">
        Accent Color Button (Make style)
      </button>

      {/* Example 7: Success/Danger states */}
      <div className="flex gap-4">
        <button className="bg-theme-success text-white p-4 rounded-lg flex-1">
          Success
        </button>
        <button className="bg-theme-danger text-white p-4 rounded-lg flex-1">
          Danger
        </button>
      </div>

      {/* Example 8: Conditional styling */}
      {[false, true].map((isActive, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-lg transition-colors ${
            isActive
              ? 'bg-theme-text-primary text-theme-bg-dark'
              : 'bg-theme-bg-medium text-theme-text-secondary'
          }`}
        >
          {isActive ? 'Active state' : 'Inactive state'}
        </div>
      ))}

      {/* Example 9: Glow effects */}
      <div className="bg-theme-glow-primary/20 border border-theme-glow-primary p-4 rounded-lg">
        Glow effect box
      </div>

      {/* Example 10: Complex card with multiple theme colors */}
      <div className="bg-theme-bg-dark border border-theme-border rounded-lg overflow-hidden">
        <div className="bg-theme-bg-medium p-4 border-b border-theme-border">
          <h3 className="text-theme-text-primary font-bold">Card Header</h3>
        </div>
        <div className="p-4">
          <p className="text-theme-text-secondary">
            This is a card with multiple theme colors applied using Tailwind classes.
          </p>
        </div>
        <div className="bg-theme-bg-light/50 p-4 border-t border-theme-border">
          <button className="bg-theme-text-primary text-theme-bg-dark hover:opacity-90 transition-opacity px-4 py-2 rounded">
            Action Button
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * USAGE NOTES:
 *
 * 1. All theme colors automatically update when user changes theme
 * 2. No need to call useSettingsStore() or getThemeColors()
 * 3. Use Tailwind opacity modifiers: /10, /20, /50, /80, etc.
 * 4. Hover states: hover:bg-theme-bg-light, hover:text-theme-text-hover
 * 5. Transitions: Add transition-colors or transition-opacity for smooth changes
 *
 * MIGRATION CHECKLIST:
 * - [ ] Replace inline style objects with Tailwind classes
 * - [ ] Remove getThemeColors() calls where not needed
 * - [ ] Test with all themes (Dark, Light, Dracula, Winamp, Limewire, Steam, Discord)
 * - [ ] Verify hover/active/disabled states work correctly
 * - [ ] Check mobile responsiveness
 */
