import { NextResponse } from "next/server";

import { runAutomatedAiSnapshots } from "@/lib/ai-snapshot-runner";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAutomatedAiSnapshots();
    return NextResponse.json(
      {
        ok: true,
        timestamp: result.timestamp,
        created: result.created,
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI snapshot run failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
