export type Mode = "standard" | "fluent" | "creative";

/* =========================
   LANGUAGE CHECK
========================= */
function isEnglish(text: string): boolean {
  return /^[a-z0-9\s.,!?'"()\-\n:;]+$/i.test(text);
}

/* =========================
   UTILS
========================= */
function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitSentences(p: string): string[] {
  return p.split(/(?<=[.!?])\s+/).filter(Boolean);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wordCount(s: string): number {
  return s.split(/\s+/).length;
}

/* =========================
   SAFE SYNONYMS (CONTROLLED)
========================= */
const SAFE_SYNONYMS: Record<string, string[]> = {
  important: ["important", "essential", "key"],
  help: ["help", "support"],
  helps: ["helps", "supports"],
  improve: ["improve", "enhance"],
  completed: ["completed", "finished"],
  delivered: ["delivered", "provided"],
};

function applySafeSynonym(sentence: string): string {
  let out = sentence;
  for (const key in SAFE_SYNONYMS) {
    if (new RegExp(`\\b${key}\\b`, "i").test(out) && Math.random() < 0.5) {
      out = out.replace(
        new RegExp(`\\b${key}\\b`, "i"),
        pick(SAFE_SYNONYMS[key]),
      );
      break;
    }
  }
  return out;
}

/* =========================
   MICRO STRUCTURE POLISH
========================= */
function microPolish(s: string): string {
  return s
    .replace(/\bis important\b/i, "plays an important role")
    .replace(/\bcan help\b/i, "helps to");
}

/* =========================
   CORE SENTENCE REWRITE
========================= */
function rewriteSentence(sentence: string, mode: Mode): string {
  let s = clean(sentence);

  // short sentence → always polish
  if (wordCount(s) <= 14) {
    s = applySafeSynonym(s);
    s = microPolish(s);
  }

  if (mode === "standard") {
    return s;
  }

  if (mode === "fluent") {
    return s.replace(/\s*,?\s*and\s+/gi, " and ").replace(/\s*,/g, ",");
  }

  // creative = slightly more variation, still safe
  s = applySafeSynonym(s);
  s = microPolish(s);

  return s;
}

/* =========================
   PARAGRAPH ENGINE
========================= */
function paraphraseEnglish(text: string, mode: Mode): string {
  return splitParagraphs(text)
    .map((p) =>
      splitSentences(p)
        .map((s) => rewriteSentence(s, mode))
        .join(" "),
    )
    .join("\n\n");
}

/* =========================
   FALLBACK
========================= */
function fallback(text: string) {
  return {
    output: clean(text),
    notice:
      "ToolzyAI works best with English text. Results for other languages may be limited.",
  };
}

/* =========================
   PUBLIC API
========================= */
export function generateParaphrase(
  input: string,
  mode: Mode,
): { output: string; notice?: string } {
  if (!isEnglish(input)) {
    return fallback(input);
  }

  return { output: paraphraseEnglish(input, mode) };
}
