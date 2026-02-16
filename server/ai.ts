
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SchemaType } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini 1.5 Flash (high context, fast, free tier friendly)
const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
                executive_summary: { type: SchemaType.STRING },
                themes: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: { type: SchemaType.STRING },
                            description: { type: SchemaType.STRING },
                            confidence: { type: SchemaType.INTEGER },
                            sentiment: { type: SchemaType.STRING, enum: ["Positive", "Neutral", "Negative"], format: "enum" },
                            citations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["title", "description", "confidence", "sentiment", "citations"]
                    }
                },
                feature_requests: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            feature: { type: SchemaType.STRING },
                            frequency: { type: SchemaType.STRING, enum: ["High", "Medium", "Low"], format: "enum" },
                            context: { type: SchemaType.STRING }
                        },
                        required: ["feature", "frequency", "context"]
                    }
                },
                pain_points: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            issue: { type: SchemaType.STRING },
                            severity: { type: SchemaType.STRING, enum: ["Critical", "Major", "Minor"], format: "enum" },
                            description: { type: SchemaType.STRING }
                        },
                        required: ["issue", "severity", "description"]
                    }
                },
                sentiment_breakdown: {
                    type: SchemaType.OBJECT,
                    properties: {
                        positive: { type: SchemaType.INTEGER },
                        neutral: { type: SchemaType.INTEGER },
                        negative: { type: SchemaType.INTEGER }
                    },
                    required: ["positive", "neutral", "negative"]
                },
                // New Fields for Competitor/Research Intelligence
                quality_score: { type: SchemaType.INTEGER, description: "0-100 score of how valuable this research data is" },
                relevance_explanation: { type: SchemaType.STRING },
                buying_intent_signals: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            signal: { type: SchemaType.STRING },
                            context: { type: SchemaType.STRING },
                            confidence: { type: SchemaType.STRING, enum: ["High", "Medium", "Low"], format: "enum" }
                        },
                        required: ["signal", "context", "confidence"]
                    }
                },
                engagement_opportunities: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            thread_id: { type: SchemaType.STRING },
                            reason: { type: SchemaType.STRING },
                            talking_points: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["thread_id", "reason", "talking_points"]
                    }
                }
            },
            required: [
                "executive_summary", "themes", "feature_requests",
                "pain_points", "sentiment_breakdown",
                "quality_score", "relevance_explanation",
                "buying_intent_signals", "engagement_opportunities"
            ]
        }
    }
});

interface ThreadContext {
    id: string;
    title: string;
    subreddit: string;
    comments: any[]; // Full comment tree
}

// Helper to minify comments and save tokens
function minifyComments(comments: any[], depth = 0): string {
    if (!comments || comments.length === 0) return "";

    return comments.map((c: any) => {
        const indent = "  ".repeat(depth);
        const header = `${indent}[ID:${c.id}] u/${c.author}:`;
        const body = c.body ? c.body.replace(/\n/g, " ") : "[deleted]";
        const replies = c.replies ? "\n" + minifyComments(c.replies, depth + 1) : "";
        return `${header} ${body}${replies}`;
    }).join("\n");
}

export async function analyzeThreads(threads: ThreadContext[], context?: string): Promise<any> {
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const systemPrompt = `
You are a Strategic Market Researcher and Data Analyst. Your job is to analyze this collection of Reddit threads to extract actionable insights, recurring themes, user sentiment, and business opportunities.

**Context:** ${context || "General market research"}
    
**Analysis Goals:**
1. **Analyze Quality**: Score the research value (0-100) based on detail, relevance to the context, and insight depth.
2. **Identify Signals**: Find specific "Buying Intent" signals (people looking for solutions, expressing willingness to pay).
3. **Spot Opportunities**: Identify threads where engagement (replying) would be valuable.
4. **Extract Themes**: Identify top recurring themes and feature requests with specific citation IDs.
5. **Assess Sentiment**: Calculate overall sentiment breakdown.

**Data Handling:**
- You are provided with a minified text representation of threads.
- READ EVERYTHING. Do not hallucinate.
- Use the provided 'ID:xyz' format in comments for citations.
`;

    const contextParts = threads.map(t => {
        return `
--- THREAD START ---
ID: ${t.id}
Subreddit: r/${t.subreddit}
Title: ${t.title}

${minifyComments(t.comments)}
--- THREAD END ---
`;
    }).join("\n\n");

    // Retry Logic with Exponential Backoff
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 2000; // Start with 2 seconds

    while (attempts < maxAttempts) {
        try {
            const result = await model.generateContent([
                systemPrompt,
                "Here is the data to analyze:",
                contextParts
            ]);
            return result.response.text();
        } catch (err: any) {
            attempts++;
            const isOverloaded = err.message?.includes("503") || err.message?.includes("Overloaded");
            const isRateLimit = err.message?.includes("429");

            if ((isOverloaded || isRateLimit) && attempts < maxAttempts) {
                console.warn(`[AI] Attempt ${attempts} failed (${err.message}). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff (2s -> 4s -> 8s)
            } else {
                throw err; // Fatal error or max attempts reached
            }
        }
    }
}
