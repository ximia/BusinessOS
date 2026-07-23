/**
 * Agency Connector — cross-bundle singleton storage.
 *
 * Next.js may evaluate a module in more than one context — notably the
 * `instrumentation` hook (which runs registration + the heartbeat) versus the
 * route handlers (which serve diagnostics) — as SEPARATE module instances.
 * Mutable connector state (registration, connection, outbox, dispatcher flag)
 * must therefore live on `globalThis`, so a diagnostics endpoint reflects the
 * work actually performed by the startup context. One instance per process.
 *
 * Pure and edge-safe; no I/O.
 */

const REGISTRY = Symbol.for("business-os.agency.singletons");

type Registry = Map<string, unknown>;

function registry(): Registry {
  const holder = globalThis as typeof globalThis & { [REGISTRY]?: Registry };
  if (!holder[REGISTRY]) holder[REGISTRY] = new Map();
  return holder[REGISTRY];
}

/** Get-or-create a process-wide singleton instance. */
export function singleton<T>(key: string, create: () => T): T {
  const store = registry();
  if (!store.has(key)) store.set(key, create());
  return store.get(key) as T;
}

export interface Ref<T> {
  get(): T;
  set(value: T): void;
}

/** A process-wide mutable reference (for value state that is replaced wholesale). */
export function ref<T>(key: string, init: () => T): Ref<T> {
  const store = registry();
  if (!store.has(key)) store.set(key, init());
  return {
    get: () => store.get(key) as T,
    set: (value: T) => store.set(key, value),
  };
}
