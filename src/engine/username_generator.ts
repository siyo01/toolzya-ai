/* =========================================================
   ToolzyAI — Username Generator Engine (Rule-based)
   Length-aware + Tone-aware
========================================================= */

export type UsernameTone =
  | "neutral"
  | "professional"
  | "casual"
  | "creative"
  | "gaming";

export type UsernameLength = "short" | "medium" | "long";

export interface GenerateUsernameParams {
  input: string;
  tone: UsernameTone;
  length: UsernameLength;
  limit?: number;
}

/* =========================
   UTILITIES
========================= */
function cleanInput(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

/* =========================
   WORD SOURCES
========================= */
const PREFIXES: Record<UsernameTone, string[]> = {
  neutral: ["the", "its", "my"],
  professional: ["real", "true", "official"],
  casual: ["hey", "yo", "its"],
  creative: ["neo", "ultra", "meta"],
  gaming: ["pro", "x", "dark"],
};

const SUFFIXES: Record<UsernameTone, string[]> = {
  neutral: ["hub", "zone", "base"],
  professional: ["hq", "lab", "studio"],
  casual: ["vibes", "daily", "life"],
  creative: ["craft", "verse", "flow"],
  gaming: ["gg", "xd", "fps"],
};

const NUMBERS = ["7", "8", "9", "99", "101"];

/* =========================
   LENGTH CONFIG
========================= */
function lengthConfig(length: UsernameLength) {
  if (length === "short") {
    return {
      maxWords: 1,
      allowPrefix: false,
      allowSuffix: false,
      allowNumber: false,
      maxLength: 14,
    };
  }

  if (length === "long") {
    return {
      maxWords: 3,
      allowPrefix: true,
      allowSuffix: true,
      allowNumber: true,
      maxLength: 30,
    };
  }

  // medium (default)
  return {
    maxWords: 2,
    allowPrefix: Math.random() < 0.4,
    allowSuffix: true,
    allowNumber: Math.random() < 0.3,
    maxLength: 22,
  };
}

/* =========================
   CORE BUILDER
========================= */
function buildUsername(
  baseWords: string[],
  tone: UsernameTone,
  length: UsernameLength,
): string {
  const config = lengthConfig(length);

  const words = baseWords.slice(0, config.maxWords);

  const prefix = config.allowPrefix ? pick(PREFIXES[tone]) : "";
  const suffix = config.allowSuffix ? pick(SUFFIXES[tone]) : "";
  const number = config.allowNumber ? pick(NUMBERS) : "";

  const parts = [prefix, ...words, suffix, number].filter(Boolean);

  let result = parts.join("");

  // safety trims
  result = result.replace(/__+/g, "_");
  result = result.replace(/--+/g, "-");
  result = result.slice(0, config.maxLength);

  return result;
}

/* =========================
   PUBLIC GENERATOR
========================= */
export function generateUsernames(params: GenerateUsernameParams): string[] {
  const { input, tone = "neutral", length = "medium", limit = 6 } = params;

  if (!input || !input.trim()) return [];

  const cleaned = cleanInput(input);
  const words = cleaned.split(" ").filter(Boolean);

  const results: string[] = [];

  for (let i = 0; i < limit * 2; i++) {
    const username = buildUsername(words, tone, length);
    if (username.length >= 3) {
      results.push(username);
    }
  }

  return uniq(results).slice(0, limit);
}

/* =========================
   DEFAULT EXPORT (SAFE)
========================= */
export default {
  generateUsernames,
};
