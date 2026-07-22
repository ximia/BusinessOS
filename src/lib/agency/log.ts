/**
 * Agency Connector — scoped logging.
 *
 * A thin, dependency-free wrapper over `console` that prefixes every line with
 * `[agency:<scope>]` so connector activity is easy to find and filter in logs.
 *
 * SECURITY: callers must never pass secrets (API keys) or customer PII into
 * these functions. The connector logs identifiers, statuses, and outcomes only.
 */

export interface AgencyLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export function createLogger(scope: string): AgencyLogger {
  const prefix = `[agency:${scope}]`;
  return {
    info: (message, meta) =>
      meta !== undefined
        ? console.info(`${prefix} ${message}`, meta)
        : console.info(`${prefix} ${message}`),
    warn: (message, meta) =>
      meta !== undefined
        ? console.warn(`${prefix} ${message}`, meta)
        : console.warn(`${prefix} ${message}`),
    error: (message, meta) =>
      meta !== undefined
        ? console.error(`${prefix} ${message}`, meta)
        : console.error(`${prefix} ${message}`),
  };
}
