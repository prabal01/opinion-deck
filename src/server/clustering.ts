
import { getEmbeddings, arbitrateSimilarity } from "./ai.js";
import { saveAggregatedInsights, updateUserAicost } from "./firestore.js";
import { ClusterLogger } from "./utils/logger.js";

// GEMINI FLASH PRICING (Estimated)
const PRICE_PER_1M_INPUT_TOKENS = 0.0375;
const PRICE_PER_1M_OUTPUT_TOKENS = 0.15;
// VERTEX AI TEXT-EMBEDDING-004 PRICING
const PRICE_PER_1K_CHARACTERS_EMBEDDING = 0.000025;

interface Insight {
    title: string;
    quotes: string[];
    thread_id: string;
}

interface Cluster {
    canonicalTitle: string;
    rawInsights: Insight[];
    embedding?: number[];
    intensityScore: number;
    threadCount: number;
    mentionCount: number;
    category: "pain_point" | "switch_trigger" | "desired_outcome";
}

export class ClusterEngine {
    private thresholdMerge = 0.70;
    private thresholdArbitrate = 0.50;

    constructor(private folderId: string, private uid: string) { }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magA * magB);
    }

    async aggregate(insights: Insight[], category: "pain_point" | "switch_trigger" | "desired_outcome"): Promise<Cluster[]> {
        const logger = new ClusterLogger(this.folderId);
        logger.log(`Starting ${category} aggregation for ${insights.length} insights...`);

        if (insights.length === 0) {
            logger.close();
            return [];
        }

        // 1. Generate Embeddings
        const titles = insights.map(i => i.title);
        const embeddingsResponse = await getEmbeddings(titles);

        // Track Embedding Cost
        const embeddingCost = (embeddingsResponse.billableCharacters / 1000) * PRICE_PER_1K_CHARACTERS_EMBEDDING;
        await updateUserAicost(this.uid, {
            totalAiCost: embeddingCost
        });
        logger.log(`Generated embeddings for ${titles.length} items. Estimated cost: $${embeddingCost.toFixed(6)}`);

        // Map embeddings back to insights
        const insightsWithEmbeddings = insights.map((insight, idx) => ({
            ...insight,
            embedding: embeddingsResponse.embeddings[idx].values
        }));

        const clusters: Cluster[] = [];

        // 2. Clustering Loop
        for (const insight of insightsWithEmbeddings) {
            let matched = false;

            for (const cluster of clusters) {
                const similarity = this.cosineSimilarity(insight.embedding, cluster.embedding!);
                // Only log highish similarities to avoid spam
                if (similarity > 0.5) {
                    logger.log(`Similarity: ${(similarity * 100).toFixed(1)}% between '${insight.title}' and '${cluster.canonicalTitle}'`);
                }

                if (similarity >= this.thresholdMerge) {
                    logger.log(`-> Auto-Merged '${insight.title}' into '${cluster.canonicalTitle}'`);
                    cluster.rawInsights.push(insight);
                    matched = true;
                    break;
                } else if (similarity >= this.thresholdArbitrate) {
                    const arbitration = await arbitrateSimilarity(cluster.canonicalTitle, insight.title);

                    logger.log(`Arbitration ('${insight.title}' vs '${cluster.canonicalTitle}'): areSame=${arbitration.areSame}`);

                    // Track Arbitration Tokens & Cost
                    if (arbitration.usage) {
                        const cost = this.calculateCost(arbitration.usage);
                        await updateUserAicost(this.uid, {
                            totalInputTokens: arbitration.usage.promptTokenCount,
                            totalOutputTokens: arbitration.usage.candidatesTokenCount,
                            totalAiCost: cost
                        });
                    }

                    if (arbitration.areSame) {
                        cluster.rawInsights.push(insight);
                        cluster.canonicalTitle = arbitration.canonicalTitle; // Update to best title
                        matched = true;
                        break;
                    }
                }
            }

            if (!matched) {
                logger.log(`Created new cluster: '${insight.title}'`);
                clusters.push({
                    canonicalTitle: insight.title,
                    rawInsights: [insight],
                    embedding: insight.embedding,
                    intensityScore: 0,
                    threadCount: 0,
                    mentionCount: 0,
                    category
                });
            }
        }

        // 3. Finalize Clusters
        const finalClusters = clusters.map(cluster => {
            const uniqueThreads = new Set(cluster.rawInsights.map(ri => ri.thread_id));
            const totalMentions = cluster.rawInsights.length;

            // Heuristic for Intensity: (Mentions * 0.7) + (Threads * 0.3)
            // Normalized to 1-10 scale? Let's just store raw for now.
            cluster.threadCount = uniqueThreads.size;
            cluster.mentionCount = totalMentions;
            cluster.intensityScore = totalMentions; // Simplest version

            return cluster;
        });

        logger.log(`Completed ${category}. Created ${finalClusters.length} clusters from ${insights.length} signals.`);
        logger.close();
        return finalClusters;
    }

    private calculateCost(usage: any) {
        const inputCost = (usage.promptTokenCount / 1000000) * PRICE_PER_1M_INPUT_TOKENS;
        const outputCost = (usage.candidatesTokenCount / 1000000) * PRICE_PER_1M_OUTPUT_TOKENS;
        return inputCost + outputCost;
    }
}
