import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { db } from "@/db";
import { aiSnapshots } from "@/db/schema";

export const AI_SNAPSHOT_PROMPT =
  "Who is Michael Pearson-Adams? Be concise.";

export type RunAiSnapshotsResult = {
  timestamp: string;
  created: { provider: "chatgpt" | "gemini"; id: number }[];
  errors: { provider: "chatgpt" | "gemini"; message: string }[];
};

function openAiKey(): string | undefined {
  return process.env.OPENAI_API_KEY ?? process.env.OPTIONAL_OPENAI_API_KEY;
}

function geminiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.OPTIONAL_GEMINI_API_KEY
  );
}

async function fetchOpenAiResponse(prompt: string): Promise<string> {
  const apiKey = openAiKey();
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}

async function fetchGeminiResponse(prompt: string): Promise<string> {
  const apiKey = geminiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text()?.trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

function summaryFromResponse(text: string): string {
  return text.length > 280 ? `${text.slice(0, 277)}…` : text;
}

async function storeSnapshot(
  provider: "chatgpt" | "gemini",
  prompt: string,
  fullResponse: string,
  snapshotDate: Date,
) {
  const [row] = await db
    .insert(aiSnapshots)
    .values({
      provider,
      prompt,
      responseSummary: summaryFromResponse(fullResponse),
      fullResponse,
      snapshotDate,
      notes: "Automated snapshot",
      updatedAt: snapshotDate,
    })
    .returning({ id: aiSnapshots.id });

  return row.id;
}

/** Query OpenAI + Gemini and persist two new ai_snapshots rows. */
export async function runAutomatedAiSnapshots(): Promise<RunAiSnapshotsResult> {
  const snapshotDate = new Date();
  const timestamp = snapshotDate.toISOString();
  const created: RunAiSnapshotsResult["created"] = [];
  const errors: RunAiSnapshotsResult["errors"] = [];

  const [openAiResult, geminiResult] = await Promise.allSettled([
    fetchOpenAiResponse(AI_SNAPSHOT_PROMPT),
    fetchGeminiResponse(AI_SNAPSHOT_PROMPT),
  ]);

  if (openAiResult.status === "fulfilled") {
    const id = await storeSnapshot(
      "chatgpt",
      AI_SNAPSHOT_PROMPT,
      openAiResult.value,
      snapshotDate,
    );
    created.push({ provider: "chatgpt", id });
  } else {
    errors.push({
      provider: "chatgpt",
      message:
        openAiResult.reason instanceof Error
          ? openAiResult.reason.message
          : "OpenAI request failed.",
    });
  }

  if (geminiResult.status === "fulfilled") {
    const id = await storeSnapshot(
      "gemini",
      AI_SNAPSHOT_PROMPT,
      geminiResult.value,
      snapshotDate,
    );
    created.push({ provider: "gemini", id });
  } else {
    errors.push({
      provider: "gemini",
      message:
        geminiResult.reason instanceof Error
          ? geminiResult.reason.message
          : "Gemini request failed.",
    });
  }

  if (created.length === 0) {
    throw new Error(
      errors.map((e) => `${e.provider}: ${e.message}`).join(" "),
    );
  }

  return { timestamp, created, errors };
}
