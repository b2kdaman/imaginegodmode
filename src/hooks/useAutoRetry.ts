import { useEffect } from 'react';
import { usePowerToolsStore } from '@/store/usePowerToolsStore';
import { startAutoRetry, stopAutoRetry, isAutoRetryRunning } from '@/utils/autoRetryManager';

export function useAutoRetry() {
  const store = usePowerToolsStore();

  useEffect(() => {
    if (store.autoRetryEnabled) {
      if (!isAutoRetryRunning()) {
        startAutoRetry();
      }
    } else {
      stopAutoRetry();
    }
  }, [store.autoRetryEnabled]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && store.autoRetryEnabled) {
        if (!isAutoRetryRunning()) {
          startAutoRetry();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const keepAliveRef = setInterval(() => {
      try {
        chrome.runtime.sendMessage({ action: 'keepAlive' }).catch(() => {});
      } catch {
        // extension context may be invalid — ignore
      }
    }, 20000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(keepAliveRef);
    };
  }, [store.autoRetryEnabled]);
}
