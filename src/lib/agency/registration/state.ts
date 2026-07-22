/**
 * Agency registration — state.
 *
 * A small in-process state machine tracking this deployment's registration
 * lifecycle. It exists to make registration IDEMPOTENT and observable within a
 * running server: once `registered` for a given payload, repeat calls are
 * no-ops.
 *
 * SCOPE (Phase 3): state is in-memory, per process. It is intentionally NOT
 * persisted to the database — that would drag in the machine write-context
 * problem from DECISIONS.md ADR-0011, and true cross-restart idempotency is the
 * Agency OS endpoint's responsibility (it should upsert by deployment id +
 * idempotency key). Across cold starts the deployment simply re-announces once,
 * which is safe. A persistent backend can be swapped behind this module later.
 */

export type RegistrationPhase =
  | "idle"
  | "skipped"
  | "registering"
  | "registered"
  | "failed";

export interface RegistrationState {
  phase: RegistrationPhase;
  /** Number of network attempts made in the current process. */
  attempts: number;
  lastAttemptAt: string | null;
  registeredAt: string | null;
  /** Hash of the last successfully registered payload (idempotency key). */
  payloadHash: string | null;
  /** Sanitized last error message (never contains secrets). */
  lastError: string | null;
  /** Why registration was skipped, when applicable (e.g. "connector disabled"). */
  skipReason: string | null;
}

const initialState: RegistrationState = {
  phase: "idle",
  attempts: 0,
  lastAttemptAt: null,
  registeredAt: null,
  payloadHash: null,
  lastError: null,
  skipReason: null,
};

let current: RegistrationState = { ...initialState };

/** A defensive copy of the current registration state. */
export function getRegistrationState(): RegistrationState {
  return { ...current };
}

/** Merge a patch into the state and return the new snapshot. */
export function setRegistrationState(
  patch: Partial<RegistrationState>
): RegistrationState {
  current = { ...current, ...patch };
  return { ...current };
}

/** Reset to the initial state (primarily for tests). */
export function resetRegistrationState(): void {
  current = { ...initialState };
}
