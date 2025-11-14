/**
 * UI components and rendering
 */

import {
    VERSION,
    UI_POSITION,
    UI_SPACING,
    UI_SIZE,
    UI_COLORS,
    UI_TRANSITION,
    DEFAULTS,
} from '../constants/constants.js';

export const UI = {
    elements: {
        container: null,
        pill: null,
        textNavPill: null,
        textPill: null,
        textInput: null,
        prevBtn: null,
        nextBtn: null,
        addBtn: null,
        removeBtn: null,
        details: null,
        status: null,
        upscaleInfo: null,
        fetchBtn: null,
        downloadBtn: null,
        upscaleBtn: null,
        promptBtn: null,
        linksWrap: null,
    },

    textItems: [],
    currentIndex: 0,
    currentView: 'prompt', // 'prompt' or 'status'

    loadTextItems() {
        try {
            const saved = localStorage.getItem('grok-text-items');
            this.textItems = saved ? JSON.parse(saved) : [''];
        } catch {
            this.textItems = [''];
        }
        this.currentIndex = 0;
    },

    saveTextItems() {
        try {
            localStorage.setItem('grok-text-items', JSON.stringify(this.textItems));
        } catch (e) {
            console.error('Failed to save text items:', e);
        }
    },

    updateTextInput() {
        if (this.elements.textInput) {
            this.elements.textInput.value = this.textItems[this.currentIndex] || '';
        }
        this.updateNavButtons();
    },

    updateNavButtons() {
        if (this.elements.prevBtn) {
            this.elements.prevBtn.disabled = this.currentIndex === 0;
            this.elements.prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.disabled = this.currentIndex >= this.textItems.length - 1;
            this.elements.nextBtn.style.opacity = this.currentIndex >= this.textItems.length - 1 ? '0.3' : '1';
        }
        if (this.elements.removeBtn) {
            this.elements.removeBtn.disabled = this.textItems.length <= 1;
            this.elements.removeBtn.style.opacity = this.textItems.length <= 1 ? '0.3' : '1';
        }
    },

    switchView(view) {
        this.currentView = view;
        if (this.elements.textNavPill && this.elements.textPill && this.elements.details) {
            if (view === 'prompt') {
                this.elements.textNavPill.style.display = 'inline-flex';
                this.elements.textPill.style.display = 'flex';
                this.elements.details.style.display = 'none';
            } else {
                this.elements.textNavPill.style.display = 'none';
                this.elements.textPill.style.display = 'none';
                this.elements.details.style.display = 'block';
            }
        }
    },

    /**
     * Create a styled button element
     * @param {string} label - Button label
     * @param {boolean} withIcon - Whether to include icon spacing
     * @returns {HTMLButtonElement} Button element
     */
    createButton(label, withIcon = true) {
        const btn = document.createElement('button');
        Object.assign(btn.style, {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: withIcon ? UI_SPACING.GAP_MEDIUM : '0',
            border: 'none',
            background: UI_COLORS.BACKGROUND_MEDIUM,
            color: UI_COLORS.TEXT_SECONDARY,
            padding: `${UI_SPACING.PADDING_SMALL} ${UI_SPACING.PADDING_LARGE}`,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            cursor: 'pointer',
            fontSize: UI_SIZE.FONT_SIZE_NORMAL,
            fontWeight: '500',
            lineHeight: '1.2',
            outline: 'none',
            transition: `all ${UI_TRANSITION.DURATION} ${UI_TRANSITION.EASING}`,
            minHeight: 'auto',
        });
        btn.onmouseenter = () => {
            btn.style.background = UI_COLORS.BACKGROUND_LIGHT;
            btn.style.color = UI_COLORS.TEXT_HOVER;
        };
        btn.onmouseleave = () => {
            btn.style.background = UI_COLORS.BACKGROUND_MEDIUM;
            btn.style.color = UI_COLORS.TEXT_SECONDARY;
        };
        btn.textContent = label;
        return btn;
    },

    /**
     * Initialize the UI if not already created
     */
    ensure() {
        if (this.elements.container) return;

        // Load text items from localStorage
        this.loadTextItems();

        // Container
        const container = document.createElement('div');
        container.id = 'grok-media-fetcher';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: UI_POSITION.BOTTOM,
            right: UI_POSITION.RIGHT,
            zIndex: UI_POSITION.Z_INDEX,
            fontSize: UI_SIZE.FONT_SIZE_NORMAL,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            color: UI_COLORS.TEXT_PRIMARY,
            pointerEvents: 'auto',
        });
        this.elements.container = container;

        // Text navigation buttons pill
        const textNavPill = document.createElement('div');
        Object.assign(textNavPill.style, {
            display: 'inline-flex',
            alignItems: 'center',
            gap: UI_SPACING.GAP_LARGE,
            padding: UI_SPACING.PADDING_SMALL,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_DARK,
            border: 'none',
            boxShadow: `0 4px 12px ${UI_COLORS.SHADOW}`,
            marginBottom: UI_SPACING.MARGIN_MEDIUM,
        });
        this.elements.textNavPill = textNavPill;

        // Prev button
        const prevBtn = this.createButton('←', false);
        prevBtn.style.padding = `${UI_SPACING.PADDING_MEDIUM} ${UI_SPACING.PADDING_LARGE}`;
        prevBtn.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateTextInput();
            }
        });
        this.elements.prevBtn = prevBtn;

        // Next button
        const nextBtn = this.createButton('→', false);
        nextBtn.style.padding = `${UI_SPACING.PADDING_MEDIUM} ${UI_SPACING.PADDING_LARGE}`;
        nextBtn.addEventListener('click', () => {
            if (this.currentIndex < this.textItems.length - 1) {
                this.currentIndex++;
                this.updateTextInput();
            }
        });
        this.elements.nextBtn = nextBtn;

        // Add button
        const addBtn = this.createButton('+', false);
        addBtn.style.padding = `${UI_SPACING.PADDING_MEDIUM} ${UI_SPACING.PADDING_LARGE}`;
        addBtn.addEventListener('click', () => {
            const currentText = this.textItems[this.currentIndex] || '';
            if (currentText.trim() === '') {
                return; // Don't add if current text is empty
            }
            this.textItems.push('');
            this.currentIndex = this.textItems.length - 1;
            this.updateTextInput();
            this.saveTextItems();
        });
        this.elements.addBtn = addBtn;

        // Remove button
        const removeBtn = this.createButton('×', false);
        removeBtn.style.padding = `${UI_SPACING.PADDING_MEDIUM} ${UI_SPACING.PADDING_LARGE}`;
        removeBtn.addEventListener('click', () => {
            if (this.textItems.length > 1) {
                this.textItems.splice(this.currentIndex, 1);
                this.currentIndex = Math.min(this.currentIndex, this.textItems.length - 1);
                this.updateTextInput();
                this.saveTextItems();
            }
        });
        this.elements.removeBtn = removeBtn;

        textNavPill.appendChild(prevBtn);
        textNavPill.appendChild(nextBtn);
        textNavPill.appendChild(addBtn);
        textNavPill.appendChild(removeBtn);

        // Text input pill
        const textPill = document.createElement('div');
        Object.assign(textPill.style, {
            display: 'flex',
            alignItems: 'stretch',
            gap: UI_SPACING.GAP_MEDIUM,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_DARK,
            border: 'none',
            boxShadow: `0 4px 12px ${UI_COLORS.SHADOW}`,
            marginBottom: UI_SPACING.MARGIN_MEDIUM,
            padding: UI_SPACING.PADDING_SMALL,
        });
        this.elements.textPill = textPill;

        // Text input
        const textInput = document.createElement('textarea');
        textInput.rows = 3;
        textInput.placeholder = 'Enter text...';
        Object.assign(textInput.style, {
            flex: '1',
            padding: `${UI_SPACING.PADDING_MEDIUM} ${UI_SPACING.PADDING_LARGE}`,
            border: `1px solid ${UI_COLORS.BORDER}`,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_MEDIUM,
            color: UI_COLORS.TEXT_PRIMARY,
            fontSize: UI_SIZE.FONT_SIZE_NORMAL,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            outline: 'none',
            transition: `all ${UI_TRANSITION.DURATION} ${UI_TRANSITION.EASING}`,
            resize: 'vertical',
        });
        textInput.addEventListener('input', (e) => {
            this.textItems[this.currentIndex] = e.target.value;
            this.saveTextItems();
        });
        textInput.addEventListener('focus', () => {
            textInput.style.background = UI_COLORS.BACKGROUND_LIGHT;
            textInput.style.borderColor = UI_COLORS.TEXT_SECONDARY;
        });
        textInput.addEventListener('blur', () => {
            textInput.style.background = UI_COLORS.BACKGROUND_MEDIUM;
            textInput.style.borderColor = UI_COLORS.BORDER;
        });
        this.elements.textInput = textInput;

        // Container for sync and copy buttons
        const buttonColumn = document.createElement('div');
        Object.assign(buttonColumn.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: UI_SPACING.GAP_SMALL,
        });

        // Down arrow button (copy FROM external textarea TO our textarea)
        const downBtn = this.createButton('↓', false);
        downBtn.title = 'Copy from page input';
        Object.assign(downBtn.style, {
            padding: `${UI_SPACING.PADDING_SMALL} ${UI_SPACING.PADDING_MEDIUM}`,
            flex: '1',
            minHeight: '0',
        });
        downBtn.addEventListener('click', () => {
            try {
                const externalTextarea = document.querySelector('textarea[placeholder="Make a video"]');
                if (externalTextarea && externalTextarea.value) {
                    this.textItems[this.currentIndex] = externalTextarea.value;
                    this.updateTextInput();
                    this.saveTextItems();
                    const originalText = downBtn.textContent;
                    downBtn.textContent = '✓';
                    setTimeout(() => {
                        downBtn.textContent = originalText;
                    }, 1000);
                } else {
                    downBtn.textContent = '✗';
                    setTimeout(() => {
                        downBtn.textContent = '↓';
                    }, 1000);
                }
            } catch (err) {
                console.error('Failed to copy from external textarea:', err);
            }
        });

        // Up arrow button (copy FROM our textarea TO external textarea)
        const upBtn = this.createButton('↑', false);
        upBtn.title = 'Copy to page input';
        Object.assign(upBtn.style, {
            padding: `${UI_SPACING.PADDING_SMALL} ${UI_SPACING.PADDING_MEDIUM}`,
            flex: '1',
            minHeight: '0',
        });
        upBtn.addEventListener('click', () => {
            try {
                const externalTextarea = document.querySelector('textarea[placeholder="Make a video"]');
                if (externalTextarea) {
                    const text = this.textItems[this.currentIndex] || '';

                    // Use native setter to bypass React's value tracking
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLTextAreaElement.prototype,
                        'value'
                    ).set;
                    nativeInputValueSetter.call(externalTextarea, text);

                    // Dispatch input event that React will recognize
                    const inputEvent = new Event('input', { bubbles: true });
                    externalTextarea.dispatchEvent(inputEvent);

                    const originalText = upBtn.textContent;
                    upBtn.textContent = '✓';
                    setTimeout(() => {
                        upBtn.textContent = originalText;
                    }, 1000);
                } else {
                    upBtn.textContent = '✗';
                    setTimeout(() => {
                        upBtn.textContent = '↑';
                    }, 1000);
                }
            } catch (err) {
                console.error('Failed to copy to external textarea:', err);
            }
        });

        // Copy button
        const copyBtn = this.createButton('Copy', false);
        copyBtn.style.padding = `${UI_SPACING.PADDING_MEDIUM} ${UI_SPACING.PADDING_LARGE}`;
        copyBtn.style.alignSelf = 'stretch';
        copyBtn.addEventListener('click', async () => {
            const text = this.textItems[this.currentIndex] || '';
            try {
                await navigator.clipboard.writeText(text);
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 1500);
            } catch (err) {
                console.error('Failed to copy:', err);
                copyBtn.textContent = 'Failed';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 1500);
            }
        });

        buttonColumn.appendChild(downBtn);
        buttonColumn.appendChild(upBtn);

        textPill.appendChild(textInput);
        textPill.appendChild(buttonColumn);
        textPill.appendChild(copyBtn);

        this.updateTextInput();

        // Main buttons pill container
        const pill = document.createElement('div');
        Object.assign(pill.style, {
            display: 'inline-flex',
            alignItems: 'center',
            gap: UI_SPACING.GAP_LARGE,
            padding: UI_SPACING.PADDING_SMALL,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_DARK,
            border: 'none',
            boxShadow: `0 4px 12px ${UI_COLORS.SHADOW}`,
        });
        this.elements.pill = pill;

        // Buttons
        const fetchBtn = this.createButton('Fetch', false);
        fetchBtn.style.color = UI_COLORS.TEXT_SECONDARY;
        this.elements.fetchBtn = fetchBtn;

        this.elements.upscaleBtn = this.createButton('Upscale', false);
        this.elements.downloadBtn = this.createButton('Download', false);

        const promptBtn = this.createButton('Prompt', false);
        this.elements.promptBtn = promptBtn;

        pill.appendChild(promptBtn);
        pill.appendChild(fetchBtn);
        pill.appendChild(this.elements.upscaleBtn);
        pill.appendChild(this.elements.downloadBtn);

        // Details panel
        const details = document.createElement('div');
        Object.assign(details.style, {
            marginTop: UI_SPACING.MARGIN_MEDIUM,
            padding: `${UI_SPACING.PADDING_LARGE} ${UI_SPACING.PADDING_XLARGE}`,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_DARK,
            border: 'none',
            fontSize: UI_SIZE.FONT_SIZE_MEDIUM,
            color: UI_COLORS.TEXT_SECONDARY,
            display: 'none',
            maxWidth: UI_SIZE.MAX_WIDTH_DETAILS,
            boxShadow: `0 4px 12px ${UI_COLORS.SHADOW}`,
        });
        this.elements.details = details;

        const status = document.createElement('div');
        status.textContent = DEFAULTS.STATUS_READY;
        status.style.marginBottom = UI_SPACING.MARGIN_SMALL;
        this.elements.status = status;

        const upscaleInfo = document.createElement('div');
        upscaleInfo.textContent = 'Upscaled 0 / 0 (HD 0)';
        this.elements.upscaleInfo = upscaleInfo;

        details.appendChild(status);
        details.appendChild(upscaleInfo);

        // Footer with branding
        const footer = document.createElement('div');
        Object.assign(footer.style, {
            marginTop: UI_SPACING.MARGIN_MEDIUM,
            padding: `${UI_SPACING.PADDING_SMALL} ${UI_SPACING.PADDING_MEDIUM}`,
            borderRadius: UI_SIZE.BORDER_RADIUS_SMALL,
            background: UI_COLORS.BACKGROUND_DARK,
            border: 'none',
            fontSize: UI_SIZE.FONT_SIZE_SMALL,
            color: UI_COLORS.TEXT_SECONDARY,
            textAlign: 'center',
            boxShadow: `0 4px 12px ${UI_COLORS.SHADOW}`,
        });
        footer.textContent = `grokGoonify ${VERSION} by b2kdaman`;
        this.elements.footer = footer;

        // Append in order: prompt/status at top, buttons below, footer at bottom
        container.appendChild(textNavPill);
        container.appendChild(textPill);
        container.appendChild(details);
        container.appendChild(pill);
        container.appendChild(footer);
        document.body.appendChild(container);

        // Set initial view to prompt
        this.switchView('prompt');
    },

    /**
     * Attach event handlers (called after handlers are initialized)
     * @param {Object} handlers - Handlers object
     */
    attachHandlers(handlers) {
        if (this.elements.container) {
            this.elements.fetchBtn.addEventListener('click', handlers.fetch);
            this.elements.downloadBtn.addEventListener('click', handlers.download);
            this.elements.upscaleBtn.addEventListener('click', handlers.upscale);
            this.elements.promptBtn.addEventListener('click', () => {
                this.switchView('prompt');
            });
        }
    },

    /**
     * Show details panel
     */
    showDetails() {
        this.ensure();
        this.switchView('status');
    },

    /**
     * Hide details panel
     */
    hideDetails() {
        this.ensure();
        this.switchView('prompt');
    },

    /**
     * Set status text
     * @param {string} text - Status text
     */
    setStatus(text) {
        this.ensure();
        this.elements.status.textContent = text;
    },

    /**
     * Set upscale info text
     * @param {number} done - Number of upscales completed
     * @param {number} total - Total number to upscale
     * @param {number} hdCount - Number of HD videos
     */
    setUpscaleInfo(done, total, hdCount) {
        this.ensure();
        this.elements.upscaleInfo.textContent = `Upscaled ${done} / ${total} (HD ${hdCount})`;
    },

    /**
     * Clear and remove links wrapper
     */
    clearLinksWrap() {
        if (this.elements.linksWrap) {
            this.elements.linksWrap.remove();
            this.elements.linksWrap = null;
        }
    },

    /**
     * Create and display media info
     * @param {Object} data - Media data object
     */
    renderMediaInfo(data) {
        this.clearLinksWrap();
        const linksWrap = document.createElement('div');
        linksWrap.className = 'grok-media-links';
        linksWrap.style.marginTop = UI_SPACING.MARGIN_SMALL;

        if (!data.urls.length) {
            const noMedia = document.createElement('div');
            noMedia.textContent = 'No media URLs detected';
            linksWrap.appendChild(noMedia);
        } else {
            const countInfo = document.createElement('div');
            const totalVideoCount = data.videosToUpscale.length + data.hdVideoCount;
            countInfo.textContent =
                `Media: ${data.urls.length} | ` +
                `Videos: ${totalVideoCount} (HD ${data.hdVideoCount}, ` +
                `${data.videosToUpscale.length} to upscale)`;
            countInfo.style.marginTop = UI_SPACING.MARGIN_SMALL;
            linksWrap.appendChild(countInfo);
        }

        this.elements.details.appendChild(linksWrap);
        this.elements.linksWrap = linksWrap;
    }
};

