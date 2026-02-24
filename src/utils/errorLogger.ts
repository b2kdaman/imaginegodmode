type ErrorLogEntry = {
  timestamp: string;
  message: string;
  context?: string;
  stack?: string;
  url?: string;
};

const LOG_KEY = 'imagine-god-mode-error-log';
const MAX_LOG_ENTRIES = 100;

export function logError(message: string, context?: string, error?: Error): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    message,
    context,
    stack: error?.stack,
    url: window.location.href,
  };

  console.error('[Imagine God Mode Error]', entry);

  try {
    const stored = localStorage.getItem(LOG_KEY);
    const logs: ErrorLogEntry[] = stored ? JSON.parse(stored) : [];
    
    logs.unshift(entry);
    
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.length = MAX_LOG_ENTRIES;
    }
    
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch {
    console.error('[Imagine God Mode] Failed to save error log');
  }
}

export function getErrorLogs(): ErrorLogEntry[] {
  try {
    const stored = localStorage.getItem(LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearErrorLogs(): void {
  localStorage.removeItem(LOG_KEY);
}

export function exportErrorLogs(): string {
  const logs = getErrorLogs();
  return JSON.stringify(logs, null, 2);
}

window.addEventListener('error', (event) => {
  logError(
    event.message,
    'Uncaught Error',
    event.error
  );
});

window.addEventListener('unhandledrejection', (event) => {
  logError(
    String(event.reason),
    'Unhandled Promise Rejection',
    event.reason instanceof Error ? event.reason : undefined
  );
});
