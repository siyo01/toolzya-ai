// src/utils/modelclient.ts
// Rule-based paraphrasing engine (MVP)

export type Mode = "standard" | "fluent" | "creative";

/* ---------------- LANGUAGE DETECTION ---------------- */

function detectLanguage(text: string): "id" | "en" | "other" {
  const idHints = [
    "yang",
    "dan",
    "untuk",
    "dengan",
    "adalah",
    "ini",
    "itu",
    "tidak",
    "karena",
  ];

  const lower = text.toLowerCase();
  let score = 0;

  for (const w of idHints) {
    if (lower.includes(` ${w} `)) score++;
  }

  if (score >= 2) return "id";
  if (/^[a-z0-9\s.,!?'"()-]+$/i.test(text)) return "en";
  return "other";
}

/* ---------------- UTILS ---------------- */

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function clean(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

/* ---------------- ENGLISH ---------------- */

const EN_SYNONYMS: Record<string, string[]> = {
  completed: ["finished", "wrapped up", "finalized"],
  project: ["task", "work", "assignment"],
  exceeded: ["surpassed", "went beyond"],
  quality: ["standards", "expectations"],
  team: ["group", "crew"],
};

function paraphraseEN(text: string, mode: Mode) {
  let out = text;

  for (const key in EN_SYNONYMS) {
    const pick = shuffle(EN_SYNONYMS[key])[0];
    out = out.replace(new RegExp(`\\b${key}\\b`, "gi"), pick);
  }

  if (mode === "fluent") {
    out = out.replace(/\band\b/gi, ", and");
  }

  if (mode === "creative") {
    const tails = [
      "with impressive results.",
      "showing strong performance.",
      "which deserves recognition.",
    ];
    out += " " + shuffle(tails)[0];
  }

  return clean(out);
}

/* ---------------- INDONESIAN ---------------- */

const ID_SYNONYMS: Record<string, string[]> = {
  menyelesaikan: ["menuntaskan", "merampungkan"],
  proyek: ["pekerjaan", "tugas"],
  cepat: ["lebih dini", "lebih awal"],
  kualitas: ["mutu", "standar"],
};

function paraphraseID(text: string, mode: Mode) {
  let out = text;

  for (const key in ID_SYNONYMS) {
    out = out.replace(
      new RegExp(`\\b${key}\\b`, "gi"),
      shuffle(ID_SYNONYMS[key])[0],
    );
  }

  if (mode === "fluent") {
    out = out.replace(/\s+yang\s+/gi, " ");
  }

  if (mode === "creative") {
    const tails = [
      "dengan hasil yang patut diapresiasi.",
      "sebagai pencapaian yang positif.",
      "yang menunjukkan kinerja baik.",
    ];
    out += " " + shuffle(tails)[0];
  }

  return clean(out);
}

/* ---------------- GENERIC ---------------- */

function paraphraseGeneric(text: string) {
  return clean(text);
}

/* ---------------- MAIN ---------------- */

export async function generateText(input: string, mode: Mode = "standard") {
  const lang = detectLanguage(input);

  if (lang === "en") return paraphraseEN(input, mode);
  if (lang === "id") return paraphraseID(input, mode);

  return paraphraseGeneric(input);
}
