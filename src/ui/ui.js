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
        toggleBtn: null,
        contentWrapper: null,
        categoryPill: null,
        pill: null,
        textPill: null,
        textInput: null,
        categoryDropdown: null,
        addCategoryBtn: null,
        categoryInput: null,
        saveCategoryBtn: null,
        cancelCategoryBtn: null,
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

    categories: {},
    currentCategory: 'Default',
    currentIndex: 0,
    currentView: 'prompt', // 'prompt' or 'status'
    isAddingCategory: false,
    isHidden: false,

    loadTextItems() {
        try {
            const saved = localStorage.getItem('grok-text-items');
            if (!saved) {
                // No data - initialize with default category
                this.categories = { 'Default': [''] };
                this.currentCategory = 'Default';
                this.currentIndex = 0;
                return;
            }

            const parsed = JSON.parse(saved);

            // Migration: convert old array format to categories
            if (Array.isArray(parsed)) {
                this.categories = { 'Default': parsed.length > 0 ? parsed : [''] };
                this.currentCategory = 'Default';
                this.currentIndex = 0;
                this.saveTextItems(); // Save migrated data
            } else {
                // New format with categories
                this.categories = parsed.categories || { 'Default': [''] };
                this.currentCategory = parsed.currentCategory || 'Default';
                this.currentIndex = parsed.currentIndex || 0;

                // Ensure current category exists
                if (!this.categories[this.currentCategory]) {
                    this.currentCategory = 'Default';
                    this.currentIndex = 0;
                }
            }
        } catch (e) {
            console.error('Failed to load text items:', e);
            this.categories = { 'Default': [''] };
            this.currentCategory = 'Default';
            this.currentIndex = 0;
        }
    },

    saveTextItems() {
        try {
            const data = {
                categories: this.categories,
                currentCategory: this.currentCategory,
                currentIndex: this.currentIndex
            };
            localStorage.setItem('grok-text-items', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save text items:', e);
        }
    },

    getCurrentPrompts() {
        return this.categories[this.currentCategory] || [''];
    },

    setCurrentPrompt(index, value) {
        if (!this.categories[this.currentCategory]) {
            this.categories[this.currentCategory] = [''];
        }
        this.categories[this.currentCategory][index] = value;
    },

    updateTextInput() {
        if (this.elements.textInput) {
            const prompts = this.getCurrentPrompts();
            this.elements.textInput.value = prompts[this.currentIndex] || '';
        }
        this.updateNavButtons();
    },

    updateNavButtons() {
        const prompts = this.getCurrentPrompts();
        if (this.elements.prevBtn) {
            this.elements.prevBtn.disabled = this.currentIndex === 0;
            this.elements.prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.disabled = this.currentIndex >= prompts.length - 1;
            this.elements.nextBtn.style.opacity = this.currentIndex >= prompts.length - 1 ? '0.3' : '1';
        }
        if (this.elements.removeBtn) {
            this.elements.removeBtn.disabled = prompts.length <= 1;
            this.elements.removeBtn.style.opacity = prompts.length <= 1 ? '0.3' : '1';
        }
    },

    updateCategoryDropdown() {
        if (!this.elements.categoryDropdown) return;

        // Clear existing options
        this.elements.categoryDropdown.innerHTML = '';

        // Add all categories
        Object.keys(this.categories).forEach(categoryName => {
            const option = document.createElement('option');
            option.value = categoryName;
            option.textContent = categoryName;
            if (categoryName === this.currentCategory) {
                option.selected = true;
            }
            this.elements.categoryDropdown.appendChild(option);
        });
    },

    startAddCategory() {
        if (this.isAddingCategory) return;
        this.isAddingCategory = true;

        // Hide dropdown and add button, show input and Save/Cancel buttons
        if (this.elements.categoryDropdown) {
            this.elements.categoryDropdown.style.display = 'none';
        }
        if (this.elements.addCategoryBtn) {
            this.elements.addCategoryBtn.style.display = 'none';
        }
        if (this.elements.categoryInput) {
            this.elements.categoryInput.style.display = 'block';
            this.elements.categoryInput.value = '';
            this.elements.categoryInput.focus();
        }
        if (this.elements.saveCategoryBtn) {
            this.elements.saveCategoryBtn.style.display = 'inline-flex';
        }
        if (this.elements.cancelCategoryBtn) {
            this.elements.cancelCategoryBtn.style.display = 'inline-flex';
        }
    },

    cancelAddCategory() {
        if (!this.isAddingCategory) return;
        this.isAddingCategory = false;

        // Hide input and Save/Cancel buttons, show dropdown and add button
        if (this.elements.categoryDropdown) {
            this.elements.categoryDropdown.style.display = 'block';
        }
        if (this.elements.addCategoryBtn) {
            this.elements.addCategoryBtn.style.display = 'inline-flex';
        }
        if (this.elements.categoryInput) {
            this.elements.categoryInput.style.display = 'none';
            this.elements.categoryInput.value = '';
        }
        if (this.elements.saveCategoryBtn) {
            this.elements.saveCategoryBtn.style.display = 'none';
        }
        if (this.elements.cancelCategoryBtn) {
            this.elements.cancelCategoryBtn.style.display = 'none';
        }
    },

    saveCategory() {
        if (!this.isAddingCategory || !this.elements.categoryInput) return;

        const categoryName = this.elements.categoryInput.value.trim();
        
        // Validate category name
        if (!categoryName) {
            return; // Don't create empty category
        }

        // Check if category already exists
        if (this.categories[categoryName]) {
            // Switch to existing category instead of creating duplicate
            this.currentCategory = categoryName;
            this.currentIndex = 0;
        } else {
            // Create new category
            this.categories[categoryName] = [''];
            this.currentCategory = categoryName;
            this.currentIndex = 0;
        }

        // Update UI and save
        this.updateCategoryDropdown();
        this.updateTextInput();
        this.saveTextItems();
        this.cancelAddCategory();
    },

    switchView(view) {
        this.currentView = view;
        if (this.elements.textPill && this.elements.details) {
            if (view === 'prompt') {
                this.elements.textPill.style.display = 'flex';
                this.elements.details.style.display = 'none';
                if (this.elements.categoryPill) {
                    this.elements.categoryPill.style.display = 'flex';
                }
            } else {
                this.elements.textPill.style.display = 'none';
                this.elements.details.style.display = 'block';
                if (this.elements.categoryPill) {
                    this.elements.categoryPill.style.display = 'none';
                }
            }
        }
    },

    toggleVisibility() {
        this.isHidden = !this.isHidden;
        
        if (this.elements.contentWrapper && this.elements.toggleBtn) {
            if (this.isHidden) {
                this.elements.contentWrapper.style.display = 'none';
                this.elements.toggleBtn.innerHTML = '&#9650;'; // Chevron up HTML entity (▲)
            } else {
                this.elements.contentWrapper.style.display = 'flex';
                this.elements.toggleBtn.innerHTML = '&#9660;'; // Chevron down HTML entity (▼)
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
        });
        this.elements.container = container;

        // Toggle button (always visible at top)
        const toggleBtn = document.createElement('button');
        Object.assign(toggleBtn.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            padding: '0',
            marginBottom: UI_SPACING.MARGIN_SMALL,
            border: 'none',
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_DARK,
            color: UI_COLORS.TEXT_SECONDARY,
            fontSize: UI_SIZE.FONT_SIZE_LARGE,
            cursor: 'pointer',
            outline: 'none',
            transition: `all ${UI_TRANSITION.DURATION} ${UI_TRANSITION.EASING}`,
            boxShadow: `0 4px 12px ${UI_COLORS.SHADOW}`,
        });
        toggleBtn.innerHTML = '&#9660;'; // Chevron down HTML entity (▼)
        toggleBtn.title = 'Toggle UI';
        toggleBtn.addEventListener('click', () => {
            this.toggleVisibility();
        });
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.background = UI_COLORS.BACKGROUND_LIGHT;
            toggleBtn.style.color = UI_COLORS.TEXT_HOVER;
        });
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.background = UI_COLORS.BACKGROUND_DARK;
            toggleBtn.style.color = UI_COLORS.TEXT_SECONDARY;
        });
        this.elements.toggleBtn = toggleBtn;

        // Content wrapper (contains all UI except toggle button)
        const contentWrapper = document.createElement('div');
        Object.assign(contentWrapper.style, {
            display: 'flex',
            flexDirection: 'column',
        });
        this.elements.contentWrapper = contentWrapper;

        // Category pill (separate background block)
        const categoryPill = document.createElement('div');
        Object.assign(categoryPill.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: UI_SPACING.GAP_MEDIUM,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_DARK,
            border: 'none',
            boxShadow: `0 4px 12px ${UI_COLORS.SHADOW}`,
            marginBottom: UI_SPACING.MARGIN_MEDIUM,
            padding: UI_SPACING.PADDING_SMALL,
        });
        this.elements.categoryPill = categoryPill;

        // Category row: dropdown + add button
        const categoryRow = document.createElement('div');
        Object.assign(categoryRow.style, {
            display: 'flex',
            gap: UI_SPACING.GAP_SMALL,
            alignItems: 'center',
        });

        // Category dropdown
        const categoryDropdown = document.createElement('select');
        Object.assign(categoryDropdown.style, {
            flex: '1',
            padding: `${UI_SPACING.PADDING_MEDIUM} ${UI_SPACING.PADDING_LARGE}`,
            paddingRight: '32px',
            border: `1px solid ${UI_COLORS.BORDER}`,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: `${UI_COLORS.BACKGROUND_MEDIUM} url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") no-repeat right 8px center`,
            backgroundSize: '16px',
            color: UI_COLORS.TEXT_PRIMARY,
            fontSize: UI_SIZE.FONT_SIZE_NORMAL,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            outline: 'none',
            cursor: 'pointer',
            transition: `all ${UI_TRANSITION.DURATION} ${UI_TRANSITION.EASING}`,
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
        });
        categoryDropdown.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.currentIndex = 0;
            this.updateTextInput();
            this.updateCategoryDropdown();
            this.saveTextItems();
        });
        categoryDropdown.addEventListener('focus', () => {
            categoryDropdown.style.background = UI_COLORS.BACKGROUND_LIGHT;
            categoryDropdown.style.borderColor = UI_COLORS.TEXT_SECONDARY;
        });
        categoryDropdown.addEventListener('blur', () => {
            categoryDropdown.style.background = UI_COLORS.BACKGROUND_MEDIUM;
            categoryDropdown.style.borderColor = UI_COLORS.BORDER;
        });
        this.elements.categoryDropdown = categoryDropdown;

        // Category input (hidden by default, shown when adding)
        const categoryInput = document.createElement('input');
        categoryInput.type = 'text';
        categoryInput.placeholder = 'Category name';
        Object.assign(categoryInput.style, {
            flex: '1',
            padding: `${UI_SPACING.PADDING_MEDIUM} ${UI_SPACING.PADDING_LARGE}`,
            border: `1px solid ${UI_COLORS.BORDER}`,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_MEDIUM,
            color: UI_COLORS.TEXT_PRIMARY,
            fontSize: UI_SIZE.FONT_SIZE_NORMAL,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            outline: 'none',
            display: 'none',
            transition: `all ${UI_TRANSITION.DURATION} ${UI_TRANSITION.EASING}`,
        });
        categoryInput.addEventListener('focus', () => {
            categoryInput.style.background = UI_COLORS.BACKGROUND_LIGHT;
            categoryInput.style.borderColor = UI_COLORS.TEXT_SECONDARY;
        });
        categoryInput.addEventListener('blur', () => {
            categoryInput.style.background = UI_COLORS.BACKGROUND_MEDIUM;
            categoryInput.style.borderColor = UI_COLORS.BORDER;
        });
        categoryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveCategory();
            } else if (e.key === 'Escape') {
                this.cancelAddCategory();
            }
        });
        this.elements.categoryInput = categoryInput;

        // Add category button
        const addCategoryBtn = this.createButton('+', false);
        Object.assign(addCategoryBtn.style, {
            minWidth: '32px',
            minHeight: '32px',
            fontSize: '20px',
            fontWeight: 'bold',
        });
        addCategoryBtn.innerHTML = '&#43;'; // HTML entity for plus
        addCategoryBtn.addEventListener('click', () => {
            this.startAddCategory();
        });
        this.elements.addCategoryBtn = addCategoryBtn;

        // Save category button (hidden by default)
        const saveCategoryBtn = this.createButton('Save', false);
        saveCategoryBtn.style.display = 'none';
        saveCategoryBtn.addEventListener('click', () => {
            this.saveCategory();
        });
        this.elements.saveCategoryBtn = saveCategoryBtn;

        // Cancel category button (hidden by default)
        const cancelCategoryBtn = this.createButton('Cancel', false);
        cancelCategoryBtn.style.display = 'none';
        cancelCategoryBtn.addEventListener('click', () => {
            this.cancelAddCategory();
        });
        this.elements.cancelCategoryBtn = cancelCategoryBtn;

        categoryRow.appendChild(categoryDropdown);
        categoryRow.appendChild(categoryInput);
        categoryRow.appendChild(addCategoryBtn);
        categoryRow.appendChild(saveCategoryBtn);
        categoryRow.appendChild(cancelCategoryBtn);

        categoryPill.appendChild(categoryRow);

        // Text input pill
        const textPill = document.createElement('div');
        Object.assign(textPill.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: UI_SPACING.GAP_MEDIUM,
            borderRadius: UI_SIZE.BORDER_RADIUS_MEDIUM,
            background: UI_COLORS.BACKGROUND_DARK,
            border: 'none',
            boxShadow: `0 4px 12px ${UI_COLORS.SHADOW}`,
            marginBottom: UI_SPACING.MARGIN_MEDIUM,
            padding: UI_SPACING.PADDING_SMALL,
        });
        this.elements.textPill = textPill;

        // Top row: textarea + nav buttons
        const topRow = document.createElement('div');
        Object.assign(topRow.style, {
            display: 'flex',
            gap: UI_SPACING.GAP_MEDIUM,
        });

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
            this.setCurrentPrompt(this.currentIndex, e.target.value);
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

        // Navigation buttons grid (2x2)
        const navGrid = document.createElement('div');
        Object.assign(navGrid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: UI_SPACING.GAP_SMALL,
        });

        // Prev button
        const prevBtn = this.createButton('←', false);
        prevBtn.innerHTML = '&#8592;'; // Left arrow HTML entity
        prevBtn.style.fontSize = '20px';
        prevBtn.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateTextInput();
            }
        });
        this.elements.prevBtn = prevBtn;

        // Next button
        const nextBtn = this.createButton('→', false);
        nextBtn.innerHTML = '&#8594;'; // Right arrow HTML entity
        nextBtn.style.fontSize = '20px';
        nextBtn.addEventListener('click', () => {
            const prompts = this.getCurrentPrompts();
            if (this.currentIndex < prompts.length - 1) {
                this.currentIndex++;
                this.updateTextInput();
                this.saveTextItems();
            }
        });
        this.elements.nextBtn = nextBtn;

        // Add button
        const addBtn = this.createButton('+', false);
        addBtn.innerHTML = '&#43;'; // Plus HTML entity
        addBtn.style.fontSize = '20px';
        addBtn.addEventListener('click', () => {
            const prompts = this.getCurrentPrompts();
            const currentText = prompts[this.currentIndex] || '';
            if (currentText.trim() === '') {
                return; // Don't add if current text is empty
            }
            prompts.push('');
            this.currentIndex = prompts.length - 1;
            this.updateTextInput();
            this.saveTextItems();
        });
        this.elements.addBtn = addBtn;

        // Remove button
        const removeBtn = this.createButton('×', false);
        removeBtn.innerHTML = '&#215;'; // Multiplication sign HTML entity
        removeBtn.style.fontSize = '20px';
        removeBtn.addEventListener('click', () => {
            const prompts = this.getCurrentPrompts();
            if (prompts.length > 1) {
                prompts.splice(this.currentIndex, 1);
                this.currentIndex = Math.min(this.currentIndex, prompts.length - 1);
                this.updateTextInput();
                this.saveTextItems();
            }
        });
        this.elements.removeBtn = removeBtn;

        navGrid.appendChild(prevBtn);
        navGrid.appendChild(nextBtn);
        navGrid.appendChild(addBtn);
        navGrid.appendChild(removeBtn);

        topRow.appendChild(textInput);
        topRow.appendChild(navGrid);

        // Button row below textarea
        const buttonRow = document.createElement('div');
        Object.assign(buttonRow.style, {
            display: 'flex',
            gap: UI_SPACING.GAP_MEDIUM,
            justifyContent: 'flex-start',
        });

        // From button (copy FROM external textarea TO our textarea)
        const fromBtn = this.createButton('From', false);
        fromBtn.title = 'Copy from page input';
        fromBtn.addEventListener('click', () => {
            try {
                const externalTextarea = document.querySelector('textarea[placeholder="Make a video"]');
                if (externalTextarea && externalTextarea.value) {
                    this.setCurrentPrompt(this.currentIndex, externalTextarea.value);
                    this.updateTextInput();
                    this.saveTextItems();
                    const originalText = fromBtn.textContent;
                    fromBtn.innerHTML = '&#10003;'; // Checkmark HTML entity
                    setTimeout(() => {
                        fromBtn.textContent = originalText;
                    }, 1000);
                } else {
                    fromBtn.innerHTML = '&#10007;'; // X mark HTML entity
                    setTimeout(() => {
                        fromBtn.textContent = 'From';
                    }, 1000);
                }
            } catch (err) {
                console.error('Failed to copy from external textarea:', err);
            }
        });

        // To button (copy FROM our textarea TO external textarea)
        const toBtn = this.createButton('To', false);
        toBtn.title = 'Copy to page input';
        toBtn.addEventListener('click', () => {
            try {
                const externalTextarea = document.querySelector('textarea[placeholder="Make a video"]');
                if (externalTextarea) {
                    const prompts = this.getCurrentPrompts();
                    const text = prompts[this.currentIndex] || '';

                    // Use native setter to bypass React's value tracking
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLTextAreaElement.prototype,
                        'value'
                    ).set;
                    nativeInputValueSetter.call(externalTextarea, text);

                    // Dispatch input event that React will recognize
                    const inputEvent = new Event('input', { bubbles: true });
                    externalTextarea.dispatchEvent(inputEvent);

                    const originalText = toBtn.textContent;
                    toBtn.innerHTML = '&#10003;'; // Checkmark HTML entity
                    setTimeout(() => {
                        toBtn.textContent = originalText;
                    }, 1000);
                } else {
                    toBtn.innerHTML = '&#10007;'; // X mark HTML entity
                    setTimeout(() => {
                        toBtn.textContent = 'To';
                    }, 1000);
                }
            } catch (err) {
                console.error('Failed to copy to external textarea:', err);
            }
        });

        // Copy button
        const copyBtn = this.createButton('Copy', false);
        copyBtn.addEventListener('click', async () => {
            const prompts = this.getCurrentPrompts();
            const text = prompts[this.currentIndex] || '';
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

        buttonRow.appendChild(fromBtn);
        buttonRow.appendChild(toBtn);
        buttonRow.appendChild(copyBtn);

        textPill.appendChild(topRow);
        textPill.appendChild(buttonRow);

        // Initialize category dropdown and text input
        this.updateCategoryDropdown();
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

        // Append to content wrapper: category at top, prompt/status below, buttons below, footer at bottom
        contentWrapper.appendChild(categoryPill);
        contentWrapper.appendChild(textPill);
        contentWrapper.appendChild(details);
        contentWrapper.appendChild(pill);
        contentWrapper.appendChild(footer);

        // Append toggle button and content wrapper to container
        container.appendChild(toggleBtn);
        container.appendChild(contentWrapper);
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

