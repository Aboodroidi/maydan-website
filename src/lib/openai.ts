import { openaiKey } from "./firebase";

/**
 * Minimal OpenAI Chat Completions client for Maydan AI.
 *
 * SECURITY NOTE: this calls api.openai.com directly from the browser using
 * VITE_OPENAI_KEY, which is exposed in the bundle. That is acceptable for
 * LOCAL DEVELOPMENT ONLY. Before launch this MUST move behind a server-side
 * proxy that holds the key (the client calls the proxy, never OpenAI).
 * Mirrors the iOS app's Sources/Features/Chat/OpenAIService.swift.
 */

export type ChatRole = "system" | "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

const MODEL = "gpt-4o-mini";

/** Same player system prompt as the iOS OpenAIService. */
const SYSTEM_PROMPT =
  "You are the Maydan assistant. Maydan is an app for discovering and booking " +
  "football (soccer) pitches in Muscat, Oman. You're given LIVE PITCH DATA " +
  "below — use ONLY it to recommend specific pitches, compare prices (in OMR) " +
  "and distances, and suggest available times. Never invent pitches, prices, " +
  "or times that aren't in the data. To book, tell the user to open the pitch " +
  "in the app, pick a time, and pay (in full, or split the cost with teammates " +
  "who join with a 6-digit code). Pitches marked \"call to book\" can't be booked " +
  "in-app. Keep replies short, friendly, and practical.";

interface StreamChunk {
  choices?: { delta?: { content?: string } }[];
}

/**
 * Streams the assistant's reply token-by-token. `context` carries live pitch
 * data appended to the system prompt so the model answers with real
 * availability, prices and distances.
 */
export async function streamReply(
  history: ChatTurn[],
  context: string,
  onDelta: (s: string) => void
): Promise<void> {
  if (!openaiKey) throw new Error("No OpenAI API key configured.");

  const system = context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: system }, ...history],
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`OpenAI request failed (${res.status}).`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  // Server-sent events: lines of `data: {json}` ending with `data: [DONE]`.
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") return;
      try {
        const chunk = JSON.parse(payload) as StreamChunk;
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      } catch {
        // Ignore malformed keep-alive fragments.
      }
    }
  }
}
