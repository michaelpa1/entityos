import { NextResponse } from "next/server";
import { and, eq, isNotNull, ne } from "drizzle-orm";

import { db } from "@/db";
import { assets } from "@/db/schema";
import { isAuthorizedCronRequest } from "@/lib/cron";

export const runtime = "nodejs";

async function isBrokenUrl(url: string): Promise<{ broken: boolean; reason?: string }> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (response.status === 404) {
      return { broken: true, reason: "404" };
    }

    return { broken: false };
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return { broken: true, reason: "timeout" };
    }

    return { broken: true, reason: "request_error" };
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({ id: assets.id, name: assets.name, url: assets.url })
      .from(assets)
      .where(and(ne(assets.status, "broken"), isNotNull(assets.url)));

    const brokenAssetIds: number[] = [];
    const brokenDetails: { id: number; name: string; url: string; reason: string }[] = [];

    for (const row of rows) {
      if (!row.url) continue;

      const result = await isBrokenUrl(row.url);
      if (!result.broken) continue;

      brokenAssetIds.push(row.id);
      brokenDetails.push({
        id: row.id,
        name: row.name,
        url: row.url,
        reason: result.reason ?? "request_error",
      });

      await db
        .update(assets)
        .set({ status: "broken", updatedAt: new Date() })
        .where(eq(assets.id, row.id));
    }

    const summary = `Checked ${rows.length} links, ${brokenAssetIds.length} broken`;

    return NextResponse.json(
      {
        ok: true,
        summary,
        checked: rows.length,
        broken: brokenAssetIds.length,
        brokenAssetIds,
        brokenDetails,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Link check failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
