// src/pages/api/paraphraser.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { sanitizeInput } from "../../utils/sanitize";
import { rateLimit } from "../../utils/ratelimit";
import { generateParaphrase, type Mode } from "../../engine/paraphraser";

const ALLOWED_MODES: Mode[] = ["standard", "fluent", "creative"];

type ReqBody = {
  input?: string;
  mode?: Mode;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (!rateLimit(ip)) {
      return new Response(
        JSON.stringify({ success: false, error: "TooManyRequests" }),
        { status: 429 },
      );
    }

    const body = (await request.json()) as ReqBody;

    if (!body?.input) {
      return new Response(
        JSON.stringify({ success: false, error: "InvalidRequest" }),
        { status: 400 },
      );
    }

    const input = sanitizeInput(body.input);
    const mode: Mode = ALLOWED_MODES.includes(body.mode as Mode)
      ? (body.mode as Mode)
      : "standard";

    const result = generateParaphrase(input, mode);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Paraphrase error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "ServerError" }),
      { status: 500 },
    );
  }
};
