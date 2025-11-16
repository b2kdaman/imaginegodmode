/**
 * Hook to watch for "Make a Video" button progress and show visual feedback
 */

import { useEffect } from 'react';

export const useVideoProgress = () => {
  useEffect(() => {
    let buttonRef: HTMLButtonElement | null = null;
    let lastPercentage: number | null = null;
    let progressBar: HTMLDivElement | null = null;

    // Create progress bar element
    function createProgressBar() {
      if (progressBar) return progressBar;

      progressBar = document.createElement('div');
      progressBar.id = 'grok-progress-bar';
      Object.assign(progressBar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        height: '7px',
        width: '0%',
        background: 'rgba(255, 255, 255, 0.5)',
        zIndex: '999999',
        transition: 'width 0.3s ease',
        pointerEvents: 'none',
      });
      document.body.appendChild(progressBar);
      return progressBar;
    }

    // Remove progress bar
    function removeProgressBar() {
      if (progressBar) {
        progressBar.remove();
        progressBar = null;
      }
    }

    // Add glow effect to button
    function makeButtonGlow(button: HTMLButtonElement) {
      if (button && !button.dataset.grokGlowApplied) {
        button.dataset.grokGlowApplied = 'true';

        // Add glow effect
        button.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4)';
        button.style.transition = 'box-shadow 0.3s ease';

        // Add pulsing animation (only once)
        if (!document.getElementById('grok-glow-style')) {
          const style = document.createElement('style');
          style.id = 'grok-glow-style';
          style.textContent = `
            @keyframes grok-glow-pulse {
              0%, 100% {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4);
              }
              50% {
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.6);
              }
            }
            button[data-grok-glow-applied="true"] {
              animation: grok-glow-pulse 2s ease-in-out infinite;
            }
          `;
          document.head.appendChild(style);
        }
      }
    }

    // Find button with percentage text
    function findButton() {
      if (!buttonRef || !document.body.contains(buttonRef)) {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          const text = btn.textContent || btn.innerText || '';
          if (text.match(/\d+%/)) {
            buttonRef = btn as HTMLButtonElement;
            makeButtonGlow(buttonRef);
            break;
          }
        }
      }
      return buttonRef;
    }

    // Check button text for percentage and update progress
    function checkButtonText() {
      const button = findButton();
      if (button) {
        const buttonText = button.textContent || button.innerText || '';
        const percentageMatch = buttonText.match(/(\d+)%/);

        if (percentageMatch) {
          const percentage = parseInt(percentageMatch[1], 10);

          if (percentage === 100) {
            // Remove progress bar when 100%
            removeProgressBar();
            lastPercentage = null;
            buttonRef = null;
          } else {
            // Create and update progress bar
            const bar = createProgressBar();
            bar.style.width = `${percentage}%`;

            if (percentage !== lastPercentage) {
              lastPercentage = percentage;
              console.log('[GrokGoonify] Video generation progress:', percentage + '%');
            }
          }
        } else if (lastPercentage !== null) {
          // Remove progress bar when percentage disappears
          removeProgressBar();
          lastPercentage = null;
          buttonRef = null;
        }
      } else {
        // Remove progress bar if button is not found
        if (progressBar) {
          removeProgressBar();
          lastPercentage = null;
        }
      }
    }

    // Check immediately
    checkButtonText();

    // Poll every 500ms
    const interval = setInterval(checkButtonText, 500);

    // Cleanup
    return () => {
      clearInterval(interval);
      removeProgressBar();
    };
  }, []);
};
