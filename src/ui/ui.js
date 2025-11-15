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
    TIMING,
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
        deleteCategoryBtn: null,
        categoryInput: null,
        saveCategoryBtn: null,
        cancelCategoryBtn: null,
        prevBtn: null,
        nextBtn: null,
        addBtn: null,
        removeBtn: null,
        playBtn: null,
        starRating: null,
        details: null,
        status: null,
        upscaleInfo: null,
        downloadBtn: null,
        upscaleBtn: null,
        promptBtn: null,
        linksWrap: null,
        spinBtn: null,
        fullscreenBtn: null,
    },

    categories: {},
    currentCategory: 'Default',
    currentIndex: 0,
    currentView: 'prompt', // 'prompt' or 'status'
    isAddingCategory: false,
    isHidden: false,
    lastDeleteClickTime: 0,
    isSpinning: false,
    shouldStopSpinning: false,
    spinAnimationInterval: null,

    loadTextItems() {
        try {
            const saved = localStorage.getItem('grok-text-items');
            if (!saved) {
                // No data - initialize with default category
                this.categories = { 'Default': [{ text: '', rating: 0 }] };
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

            // Migration: convert string prompts to objects with ratings
            Object.keys(this.categories).forEach(categoryName => {
                this.categories[categoryName] = this.categories[categoryName].map(prompt => {
                    // If it's a string, convert to object
                    if (typeof prompt === 'string') {
                        return { text: prompt, rating: 0 };
                    }
                    // If it's already an object, ensure it has both properties
                    return {
                        text: prompt.text || '',
                        rating: prompt.rating || 0
                    };
                });
            });
        } catch (e) {
            console.error('Failed to load text items:', e);
            this.categories = { 'Default': [{ text: '', rating: 0 }] };
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
            this.categories[this.currentCategory] = [{ text: '', rating: 0 }];
        }
        // If value is a string, update only text; preserve rating
        if (typeof value === 'string') {
            const currentPrompt = this.categories[this.currentCategory][index];
            this.categories[this.currentCategory][index] = {
                text: value,
                rating: currentPrompt?.rating || 0
            };
        } else {
            // If value is an object, replace entirely
            this.categories[this.currentCategory][index] = value;
        }
    },

    updateTextInput() {
        if (this.elements.textInput) {
            const prompts = this.getCurrentPrompts();
            this.elements.textInput.value = prompts[this.currentIndex]?.text || '';
        }
        this.updateNavButtons();
        this.updateStarRating();
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

    setRating(rating) {
        const prompts = this.getCurrentPrompts();
        const currentPrompt = prompts[this.currentIndex];
        if (currentPrompt) {
            currentPrompt.rating = rating;
            this.updateStarRating();
            this.saveTextItems();
        }
    },

    updateStarRating() {
        if (!this.elements.starRating) return;

        const prompts = this.getCurrentPrompts();
        const currentRating = prompts[this.currentIndex]?.rating || 0;

        // Update each star element
        const stars = this.elements.starRating.children;
        for (let i = 0; i < stars.length; i++) {
            if (i < currentRating) {
                stars[i].innerHTML = '&#9733;'; // Filled star ★
                stars[i].style.color = '#FFD700'; // Gold
            } else {
                stars[i].innerHTML = '&#9734;'; // Empty star ☆
                stars[i].style.color = '#666'; // Gray
            }
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

        // Hide dropdown and add/delete buttons, show input and Save/Cancel buttons
        if (this.elements.categoryDropdown) {
            this.elements.categoryDropdown.style.display = 'none';
        }
        if (this.elements.addCategoryBtn) {
            this.elements.addCategoryBtn.style.display = 'none';
        }
        if (this.elements.deleteCategoryBtn) {
            this.elements.deleteCategoryBtn.style.display = 'none';
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

        // Hide input and Save/Cancel buttons, show dropdown and add/delete buttons
        if (this.elements.categoryDropdown) {
            this.elements.categoryDropdown.style.display = 'block';
        }
        if (this.elements.addCategoryBtn) {
            this.elements.addCategoryBtn.style.display = 'inline-flex';
        }
        if (this.elements.deleteCategoryBtn) {
            this.elements.deleteCategoryBtn.style.display = 'inline-flex';
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
            this.categories[categoryName] = [{ text: '', rating: 0 }];
            this.currentCategory = categoryName;
            this.currentIndex = 0;
        }

        // Update UI and save
        this.updateCategoryDropdown();
        this.updateTextInput();
        this.saveTextItems();
        this.cancelAddCategory();
    },

    deleteCategory() {
        const categoryNames = Object.keys(this.categories);

        // Prevent deleting the last category
        if (categoryNames.length <= 1) {
            return;
        }

        // Double-click detection (within 500ms)
        const now = Date.now();
        const timeSinceLastClick = now - this.lastDeleteClickTime;

        if (timeSinceLastClick < 500) {
            // Second click within threshold - perform delete
            const categoryToDelete = this.currentCategory;

            // Delete the category
            delete this.categories[categoryToDelete];

            // Switch to first available category
            const remainingCategories = Object.keys(this.categories);
            this.currentCategory = remainingCategories[0];
            this.currentIndex = 0;

            // Update UI and save
            this.updateCategoryDropdown();
            this.updateTextInput();
            this.saveTextItems();

            // Reset click time
            this.lastDeleteClickTime = 0;

            // Visual feedback
            if (this.elements.deleteCategoryBtn) {
                const originalText = this.elements.deleteCategoryBtn.innerHTML;
                this.elements.deleteCategoryBtn.innerHTML = '&#10003;'; // Checkmark
                setTimeout(() => {
                    this.elements.deleteCategoryBtn.innerHTML = originalText;
                }, 1000);
            }
        } else {
            // First click - update time and show feedback
            this.lastDeleteClickTime = now;

            // Visual feedback: indicate that another click is needed
            if (this.elements.deleteCategoryBtn) {
                const originalBg = this.elements.deleteCategoryBtn.style.background;
                this.elements.deleteCategoryBtn.style.background = '#ff6b6b';
                setTimeout(() => {
                    this.elements.deleteCategoryBtn.style.background = originalBg;
                }, 500);
            }
        }
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

        // Add fullscreen video styles
        const style = document.createElement('style');
        style.textContent = `
            video:fullscreen {
                width: 100vw;
                height: 100vh;
                object-fit: contain;
            }
        `;
        document.head.appendChild(style);

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
            width: UI_SIZE.ICON_BUTTON_SIZE,
            height: UI_SIZE.ICON_BUTTON_SIZE,
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
            width: UI_SIZE.ICON_BUTTON_SIZE,
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minWidth: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            padding: '0',
            fontSize: '20px',
            fontWeight: 'bold',
        });
        addCategoryBtn.innerHTML = '&#43;'; // HTML entity for plus
        addCategoryBtn.addEventListener('click', () => {
            this.startAddCategory();
        });
        this.elements.addCategoryBtn = addCategoryBtn;

        // Delete category button
        const deleteCategoryBtn = this.createButton('−', false);
        Object.assign(deleteCategoryBtn.style, {
            width: UI_SIZE.ICON_BUTTON_SIZE,
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minWidth: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            padding: '0',
            fontSize: '20px',
            fontWeight: 'bold',
        });
        deleteCategoryBtn.innerHTML = '&#8722;'; // HTML entity for minus
        deleteCategoryBtn.title = 'Double-click to delete category';
        deleteCategoryBtn.addEventListener('click', () => {
            this.deleteCategory();
        });
        this.elements.deleteCategoryBtn = deleteCategoryBtn;

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
        categoryRow.appendChild(deleteCategoryBtn);
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
        textInput.rows = 5;
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
        Object.assign(prevBtn.style, {
            width: UI_SIZE.ICON_BUTTON_SIZE,
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minWidth: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            padding: '0',
            fontSize: '20px',
        });
        prevBtn.innerHTML = '&#8592;'; // Left arrow HTML entity
        prevBtn.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateTextInput();
            }
        });
        this.elements.prevBtn = prevBtn;

        // Next button
        const nextBtn = this.createButton('→', false);
        Object.assign(nextBtn.style, {
            width: UI_SIZE.ICON_BUTTON_SIZE,
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minWidth: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            padding: '0',
            fontSize: '20px',
        });
        nextBtn.innerHTML = '&#8594;'; // Right arrow HTML entity
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
        Object.assign(addBtn.style, {
            width: UI_SIZE.ICON_BUTTON_SIZE,
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minWidth: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            padding: '0',
            fontSize: '20px',
        });
        addBtn.innerHTML = '&#43;'; // Plus HTML entity
        addBtn.addEventListener('click', () => {
            const prompts = this.getCurrentPrompts();
            const currentText = prompts[this.currentIndex]?.text || '';
            if (currentText.trim() === '') {
                return; // Don't add if current text is empty
            }
            prompts.push({ text: '', rating: 0 });
            this.currentIndex = prompts.length - 1;
            this.updateTextInput();
            this.saveTextItems();
        });
        this.elements.addBtn = addBtn;

        // Remove button
        const removeBtn = this.createButton('×', false);
        Object.assign(removeBtn.style, {
            width: UI_SIZE.ICON_BUTTON_SIZE,
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minWidth: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            padding: '0',
            fontSize: '20px',
        });
        removeBtn.innerHTML = '&#215;'; // Multiplication sign HTML entity
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

        // Play button (2 columns wide)
        const playBtn = this.createButton('▶', false);
        Object.assign(playBtn.style, {
            width: '100%',
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            padding: '0',
            fontSize: '20px',
            gridColumn: '1 / 3',
        });
        playBtn.innerHTML = '&#9654;'; // Play triangle HTML entity
        playBtn.title = 'Copy to page and Make a Video';
        playBtn.addEventListener('click', () => {
            try {
                const externalTextarea = document.querySelector('textarea[placeholder="Make a video"]');
                if (externalTextarea) {
                    const prompts = this.getCurrentPrompts();
                    const text = prompts[this.currentIndex]?.text || '';

                    // Use native setter to bypass React's value tracking
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLTextAreaElement.prototype,
                        'value'
                    ).set;
                    nativeInputValueSetter.call(externalTextarea, text);

                    // Dispatch input event that React will recognize
                    const inputEvent = new Event('input', { bubbles: true });
                    externalTextarea.dispatchEvent(inputEvent);

                    // Wait a moment then click "Make a Video" button
                    setTimeout(() => {
                        const makeVideoButton = document.querySelector('button[aria-label="Make video"]');
                        if (makeVideoButton) {
                            makeVideoButton.click();
                            const originalText = playBtn.innerHTML;
                            playBtn.innerHTML = '&#10003;'; // Checkmark
                            setTimeout(() => {
                                playBtn.innerHTML = originalText;
                            }, 1000);
                        } else {
                            playBtn.innerHTML = '&#10007;'; // X mark
                            setTimeout(() => {
                                playBtn.innerHTML = '&#9654;';
                            }, 1000);
                        }
                    }, 100);
                } else {
                    playBtn.innerHTML = '&#10007;'; // X mark
                    setTimeout(() => {
                        playBtn.innerHTML = '&#9654;';
                    }, 1000);
                }
            } catch (err) {
                console.error('Failed to play:', err);
            }
        });
        this.elements.playBtn = playBtn;

        navGrid.appendChild(prevBtn);
        navGrid.appendChild(nextBtn);
        navGrid.appendChild(addBtn);
        navGrid.appendChild(removeBtn);
        navGrid.appendChild(playBtn);

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault(); // Prevent default behavior

                if (e.shiftKey) {
                    // Ctrl/Cmd+Shift+Enter: Copy prompt and click "Make a Video" (play button)
                    playBtn.click();
                } else {
                    // Ctrl/Cmd+Enter: Just click "Make a Video" button without copying
                    const makeVideoButton = document.querySelector('button[aria-label="Make video"]');
                    if (makeVideoButton) {
                        makeVideoButton.click();
                    }
                }
            } else if (e.key === 'ArrowLeft') {
                // Left arrow: Click "Previous video" button
                const prevVideoButton = document.querySelector('button[aria-label="Previous video"]');
                if (prevVideoButton) {
                    e.preventDefault();
                    prevVideoButton.click();
                }
            } else if (e.key === 'ArrowRight') {
                // Right arrow: Click "Next video" button
                const nextVideoButton = document.querySelector('button[aria-label="Next video"]');
                if (nextVideoButton) {
                    e.preventDefault();
                    nextVideoButton.click();
                }
            }
        });

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
                    const text = prompts[this.currentIndex]?.text || '';

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
            const text = prompts[this.currentIndex]?.text || '';
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

        // Star rating component
        const starRating = document.createElement('div');
        Object.assign(starRating.style, {
            display: 'flex',
            gap: '2px',
            alignItems: 'center',
            marginLeft: 'auto', // Push to right side
        });

        // Create 5 star elements
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.innerHTML = '&#9734;'; // Empty star by default
            Object.assign(star.style, {
                cursor: 'pointer',
                fontSize: '18px',
                color: '#666',
                transition: 'color 0.1s ease',
                userSelect: 'none',
            });

            // Click handler - set rating
            star.addEventListener('click', () => {
                this.setRating(i);
            });

            // Hover handler - preview rating
            star.addEventListener('mouseenter', () => {
                const stars = starRating.children;
                for (let j = 0; j < stars.length; j++) {
                    if (j < i) {
                        stars[j].innerHTML = '&#9733;'; // Filled star
                        stars[j].style.color = '#FFD700'; // Gold
                    } else {
                        stars[j].innerHTML = '&#9734;'; // Empty star
                        stars[j].style.color = '#666'; // Gray
                    }
                }
            });

            // Mouse leave handler - reset to actual rating
            star.addEventListener('mouseleave', () => {
                this.updateStarRating();
            });

            starRating.appendChild(star);
        }
        this.elements.starRating = starRating;

        buttonRow.appendChild(fromBtn);
        buttonRow.appendChild(toBtn);
        buttonRow.appendChild(copyBtn);
        buttonRow.appendChild(starRating);

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
        this.elements.upscaleBtn = this.createButton('Upscale', false);
        this.elements.downloadBtn = this.createButton('Download', false);

        const promptBtn = this.createButton('Prompt', false);
        this.elements.promptBtn = promptBtn;

        // Make buttons fill their container
        Object.assign(promptBtn.style, { flex: '1' });
        Object.assign(this.elements.upscaleBtn.style, { flex: '1' });
        Object.assign(this.elements.downloadBtn.style, { flex: '1' });

        // Disable download button by default
        this.elements.downloadBtn.disabled = true;
        this.elements.downloadBtn.style.opacity = '0.5';
        this.elements.downloadBtn.style.cursor = 'not-allowed';

        pill.appendChild(promptBtn);
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
            width: '100%',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: UI_SPACING.GAP_SMALL,
        });

        // Footer button row (spin and fullscreen buttons)
        const footerButtonRow = document.createElement('div');
        Object.assign(footerButtonRow.style, {
            display: 'flex',
            gap: UI_SPACING.GAP_MEDIUM,
            alignItems: 'center',
            width: '100%',
        });

        // Spin button (full width)
        const spinBtn = this.createButton('Spin', false);
        Object.assign(spinBtn.style, {
            padding: `${UI_SPACING.PADDING_SMALL} ${UI_SPACING.PADDING_MEDIUM}`,
            flex: '1',
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            maxHeight: UI_SIZE.ICON_BUTTON_SIZE,
        });
        spinBtn.title = 'Spin through list items and run them';
        this.elements.spinBtn = spinBtn;

        // Fullscreen button (square)
        const fullscreenBtn = this.createButton('[ ]', false);
        Object.assign(fullscreenBtn.style, {
            width: UI_SIZE.ICON_BUTTON_SIZE,
            height: UI_SIZE.ICON_BUTTON_SIZE,
            minWidth: UI_SIZE.ICON_BUTTON_SIZE,
            minHeight: UI_SIZE.ICON_BUTTON_SIZE,
            maxWidth: UI_SIZE.ICON_BUTTON_SIZE,
            maxHeight: UI_SIZE.ICON_BUTTON_SIZE,
            padding: '0',
            fontSize: '20px',
            lineHeight: UI_SIZE.ICON_BUTTON_SIZE,
            flexShrink: '0',
        });
        fullscreenBtn.title = 'Enter fullscreen mode';
        this.elements.fullscreenBtn = fullscreenBtn;

        footerButtonRow.appendChild(spinBtn);
        footerButtonRow.appendChild(fullscreenBtn);

        // Version text
        const versionText = document.createElement('span');
        versionText.textContent = `grokGoonify ${VERSION} by b2kdaman`;

        footer.appendChild(footerButtonRow);
        footer.appendChild(versionText);
        this.elements.footer = footer;

        // Attach spin button click handler
        spinBtn.addEventListener('click', () => {
            if (this.isSpinning) {
                // Stop spinning
                this.stopSpin();
            } else {
                // Start spinning
                this.spin();
            }
        });

        // Attach fullscreen button click handler
        fullscreenBtn.addEventListener('click', () => {
            this.enterFullscreen();
        });

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
     * Enable the download button
     */
    enableDownloadButton() {
        this.ensure();
        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.disabled = false;
            this.elements.downloadBtn.style.opacity = '1';
            this.elements.downloadBtn.style.cursor = 'pointer';
        }
    },

    /**
     * Disable the download button
     */
    disableDownloadButton() {
        this.ensure();
        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.disabled = true;
            this.elements.downloadBtn.style.opacity = '0.5';
            this.elements.downloadBtn.style.cursor = 'not-allowed';
        }
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
     * Find run button (the one with percentage text that glows)
     * @returns {HTMLButtonElement|null} The run button or null if not found
     */
    findRunButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const text = btn.textContent || btn.innerText || '';
            // Look for button with percentage pattern (like "50%") or the glowing one
            if (text.match(/\d+%/) || btn.dataset.grokGlowApplied === 'true') {
                return btn;
            }
        }
        return null;
    },

    /**
     * Wait for run button to complete (percentage reaches 100% or disappears)
     * @returns {Promise<void>}
     */
    async waitForRunCompletion() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const runButton = this.findRunButton();
                if (!runButton) {
                    // Button disappeared, likely completed
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }

                const buttonText = runButton.textContent || runButton.innerText || '';
                const percentageMatch = buttonText.match(/(\d+)%/);
                
                if (percentageMatch) {
                    const percentage = parseInt(percentageMatch[1], 10);
                    if (percentage >= 100) {
                        // Wait a bit more to ensure it's truly done
                        setTimeout(() => {
                            clearInterval(checkInterval);
                            resolve();
                        }, TIMING.SPIN_COMPLETION_FINAL_WAIT);
                        return;
                    }
                } else if (runButton.dataset.grokGlowApplied === 'true') {
                    // Still glowing but no percentage - might be in transition
                    // Continue checking
                } else {
                    // No percentage and not glowing - likely done
                    clearInterval(checkInterval);
                    resolve();
                }
            }, TIMING.SPIN_COMPLETION_CHECK_INTERVAL);

            // Timeout to prevent infinite waiting
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, TIMING.SPIN_COMPLETION_MAX_TIMEOUT);
        });
    },

    /**
     * Click on a list item element - tries to find and click lower/nested divs
     * @param {HTMLElement} item - The list item element to click
     * @returns {boolean} True if click was attempted, false otherwise
     */
    clickListItem(item) {
        if (!item) {
            console.error('[Grok Spin] No item provided to clickListItem');
            return false;
        }

        console.log('[Grok Spin] Item structure:', {
            tagName: item.tagName,
            className: item.className,
            id: item.id,
            innerHTML: item.innerHTML.substring(0, 200) + '...'
        });

        // Strategy 1: Try to find and click a link (most reliable for navigation)
        const link = item.querySelector('a');
        if (link) {
            console.log('[Grok Spin] Found link element, clicking it');
            try {
                link.click();
                const mouseEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                link.dispatchEvent(mouseEvent);
                console.log('[Grok Spin] ✓ Clicked link successfully');
                return true;
            } catch (err) {
                console.warn('[Grok Spin] Error clicking link:', err);
            }
        }

        // Strategy 2: Find a large clickable div that doesn't contain buttons
        // (avoid clicking on favorite/like buttons)
        const nestedDivs = item.querySelectorAll('div');
        console.log(`[Grok Spin] Found ${nestedDivs.length} nested divs in item`);

        // Look for a div that:
        // 1. Has substantial size (likely the main content area)
        // 2. Doesn't contain buttons (avoid action buttons like favorite)
        // 3. Has text content (likely the item title/description)
        let targetDiv = null;
        const MIN_WIDTH = 100; // Minimum width to be considered main content

        for (let i = 0; i < nestedDivs.length; i++) {
            const div = nestedDivs[i];
            const hasButtons = div.querySelector('button') !== null;
            const hasSize = div.offsetWidth >= MIN_WIDTH && div.offsetHeight > 0;
            const hasText = div.textContent && div.textContent.trim().length > 10;

            if (!hasButtons && hasSize && hasText) {
                // Check if this div doesn't contain other candidate divs (we want a leaf-ish node)
                const childCandidates = Array.from(div.querySelectorAll('div')).filter(child =>
                    !child.querySelector('button') &&
                    child.offsetWidth >= MIN_WIDTH &&
                    child.textContent?.trim().length > 10
                );

                if (childCandidates.length === 0) {
                    targetDiv = div;
                    console.log(`[Grok Spin] Found suitable content div at index ${i}`, {
                        width: div.offsetWidth,
                        height: div.offsetHeight,
                        textLength: div.textContent.trim().length
                    });
                    break;
                }
            }
        }

        if (targetDiv) {
            console.log(`[Grok Spin] Clicking content div`);
            try {
                targetDiv.click();
                const mouseEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                targetDiv.dispatchEvent(mouseEvent);
                console.log('[Grok Spin] ✓ Clicked content div successfully');
                return true;
            } catch (err) {
                console.warn('[Grok Spin] Error clicking content div:', err);
            }
        }

        // Strategy 3: Click the item itself (avoiding its buttons)
        console.log('[Grok Spin] Clicking item itself as fallback');
        try {
            item.click();
            const mouseEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            item.dispatchEvent(mouseEvent);
            console.log('[Grok Spin] ✓ Clicked item directly successfully');
            return true;
        } catch (err) {
            console.error('[Grok Spin] Error clicking item:', err);
            return false;
        }
    },

    /**
     * Find and click the "Make video" button
     * @returns {boolean} True if button was found and clicked, false otherwise
     */
    clickMakeVideoButton() {
        const makeVideoButton = document.querySelector('button[aria-label="Make video"]');
        if (makeVideoButton) {
            console.log('[Grok Spin] Clicking "Make video" button');
            makeVideoButton.click();
            return true;
        }
        return false;
    },

    /**
     * Find and click the Back button
     * @returns {boolean} True if button was found and clicked, false otherwise
     */
    clickBackButton() {
        const backButton = document.querySelector('button[aria-label="Back"]');
        console.log('[Grok Spin] Looking for Back button...');
        if (backButton) {
            console.log('[Grok Spin] Back button found, clicking it');
            backButton.click();
            return true;
        }
        console.warn('[Grok Spin] Back button NOT found');
        return false;
    },

    /**
     * Spin through list items - click each, run, wait, go back, repeat
     */
    async spin() {
        if (this.isSpinning) {
            console.log('[Grok Spin] Already spinning, skipping...');
            return;
        }

        this.isSpinning = true;
        this.shouldStopSpinning = false;
        const spinBtn = this.elements.spinBtn;

        // Start animation (rotating dots)
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let frameIndex = 0;

        if (spinBtn) {
            // Keep button enabled so user can click to stop
            spinBtn.disabled = false;
            spinBtn.style.opacity = '1';

            // Start animation
            this.spinAnimationInterval = setInterval(() => {
                if (spinBtn && this.isSpinning) {
                    const currentText = spinBtn.textContent.replace(/^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]\s*/, '');
                    spinBtn.textContent = `${frames[frameIndex]} ${currentText}`;
                    frameIndex = (frameIndex + 1) % frames.length;
                }
            }, 80);

            spinBtn.textContent = `${frames[0]} Stop`;
        }

        try {
            // Find the list container
            const listContainer = document.querySelector('div[role="list"]');
            if (!listContainer) {
                console.warn('[Grok Spin] No list container found with role="list"');

                // Stop animation
                if (this.spinAnimationInterval) {
                    clearInterval(this.spinAnimationInterval);
                    this.spinAnimationInterval = null;
                }

                if (spinBtn) {
                    spinBtn.textContent = 'No list found';
                    setTimeout(() => {
                        spinBtn.textContent = 'Spin';
                        spinBtn.disabled = false;
                        spinBtn.style.opacity = '1';
                        this.isSpinning = false;
                    }, TIMING.SPIN_ERROR_MSG_TIMEOUT);
                }
                return;
            }

            // Helper function to get current list items (fresh query)
            const getListItems = () => {
                const listItems = listContainer.querySelectorAll('[role="listitem"]');
                return listItems.length > 0
                    ? Array.from(listItems)
                    : Array.from(listContainer.children).filter(el =>
                        el.tagName === 'LI' || el.getAttribute('role') === 'listitem' || el.querySelector('button')
                    );
            };

            // Get initial count
            let initialItems = getListItems();
            if (initialItems.length === 0) {
                console.warn('[Grok Spin] No list items found');

                // Stop animation
                if (this.spinAnimationInterval) {
                    clearInterval(this.spinAnimationInterval);
                    this.spinAnimationInterval = null;
                }

                if (spinBtn) {
                    spinBtn.textContent = 'No items found';
                    setTimeout(() => {
                        spinBtn.textContent = 'Spin';
                        spinBtn.disabled = false;
                        spinBtn.style.opacity = '1';
                        this.isSpinning = false;
                    }, TIMING.SPIN_ERROR_MSG_TIMEOUT);
                }
                return;
            }

            const totalItems = initialItems.length;
            console.log(`[Grok Spin] Found ${totalItems} items to process`);

            // Iterate through each item - re-query DOM on each iteration to avoid stale references
            for (let i = 0; i < totalItems; i++) {
                // Check if user requested stop
                if (this.shouldStopSpinning) {
                    console.log('[Grok Spin] Stop requested by user');
                    break;
                }

                // Re-query the list to get fresh DOM references
                const currentItems = getListItems();

                if (i >= currentItems.length) {
                    console.warn(`[Grok Spin] Item ${i + 1} no longer exists in DOM, skipping`);
                    continue;
                }

                const item = currentItems[i];
                console.log(`[Grok Spin] Re-queried list, got fresh reference for item ${i + 1}/${totalItems}`);

                if (spinBtn) {
                    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
                    const frame = frames[i % frames.length];
                    spinBtn.textContent = `${frame} Stop (${i + 1}/${totalItems})`;
                }

                try {
                    // Click on the list item
                    console.log(`[Grok Spin] Clicking item ${i + 1}...`);
                    this.clickListItem(item);

                    // Wait a bit for UI to update
                    await new Promise(resolve => setTimeout(resolve, TIMING.SPIN_AFTER_ITEM_CLICK));

                    // === DISABLED FOR TESTING NAVIGATION ===
                    // // Click the "Make video" button after clicking list item
                    // let makeVideoClicked = this.clickMakeVideoButton();
                    // if (!makeVideoClicked) {
                    //     // Wait a bit more and try again
                    //     await new Promise(resolve => setTimeout(resolve, TIMING.SPIN_RETRY_RUN_BUTTON));
                    //     makeVideoClicked = this.clickMakeVideoButton();
                    // }

                    // if (makeVideoClicked) {
                    //     // Wait a bit for the video creation to start
                    //     await new Promise(resolve => setTimeout(resolve, TIMING.SPIN_RETRY_RUN_BUTTON));
                    //
                    //     // Click Back button after "Make video"
                    //     await new Promise(resolve => setTimeout(resolve, TIMING.SPIN_AFTER_BACK_CLICK));
                    //     if (this.clickBackButton()) {
                    //         console.log(`[Grok Spin] Clicked Back after "Make video" for item ${i + 1}`);
                    //         // Wait a bit for navigation
                    //         await new Promise(resolve => setTimeout(resolve, TIMING.SPIN_AFTER_NAVIGATION));
                    //     } else {
                    //         console.warn(`[Grok Spin] Back button not found after "Make video" for item ${i + 1}`);
                    //     }
                    // }

                    // // Find and click the run button
                    // let runButton = this.findRunButton();
                    // if (!runButton) {
                    //     // Wait a bit more and try again
                    //     await new Promise(resolve => setTimeout(resolve, TIMING.SPIN_RETRY_RUN_BUTTON));
                    //     runButton = this.findRunButton();
                    // }

                    // if (runButton) {
                    //     console.log(`[Grok Spin] Clicking run button for item ${i + 1}...`);
                    //     runButton.click();
                    //
                    //     // Wait for completion
                    //     console.log(`[Grok Spin] Waiting for item ${i + 1} to complete...`);
                    //     await this.waitForRunCompletion();
                    //     console.log(`[Grok Spin] Item ${i + 1} completed`);
                    // } else {
                    //     console.warn(`[Grok Spin] No run button found for item ${i + 1}`);
                    // }
                    // === END DISABLED SECTION ===

                    console.log(`[Grok Spin] Item ${i + 1} clicked, waiting before next...`);

                    // Wait a bit before moving to next item (2 seconds for testing visibility)
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Click Back button to return to list
                    if (this.clickBackButton()) {
                        console.log(`[Grok Spin] Clicked Back after item ${i + 1}`);
                        // Wait a bit for navigation
                        await new Promise(resolve => setTimeout(resolve, TIMING.SPIN_AFTER_NAVIGATION));
                    } else {
                        console.warn(`[Grok Spin] Back button not found after item ${i + 1}`);
                    }

                } catch (err) {
                    console.error(`[Grok Spin] Error processing item ${i + 1}:`, err);
                }
            }

            console.log('[Grok Spin] Finished spinning through all items');

        } catch (err) {
            console.error('[Grok Spin] Error during spin:', err);
        } finally {
            // Clean up
            this.isSpinning = false;
            this.shouldStopSpinning = false;

            // Stop animation
            if (this.spinAnimationInterval) {
                clearInterval(this.spinAnimationInterval);
                this.spinAnimationInterval = null;
            }

            // Reset button
            if (spinBtn) {
                spinBtn.disabled = false;
                spinBtn.style.opacity = '1';
                spinBtn.textContent = 'Spin';
            }
        }
    },

    /**
     * Stop the current spin operation
     */
    stopSpin() {
        console.log('[Grok Spin] Stopping spin...');
        this.shouldStopSpinning = true;
    },

    /**
     * Enter fullscreen mode for the HD video
     */
    enterFullscreen() {
        try {
            // Find the visible video element
            const hdVideo = document.getElementById('hd-video');
            const sdVideo = document.getElementById('sd-video');

            let video = null;

            // Check if HD video is visible
            if (hdVideo && hdVideo.offsetWidth > 0 && hdVideo.offsetHeight > 0 &&
                getComputedStyle(hdVideo).display !== 'none' &&
                getComputedStyle(hdVideo).visibility !== 'hidden') {
                video = hdVideo;
            }
            // Otherwise check if SD video is visible
            else if (sdVideo && sdVideo.offsetWidth > 0 && sdVideo.offsetHeight > 0 &&
                     getComputedStyle(sdVideo).display !== 'none' &&
                     getComputedStyle(sdVideo).visibility !== 'hidden') {
                video = sdVideo;
            }
            // Fallback to whichever exists
            else {
                video = hdVideo || sdVideo;
            }

            if (!video) {
                if (this.elements.fullscreenBtn) {
                    const originalText = this.elements.fullscreenBtn.innerHTML;
                    this.elements.fullscreenBtn.innerHTML = '&#10007;';
                    setTimeout(() => {
                        this.elements.fullscreenBtn.innerHTML = originalText;
                    }, 1000);
                }
                return;
            }

            // Try to find the video container/wrapper for better fullscreen experience
            let targetElement = video;

            // Look for common video player container patterns
            const parent = video.parentElement;
            const grandparent = parent?.parentElement;

            // Use container if it looks like a video player wrapper
            if (grandparent && (
                grandparent.classList.contains('video-player') ||
                grandparent.classList.contains('player') ||
                grandparent.getAttribute('role') === 'region' ||
                grandparent.tagName === 'VIDEO-PLAYER'
            )) {
                targetElement = grandparent;
            } else if (parent && (
                parent.classList.contains('video-player') ||
                parent.classList.contains('player') ||
                parent.getAttribute('role') === 'region'
            )) {
                targetElement = parent;
            }

            if (targetElement.requestFullscreen) {
                targetElement.requestFullscreen();
            } else if (targetElement.webkitRequestFullscreen) {
                targetElement.webkitRequestFullscreen();
            } else if (targetElement.msRequestFullscreen) {
                targetElement.msRequestFullscreen();
            }

            // Visual feedback
            if (this.elements.fullscreenBtn) {
                const originalText = this.elements.fullscreenBtn.innerHTML;
                this.elements.fullscreenBtn.innerHTML = '&#10003;';
                setTimeout(() => {
                    this.elements.fullscreenBtn.innerHTML = originalText;
                }, 1000);
            }
        } catch (err) {
            console.error('[Grok Fullscreen] Error:', err);
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

