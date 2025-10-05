/**
 * SIGMACODE AI - Structured Logging System
 *
 * Ersetzt alle console.log/error Aufrufe mit strukturierten Logs.
 * Nutzt Pino für High-Performance Logging in Production.
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Pino Logger mit Transport für Pretty-Printing in Development
export const logger = pino({
  level: logLevel,
  // Pretty-Print nur in Development
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // Production: JSON-Format für ELK-Stack
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Basis-Kontext für alle Logs
  base: {
    service: 'sigmacode-ai',
    env: process.env.NODE_ENV || 'development',
  },
  // Timestamp immer in ISO-Format
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Helper: Erstellt einen Child-Logger mit Kontext
 *
 * @example
 * const dbLogger = createLogger('database');
 * dbLogger.info({ query: 'SELECT * FROM users' }, 'Query executed');
 */
export function createLogger(component: string) {
  return logger.child({ component });
}

/**
 * Helper: Log mit Request-Context
 *
 * @example
 * logRequest(req, { action: 'login', userId: '123' });
 */
export function logRequest(
  req: { headers: { get: (key: string) => string | null }; url: string; method: string },
  data?: Record<string, any>,
) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  logger.info(
    {
      requestId,
      method: req.method,
      url: req.url,
      ...data,
    },
    'Request processed',
  );
}

/**
 * Helper: Log mit Performance-Messung
 *
 * @example
 * const end = logPerformance('db.query');
 * // ... query execution
 * end({ query: 'SELECT ...' });
 */
export function logPerformance(operation: string) {
  const start = Date.now();
  return (data?: Record<string, any>) => {
    const duration = Date.now() - start;
    logger.info(
      {
        operation,
        duration,
        ...data,
      },
      'Operation completed',
    );
  };
}

/**
 * Helper: Security-Event Logging
 *
 * @example
 * logSecurityEvent('firewall.blocked', { ip, reason });
 */
export function logSecurityEvent(event: string, data: Record<string, any>) {
  logger.warn(
    {
      securityEvent: event,
      timestamp: new Date().toISOString(),
      ...data,
    },
    'Security event detected',
  );
}

/**
 * Helper: Error Logging mit Stack-Trace
 *
 * @example
 * logError(error, { context: 'database', operation: 'insert' });
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  logger.error(
    {
      error: {
        message: errorObj.message,
        stack: errorObj.stack,
        name: errorObj.name,
      },
      ...context,
    },
    'Error occurred',
  );
}

// Export default logger
export default logger;
