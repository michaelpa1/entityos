import { NextResponse } from "next/server";
import { auth, searchconsole } from "@googleapis/searchconsole";

import { db } from "@/db";
import { searchSnapshots } from "@/db/schema";
import { isAuthorizedCronRequest } from "@/lib/cron";

export const runtime = "nodejs";

type ServiceAccountCredentials = {
  client_email?: string;
  private_key?: string;
};

function getGoogleServiceAccount(): ServiceAccountCredentials {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured.");
  }

  const parsed = JSON.parse(raw) as ServiceAccountCredentials;

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key.",
    );
  }

  return {
    ...parsed,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

function getDateRange(days = 28) {
  const end = new Date();
  end.setDate(end.getDate() - 1);

  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    snapshotDate: end,
  };
}

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json(
      { error: "GOOGLE_SEARCH_CONSOLE_SITE_URL is not configured." },
      { status: 500 },
    );
  }

  try {
    const credentials = getGoogleServiceAccount();
    const authClient = new auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });

    const client = searchconsole({ version: "v1", auth: authClient });
    const range = getDateRange();

    const response = await client.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: range.startDate,
        endDate: range.endDate,
        dimensions: ["query", "device"],
        rowLimit: 1,
        dimensionFilterGroups: [
          {
            groupType: "and",
            filters: [
              {
                dimension: "query",
                operator: "contains",
                expression: "Michael Pearson-Adams",
              },
            ],
          },
        ],
      },
    });

    const row = response.data.rows?.[0];
    const query = row?.keys?.[0] ?? null;
    const rawDevice = row?.keys?.[1] ?? "desktop";

    if (!row || !query) {
      return NextResponse.json(
        {
          ok: false,
          message:
            'No Google Search Console query containing "Michael Pearson-Adams" was found.',
        },
        { status: 200 },
      );
    }

    const device = rawDevice === "mobile" ? "mobile" : "desktop";
    const position = Number(row.position ?? 0);
    const ctrPercent = Number((Number(row.ctr ?? 0) * 100).toFixed(2));
    const clicks = Number(row.clicks ?? 0);
    const searchVolume = Number(row.impressions ?? 0);

    await db.insert(searchSnapshots).values({
      searchEngine: "google",
      query,
      device,
      snapshotDate: range.snapshotDate,
      averagePosition: position,
      ctrPercent,
      searchVolume,
      notes: `Google Search Console branded query snapshot. Clicks: ${clicks}.`,
    });

    return NextResponse.json(
      {
        ok: true,
        query,
        device,
        position,
        ctrPercent,
        clicks,
        searchVolume,
        timestamp: range.snapshotDate.toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search snapshot run failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
