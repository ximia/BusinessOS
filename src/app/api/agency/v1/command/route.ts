import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateAgencyRequest } from "@/lib/agency/api/auth";
import { apiOk, apiUnauthorized } from "@/lib/agency/api/response";
import { executeCommand } from "@/lib/agency/commands";

/**
 * POST /api/agency/v1/command
 *
 * The connector's ONE inbound mutating surface: Agency OS sends a whitelisted
 * command (pause/resume reporting, refresh caches, run self-test, maintenance
 * on/off). Authenticated with the same per-deployment bearer key as the read
 * API. Deliberately does NOT gate on the connector being enabled, so `resume`
 * works while paused. Unknown/invalid commands → 400.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!authenticateAgencyRequest(request).ok) return apiUnauthorized();

  let body: { command?: unknown; args?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, status: "error", message: "Body must be valid JSON." },
      { status: 400 }
    );
  }

  const command = typeof body.command === "string" ? body.command : "";
  if (!command) {
    return NextResponse.json(
      { ok: false, status: "error", message: "Missing 'command'." },
      { status: 400 }
    );
  }

  const args =
    body.args && typeof body.args === "object"
      ? (body.args as Record<string, unknown>)
      : undefined;

  const result = await executeCommand(command, args);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, status: "error", message: result.error },
      { status: 400 }
    );
  }

  return apiOk("command", z.any(), result.data);
}
