/**
 * UI components and rendering
 */

export const UI = {
    elements: {
        container: null,
        pill: null,
        details: null,
        status: null,
        upscaleInfo: null,
        fetchBtn: null,
        downloadBtn: null,
        upscaleBtn: null,
        moreBtn: null,
        linksWrap: null,
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
            gap: withIcon ? '6px' : '0',
            border: 'none',
            background: '#2a2a2a',
            color: '#b0b0b0',
            padding: '8px 16px',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '1.2',
            outline: 'none',
            transition: 'all 0.2s ease',
            minHeight: '36px',
        });
        btn.onmouseenter = () => {
            btn.style.background = '#3a3a3a';
            btn.style.color = '#d0d0d0';
        };
        btn.onmouseleave = () => {
            btn.style.background = '#2a2a2a';
            btn.style.color = '#b0b0b0';
        };
        btn.textContent = label;
        return btn;
    },

    /**
     * Initialize the UI if not already created
     */
    ensure() {
        if (this.elements.container) return;

        // Container
        const container = document.createElement('div');
        container.id = 'grok-media-fetcher';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '72px',
            right: '24px',
            zIndex: '99999',
            fontSize: '13px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            color: '#fff',
            pointerEvents: 'auto',
        });
        this.elements.container = container;

        // Pill container
        const pill = document.createElement('div');
        Object.assign(pill.style, {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px',
            borderRadius: '999px',
            background: '#1a1a1a',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        });
        this.elements.pill = pill;

        // Buttons
        const fetchBtn = this.createButton('Fetch', false);
        fetchBtn.style.color = '#b0b0b0';
        this.elements.fetchBtn = fetchBtn;

        this.elements.upscaleBtn = this.createButton('Upscale', false);
        this.elements.downloadBtn = this.createButton('Download', false);

        const moreBtn = this.createButton('⋯', false);
        moreBtn.style.fontSize = '20px';
        moreBtn.style.padding = '8px 12px';
        moreBtn.style.minWidth = '36px';
        this.elements.moreBtn = moreBtn;

        pill.appendChild(fetchBtn);
        pill.appendChild(this.elements.upscaleBtn);
        pill.appendChild(this.elements.downloadBtn);
        pill.appendChild(moreBtn);

        // Details panel
        const details = document.createElement('div');
        Object.assign(details.style, {
            marginTop: '8px',
            padding: '12px 16px',
            borderRadius: '16px',
            background: '#1a1a1a',
            border: 'none',
            fontSize: '12px',
            color: '#b0b0b0',
            display: 'none',
            maxWidth: '280px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        });
        this.elements.details = details;

        const status = document.createElement('div');
        status.textContent = 'Ready';
        status.style.marginBottom = '2px';
        this.elements.status = status;

        const upscaleInfo = document.createElement('div');
        upscaleInfo.textContent = 'Upscaled 0 / 0 (HD 0)';
        this.elements.upscaleInfo = upscaleInfo;

        details.appendChild(status);
        details.appendChild(upscaleInfo);

        container.appendChild(pill);
        container.appendChild(details);
        document.body.appendChild(container);
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
            this.elements.moreBtn.addEventListener('click', handlers.toggleDetails);
        }
    },

    /**
     * Show details panel
     */
    showDetails() {
        this.ensure();
        this.elements.details.style.display = 'block';
    },

    /**
     * Hide details panel
     */
    hideDetails() {
        this.ensure();
        this.elements.details.style.display = 'none';
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
        linksWrap.style.marginTop = '2px';

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
            countInfo.style.marginTop = '2px';
            linksWrap.appendChild(countInfo);
        }

        this.elements.details.appendChild(linksWrap);
        this.elements.linksWrap = linksWrap;
    }
};

