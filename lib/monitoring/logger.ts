type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function getCurrentLevel(): LogLevel {
  return (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] <= LOG_LEVELS[getCurrentLevel()];
}

export const logger = {
  error: (message: string, error?: unknown) => {
    if (!shouldLog('error')) return;
    console.error(`[ERROR] ${message}`, error instanceof Error ? { message: error.message, stack: error.stack } : error);
  },
  warn: (message: string, data?: unknown) => {
    if (!shouldLog('warn')) return;
    console.warn(`[WARN] ${message}`, data);
  },
  info: (message: string, data?: unknown) => {
    if (!shouldLog('info')) return;
    console.info(`[INFO] ${message}`, data);
  },
  debug: (message: string, data?: unknown) => {
    if (!shouldLog('debug')) return;
    console.debug(`[DEBUG] ${message}`, data);
  },
};
