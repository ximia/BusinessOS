/**
 * Agency Connector — connection state (last-contact tracker).
 *
 * A single in-process record of the most recent OUTBOUND contact with Agency OS.
 * Every outbound call flows through `postSigned` (see `outbound.ts`), which
 * records its outcome here. This is the missing abstraction the diagnostics layer
 * needs to answer "can we reach Agency, and what happened last?" — distinguishing
 * an auth failure from an unreachable Agency from a healthy connection.
 *
 * In-memory, per process (like registration/outbox state); it reflects live
 * connectivity, not durable history (Agency OS builds history from the event
 * stream). Pure and edge-safe.
 */

import { ref } from "./global-state";

export type ContactOutcome =
  | "ok"
  | "auth_failed"
  | "rejected"
  | "server_error"
  | "unreachable";

export interface ConnectionState {
  /** Outcome of the most recent outbound contact, or null if none yet. */
  lastOutcome: ContactOutcome | null;
  /** When the last contact was attempted. */
  lastContactAt: string | null;
  /** When the last *successful* contact occurred. */
  lastOkAt: string | null;
  /** Consecutive failures since the last success (0 when healthy). */
  consecutiveFailures: number;
  /** HTTP status of the last contact, when there was a response. */
  lastStatus: number | null;
  /** Sanitized detail of the last outcome (never secrets). */
  lastDetail: string | null;
}

const initialState: ConnectionState = {
  lastOutcome: null,
  lastContactAt: null,
  lastOkAt: null,
  consecutiveFailures: 0,
  lastStatus: null,
  lastDetail: null,
};

// Process-wide so outbound activity (instrumentation) is visible to diagnostics
// (route handlers).
const state = ref<ConnectionState>("connection.state", () => ({
  ...initialState,
}));

/** Map an HTTP status from a non-2xx response to a contact outcome. */
export function classifyStatus(status: number): Exclude<ContactOutcome, "ok"> {
  if (status === 401 || status === 403) return "auth_failed";
  if (status === 429 || status >= 500) return "server_error";
  return "rejected";
}

export function recordContactSuccess(status: number): void {
  const now = new Date().toISOString();
  state.set({
    lastOutcome: "ok",
    lastContactAt: now,
    lastOkAt: now,
    consecutiveFailures: 0,
    lastStatus: status,
    lastDetail: null,
  });
}

export function recordContactFailure(
  outcome: Exclude<ContactOutcome, "ok">,
  status: number | null = null,
  detail: string | null = null
): void {
  const current = state.get();
  state.set({
    ...current,
    lastOutcome: outcome,
    lastContactAt: new Date().toISOString(),
    consecutiveFailures: current.consecutiveFailures + 1,
    lastStatus: status,
    lastDetail: detail,
  });
}

export function getConnectionState(): ConnectionState {
  return { ...state.get() };
}

export function resetConnectionState(): void {
  state.set({ ...initialState });
}
