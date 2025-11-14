/**
 * Main entry point
 */

import { UI } from './ui/ui.js';
import { UrlWatcher } from './watchers/urlWatcher.js';
import { Handlers } from './core/handlers.js';

function makeButtonGlow(button) {
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

function watchForButton() {
    let buttonRef = null;
    let lastPercentage = null;
    let progressBar = null;
    
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
            zIndex: '999',
            transition: 'width 0.3s ease',
            pointerEvents: 'none',
        });
        document.body.appendChild(progressBar);
        return progressBar;
    }
    
    function removeProgressBar() {
        if (progressBar) {
            progressBar.remove();
            progressBar = null;
        }
    }
    
    function findButton() {
        if (!buttonRef || !document.body.contains(buttonRef)) {
            // Try to find button by percentage text pattern
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
                const text = btn.textContent || btn.innerText || '';
                if (text.match(/\d+%/)) {
                    buttonRef = btn;
                    makeButtonGlow(buttonRef);
                    break;
                }
            }
        }
        return buttonRef;
    }
    
    function checkButtonText() {
        const button = findButton();
        if (button) {
            // Check for percentage in button text
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
    
    // Try immediately
    checkButtonText();
    
    // Poll every 500ms
    setInterval(checkButtonText, 500);
}

function init() {
    UI.ensure();
    UI.attachHandlers(Handlers);
    UrlWatcher.start();
    watchForButton();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

