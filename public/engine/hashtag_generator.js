// ======================================================
// ToolzyAI — Hashtag Generator (Rule-based, Browser)
// UPGRADED VERSION: Enhanced quality, flexible input, bug fixes
// ======================================================

window.ToolzyEngines = window.ToolzyEngines || {};

window.ToolzyEngines.hashtag = function ({
    input,
    tone = "mixed",
    length = "medium",
}) {
    if (!input || input.trim().length === 0) return [];

    /* =========================
       ENHANCED PROMPT NORMALIZER
       ========================= */

    // Reduced stopwords - only truly common words
    const STOPWORDS = [
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "be", "been",
        "this", "that", "it", "its", "will", "would", "can", "could", "hashtag", "hashtags"
    ];

    // AI-style prompt detection patterns
    const AI_INTENT_PATTERNS = [
        /(?:i want|i need|create|generate|make me|give me|looking for)\s+(?:hashtags?|tags?)?\s+(?:for|about|related to)?\s*(.*)/i,
        /(?:hashtags?|tags?)\s+(?:for|about|related to)\s+(.*)/i,
        /(?:something|tags)\s+(?:about|for|related to)\s+(.*)/i,
        /(?:best|good|popular)\s+(?:hashtags?|tags?)\s+(?:for|about)?\s*(.*)/i
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
                w.length >= 3 &&
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

            return lenientWords.slice(0, 25);
        }

        return words.slice(0, 25); // Max 25 words
    }

    const keywords = extractKeywords(input);
    if (!keywords.length) {
        // Fallback: sanitized input
        const fallback = input.toLowerCase().replace(/[^a-z0-9]/g, "");
        return fallback ? [`#${fallback}`, `#${fallback}daily`, `#${fallback}life`] : [];
    }

    /* =========================
       ENHANCED HELPERS
       ========================= */

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const uniq = arr => Array.from(new Set(arr));

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Improved count based on length descriptions
    function getHashtagCount() {
        if (length === "short") return rand(5, 8);    // Concise
        if (length === "long") return rand(20, 30);   // Comprehensive
        return rand(10, 15);                          // Balanced
    }

    function capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    function toCamelCase(words) {
        return words.map((w, i) => i === 0 ? w : capitalize(w)).join('');
    }

    function toPascalCase(words) {
        return words.map(w => capitalize(w)).join('');
    }

    /* =========================
       HASHTAG BUILDING BLOCKS
       ========================= */

    // Popular hashtag patterns (broader visibility)
    const POPULAR_SUFFIXES = [
        "life", "style", "vibes", "daily", "love", "gram", "goals", "inspo",
        "mood", "feels", "squad", "fam", "nation", "world", "trend", "viral"
    ];

    const POPULAR_PREFIXES = [
        "daily", "best", "top", "amazing", "awesome", "epic", "love",
        "beautiful", "happy", "perfect", "ultimate", "real", "pure"
    ];

    const POPULAR_PATTERNS = [
        "OfTheDay", "OfInstagram", "Lovers", "Addicts", "Obsessed",
        "Forever", "Always", "Everyday", "IsLife", "IsBae"
    ];

    // Niche hashtag patterns (targeted audiences)
    const NICHE_SUFFIXES = [
        "community", "tribe", "collective", "crew", "culture", "movement",
        "society", "network", "hub", "space", "studio", "lab", "academy",
        "insider", "pro", "expert", "geek", "nerd", "enthusiast"
    ];

    const NICHE_PREFIXES = [
        "micro", "indie", "underground", "authentic", "raw", "real",
        "niche", "boutique", "artisan", "handcrafted", "custom", "unique"
    ];

    const NICHE_PATTERNS = [
        "Community", "Circle", "Collective", "Underground", "InnerCircle",
        "Elite", "Insider", "Curator", "Connoisseur", "Specialist"
    ];

    // Time-based & trending patterns
    const TIME_PATTERNS = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
        "Weekend", "Morning", "Night", "Today", "2025", "ThisYear"
    ];

    const TRENDING_PATTERNS = [
        "Challenge", "Motivation", "Inspiration", "Goals", "Journey",
        "Story", "Vibes", "Mood", "Aesthetic", "Energy"
    ];

    // CTA & Engagement hashtags
    const CTA_PATTERNS = [
        "FollowForMore", "LikeAndFollow", "ShareYourStory", "TagSomeone",
        "DoubleTab", "CommentBelow", "SaveThis", "ShareThis"
    ];

    /* =========================
       HASHTAG GENERATORS
       ========================= */

    // Base hashtag creation
    function createHashtag(...parts) {
        const combined = parts
            .filter(p => p && p.length > 0)
            .join('')
            .replace(/\s+/g, '');
        return `#${combined}`;
    }

    // Generate POPULAR hashtags (broader visibility, commonly used)
    function generatePopular(count) {
        const hashtags = new Set();
        let attempts = 0;
        const maxAttempts = count * 20;

        while (hashtags.size < count && attempts < maxAttempts) {
            attempts++;
            const word = pick(keywords);
            const technique = Math.random();

            let hashtag;

            if (technique < 0.15) {
                // Simple base tag
                hashtag = createHashtag(word);
            } else if (technique < 0.30) {
                // Word + popular suffix
                hashtag = createHashtag(word, pick(POPULAR_SUFFIXES));
            } else if (technique < 0.45) {
                // Popular prefix + word
                hashtag = createHashtag(pick(POPULAR_PREFIXES), word);
            } else if (technique < 0.60) {
                // Trending pattern
                hashtag = createHashtag(word, pick(TRENDING_PATTERNS));
            } else if (technique < 0.75) {
                // Time-based pattern
                hashtag = createHashtag(pick(TIME_PATTERNS), word);
            } else if (technique < 0.85) {
                // Popular pattern (e.g., #PhotoOfTheDay)
                hashtag = createHashtag(capitalize(word), pick(POPULAR_PATTERNS));
            } else {
                // Two words combo (PascalCase)
                const word2 = pick(keywords.filter(w => w !== word)) || word;
                hashtag = createHashtag(toPascalCase([word, word2]));
            }

            if (hashtag && hashtag.length > 3 && hashtag.length <= 30) {
                hashtags.add(hashtag);
            }
        }

        // Add some CTA hashtags for engagement (popular tone focus)
        if (hashtags.size < count) {
            const ctaCount = Math.min(2, count - hashtags.size);
            for (let i = 0; i < ctaCount; i++) {
                hashtags.add(createHashtag(pick(CTA_PATTERNS)));
            }
        }

        return Array.from(hashtags).slice(0, count);
    }

    // Generate NICHE hashtags (specific, targeted audiences)
    function generateNiche(count) {
        const hashtags = new Set();
        let attempts = 0;
        const maxAttempts = count * 20;

        while (hashtags.size < count && attempts < maxAttempts) {
            attempts++;
            const word = pick(keywords);
            const technique = Math.random();

            let hashtag;

            if (technique < 0.20) {
                // Word + niche suffix
                hashtag = createHashtag(word, pick(NICHE_SUFFIXES));
            } else if (technique < 0.40) {
                // Niche prefix + word
                hashtag = createHashtag(pick(NICHE_PREFIXES), word);
            } else if (technique < 0.60) {
                // Compound: two keywords
                const word2 = pick(keywords.filter(w => w !== word)) || word;
                hashtag = createHashtag(toPascalCase([word, word2]));
            } else if (technique < 0.75) {
                // Niche pattern
                hashtag = createHashtag(capitalize(word), pick(NICHE_PATTERNS));
            } else if (technique < 0.85) {
                // Triple compound (micro-niche)
                const word2 = pick(keywords.filter(w => w !== word)) || word;
                const word3 = pick(keywords.filter(w => w !== word && w !== word2)) || word;
                hashtag = createHashtag(toCamelCase([word, word2, word3]));
            } else {
                // Specific audience tag
                hashtag = createHashtag(word, pick(NICHE_SUFFIXES), pick(["s", "hub", "pro"]));
            }

            if (hashtag && hashtag.length > 3 && hashtag.length <= 35) {
                hashtags.add(hashtag);
            }
        }

        return Array.from(hashtags).slice(0, count);
    }

    // Generate MIXED hashtags (balance of popular and niche)
    function generateMixed(count) {
        const hashtags = new Set();
        let attempts = 0;
        const maxAttempts = count * 20;

        // Target: 50% popular, 50% niche for balanced approach
        const popularCount = Math.floor(count * 0.5);
        const nicheCount = count - popularCount;

        // Generate popular portion
        const popularTags = generatePopular(popularCount);
        popularTags.forEach(tag => hashtags.add(tag));

        // Generate niche portion
        const nicheTags = generateNiche(nicheCount);
        nicheTags.forEach(tag => hashtags.add(tag));

        // Fill remaining if needed with mixed techniques
        while (hashtags.size < count && attempts < maxAttempts) {
            attempts++;
            const word = pick(keywords);
            const technique = Math.random();

            let hashtag;

            if (technique < 0.25) {
                // Simple base
                hashtag = createHashtag(word);
            } else if (technique < 0.50) {
                // Popular pattern
                hashtag = createHashtag(word, pick([...POPULAR_SUFFIXES, ...NICHE_SUFFIXES]));
            } else if (technique < 0.75) {
                // Compound
                const word2 = pick(keywords.filter(w => w !== word)) || word;
                hashtag = createHashtag(toPascalCase([word, word2]));
            } else {
                // Trending
                hashtag = createHashtag(word, pick(TRENDING_PATTERNS));
            }

            if (hashtag && hashtag.length > 3 && hashtag.length <= 30) {
                hashtags.add(hashtag);
            }
        }

        return Array.from(hashtags).slice(0, count);
    }

    /* =========================
       MAIN EXECUTION
       ========================= */

    const count = getHashtagCount();

    // Generate all three sets
    const popularSet = generatePopular(count);
    const nicheSet = generateNiche(count);
    const mixedSet = generateMixed(count);

    // Return based on selected tone (but always provide all 3 for variety)
    // Format: space-separated hashtags per set
    return [
        popularSet.join(" "),
        nicheSet.join(" "),
        mixedSet.join(" ")
    ];
};
