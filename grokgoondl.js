// ==UserScript==
// @name         Grok Media Post Fetcher + Downloader + Upscaler (Pill UI Right + HD aware + Upscale refetch)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Fetch media post JSON from grok.com/imagine/post/* and show/download/upscale media with Grok-like pill UI, HD-aware, with refetch during upscale batch
// @author       you
// @match        https://grok.com/imagine/post/*
// @match        https://www.grok.com/imagine/post/*
// @run-at       document-idle
// @grant        GM_download
// ==/UserScript==

(function () {
    'use strict';
  
    let lastMediaUrls = [];          // all media download urls (prefer hdMediaUrl)
    let lastVideoIdsToUpscale = [];  // only videos without hdMediaUrl
    let lastHdVideoCount = 0;
  
    let upscaleTotal = 0;
    let upscaleDone = 0;
    let isUpscaling = false;
  
    let upscaleRefetchTimeout = null;

    const ui = {
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
    };

    const upscaleTimeoutIds = [];

    let urlWatcherInterval = null;
    let lastKnownPostId = null;
  
    function getPostIdFromUrl() {
      const parts = window.location.pathname.split('/').filter(Boolean);
      // expected: ["imagine", "post", "<id>"]
      return parts[2] || null;
    }
  
    async function fetchPostData(postId) {
      const res = await fetch('/rest/media/post/get', {
        method: 'POST',
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ id: postId }),
      });
  
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
  
      return res.json();
    }
  
    async function upscaleVideo(videoId) {
      const res = await fetch('/rest/media/video/upscale', {
        method: 'POST',
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });
  
      if (!res.ok) {
        throw new Error(`Upscale HTTP ${res.status}`);
      }
  
      const json = await res.json().catch(() => null);
      console.log('[Grok Media Fetcher] Upscale response for', videoId, json);
      return json;
    }
  
    // Download in same window via fake <a download> appended to DOM and clicked
  function fallbackDownload(url, name) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function triggerDownloads(urls) {
    const canUseGmDownload = typeof GM_download === 'function';
      urls.forEach((url, idx) => {
        setTimeout(() => {
          const clean = url.split('?')[0];
          const name = clean.split('/').filter(Boolean).pop() || `media_${idx + 1}`;
        if (canUseGmDownload) {
          try {
            GM_download({
              url,
              name,
              saveAs: false,
              onerror: (err) => {
                console.error('[Grok Media Fetcher] GM_download error, fallback triggered:', err);
                fallbackDownload(url, name);
              },
            });
          } catch (err) {
            console.error('[Grok Media Fetcher] GM_download threw, fallback triggered:', err);
            fallbackDownload(url, name);
          }
        } else {
          fallbackDownload(url, name);
        }
        }, idx * 500); // small delay between downloads
      });
    }
  
    function ensureUi() {
      if (ui.container) return;

      const container = document.createElement('div');
      container.id = 'grok-media-fetcher';
      Object.assign(container.style, {
        position: 'fixed',
        bottom: '72px',    // tweak if you want it higher/lower
        right: '24px',     // stick to the right
        zIndex: '99999',
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#fff',
        pointerEvents: 'auto',
      });
      ui.container = container;

      const pill = document.createElement('div');
      Object.assign(pill.style, {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 14px',
        borderRadius: '999px',
        background: 'rgba(0,0,0,0.8)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
      });
      ui.pill = pill;

      function makeIconButton(label, withIcon = true) {
        const btn = document.createElement('button');
        Object.assign(btn.style, {
          display: 'inline-flex',
          alignItems: 'center',
          gap: withIcon ? '6px' : '0',
          border: 'none',
          background: 'transparent',
          color: 'rgba(255,255,255,0.85)',
          padding: '4px 6px',
          borderRadius: '999px',
          cursor: 'pointer',
          fontSize: '13px',
          lineHeight: '1',
          outline: 'none',
        });
        btn.onmouseenter = () => {
          btn.style.background = 'rgba(255,255,255,0.08)';
        };
        btn.onmouseleave = () => {
          btn.style.background = 'transparent';
        };
        btn.textContent = label;
        return btn;
      }

      const fetchBtn = makeIconButton('Fetch', false);
      fetchBtn.style.color = '#ff7675';
      ui.fetchBtn = fetchBtn;

      const upscaleBtn = makeIconButton('Upscale', false);
      ui.upscaleBtn = upscaleBtn;

      const downloadBtn = makeIconButton('Download', false);
      ui.downloadBtn = downloadBtn;

      const moreBtn = makeIconButton('⋯', false);
      moreBtn.style.fontSize = '18px';
      moreBtn.style.padding = '0 4px';
      ui.moreBtn = moreBtn;

      pill.appendChild(fetchBtn);
      pill.appendChild(upscaleBtn);
      pill.appendChild(downloadBtn);
      pill.appendChild(moreBtn);

      const details = document.createElement('div');
      Object.assign(details.style, {
        marginTop: '4px',
        padding: '4px 10px',
        borderRadius: '8px',
        background: 'rgba(0,0,0,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.8)',
        display: 'none',
        maxWidth: '260px',
      });
      ui.details = details;

      const status = document.createElement('div');
      status.textContent = 'Ready';
      status.style.marginBottom = '2px';
      ui.status = status;

      const upscaleInfo = document.createElement('div');
      upscaleInfo.textContent = 'Upscaled 0 / 0 (HD 0)';
      ui.upscaleInfo = upscaleInfo;

      details.appendChild(status);
      details.appendChild(upscaleInfo);

      container.appendChild(pill);
      container.appendChild(details);
      document.body.appendChild(container);

      ui.fetchBtn.addEventListener('click', handleFetchClick);
      ui.downloadBtn.addEventListener('click', handleDownloadClick);
      ui.upscaleBtn.addEventListener('click', handleUpscaleClick);
      ui.moreBtn.addEventListener('click', handleMoreClick);
    }

    function showDetails() {
      ensureUi();
      ui.details.style.display = 'block';
    }

    function hideDetails() {
      ensureUi();
      ui.details.style.display = 'none';
    }

    function setStatus(text) {
      ensureUi();
      ui.status.textContent = text;
    }

    function setUpscaleInfo(done, total, hdCount) {
      ensureUi();
      ui.upscaleInfo.textContent =
        `Upscaled ${done} / ${total} (HD ${hdCount})`;
    }

    function clearLinksWrap() {
      if (ui.linksWrap) {
        ui.linksWrap.remove();
        ui.linksWrap = null;
      }
    }

    async function fetchAndRender() {
      ensureUi();

      const postId = getPostIdFromUrl();
      if (!postId) {
        setStatus('❌ Could not detect post ID');
        return;
      }

      try {
        const json = await fetchPostData(postId);
        window.grokPostData = json;
        console.log('[Grok Media Fetcher] Response:', json);

        const post = json.post || {};
        setStatus('✅ Fetched @ ' + new Date().toLocaleTimeString());

        clearLinksWrap();
        const linksWrap = document.createElement('div');
        linksWrap.className = 'grok-media-links';
        linksWrap.style.marginTop = '2px';

        const urls = [];
        const videosNeedingUpscale = [];
        let hdVideoCount = 0;

        const pickDownloadUrl = (obj) =>
          obj && (obj.hdMediaUrl || obj.mediaUrl || obj.thumbnailImageUrl || null);

        if (Array.isArray(post.childPosts) && post.childPosts.length > 0) {
          post.childPosts.forEach((cp) => {
            const url = pickDownloadUrl(cp);
            if (url) {
              urls.push(url);
            }

            if (cp.mediaType === 'MEDIA_POST_TYPE_VIDEO') {
              const isHd = !!cp.hdMediaUrl;
              if (isHd) {
                hdVideoCount += 1;
              } else if (cp.id) {
                videosNeedingUpscale.push(cp.id);
              }
            }
          });
        }

        lastMediaUrls = Array.from(new Set(urls));
        lastVideoIdsToUpscale = Array.from(new Set(videosNeedingUpscale));
        lastHdVideoCount = hdVideoCount;

        if (!urls.length) {
          const noMedia = document.createElement('div');
          noMedia.textContent = 'No media URLs detected';
          linksWrap.appendChild(noMedia);
        } else {
          const countInfo = document.createElement('div');
          const totalVideoCount =
            lastVideoIdsToUpscale.length + lastHdVideoCount;
          countInfo.textContent =
            `Media: ${lastMediaUrls.length} | ` +
            `Videos: ${totalVideoCount} (HD ${lastHdVideoCount}, ` +
            `${lastVideoIdsToUpscale.length} to upscale)`;
          countInfo.style.marginTop = '2px';
          linksWrap.appendChild(countInfo);
        }

        ui.details.appendChild(linksWrap);
        ui.linksWrap = linksWrap;

        if (!isUpscaling) {
          upscaleTotal = lastVideoIdsToUpscale.length;
          upscaleDone = 0;
        }

        setUpscaleInfo(upscaleDone, upscaleTotal, lastHdVideoCount);
      } catch (err) {
        console.error('[Grok Media Fetcher] Error:', err);
        setStatus('❌ Error (see console)');
      }
    }

    function startUpscaleRefetchLoop() {
      if (upscaleRefetchTimeout) return;

      const tick = async () => {
        if (!isUpscaling || upscaleDone >= upscaleTotal) {
          upscaleRefetchTimeout = null;
          return;
        }

        try {
          await fetchAndRender();
        } catch (e) {
          console.error('[Grok Media Fetcher] Upscale-refetch error:', e);
        }

        const delay = 3000 + Math.random() * 2000;
        upscaleRefetchTimeout = setTimeout(tick, delay);
      };

      tick();
    }

    async function handleFetchClick() {
      await fetchAndRender();
      showDetails();
    }

    function handleDownloadClick() {
      showDetails();

      if (!lastMediaUrls || lastMediaUrls.length === 0) {
        setStatus('⚠️ Nothing to download – press Fetch first');
        return;
      }

      setStatus(`⬇ Downloading ${lastMediaUrls.length} item(s)...`);
      triggerDownloads(lastMediaUrls);
    }

    async function handleUpscaleClick() {
      showDetails();

      if (isUpscaling) {
        setStatus('⏳ Already upscaling...');
        return;
      }

      await fetchAndRender();

      if (!lastVideoIdsToUpscale || lastVideoIdsToUpscale.length === 0) {
        setStatus('⚠️ No videos to upscale (either none or already HD)');
        return;
      }

      isUpscaling = true;
      upscaleTotal = lastVideoIdsToUpscale.length;
      upscaleDone = 0;
      setUpscaleInfo(upscaleDone, upscaleTotal, lastHdVideoCount);
      setStatus('🚀 Upscaling started...');

      startUpscaleRefetchLoop();

      upscaleTimeoutIds.splice(0, upscaleTimeoutIds.length);
      let accumulatedDelay = 0;
      lastVideoIdsToUpscale.forEach((videoId, idx) => {
        const delay = 1000 + Math.random() * 1000; // 1–2s
        accumulatedDelay += delay;

        const timeoutId = setTimeout(async () => {
          try {
            await upscaleVideo(videoId);
            upscaleDone += 1;
            setUpscaleInfo(upscaleDone, upscaleTotal, lastHdVideoCount);
          } catch (e) {
            console.error('[Grok Media Fetcher] Upscale error for', videoId, e);
          }

          if (idx === lastVideoIdsToUpscale.length - 1) {
            isUpscaling = false;
            setStatus('✅ Upscale batch finished');
          }
        }, accumulatedDelay);

        upscaleTimeoutIds.push(timeoutId);
      });
    }

    function handleMoreClick() {
      ensureUi();
      ui.details.style.display =
        ui.details.style.display === 'none' ? 'block' : 'none';
    }

    function resetStateForNewPost(newPostId) {
      lastMediaUrls = [];
      lastVideoIdsToUpscale = [];
      lastHdVideoCount = 0;
      upscaleTotal = 0;
      upscaleDone = 0;
      isUpscaling = false;

      if (upscaleRefetchTimeout) {
        clearTimeout(upscaleRefetchTimeout);
        upscaleRefetchTimeout = null;
      }

      while (upscaleTimeoutIds.length) {
        const timeoutId = upscaleTimeoutIds.pop();
        clearTimeout(timeoutId);
      }

      clearLinksWrap();
      setUpscaleInfo(0, 0, 0);
      hideDetails();

      if (newPostId) {
        setStatus('Ready');
      } else {
        setStatus('Waiting for post…');
      }
    }

    function startUrlWatcher() {
      if (urlWatcherInterval) return;

      lastKnownPostId = getPostIdFromUrl();
      resetStateForNewPost(lastKnownPostId);

      urlWatcherInterval = setInterval(() => {
        const current = getPostIdFromUrl();
        if (current !== lastKnownPostId) {
          lastKnownPostId = current;
          resetStateForNewPost(current);
        }
      }, 500);
    }
  
    function init() {
      ensureUi();
      startUrlWatcher();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  