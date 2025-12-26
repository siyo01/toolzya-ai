// ======================================================
// ToolzyAI — Enhanced Caption Generator (Rule-based)
// Version 2.0 - Powerful, Flexible, High-Quality Output
// ======================================================

window.ToolzyEngines = window.ToolzyEngines || {};

window.ToolzyEngines.caption = function ({
    input,
    tone = "formal",
    length = "medium",
}) {
    if (!input || typeof input !== 'string') return [];

    // ============================================
    // CONFIGURATION & VOCABULARY LIBRARIES
    // ============================================

    const STOPWORDS = new Set([
        "for", "with", "and", "in", "on", "to", "of", "that", "who", "which",
        "a", "an", "the", "is", "are", "was", "were", "from", "by", "as",
        "at", "be", "this", "it", "or", "but", "not", "have", "has", "had"
    ]);

    // Enhanced vocabulary libraries
    const VOCABULARY = {
        actionVerbs: [
            "discover", "explore", "unlock", "embrace", "create", "craft",
            "build", "design", "inspire", "transform", "elevate", "amplify",
            "capture", "unleash", "ignite", "cultivate", "showcase", "celebrate",
            "reimagine", "revolutionize", "empower", "enhance", "master", "perfect"
        ],
        descriptiveAdj: [
            "innovative", "dynamic", "authentic", "creative", "vibrant", "bold",
            "elegant", "modern", "timeless", "unique", "powerful", "stunning",
            "remarkable", "extraordinary", "exceptional", "inspiring", "captivating",
            "mesmerizing", "breathtaking", "incredible", "outstanding", "magnificent"
        ],
        emotions: [
            "passion", "energy", "joy", "excitement", "wonder", "inspiration",
            "creativity", "innovation", "excellence", "brilliance", "magic",
            "adventure", "discovery", "beauty", "harmony", "vision"
        ],
        connectors: [
            "that brings", "where", "with", "through", "featuring", "showcasing",
            "highlighting", "celebrating", "embracing", "combining", "blending",
            "uniting", "merging", "reflecting", "expressing", "embodying"
        ],
        hashtags: [
            "lifestyle", "inspiration", "creative", "authentic", "mindful",
            "passionate", "innovative", "visionary", "artistic", "cultural"
        ]
    };

    // Tone-specific configurations
    const TONE_CONFIG = {
        formal: {
            starters: [
                "Presenting", "Introducing", "Showcasing", "Highlighting",
                "Exploring", "Examining", "Demonstrating", "Revealing",
                "Unveiling", "Establishing", "Illustrating", "Defining",
                "Articulating", "Presenting a comprehensive look at",
                "Delivering insights into", "Providing a detailed view of",
                "Offering an in-depth exploration of", "Establishing excellence in"
            ],
            transitions: [
                "characterized by", "distinguished through", "defined by",
                "marked by excellence in", "representing", "embodying",
                "reflecting the essence of", "demonstrating mastery in",
                "showcasing professional", "highlighting sophisticated"
            ],
            closers: [
                "with precision and purpose", "in today's dynamic landscape",
                "for the discerning audience", "with meticulous attention to detail",
                "delivering exceptional value", "setting new industry standards",
                "with unwavering commitment to excellence", "through strategic innovation",
                "maintaining the highest standards", "with professional integrity"
            ],
            modifiers: ["professional", "sophisticated", "refined", "distinguished", "premier"]
        },
        friendly: {
            starters: [
                "Bringing you", "Sharing", "Enjoying", "Loving", "Exploring together",
                "Diving into", "Let's talk about", "Getting cozy with", "Vibing with",
                "Excited to share", "Can't wait to show you", "Here's something special",
                "Ready to explore", "Join me in discovering", "Let's celebrate",
                "Feeling grateful for", "Having fun with", "Embracing the magic of"
            ],
            transitions: [
                "that makes me smile", "bringing good vibes", "with so much love",
                "creating happy moments", "spreading positivity through",
                "connecting us with", "sharing the joy of", "celebrating together",
                "making memories with", "finding beauty in", "cherishing"
            ],
            closers: [
                "one moment at a time", "with all the good vibes", "together always",
                "because life is beautiful", "making every day special",
                "spreading love and light", "in this amazing journey",
                "with gratitude and joy", "keeping it real and authentic",
                "sharing the love", "living our best life"
            ],
            modifiers: ["amazing", "wonderful", "lovely", "delightful", "awesome"]
        },
        professional: {
            starters: [
                "Built around", "Crafted for", "Designed with", "Focused on",
                "Engineered to deliver", "Strategically positioned for",
                "Optimized for", "Tailored to meet", "Developed with expertise in",
                "Committed to excellence in", "Delivering results through",
                "Driving innovation in", "Transforming", "Revolutionizing",
                "Empowering success through", "Creating impact with", "Leading the way in"
            ],
            transitions: [
                "leveraging cutting-edge", "utilizing industry-leading",
                "implementing best practices in", "maximizing potential through",
                "fostering growth via", "driving measurable results in",
                "optimizing performance through", "establishing leadership in",
                "building competitive advantage with", "accelerating success through"
            ],
            closers: [
                "for sustainable growth", "delivering ROI and impact",
                "with data-driven strategies", "for market leadership",
                "ensuring competitive advantage", "with proven methodologies",
                "driving business transformation", "for long-term success",
                "with measurable outcomes", "building lasting partnerships"
            ],
            modifiers: ["strategic", "innovative", "results-driven", "scalable", "cutting-edge"]
        }
    };

    // ============================================
    // INPUT PROCESSING & ANALYSIS
    // ============================================

    function analyzeInput(text) {
        const analysis = {
            isQuestion: /\?/.test(text),
            hasHashtags: /#/.test(text),
            hasEmojis: /[\u{1F300}-\u{1F9FF}]/u.test(text),
            isShortForm: text.split(/\s+/).length <= 5,
            sentiment: 'neutral'
        };

        // Basic sentiment detection
        const positiveWords = /love|great|amazing|wonderful|best|happy|beautiful|awesome|excellent/i;
        const negativeWords = /bad|poor|worst|hate|terrible|awful/i;

        if (positiveWords.test(text)) analysis.sentiment = 'positive';
        if (negativeWords.test(text)) analysis.sentiment = 'negative';

        return analysis;
    }

    // Clean and tokenize input
    function processInput(text) {
        // Remove excessive special chars but keep meaningful ones
        let cleaned = text
            .toLowerCase()
            .replace(/[^\w\s#@-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Extract hashtags separately
        const hashtags = (text.match(/#\w+/g) || [])
            .map(tag => tag.substring(1).toLowerCase());

        return { cleaned, hashtags };
    }

    // Extract meaningful phrases (2-gram and 3-gram)
    function extractPhrases(words) {
        const phrases = {
            bigrams: [],
            trigrams: [],
            keywords: []
        };

        // Extract bigrams
        for (let i = 0; i < words.length - 1; i++) {
            if (!STOPWORDS.has(words[i]) || !STOPWORDS.has(words[i + 1])) {
                phrases.bigrams.push(words[i] + " " + words[i + 1]);
            }
        }

        // Extract trigrams
        for (let i = 0; i < words.length - 2; i++) {
            phrases.trigrams.push(words[i] + " " + words[i + 1] + " " + words[i + 2]);
        }

        // Extract keywords (non-stopwords)
        phrases.keywords = words.filter(w =>
            w.length >= 3 && !STOPWORDS.has(w)
        );

        return phrases;
    }

    // Score and rank phrases by importance
    function rankPhrases(phrases, allWords) {
        const scored = phrases.map(phrase => {
            let score = phrase.split(' ').length; // Prefer longer phrases

            // Boost score if contains multiple non-stopwords
            const words = phrase.split(' ');
            const meaningfulWords = words.filter(w => !STOPWORDS.has(w));
            score += meaningfulWords.length * 2;

            return { phrase, score };
        });

        return scored
            .sort((a, b) => b.score - a.score)
            .map(item => item.phrase);
    }

    // ============================================
    // CONTENT GENERATION HELPERS
    // ============================================

    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function randomSubset(arr, count) {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, arr.length));
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getTopic(phrases, keywords) {
        // Prefer trigrams, then bigrams, then keywords
        if (phrases.trigrams.length && Math.random() > 0.5) {
            return random(phrases.trigrams);
        }
        if (phrases.bigrams.length && Math.random() > 0.3) {
            return random(phrases.bigrams);
        }
        if (keywords.length) {
            return random(keywords);
        }
        return random(phrases.keywords || ['inspiration', 'creativity']);
    }

    function getTopicPair(phrases, keywords) {
        const topic1 = getTopic(phrases, keywords);
        const topic2 = getTopic(phrases, keywords);

        if (topic1 === topic2) return topic1;

        // Avoid repetitive combinations
        if (Math.random() > 0.5 && random(VOCABULARY.connectors)) {
            return `${topic1} ${random(VOCABULARY.connectors)} ${topic2}`;
        }

        return `${topic1} and ${topic2}`;
    }

    function enhanceWithVocabulary(baseTopic, config) {
        const enhancements = [
            `${random(config.modifiers)} ${baseTopic}`,
            `${baseTopic} with ${random(VOCABULARY.emotions)}`,
            `${random(VOCABULARY.actionVerbs)} ${baseTopic}`,
            `${random(VOCABULARY.descriptiveAdj)} ${baseTopic}`,
            baseTopic
        ];

        return random(enhancements);
    }

    // ============================================
    // CAPTION BUILDERS BY STYLE
    // ============================================

    function buildDescriptiveCaptionStyle(phrases, keywords, config, targetWords) {
        // Style 1: Descriptive & Engaging
        let parts = [];

        // Opening statement
        const opener = capitalize(random(config.starters));
        const mainTopic = enhanceWithVocabulary(getTopic(phrases, keywords), config);
        parts.push(`${opener} ${mainTopic}`);

        // Middle elaboration (for medium/long)
        if (targetWords > 20) {
            const detail = getTopic(phrases, keywords);
            const transition = random(config.transitions);
            parts.push(`${transition} ${detail}`);
        }

        // Add emotional/descriptive element
        if (targetWords > 35) {
            const emotion = random(VOCABULARY.emotions);
            const adj = random(VOCABULARY.descriptiveAdj);
            parts.push(`A ${adj} blend of ${emotion} and creativity`);
        }

        // Closing
        if (Math.random() > 0.3) {
            parts.push(random(config.closers));
        }

        return parts.join('. ') + '.';
    }

    function buildActionOrientedStyle(phrases, keywords, config, targetWords) {
        // Style 2: Action-Oriented & Engaging
        let parts = [];

        // Action-driven opening
        const verb = random(VOCABULARY.actionVerbs);
        const topic = getTopic(phrases, keywords);
        parts.push(capitalize(`${verb} ${topic}`));

        // Add descriptive layer
        if (targetWords > 20) {
            const adj = random(VOCABULARY.descriptiveAdj);
            const detail = getTopic(phrases, keywords);
            parts.push(`Experience ${adj} ${detail}`);
        }

        // Call to action or benefit (for medium/long)
        if (targetWords > 35) {
            const connector = random(VOCABULARY.connectors);
            const emotion = random(VOCABULARY.emotions);
            parts.push(`${capitalize(connector)} pure ${emotion} to life`);
        }

        // Strong closer
        parts.push(random(config.closers));

        return parts.join('. ') + '.';
    }

    function buildInspirationalStyle(phrases, keywords, config, targetWords) {
        // Style 3: Inspirational & Storytelling
        let parts = [];

        // Inspirational opening
        const topic = getTopicPair(phrases, keywords);
        parts.push(capitalize(`${random(config.starters)} the art of ${topic}`));

        // Narrative element
        if (targetWords > 20) {
            const adj = random(VOCABULARY.descriptiveAdj);
            const emotion = random(VOCABULARY.emotions);
            parts.push(`Where ${adj} ${emotion} meets innovation`);
        }

        // Vision/aspiration (for medium/long)
        if (targetWords > 35) {
            const verb = random(VOCABULARY.actionVerbs);
            const detail = getTopic(phrases, keywords);
            parts.push(`${capitalize(verb)}ing new perspectives through ${detail}`);
        }

        // Inspirational close
        const emotion = random(VOCABULARY.emotions);
        parts.push(`Powered by ${emotion} and purpose`);

        return parts.join('. ') + '.';
    }

    // ============================================
    // LENGTH MANAGEMENT
    // ============================================

    function adjustToTargetLength(text, targetMin, targetMax) {
        const words = text.split(/\s+/);
        const currentLength = words.length;

        if (currentLength >= targetMin && currentLength <= targetMax) {
            return text;
        }

        if (currentLength > targetMax) {
            // Trim to target
            const sentences = text.split('. ');
            let result = '';
            let wordCount = 0;

            for (const sentence of sentences) {
                const sentenceWords = sentence.split(/\s+/).length;
                if (wordCount + sentenceWords <= targetMax) {
                    result += (result ? '. ' : '') + sentence;
                    wordCount += sentenceWords;
                } else {
                    break;
                }
            }

            return result + (result.endsWith('.') ? '' : '.');
        }

        return text; // If too short, return as is (builder should handle)
    }

    // ============================================
    // MAIN GENERATION LOGIC
    // ============================================

    const inputAnalysis = analyzeInput(input);
    const { cleaned, hashtags } = processInput(input);

    // Tokenize
    const words = cleaned.split(/\s+/).filter(w => w.length >= 2);

    if (words.length === 0) {
        return [
            "Share your creative vision with the world.",
            "Express yourself authentically and inspire others.",
            "Craft moments that matter and tell your story."
        ];
    }

    // Extract and rank phrases
    const phrases = extractPhrases(words);
    phrases.bigrams = rankPhrases(phrases.bigrams, words).slice(0, 10);
    phrases.trigrams = rankPhrases(phrases.trigrams, words).slice(0, 8);

    // Get tone configuration
    const config = TONE_CONFIG[tone] || TONE_CONFIG.formal;

    // Define length targets (in words)
    const lengthTargets = {
        short: { min: 15, max: 25, target: 20 },
        medium: { min: 30, max: 50, target: 40 },
        long: { min: 55, max: 80, target: 65 }
    };

    const targets = lengthTargets[length] || lengthTargets.medium;

    // ============================================
    // GENERATE 3 DISTINCT OUTPUTS
    // ============================================

    function generateUniqueCaption(styleBuilder, attempts = 50) {
        const generated = new Set();

        for (let i = 0; i < attempts; i++) {
            const caption = styleBuilder(phrases, phrases.keywords, config, targets.target);
            const adjusted = adjustToTargetLength(caption, targets.min, targets.max);

            if (adjusted && !generated.has(adjusted)) {
                generated.add(adjusted);
                if (generated.size >= 3) break;
            }
        }

        return Array.from(generated);
    }

    // Output 1: Descriptive & Engaging (3 variations)
    const output1Captions = generateUniqueCaption(buildDescriptiveCaptionStyle);
    const output1 = output1Captions.join('\n\n') ||
        "Exploring creative possibilities with authentic expression. Discover unique perspectives that inspire.";

    // Output 2: Action-Oriented (3 variations)
    const output2Captions = generateUniqueCaption(buildActionOrientedStyle);
    const output2 = output2Captions.join('\n\n') ||
        "Unlock your creative potential and transform ideas into reality. Experience innovation that drives impact.";

    // Output 3: Inspirational & Storytelling (3 variations)
    const output3Captions = generateUniqueCaption(buildInspirationalStyle);
    const output3 = output3Captions.join('\n\n') ||
        "Celebrating the art of authentic self-expression. Where passion meets purpose in every moment.";

    return [output1, output2, output3];
};

// ============================================
// QUALITY ASSURANCE & VALIDATION
// ============================================

// Optional: Add validation function for testing
window.ToolzyEngines.validateCaption = function (caption) {
    if (!caption || typeof caption !== 'string') return false;

    const wordCount = caption.split(/\s+/).length;
    const hasProperEnding = caption.trim().endsWith('.');
    const notTooRepetitive = !/([\w\s]{10,})\1{2,}/.test(caption);

    return wordCount >= 10 && hasProperEnding && notTooRepetitive;
};
