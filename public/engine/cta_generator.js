// ======================================================
// ToolzyAI — CTA Generator (Enhanced Rule-based Engine)
// Version: 2.0 - Improved & Bug-Fixed
// ======================================================

window.ToolzyEngines = window.ToolzyEngines || {};

window.ToolzyEngines.cta = function ({
    input,
    tone = "direct",
    length = "medium",
}) {
    if (!input) return [];

    // ==============================
    // PREPROCESSING & SMART EXTRACTION
    // ==============================

    const original = input.trim();
    const clean = original.toLowerCase();

    // Extract keywords with smart filtering
    const LIGHT_STOPWORDS = [
        "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
        "can", "may", "might", "must", "i", "me", "my", "we", "our",
    ];

    const PROMPT_INDICATORS = [
        "want", "need", "looking", "focus", "generate", "create", "make", "write",
        "cta", "call", "action", "button", "for", "about",
    ];

    // Extract all words
    const allWords = clean
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(w => w.length >= 2);

    if (allWords.length === 0) return [];

    // Smart word classification
    const keywords = [];
    const actionWords = [];
    const contextWords = [];

    allWords.forEach(word => {
        if (LIGHT_STOPWORDS.includes(word)) return;

        if (PROMPT_INDICATORS.includes(word)) {
            // Skip prompt meta-words but continue
            return;
        }

        // Classify words
        if (isActionWord(word)) {
            actionWords.push(word);
        } else if (word.length >= 3) {
            keywords.push(word);
        }
    });

    // Fallback: if no keywords found, use all non-stopword words
    const finalKeywords = keywords.length > 0 ? keywords : allWords.filter(w =>
        !LIGHT_STOPWORDS.includes(w) && !PROMPT_INDICATORS.includes(w) && w.length >= 3
    );

    const finalActions = actionWords.length > 0 ? actionWords : ["start", "explore", "discover"];

    // If still empty, provide generic output
    if (finalKeywords.length === 0 && finalActions.length === 0) {
        return generateGenericCTAs(tone, length);
    }

    // ==============================
    // HELPER FUNCTIONS
    // ==============================

    function isActionWord(word) {
        const actionVerbs = [
            "start", "begin", "launch", "join", "get", "grab", "take", "explore",
            "discover", "try", "test", "build", "create", "make", "grow", "boost",
            "increase", "improve", "enhance", "optimize", "unlock", "access", "learn",
            "master", "achieve", "reach", "transform", "upgrade", "level", "win"
        ];
        return actionVerbs.includes(word);
    }

    const pick = arr => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : "";

    function capitalize(text) {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function getLengthConfig() {
        return {
            short: { max: 3, patterns: ["simple"] },
            medium: { max: 5, patterns: ["simple", "with_benefit", "with_urgency"] },
            long: { max: 8, patterns: ["simple", "with_benefit", "with_urgency", "full"] },
        }[length] || { max: 5, patterns: ["simple", "with_benefit"] };
    }

    function trimToLength(text, maxWords) {
        const words = text.trim().split(/\s+/);
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(" ");
    }

    function cleanDuplicateSpaces(text) {
        return text.replace(/\s+/g, " ").trim();
    }

    // ==============================
    // TONE-SPECIFIC CONFIGURATIONS
    // ==============================

    const TONE_CONFIG = {
        direct: {
            verbs: ["start", "join", "get", "try", "grab", "take", "go", "click"],
            modifiers: ["now", "today", "instantly", "immediately"],
            structures: [
                (v, k) => `${v} ${k}`,
                (v, k) => `${v} ${k} now`,
                (v, k) => `${k} - ${v} today`,
                (v, k) => `click to ${v} ${k}`,
            ],
            style: "imperative"
        },
        persuasive: {
            verbs: ["unlock", "boost", "transform", "maximize", "supercharge", "elevate", "amplify"],
            benefits: ["your success", "your growth", "your potential", "your results", "better outcomes"],
            modifiers: ["today", "right now", "instantly"],
            structures: [
                (v, k) => `${v} ${k}`,
                (v, k) => `${v} your ${k}`,
                (v, k) => `ready to ${v} ${k}?`,
                (v, k, b) => `${v} ${k} ${b}`,
                (v, k) => `${v} ${k} - see results`,
            ],
            style: "motivational"
        },
        soft: {
            verbs: ["discover", "explore", "learn", "see", "experience", "find", "embrace"],
            connectors: ["how to", "the way to", "the path to"],
            qualifiers: ["gently", "easily", "simply"],
            structures: [
                (v, k) => `${v} ${k}`,
                (v, k, c) => `${v} ${c} ${k}`,
                (v, k) => `let's ${v} ${k}`,
                (v, k) => `${v} the world of ${k}`,
                (v, k) => `your journey to ${k}`,
            ],
            style: "gentle"
        }
    };

    // ==============================
    // GENERATION ENGINE
    // ==============================

    function generateCTAs(toneKey, outputType) {
        const config = TONE_CONFIG[toneKey] || TONE_CONFIG.direct;
        const lengthCfg = getLengthConfig();
        const results = new Set();
        let attempts = 0;
        const maxAttempts = 100;
        const targetCount = 6;

        while (results.size < targetCount && attempts < maxAttempts) {
            attempts++;

            let cta = "";
            const verb = pick(config.verbs);
            const keyword = pick(finalKeywords);
            const action = pick(finalActions);

            // Generate based on output type and tone
            switch (outputType) {
                case 1: // Main tone-specific output
                    if (config.structures) {
                        const structure = pick(config.structures);
                        const benefit = config.benefits ? pick(config.benefits) : "";
                        const connector = config.connectors ? pick(config.connectors) : "";

                        // Try to call structure with appropriate params
                        try {
                            if (connector) {
                                cta = structure(verb, keyword || action, connector);
                            } else if (benefit) {
                                cta = structure(verb, keyword || action, benefit);
                            } else {
                                cta = structure(verb, keyword || action);
                            }
                        } catch (e) {
                            cta = `${verb} ${keyword || action}`;
                        }
                    } else {
                        cta = `${verb} ${keyword || action}`;
                    }

                    // Add tone-specific modifier occasionally
                    if (config.modifiers && Math.random() > 0.6) {
                        const modifier = pick(config.modifiers);
                        if (modifier) cta += ` ${modifier}`;
                    }
                    break;

                case 2: // Action-focused variant
                    if (finalActions.length > 0 || actionWords.length > 0) {
                        const actionVerb = pick([...finalActions, ...actionWords, verb]);
                        const target = pick([...finalKeywords, "today", "now"]);
                        cta = `${actionVerb} ${target}`;
                    } else {
                        cta = `${verb} ${keyword}`;
                    }

                    // Add call-to-action feel
                    if (toneKey === "direct" && Math.random() > 0.5) {
                        cta = `${cta} →`;
                    } else if (toneKey === "persuasive" && Math.random() > 0.5) {
                        cta = `${cta}!`;
                    }
                    break;

                case 3: // Benefit-focused variant
                    const prefix = toneKey === "persuasive" ?
                        pick(["get", "achieve", "unlock", "gain"]) :
                        toneKey === "soft" ?
                            pick(["discover", "find", "explore"]) :
                            pick(["start", "begin", "try"]);

                    if (finalKeywords.length > 1) {
                        const kw1 = pick(finalKeywords);
                        const kw2 = pick(finalKeywords.filter(k => k !== kw1));
                        cta = `${prefix} ${kw1} ${kw2}`;
                    } else {
                        cta = `${prefix} ${keyword || action}`;
                    }
                    break;
            }

            // Clean and format
            cta = cleanDuplicateSpaces(cta);
            cta = trimToLength(cta, lengthCfg.max);
            cta = capitalize(cta);

            // Add to results if valid and not empty
            if (cta && cta.length > 2) {
                results.add(cta);
            }
        }

        // Convert to array and join
        const ctaArray = Array.from(results);
        return ctaArray.length > 0 ? ctaArray.join(", ") : "";
    }

    // ==============================
    // GENERATE 3 OUTPUTS
    // ==============================

    // Output 1: Primary tone-specific CTAs
    const output1 = generateCTAs(tone, 1);

    // Output 2: Action-focused CTAs
    const output2 = generateCTAs(tone, 2);

    // Output 3: Benefit-focused CTAs
    const output3 = generateCTAs(tone, 3);

    return [output1, output2, output3].filter(o => o.length > 0);
};

// ==============================
// FALLBACK GENERIC GENERATOR
// ==============================

function generateGenericCTAs(tone, length) {
    const generic = {
        direct: ["Get Started", "Start Now", "Try It Today", "Click Here", "Join Now", "Go Now"],
        persuasive: ["Unlock Your Potential", "Transform Today", "Boost Your Success", "Achieve More", "Level Up Now", "Maximize Results"],
        soft: ["Discover More", "Learn Today", "Explore Now", "Find Your Way", "Begin Your Journey", "See How"]
    };

    const ctas = generic[tone] || generic.direct;

    // Trim based on length
    const lengthMap = { short: 2, medium: 4, long: 6 };
    const count = lengthMap[length] || 4;

    const selected = ctas.slice(0, count);

    return [
        selected.slice(0, 2).join(", "),
        selected.slice(2, 4).join(", "),
        selected.slice(4, 6).join(", ")
    ].filter(s => s.length > 0);
}
