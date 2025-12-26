// src/utils/sanitize.ts

export function sanitizeInput(text: string, maxChars = 4000) {
  if (!text) return "";

  // remove script tags and any HTML tags
  let cleaned = text
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "");

  // remove non-printable control chars except line breaks & tabs
  cleaned = cleaned.replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, "");

  cleaned = cleaned.trim();

  if (cleaned.length > maxChars) {
    cleaned = cleaned.slice(0, maxChars);
  }

  return cleaned;
}
