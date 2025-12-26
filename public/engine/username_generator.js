// ======================================================
// ToolzyAI — Username Generator (Rule-based, Browser)
// UPGRADED VERSION: Enhanced quality, better prompt handling, bug fixes
// ======================================================

window.ToolzyEngines = window.ToolzyEngines || {};

window.ToolzyEngines.username = function ({
  input,
  tone = "simple",
  length = "medium",
}) {
  if (!input || input.trim().length === 0) return [];

  /* =========================
     ENHANCED PROMPT NORMALIZER
     ========================= */

  // Reduced stopwords list - only truly common words
  const STOPWORDS = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "be", "been",
    "this", "that", "it", "its", "will", "would", "can", "could"
  ];

  // AI-style prompt detection patterns
  const AI_INTENT_PATTERNS = [
    /(?:i want|i need|create|generate|make me|give me|looking for)\s+(?:a|an)?\s*(?:username|name|handle)?\s+(?:for|that|about)?\s*(.*)/i,
    /username\s+(?:for|about|related to)\s+(.*)/i,
    /(?:something|name)\s+(?:about|for|related to)\s+(.*)/i
  ];

  function extractKeywords(text) {
    let processedText = text.toLowerCase().trim();

    // Detect and extract from AI-style prompts
    for (const pattern of AI_INTENT_PATTERNS) {
      const match = processedText.match(pattern);
      if (match && match[1]) {
        processedText = match[1].trim();
        break;
      }
    }

    // Extract meaningful words
    const words = processedText
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(w =>
        w.length >= 3 && // Reduced from 4 to 3
        !STOPWORDS.includes(w) &&
        !/^\d+$/.test(w) // Remove pure numbers
      );

    // If we got too few words, try being more lenient
    if (words.length < 2) {
      const lenientWords = processedText
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(w => w.length >= 2 && !STOPWORDS.includes(w));

      return lenientWords.slice(0, 25); // Max 25 words as per requirement
    }

    return words.slice(0, 25); // Max 25 words as per requirement
  }

  const words = extractKeywords(input);
  if (!words.length) {
    // Fallback: if no valid words, use sanitized input
    const fallback = input.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
    return fallback ? [fallback, fallback + "x", fallback + "hq"] : [];
  }

  /* =========================
     ENHANCED HELPERS
     ========================= */

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Improved length control based on descriptions
  function enforceLength(name, targetLength) {
    if (length === "short") {
      // Short: 6-10 chars - concise
      if (name.length > 10) {
        return name.slice(0, rand(8, 10));
      }
      if (name.length < 6) {
        return name + rand(1, 99);
      }
      return name;
    }

    if (length === "long") {
      // Long: 15-20 chars - descriptive and extended
      if (name.length < 15) {
        const extensions = ["pro", "official", "hq", "studio", "labs", "dev", "tech"];
        const ext = pick(extensions);
        return name + rand(10, 999) + ext;
      }
      if (name.length > 20) {
        return name.slice(0, 20);
      }
      return name;
    }

    // Medium: 10-15 chars - balanced
    if (name.length > 15) {
      return name.slice(0, rand(12, 15));
    }
    if (name.length < 10) {
      return name + rand(10, 99);
    }
    return name;
  }

  function trimWord(w, aggressive = false) {
    if (w.length <= 3) return w;

    if (aggressive) {
      // More aggressive trimming for creative mode
      return w.slice(0, rand(2, Math.floor(w.length * 0.6)));
    }

    // Keep meaningful portion
    const keepLength = Math.max(3, Math.floor(w.length * 0.65));
    return Math.random() > 0.5
      ? w.slice(0, keepLength)
      : w.slice(0, rand(3, keepLength));
  }

  function dropVowel(w) {
    if (w.length <= 3) return w;
    const firstChar = w[0];
    const rest = w.slice(1).replace(/[aeiou]/gi, "");
    return firstChar + rest;
  }

  function leetify(w) {
    return w
      .replace(/e/g, '3')
      .replace(/a/g, '4')
      .replace(/o/g, '0')
      .replace(/i/g, '1')
      .replace(/s/g, '5');
  }

  function capitalize(w) {
    return w.charAt(0).toUpperCase() + w.slice(1);
  }

  function reverseWord(w) {
    return w.split('').reverse().join('');
  }

  // Build unique usernames with retry logic
  function build(count, builder) {
    const globalSet = new Set();
    const results = [];
    let tries = 0;
    const maxTries = count * 20; // More attempts for better results

    while (results.length < count && tries < maxTries) {
      tries++;
      const username = builder();

      if (username &&
        username.length >= 3 &&
        !globalSet.has(username)) {
        globalSet.add(username);
        results.push(username);
      }
    }

    // Ensure minimum count
    while (results.length < count) {
      const fallback = pick(words) + rand(100, 999);
      if (!globalSet.has(fallback)) {
        globalSet.add(fallback);
        results.push(fallback);
      }
    }

    return results;
  }

  /* =========================
     ENHANCED TONE CONFIGURATIONS
     ========================= */

  const TONE_CONFIG = {
    simple: {
      // Short, clean, and easy-to-read usernames
      separators: ["", "_"],
      prefixes: [],
      suffixes: [],
      allowVowelDrop: false,
      allowLeet: false,
      allowTrim: false,
      allowCapitalize: true,
      maxComplexity: 2, // Max 2 words combined
    },

    professional: {
      // Suitable for business, portfolios, or branding
      separators: ["", "_", "."],
      prefixes: ["the", "my", "real"],
      suffixes: ["hq", "studio", "lab", "co", "inc", "pro", "official", "group"],
      allowVowelDrop: false,
      allowLeet: false,
      allowTrim: false,
      allowCapitalize: true,
      maxComplexity: 2,
    },

    creative: {
      // More playful and unique username combinations
      separators: ["", "_", ".", "-", "x"],
      prefixes: ["ultra", "mega", "super", "epic"],
      suffixes: ["ify", "flow", "zone", "core", "x", "ster", "verse", "squad"],
      allowVowelDrop: true,
      allowLeet: true,
      allowTrim: true,
      allowCapitalize: true,
      maxComplexity: 3,
    },
  };

  const config = TONE_CONFIG[tone] || TONE_CONFIG.simple;

  /* =========================
     OUTPUT STRATEGIES
     ========================= */

  // Strategy 1: Clean Combinations
  const output1 = build(8, () => {
    const word1 = pick(words);
    const word2 = words.length > 1 ? pick(words.filter(w => w !== word1)) : null;

    let username;

    if (word2 && Math.random() > 0.3) {
      // Two word combination
      const sep = pick(config.separators);
      const shouldCapitalize = config.allowCapitalize && Math.random() > 0.6;

      if (shouldCapitalize && tone === "professional") {
        username = capitalize(word1) + sep + capitalize(word2);
      } else {
        username = word1 + sep + word2;
      }

      // Add suffix for professional tone
      if (tone === "professional" && Math.random() > 0.5 && config.suffixes.length) {
        username += pick(config.suffixes);
      }
    } else {
      // Single word with optional suffix
      username = word1;

      if (config.suffixes.length && Math.random() > 0.4) {
        username += pick(config.suffixes);
      }

      if (config.allowCapitalize && Math.random() > 0.5) {
        username = capitalize(username);
      }
    }

    return enforceLength(username);
  });

  // Strategy 2: Creative Merges and Modifications
  const output2 = build(8, () => {
    const word1 = pick(words);
    const word2 = words.length > 1 ? pick(words.filter(w => w !== word1)) : pick(words);

    let username;
    const technique = Math.random();

    if (technique < 0.25 && config.allowTrim) {
      // Trimmed combination
      username = trimWord(word1) + trimWord(word2, true);
    } else if (technique < 0.5 && config.allowVowelDrop) {
      // Vowel-dropped combination
      username = dropVowel(word1) + (Math.random() > 0.5 ? word2 : dropVowel(word2));
    } else if (technique < 0.65 && config.allowLeet) {
      // Leetspeak variation
      username = leetify(word1);
    } else if (technique < 0.8) {
      // Prefix + word
      if (config.prefixes.length && Math.random() > 0.5) {
        username = pick(config.prefixes) + word1;
      } else {
        username = word1 + word2;
      }
    } else {
      // Blended words (overlap)
      const overlap = Math.min(2, Math.floor(word1.length / 2));
      username = word1 + word2.slice(overlap);
    }

    return enforceLength(username);
  });

  // Strategy 3: Unique Patterns and Variations
  const output3 = build(8, () => {
    const word1 = pick(words);
    const word2 = words.length > 1 ? pick(words.filter(w => w !== word1)) : null;

    let username;
    const pattern = Math.random();

    if (pattern < 0.2 && config.allowCapitalize) {
      // CamelCase style
      username = word2
        ? capitalize(word1) + capitalize(word2)
        : capitalize(word1) + capitalize(pick(words));
    } else if (pattern < 0.35 && tone === "creative") {
      // Reversed word play
      username = reverseWord(word1).slice(0, 4) + (word2 || word1);
    } else if (pattern < 0.5 && config.suffixes.length) {
      // Double suffix for emphasis
      username = word1 + pick(config.suffixes);
      if (Math.random() > 0.6) {
        username += pick(["x", "z", "r", "s"]);
      }
    } else if (pattern < 0.7 && word2) {
      // Alternating characters (creative)
      const combined = word1 + word2;
      username = combined.split('').filter((_, i) => i % 2 === 0).join('') +
        combined.split('').filter((_, i) => i % 2 === 1).join('').slice(0, 3);
    } else {
      // Standard combination with separator
      const sep = pick(config.separators);
      username = word2
        ? (Math.random() > 0.5 ? word1 + sep + word2 : word2 + sep + word1)
        : word1 + pick(config.suffixes || ["x"]);
    }

    return enforceLength(username);
  });

  /* =========================
     RETURN RESULTS
     ========================= */

  // Combine all outputs and ensure uniqueness across all sets
  const allUsernames = new Set([...output1, ...output2, ...output3]);
  const finalOutput = Array.from(allUsernames);

  // Format output: return as comma-separated strings for each strategy
  // This matches the original format
  return [
    output1.join(", "),
    output2.join(", "),
    output3.join(", ")
  ];
};
