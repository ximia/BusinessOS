/**
 * Agency Connector — URL helpers.
 *
 * Extracted from the registration and events configs, which both joined a base
 * URL with an endpoint path identically.
 */

/** Join a base URL and a path with exactly one slash between them. */
export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
