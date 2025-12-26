// ======================================================
// ToolzyAI — Bio Generator (Enhanced Rule-Based Engine)
// Advanced Features:
// - Smart phrase extraction (bigrams, trigrams, skip-grams)
// - Universal input handling (AI prompts & regular text)
// - 8-10 template variations per tone
// - Keyword scoring & prioritization
// - Improved uniqueness & variety
// - Enhanced Output 3 with different structures
// ======================================================

window.ToolzyEngines = window.ToolzyEngines || {};

window.ToolzyEngines.bio = function ({
    input,
    tone = "professional",
    length = "medium",
}) {
    if (!input) return [];

    /* =========================
       ENHANCED INPUT PARSING
       Universal handler for any input style
       ========================= */
    function parseInput(rawInput) {
        // Remove common AI prompt patterns
        let cleaned = rawInput
            .toLowerCase()
            // Remove AI-style prefixes
            .replace(/^(write|create|generate|make|build|i want|i need|please|can you|could you)\s+(a|an|me)?\s*(bio|biography|profile|description)?\s+(for|about|on)?\s*/gi, '')
            // Remove platform mentions in context
            .replace(/\s+(for|on|in)\s+(linkedin|twitter|instagram|facebook|github|portfolio|website|resume)\s*/gi, ' ')
            // Remove filler words in AI prompts
            .replace(/\s+(that says|that mentions|that includes|mentioning|including|highlighting|focusing on)\s+/gi, ' ')
            // Clean special characters but keep meaningful punctuation temporarily
            .replace(/[^\w\s,.-]/g, ' ')
            // Normalize spaces
            .replace(/\s+/g, ' ')
            .trim();

        // Extract key phrases before final cleaning
        const commaSegments = cleaned.split(',').map(s => s.trim()).filter(s => s.length > 0);

        // Final cleaning for word extraction
        cleaned = cleaned
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return { cleaned, segments: commaSegments };
    }

    const { cleaned, segments } = parseInput(input);

    if (!cleaned) return [];

    /* =========================
       STOPWORDS & FILTERING
       ========================= */
    const STOPWORDS = new Set([
        "i", "am", "want", "need", "for", "with", "and", "or", "in", "on", "to", "of",
        "that", "who", "what", "where", "when", "why", "how", "a", "an", "the", "is",
        "are", "was", "were", "be", "been", "as", "at", "from", "by", "about",
        "write", "writing", "bio", "biography", "profile", "linkedin", "create",
        "make", "generate", "please", "can", "could", "would", "should"
    ]);

    // Extract words
    const rawWords = cleaned.split(" ").filter(w => w.length >= 3);
    const filteredWords = rawWords.filter(w => !STOPWORDS.has(w));
    const words = filteredWords.length >= 2 ? filteredWords : rawWords.slice(0, 5);

    /* =========================
       KEYWORD SCORING
       Prioritize more meaningful words
       ========================= */
    const keywordScores = {};
    const importantPrefixes = ['senior', 'lead', 'head', 'chief', 'principal', 'expert', 'specialist'];
    const importantSuffixes = ['engineer', 'developer', 'designer', 'manager', 'architect', 'consultant'];

    words.forEach(word => {
        let score = 1;

        // Boost scores for important roles/titles
        if (importantPrefixes.some(p => word.includes(p))) score += 2;
        if (importantSuffixes.some(s => word.includes(s))) score += 2;

        // Boost longer, more specific words
        if (word.length >= 6) score += 1;
        if (word.length >= 9) score += 1;

        // Boost words that appear in segments (likely important)
        if (segments.some(seg => seg.includes(word))) score += 1;

        keywordScores[word] = score;
    });

    // Sort words by score for prioritization
    const scoredWords = words.sort((a, b) => (keywordScores[b] || 0) - (keywordScores[a] || 0));

    /* =========================
       ADAPTIVE PHRASE EXTRACTION
       Optimized for 1-25 word inputs
       ========================= */
    function extractPhrases(arr) {
        const phrases = new Set();
        const wordCount = arr.length;

        // Always extract bigrams (2-word phrases)
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== arr[i + 1]) {
                phrases.add(`${arr[i]} ${arr[i + 1]}`);
            }
        }

        // Trigrams only for medium inputs (6+ words)
        if (wordCount >= 6) {
            for (let i = 0; i < arr.length - 2; i++) {
                if (arr[i] !== arr[i + 1] && arr[i + 1] !== arr[i + 2]) {
                    phrases.add(`${arr[i]} ${arr[i + 1]} ${arr[i + 2]}`);
                }
            }
        }

        // Skip-grams only for longer inputs (8+ words)
        if (wordCount >= 8) {
            for (let i = 0; i < Math.min(arr.length - 2, 8); i++) {
                if (arr[i] !== arr[i + 2]) {
                    phrases.add(`${arr[i]} ${arr[i + 2]}`);
                }
            }
        }

        return Array.from(phrases);
    }

    const allPhrases = extractPhrases(scoredWords);

    // Prioritize phrases with high-scored words
    const scoredPhrases = allPhrases
        .map(phrase => {
            const phraseWords = phrase.split(' ');
            const score = phraseWords.reduce((sum, w) => sum + (keywordScores[w] || 0), 0);
            return { phrase, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(item => item.phrase);

    /* =========================
       ADAPTIVE TOPIC BUILDER
       Optimized for short (1-10) and medium (11-25) inputs
       ========================= */
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    function topic() {
        const wordCount = scoredWords.length;

        // For very short inputs (1-3 words), prioritize using all words
        if (wordCount <= 3) {
            if (wordCount === 1) return scoredWords[0];
            if (wordCount === 2) return `${scoredWords[0]} ${scoredWords[1]}`;
            // For 3 words, occasionally use all three
            if (Math.random() > 0.6) {
                return `${scoredWords[0]} ${scoredWords[1]} ${scoredWords[2]}`;
            }
            return `${pick(scoredWords)} ${pick(scoredWords)}`;
        }

        // For short-medium inputs (4-10 words), balance phrases and combinations
        if (wordCount <= 10) {
            if (scoredPhrases.length && Math.random() > 0.4) {
                return pick(scoredPhrases.slice(0, Math.ceil(scoredPhrases.length * 0.7)));
            }
            const topWords = scoredWords.slice(0, Math.ceil(wordCount * 0.6));
            const a = pick(topWords);
            const b = pick(topWords.filter(w => w !== a));
            return `${a} ${b}`;
        }

        // For longer inputs (11+ words), prefer scored phrases
        if (scoredPhrases.length && Math.random() > 0.3) {
            const topPhrases = scoredPhrases.slice(0, Math.ceil(scoredPhrases.length * 0.5));
            return pick(topPhrases);
        }

        // Use high-scoring word combinations
        if (scoredWords.length >= 2) {
            const topWords = scoredWords.slice(0, Math.ceil(scoredWords.length * 0.5));
            const a = pick(topWords);
            const b = pick(topWords.filter(w => w !== a));
            return `${a} ${b}`;
        }

        // Final fallback
        return pick(scoredWords.slice(0, 3) || words.slice(0, 3) || rawWords.slice(0, 3));
    }

    /* =========================
       ENHANCED ENDINGS BY LENGTH
       ========================= */
    const endings = {
        short: [
            "",
            " Always learning.",
            " Growth-focused.",
        ],
        medium: [
            " Always learning and improving.",
            " Curious and driven by progress.",
            " Continuously growing and refining skills.",
            " Committed to ongoing development.",
            " Focused on consistent improvement.",
            " Dedicated to lifelong learning.",
        ],
        long: [
            " Always curious and continuously evolving.",
            " Driven by learning, growth, and meaningful work.",
            " Focused on growth, consistency, and long-term impact.",
            " Committed to excellence through continuous learning.",
            " Building expertise through dedication and curiosity.",
            " Passionate about growth, innovation, and lasting contributions.",
            " Striving for excellence while embracing new challenges.",
        ],
    };

    /* =========================
       8-10 TEMPLATE VARIATIONS PER TONE
       ========================= */
    const TONE = {
        professional: {
            templates: [
                t => `Professional focused on ${t}.`,
                t => `Experienced in ${t}.`,
                t => `Working across ${t}.`,
                t => `Specializing in ${t}.`,
                t => `${t} professional with proven expertise.`,
                t => `Dedicated professional in ${t}.`,
                t => `Skilled in ${t} and related disciplines.`,
                t => `${t} specialist with comprehensive experience.`,
                t => `Focused on delivering results in ${t}.`,
                t => `Expert in ${t} with a track record of success.`,
            ],
        },
        casual: {
            templates: [
                t => `Into ${t} and always learning.`,
                t => `Enjoys working with ${t}.`,
                t => `Passionate about ${t}.`,
                t => `Exploring ${t} in everyday work.`,
                t => `${t} enthusiast who loves solving problems.`,
                t => `Working on ${t} and having fun with it.`,
                t => `Diving deep into ${t} every day.`,
                t => `${t} is my thing, and I'm always improving.`,
                t => `Love working with ${t} and seeing results.`,
                t => `All about ${t} and continuous growth.`,
            ],
        },
        playful: {
            templates: [
                t => `Exploring ${t} one step at a time.`,
                t => `Building things with ${t}.`,
                t => `Turning ${t} into something meaningful.`,
                t => `${t} is the playground, innovation is the game.`,
                t => `Making magic happen with ${t}.`,
                t => `Bringing ideas to life through ${t}.`,
                t => `${t} enthusiast on a mission to create.`,
                t => `Crafting solutions with ${t} and creativity.`,
                t => `${t} is where curiosity meets execution.`,
                t => `Experimenting, iterating, and thriving in ${t}.`,
            ],
        },
    };

    const rule = TONE[tone] || TONE.professional;

    /* =========================
       OUTPUT 3 SPECIAL STRUCTURES
       Different patterns for variety
       ========================= */
    const output3Structures = [
        // Structure 1: Action-oriented
        () => {
            const actions = ["Building", "Creating", "Developing", "Designing", "Implementing", "Crafting"];
            const action = pick(actions);
            const t = topic();
            const end = pick(endings[length] || [""]);
            return `${action} solutions in ${t}.${end}`.trim();
        },
        // Structure 2: Result-focused
        () => {
            const results = ["Delivering", "Achieving", "Driving", "Producing", "Enabling", "Facilitating"];
            const result = pick(results);
            const t = topic();
            const end = pick(endings[length] || [""]);
            return `${result} impact through ${t}.${end}`.trim();
        },
        // Structure 3: Experience-based
        () => {
            const years = ["years", "experience", "background", "expertise"];
            const year = pick(years);
            const t = topic();
            const end = pick(endings[length] || [""]);
            return `Bringing ${year} in ${t} to every project.${end}`.trim();
        },
        // Structure 4: Mission-driven
        () => {
            const missions = ["Helping", "Empowering", "Supporting", "Enabling", "Assisting"];
            const mission = pick(missions);
            const t = topic();
            const end = pick(endings[length] || [""]);
            return `${mission} teams and organizations with ${t}.${end}`.trim();
        },
    ];

    /* =========================
       STANDARD BIO BUILDER
       ========================= */
    function buildBio() {
        const base = pick(rule.templates)(topic());
        const tail = pick(endings[length] || [""]);
        return `${base}${tail}`.trim();
    }

    /* =========================
       ADAPTIVE BUILD WITH UNIQUENESS
       Better handling for short inputs
       ========================= */
    function build(count) {
        const set = new Set();
        const wordCount = scoredWords.length;
        let tries = 0;
        const maxTries = wordCount <= 5 ? 60 : 100;

        while (set.size < count && tries < maxTries) {
            tries++;
            const bio = buildBio();

            // For short inputs, be less strict on similarity
            const similarityThreshold = wordCount <= 5 ? 0.8 : 0.7;
            const tokens = bio.toLowerCase().split(' ');
            let isDuplicate = false;

            for (const existing of set) {
                const existingTokens = existing.toLowerCase().split(' ');
                const commonTokens = tokens.filter(t => existingTokens.includes(t)).length;
                const similarity = commonTokens / Math.max(tokens.length, existingTokens.length);

                if (similarity > similarityThreshold) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                set.add(bio);
            }
        }

        return Array.from(set).join("\n");
    }

    /* =========================
       OUTPUT GENERATION
       ========================= */

    // Output 1 — Short hooks (2 variations)
    const output1 = build(2);

    // Output 2 — Paragraph format (2-3 sentences combined)
    const sentenceCount = length === "short" ? 2 : length === "medium" ? 3 : 4;
    const output2 = Array.from({ length: sentenceCount })
        .map(() => buildBio())
        .join(" ");

    // Output 3 — Special structures (2 variations with unique patterns)
    const output3Set = new Set();
    let attempts = 0;

    while (output3Set.size < 2 && attempts < 50) {
        attempts++;
        const bio = pick(output3Structures)();

        // Avoid duplicates with output1 and output2
        const isDuplicateWithOthers =
            output1.includes(bio.substring(0, 20)) ||
            output2.includes(bio.substring(0, 20));

        if (!isDuplicateWithOthers && bio.length >= 20) {
            output3Set.add(bio);
        }
    }

    const output3 = Array.from(output3Set).join("\n");

    /* =========================
       LENGTH VALIDATION
       Ensure outputs meet minimum quality standards
       ========================= */
    const minLengths = {
        short: 20,
        medium: 30,
        long: 40,
    };

    const minLength = minLengths[length] || minLengths.medium;

    const validateOutput = (output) => {
        if (!output || output.trim().length < minLength) {
            // Fallback: simple but valid bio
            const t = topic();
            return `Professional working with ${t}. Focused on continuous growth.`;
        }
        return output;
    };

    const finalOutput1 = validateOutput(output1);
    const finalOutput2 = validateOutput(output2);
    const finalOutput3 = validateOutput(output3);

    return [finalOutput1, finalOutput2, finalOutput3];
};
