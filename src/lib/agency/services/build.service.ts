import { buildInfoSchema, type BuildInfo } from "../schema";

/**
 * Agency Connector — build information service (Phase 5).
 *
 * Reports build/runtime provenance so Agency OS can power version management and
 * a deployment timeline. Values come from platform-provided environment
 * variables when present (Vercel/Fly/etc.); each is null when unavailable. No
 * I/O, no secrets.
 */

function firstEnv(...names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

export function getBuildInfo(): BuildInfo {
  return buildInfoSchema.parse({
    commitSha: firstEnv(
      "VERCEL_GIT_COMMIT_SHA",
      "GIT_COMMIT_SHA",
      "COMMIT_SHA",
      "SOURCE_COMMIT"
    ),
    buildId: firstEnv("VERCEL_DEPLOYMENT_ID", "BUILD_ID"),
    builtAt: firstEnv("BUILD_TIMESTAMP", "BUILT_AT"),
    nodeVersion:
      typeof process !== "undefined" && process.version
        ? process.version
        : null,
    region: firstEnv("VERCEL_REGION", "FLY_REGION", "AWS_REGION"),
  });
}
