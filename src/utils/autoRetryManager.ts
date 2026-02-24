import { usePowerToolsStore } from '@/store/usePowerToolsStore';

let workerRef: Worker | null = null;
let retryCount = 0;
let locked = false;
let savedPrompt = '';
let targetRetryTime = 0;
let isCountingDown = false;
let isRunning = false;
let videoCount = 0;
let lastVideoCheck = 0;
let lastThumbnailCount = 0;

const MODERATED_PHRASES = [
  'content moderated',
  'moderated',
  'something went wrong',
  'unable to generate',
  'generation failed',
  'could not generate',
];

const INVALID_PAGE_PHRASES = [
  'post not found',
  'page not found',
  'not found',
  'redirecting',
];

const POST_CLICK_LOCK_MS = 8000;

function isValidPage(): boolean {
  const bodyText = document.body.innerText.toLowerCase();
  if (INVALID_PAGE_PHRASES.some((p) => bodyText.includes(p))) {
    return false;
  }
  return true;
}

function getPromptTextarea(): HTMLTextAreaElement | null {
  return document.querySelector('textarea') as HTMLTextAreaElement | null;
}

function getPromptEditor(): HTMLElement | null {
  const proseMirror = document.querySelector('.ProseMirror') as HTMLElement | null;
  if (proseMirror) return proseMirror;
  
  const p = document.querySelector('p[contenteditable="true"]') as HTMLElement | null;
  if (p) return p;
  
  const emptyP = document.querySelector('p.is-editor-empty') as HTMLElement | null;
  if (emptyP) return emptyP;
  
  return null;
}

function getPromptText(): string {
  const editor = getPromptEditor();
  if (editor) {
    return editor.innerText?.trim() || '';
  }
  const textarea = getPromptTextarea();
  return textarea?.value?.trim() || '';
}

function setPrompt(text: string): boolean {
  const editor = getPromptEditor();
  if (editor) {
    editor.focus();
    document.execCommand('selectAll', false);
    document.execCommand('insertText', false, text);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  
  const textarea = getPromptTextarea();
  if (textarea) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    
    nativeInputValueSetter?.call(textarea, text);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  
  return false;
}

function clickMakeButton(): boolean {
  const allButtons = [...document.querySelectorAll('button')];
  
  const btn =
    allButtons.find((b) => {
      const text = b.textContent?.trim() || '';
      return text === 'Redo' || text === 'redo';
    }) ||
    allButtons.find((b) => {
      const span = b.querySelector('span');
      return span && span.textContent?.trim() === 'Redo';
    }) ||
    allButtons.find((b) => /make\s*video/i.test(b.textContent?.trim() || '')) ||
    allButtons.find((b) => /\bmake\b/i.test(b.textContent?.trim() || '')) ||
    allButtons.find((b) => {
      const svg = b.querySelector('svg');
      if (!svg) return false;
      const path = svg.querySelector('path');
      if (!path) return false;
      const d = path.getAttribute('d') || '';
      return d.includes('M6 11L12 5M12 5L18 11M12 5V19');
    }) ||
    allButtons.find((b) => {
      const ariaLabel = b.getAttribute('aria-label')?.toLowerCase() || '';
      return ariaLabel.includes('retry') || ariaLabel.includes('redo') || ariaLabel.includes('regenerate');
    }) ||
    null;
  if (btn) {
    btn.click();
    return true;
  }
  return false;
}

function isModerationVisible(): boolean {
  const bodyText = document.body.innerText.toLowerCase();
  if (MODERATED_PHRASES.some((p) => bodyText.includes(p))) {
    return true;
  }
  
  const eyeOffIcon = document.querySelector('svg.lucide-eye-off');
  if (eyeOffIcon) {
    return true;
  }
  
  return false;
}

function getThumbnailCount(): number {
  const thumbnails = document.querySelectorAll('img[alt^="Thumbnail"]');
  return thumbnails.length;
}

function isGenerating(): boolean {
  const body = document.body.innerText.toLowerCase();
  const match = body.match(/(\d+)%/);
  if (match) {
    const pct = parseInt(match[1], 10);
    return pct > 0 && pct < 100;
  }
  return false;
}

function doRetry() {
  const store = usePowerToolsStore.getState();
  
  if (savedPrompt) {
    setPrompt(savedPrompt);
  }
  clickMakeButton();
  store.setRetryStatus(`Retry ${retryCount}/${store.maxRetries} — waiting…`);
  
  setTimeout(() => {
    locked = false;
  }, POST_CLICK_LOCK_MS);
}

function checkAndRetry() {
  const store = usePowerToolsStore.getState();
  
  if (!isValidPage()) {
    store.setRetryStatus('Invalid page — waiting for valid post…');
    return;
  }
  
  if (locked) return;
  
  if (isModerationVisible()) {
    if (retryCount >= store.maxRetries) {
      store.setRetryStatus(`Stopped — hit max retries (${store.maxRetries})`);
      stopAutoRetry();
      return;
    }

    locked = true;
    isCountingDown = true;

    const next = retryCount + 1;
    retryCount = next;
    store.setRetryCount(next);

    targetRetryTime = Date.now() + (store.cooldownSeconds * 1000);
    store.setCooldownRemaining(store.cooldownSeconds);
    store.setRetryStatus(`Moderated — retrying in ${store.cooldownSeconds}s…`);
    return;
  }
  
  if (isGenerating()) {
    return;
  }
  
  if (store.videoGoalTarget > 0) {
    const currentThumbnailCount = getThumbnailCount();
    
    if (currentThumbnailCount > lastThumbnailCount) {
      const newVideos = currentThumbnailCount - lastThumbnailCount;
      videoCount += newVideos;
      lastThumbnailCount = currentThumbnailCount;
      store.setVideoGoalCurrent(videoCount);
      
      if (videoCount >= store.videoGoalTarget) {
        store.setRetryStatus(`Done! Made ${videoCount} videos.`);
        store.setVideoGoalStatus(`Done! Made ${videoCount} videos.`);
        stopAutoRetry();
        return;
      }
      
      store.setRetryStatus(`Video ${videoCount}/${store.videoGoalTarget} — starting next…`);
      store.setVideoGoalStatus(`${videoCount}/${store.videoGoalTarget} done`);
      
      locked = true;
      setTimeout(() => {
        if (isRunning) {
          const clicked = clickMakeButton();
          if (!clicked) {
            store.setRetryStatus(`Video ${videoCount}/${store.videoGoalTarget} — no button found`);
          }
        }
        setTimeout(() => {
          locked = false;
        }, 2000);
      }, store.cooldownSeconds * 1000);
      return;
    }
    
    if (currentThumbnailCount === 0 && videoCount < store.videoGoalTarget) {
      const now = Date.now();
      if (now - lastVideoCheck > 5000) {
        lastVideoCheck = now;
        store.setRetryStatus(`Looking for button to start video ${videoCount + 1}…`);
        
        locked = true;
        const clicked = clickMakeButton();
        if (!clicked) {
          store.setRetryStatus(`Waiting for video page…`);
        }
        setTimeout(() => {
          locked = false;
        }, 3000);
      }
    }
  }
}

function updateCountdown() {
  const store = usePowerToolsStore.getState();
  
  if (!isCountingDown) return;
  
  const now = Date.now();
  const remaining = Math.ceil((targetRetryTime - now) / 1000);
  
  if (remaining <= 0) {
    isCountingDown = false;
    store.setCooldownRemaining(0);
    doRetry();
  } else {
    store.setCooldownRemaining(remaining);
    store.setRetryStatus(`Moderated — retrying in ${remaining}s…`);
  }
}

export function startAutoRetry() {
  if (isRunning) return;
  
  const store = usePowerToolsStore.getState();
  savedPrompt = getPromptText();
  
  isRunning = true;
  locked = false;
  isCountingDown = false;
  retryCount = 0;
  videoCount = 0;
  lastVideoCheck = 0;
  lastThumbnailCount = getThumbnailCount();
  
  store.setRetryCount(0);
  store.setVideoGoalCurrent(0);
  store.setRetryStatus(savedPrompt ? 'Watching for moderation…' : 'Watching for moderation… (no prompt saved)');
  store.setVideoGoalStatus(`Running (0/${store.videoGoalTarget})`);

  const workerCode = `
    let checkInterval;
    let countdownInterval;
    
    self.onmessage = function(e) {
      if (e.data.action === 'start') {
        clearInterval(checkInterval);
        clearInterval(countdownInterval);
        
        checkInterval = setInterval(() => {
          self.postMessage({ type: 'check' });
        }, 1500);
        
        countdownInterval = setInterval(() => {
          self.postMessage({ type: 'countdown' });
        }, 1000);
      } else if (e.data.action === 'stop') {
        clearInterval(checkInterval);
        clearInterval(countdownInterval);
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  workerRef = new Worker(URL.createObjectURL(blob));

  workerRef.onmessage = (e) => {
    if (e.data.type === 'check') {
      checkAndRetry();
    } else if (e.data.type === 'countdown') {
      updateCountdown();
    }
  };

  workerRef.postMessage({ action: 'start' });
}

export function stopAutoRetry() {
  const store = usePowerToolsStore.getState();
  
  if (workerRef) {
    workerRef.postMessage({ action: 'stop' });
    workerRef.terminate();
    workerRef = null;
  }
  
  isRunning = false;
  locked = false;
  isCountingDown = false;
  
  store.setRetryStatus('Idle');
  store.setCooldownRemaining(0);
  store.setVideoGoalRunning(false);
}

export function isAutoRetryRunning(): boolean {
  return isRunning;
}

export function getAutoRetryState() {
  return {
    isRunning,
    retryCount,
    savedPrompt,
    videoCount,
  };
}
