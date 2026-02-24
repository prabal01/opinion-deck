import { VertexAI } from "@google-cloud/vertexai";

const project = process.env.GOOGLE_CLOUD_PROJECT || "redditkeeperprod";
const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

console.log(`[AI] Initializing Vertex AI... Project: ${project}, Location: ${location}`);

const vertexAI = new VertexAI({ project, location });

// Schema Definitions using Vertex AI format ('object', 'string', etc.)
const granularThreadInsightSchema: any = {
    type: 'object',
    properties: {
        thread_id: { type: 'string' },
        pain_points: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    quotes: { type: 'array', items: { type: 'string' } }
                },
                required: ["title", "quotes"]
            }
        },
        switch_triggers: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    quotes: { type: 'array', items: { type: 'string' } }
                },
                required: ["title", "quotes"]
            }
        },
        desired_outcomes: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    quotes: { type: 'array', items: { type: 'string' } }
                },
                required: ["title", "quotes"]
            }
        }
    },
    required: ["thread_id", "pain_points", "switch_triggers", "desired_outcomes"]
};

const responseSchema: any = {
    type: 'object',
    properties: {
        market_attack_summary: {
            type: 'object',
            properties: {
                core_frustration: { type: 'string' },
                primary_competitor_failure: { type: 'string' },
                immediate_opportunity: { type: 'string' },
                confidence_basis: {
                    type: 'object',
                    properties: {
                        threads_analyzed: { type: 'integer' },
                        total_complaint_mentions: { type: 'integer' }
                    },
                    required: ["threads_analyzed", "total_complaint_mentions"]
                }
            },
            required: ["core_frustration", "primary_competitor_failure", "immediate_opportunity", "confidence_basis"]
        },
        high_intensity_pain_points: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    mention_count: { type: 'integer' },
                    threads_covered: { type: 'integer' },
                    intensity: { type: 'string', enum: ["Low", "Medium", "High"] },
                    representative_quotes: { type: 'array', items: { type: 'string' } },
                    why_it_matters: { type: 'string' }
                },
                required: ["title", "mention_count", "threads_covered", "intensity", "representative_quotes", "why_it_matters"]
            }
        },
        switch_triggers: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    trigger: { type: 'string' },
                    evidence_mentions: { type: 'integer' },
                    representative_quotes: { type: 'array', items: { type: 'string' } },
                    strategic_implication: { type: 'string' }
                },
                required: ["trigger", "evidence_mentions", "representative_quotes", "strategic_implication"]
            }
        },
        feature_gaps: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    missing_or_weak_feature: { type: 'string' },
                    demand_signal_strength: { type: 'string', enum: ["Low", "Medium", "High"] },
                    mention_count: { type: 'integer' },
                    context_summary: { type: 'string' },
                    opportunity_level: { type: 'string', enum: ["Low", "Medium", "High"] }
                },
                required: ["missing_or_weak_feature", "demand_signal_strength", "mention_count", "context_summary", "opportunity_level"]
            }
        },
        competitive_weakness_map: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    competitor: { type: 'string' },
                    perceived_strength: { type: 'string' },
                    perceived_weakness: { type: 'string' },
                    exploit_opportunity: { type: 'string' }
                },
                required: ["competitor", "perceived_strength", "perceived_weakness", "exploit_opportunity"]
            }
        },
        ranked_build_priorities: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    priority_rank: { type: 'integer' },
                    initiative: { type: 'string' },
                    justification: { type: 'string' },
                    evidence_mentions: { type: 'integer' },
                    expected_impact: { type: 'string', enum: ["Low", "Medium", "High"] }
                },
                required: ["priority_rank", "initiative", "justification", "evidence_mentions", "expected_impact"]
            }
        },
        messaging_and_positioning_angles: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    angle: { type: 'string' },
                    supporting_emotional_driver: { type: 'string' },
                    supporting_evidence_quotes: { type: 'array', items: { type: 'string' } }
                },
                required: ["angle", "supporting_emotional_driver", "supporting_evidence_quotes"]
            }
        },
        risk_flags: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    risk: { type: 'string' },
                    evidence_basis: { type: 'string' }
                },
                required: ["risk", "evidence_basis"]
            }
        },
        analysis_metadata: {
            type: 'object',
            properties: {
                platform: { type: 'string' },
                competitor_analyzed: { type: 'string' },
                total_threads: { type: 'integer' },
                total_comments_analyzed: { type: 'integer' },
                analysis_depth: { type: 'string', enum: ["Lean", "Moderate", "Deep"] }
            },
            required: ["platform", "competitor_analyzed", "total_threads", "total_comments_analyzed", "analysis_depth"]
        },
        launch_velocity_90_days: {
            type: 'object',
            properties: {
                core_feature_to_ship: { type: 'string' },
                positioning_angle: { type: 'string' },
                target_segment: { type: 'string' },
                pricing_strategy: { type: 'string' },
                primary_differentiator: { type: 'string' }
            },
            required: ["core_feature_to_ship", "positioning_angle", "target_segment", "pricing_strategy", "primary_differentiator"]
        }
    },
    required: [
        "market_attack_summary", "high_intensity_pain_points", "switch_triggers",
        "feature_gaps", "competitive_weakness_map", "ranked_build_priorities",
        "messaging_and_positioning_angles", "risk_flags", "analysis_metadata",
        "launch_velocity_90_days"
    ]
};

const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
    }
});

const granularModel = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: granularThreadInsightSchema
    }
});

interface ThreadContext {
    id: string;
    title: string;
    subreddit: string;
    comments: any[];
}

// Helper to minify comments and save tokens
export function minifyComments(comments: any[], depth = 0): string {
    if (!comments || comments.length === 0) return "";

    return comments.map((c: any) => {
        const indent = "  ".repeat(depth);
        const header = `${indent}[ID:${c.id}] u/${c.author}:`;
        const body = c.body ? c.body.replace(/\n/g, " ") : "[deleted]";
        const replies = c.replies ? "\n" + minifyComments(c.replies, depth + 1) : "";
        return `${header} ${body}${replies}`;
    }).join("\n");
}

export async function analyzeThreads(threads: ThreadContext[], context?: string, totalComments: number = 0) {
    const threadData = threads.map(t => ({
        title: t.title,
        subreddit: t.subreddit,
        id: t.id,
        content: minifyComments(t.comments)
    }));

    const systemPrompt = `
You are a competitive intelligence analyst.
Your job is to transform raw customer discussion threads into a strategic competitive advantage blueprint.

You must return a JSON object that EXACTLY follows this structure:
{
  "market_attack_summary": {
    "core_frustration": "string",
    "primary_competitor_failure": "string",
    "immediate_opportunity": "string",
    "confidence_basis": { "threads_analyzed": number, "total_complaint_mentions": number }
  },
  "high_intensity_pain_points": [],
  "switch_triggers": [],
  "feature_gaps": [],
  "competitive_weakness_map": [],
  "ranked_build_priorities": [],
  "messaging_and_positioning_angles": [],
  "risk_flags": [],
  "analysis_metadata": { "platform": "Reddit", "competitor_analyzed": "${context || 'Unknown'}", "total_threads": ${threads.length}, "total_comments_analyzed": ${totalComments}, "analysis_depth": "Deep" },
  "launch_velocity_90_days": {
    "core_feature_to_ship": "string",
    "positioning_angle": "string",
    "target_segment": "string",
    "pricing_strategy": "string",
    "primary_differentiator": "string"
  }
}

You are extracting:
- Emotional pain -> high_intensity_pain_points
- Repeated complaints -> market_attack_summary.total_complaint_mentions
- Switching triggers -> switch_triggers
- Feature gaps -> feature_gaps
- Strategic opportunities -> immediate_opportunity
- Launch roadmap -> launch_velocity_90_days (Actionable, tactical 90-day strike plan)
- Messaging leverage -> messaging_and_positioning_angles

You must ONLY use the provided threads as evidence.
Quotes must be copied verbatim.
Keep language strategic, decisive, and actionable.

INPUT
Competitor Name: ${context || "Unknown"}
Platform: Reddit
Total Threads Provided: ${threads.length}

Thread Data:
${threadData.map(t => `--- THREAD START ---\nTitle: ${t.title}\nSubreddit: r/${t.subreddit}\n${t.content}\n--- THREAD END ---`).join("\n\n")}
`;

    try {
        console.log(`[AI] Calling Vertex AI with ${threads.length} threads...`);
        const result = await model.generateContent(systemPrompt);
        const response = result.response;

        // Vertex AI SDK response format
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("No response from Vertex AI");

        console.log("[AI] Raw Response received. Parsing JSON...");
        const parsed = JSON.parse(text);

        // Defensive check
        if (!parsed.market_attack_summary) {
            parsed.market_attack_summary = {
                core_frustration: "Data unavailable",
                primary_competitor_failure: "Data unavailable",
                immediate_opportunity: "Data unavailable",
                confidence_basis: { threads_analyzed: threads.length, total_complaint_mentions: 0 }
            };
        }

        // Backward compatibility mapping
        parsed.executive_summary = parsed.market_attack_summary.core_frustration + "\n\n" + parsed.market_attack_summary.immediate_opportunity;

        return {
            analysis: parsed,
            usage: response.usageMetadata
        };
    } catch (error) {
        console.error("Vertex AI Analysis Error:", error);
        throw error;
    }
}

export async function analyzeThreadGranular(thread: ThreadContext) {
    const threadContent = minifyComments(thread.comments);

    const systemPrompt = `
You are a competitive intelligence analyst.
Your job is to transform a SINGLE raw customer discussion thread into highly granular, structured intent signals.

Return a JSON object that EXACTLY follows this structure:
{
  "thread_id": "${thread.id}",
  "pain_points": [
    {
      "title": "string (lowercase, concrete, no adjectives, problem-focused, max 6 words)",
      "quotes": ["string (verbatim)"]
    }
  ],
  "switch_triggers": [
    {
      "title": "string (lowercase, concrete, situational, max 6 words)",
      "quotes": ["string (verbatim)"]
    }
  ],
  "desired_outcomes": [
    {
      "title": "string (lowercase, result-oriented, max 6 words)",
      "quotes": ["string (verbatim)"]
    }
  ]
}

STRICT CONSTRAINTS:
1. TITLES: Must be lowercase, concrete, max 6 words. No adjectives. No ranking.
2. QUOTES: Must be 100% verbatim from the text.
3. NO SPECULATION: If a signal is not explicitly present, return an empty array for that category.
4. CONCRETE: Focused on the specific problem described.

INPUT:
Thread Title: ${thread.title}
Subreddit: r/${thread.subreddit}

Thread Data:
${threadContent}
`;

    try {
        console.log(`[AI] [GRANULAR] Analyzing thread ${thread.id} via Vertex AI...`);
        const result = await granularModel.generateContent(systemPrompt);
        const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("No response from Vertex AI");
        return JSON.parse(text);
    } catch (error) {
        console.error(`[AI] [GRANULAR] Error analyzing thread ${thread.id}:`, error);
        throw error;
    }
}
