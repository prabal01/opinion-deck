import fetch from 'node-fetch';
import { redis } from './middleware/rateLimiter.js';

export interface RedditMetadata {
    id: string;
    title: string;
    subreddit: string;
    ups: number;
    num_comments: number;
    created_utc: number;
    url: string;
    description?: string;
}

export class RedditDiscoveryService {
    private static lastRequestTime = 0;
    private static MIN_REQUEST_INTERVAL = 1000; // 1 request per second

    /**
     * Ensures we respect the 1 req/sec rate limit globally across this instance.
     */
    private static async waitIfNecessary() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastRequestTime = Date.now();
    }

    /**
     * Fetches metadata for a single Reddit thread, with caching and rate-limiting.
     */
    static async getThreadMetadata(url: string): Promise<RedditMetadata | null> {
        const threadId = this.extractIdFromUrl(url);
        if (!threadId) return null;

        const cacheKey = `reddit_meta:${threadId}`;

        // 1. Check Cache (Redis)
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                console.log(`[RedditService] [CACHE_HIT] ${url}`);
                return JSON.parse(cached);
            }
        } catch (err) {
            console.error(`[RedditService] [CACHE_ERR] Redis read failed:`, err);
        }

        // 2. Fetch from Reddit (.json method)
        await this.waitIfNecessary();

        try {
            const jsonUrl = url.endsWith('/') ? `${url.slice(0, -1)}.json` : `${url}.json`;
            console.log(`[RedditService] [API_CALL] Fetching metadata: ${jsonUrl}`);
            const response = await fetch(jsonUrl, {
                headers: { 'User-Agent': 'OpinionDeck-Discovery/1.0.0' }
            });
            console.log(`[RedditService] [RESPONSE] Status: ${response.status} for ${jsonUrl}`);

            if (response.status === 429) {
                console.warn(`[RedditService] Rate limited for ${url}. Backing off...`);
                return null;
            }

            if (!response.ok) return null;

            const data: any = await response.json();
            const post = data[0]?.data?.children[0]?.data;
            if (!post) return null;

            const metadata: RedditMetadata = {
                id: post.id,
                title: post.title,
                subreddit: post.subreddit,
                ups: post.ups,
                num_comments: post.num_comments,
                created_utc: post.created_utc,
                url: `https://www.reddit.com${post.permalink}`,
                description: post.selftext
            };

            // 3. Save to Cache (Redis - 1 Hour TTL)
            try {
                await redis.set(cacheKey, JSON.stringify(metadata), 'EX', 3600);
                console.log(`[RedditService] [CACHE_SET] ${url} (TTL: 1h)`);
            } catch (err) {
                console.error(`[RedditService] [CACHE_ERR] Redis set failed:`, err);
            }

            return metadata;
        } catch (error) {
            console.error(`[RedditService] Error fetching metadata for ${url}:`, error);
            return null;
        }
    }

    /**
     * Fetches a full thread (post + comments) with limits and optimized extraction.
     */
    static async fetchFullThreadRecord(url: string, commentLimit = 500): Promise<any | null> {
        await this.waitIfNecessary();
        try {
            const jsonWithoutTrailing = url.replace(/\/$/, "");
            const jsonUrl = `${jsonWithoutTrailing}.json?limit=${commentLimit}`;

            console.log(`[RedditService] [SYNC_FETCH] Fetching full thread: ${jsonUrl}`);
            const response = await fetch(jsonUrl, {
                headers: { 'User-Agent': 'OpinionDeck-Discovery/1.0.0' }
            });
            if (!response.ok) return null;

            const data: any = await response.json();
            const postData = data[0]?.data?.children[0]?.data;
            if (!postData) return null;

            // Extract essential post info
            const post = {
                id: postData.fullname || `t3_${postData.id}`,
                title: postData.title,
                author: postData.author,
                subreddit: postData.subreddit,
                ups: postData.ups,
                num_comments: postData.num_comments,
                permalink: postData.permalink,
                selftext: postData.selftext,
                created_utc: postData.created_utc
            };

            // Recursive comment flattener
            const flattenedComments: any[] = [];
            const processComments = (commentList: any[]) => {
                for (const child of commentList) {
                    if (child.kind === 't1' && flattenedComments.length < commentLimit) {
                        const c = child.data;
                        flattenedComments.push({
                            id: c.id,
                            author: c.author,
                            body: c.body,
                            ups: c.ups,
                            parent_id: c.parent_id,
                            created_utc: c.created_utc
                        });
                        if (c.replies && c.replies.data && c.replies.data.children) {
                            processComments(c.replies.data.children);
                        }
                    }
                }
            };

            if (data[1] && data[1].data && data[1].data.children) {
                processComments(data[1].data.children);
            }

            return {
                post,
                comments: flattenedComments,
                source: 'reddit',
                fetchedAt: new Date().toISOString()
            };
        } catch (err) {
            console.error(`[RedditService] Failed to fetch full thread record for ${url}:`, err);
            return null;
        }
    }

    private static extractIdFromUrl(url: string): string | null {
        const match = url.match(/comments\/([a-z0-9]+)/);
        return match ? match[1] : null;
    }

    /**
     * Checks if a list of URLs are already present in the metadata cache.
     */
    static async checkMetadataCacheStatus(results: any[]): Promise<any[]> {
        return Promise.all(results.map(async (r) => {
            const threadId = this.extractIdFromUrl(r.url);
            if (!threadId) return { ...r, isCached: false };

            const cacheKey = `reddit_meta:${threadId}`;
            try {
                const exists = await redis.exists(cacheKey);
                return { ...r, isCached: exists === 1 };
            } catch (err) {
                return { ...r, isCached: false };
            }
        }));
    }

    /**
     * Implements the specialized Discovery algorithm from relevance-rd.ts
     */
    static async deepDiscovery(competitor: string): Promise<any> {
        // Clean competitor string in case user appended operators (like in server.ts workaround)
        const cleanCompetitor = competitor
            .replace(/site:reddit\.com/gi, '')
            .replace(/frustating/gi, '') // user's typo fix
            .trim();

        const cacheKey = `discovery_results:${cleanCompetitor.toLowerCase()}`;

        // 1. Check Global Search Cache
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                console.log(`[RedditService] [DEEP_CACHE_HIT] ${cleanCompetitor}`);
                const parsed = JSON.parse(cached);
                // Re-check individual thread cache status for fresh plan
                const enriched = await this.checkMetadataCacheStatus(parsed);
                return {
                    results: enriched,
                    isFromCache: true,
                    scannedCount: parsed.length // Fallback or store scannedCount in cache too
                };
            }
        } catch (err) {
            console.error(`[RedditService] [DEEP_CACHE_ERR]`, err);
        }

        console.log(`[RedditService] [DEEP_START] Competitor: "${cleanCompetitor}" (Original: "${competitor}")`);

        const compLower = cleanCompetitor.toLowerCase();
        const queries = [
            `title:${cleanCompetitor} + frustrated`,
            `title:${cleanCompetitor} + alternative`,
            `title:${cleanCompetitor} + vs`,
            `title:${cleanCompetitor} + review`,
            `title:${cleanCompetitor} + sucks`,
            `"${cleanCompetitor}" + annoying`,
            `"${cleanCompetitor}" + problems`,
            `"${cleanCompetitor}"`
        ];

        const allResultsMap = new Map<string, any>();
        let scannedCount = 0;

        for (const query of queries) {
            await this.waitIfNecessary();

            try {
                const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=25`;
                console.log(`[RedditService] [API_CALL] Searching Reddit: ${searchUrl}`);
                const res = await fetch(searchUrl, {
                    headers: { 'User-Agent': 'OpinionDeck-Discovery/1.0.0' }
                });
                console.log(`[RedditService] [RESPONSE] Status: ${res.status} for query: ${query}`);

                if (!res.ok) continue;
                const data: any = await res.json();
                const children = data.data?.children || [];
                scannedCount += children.length;

                for (const child of children) {
                    const post = child.data;
                    // Apply scoring logic (simplified version of relevance-rd.ts)
                    const score = this.calculateRelevanceScore(post, compLower);
                    if (score > 1000) { // Lowered threshold from 5000 to be more inclusive
                        const result = {
                            id: post.id,
                            title: post.title,
                            subreddit: post.subreddit,
                            ups: post.ups,
                            num_comments: post.num_comments,
                            created_utc: post.created_utc,
                            url: `https://www.reddit.com${post.permalink}`,
                            score
                        };
                        console.log(`[RedditService] [MATCH] Found post: "${post.title.substring(0, 50)}..." Score: ${score}`);
                        // Cache locally and globally if better score found
                        if (!allResultsMap.has(post.id) || allResultsMap.get(post.id).score < score) {
                            allResultsMap.set(post.id, result);
                        }
                    }
                }
            } catch (err) {
                console.error(`[RedditService] Deep Discovery Error for query "${query}":`, err);
            }
        }

        const finalResults = Array.from(allResultsMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 30);

        // 2. Save Search to Global Cache (24 Hour TTL)
        try {
            await redis.set(cacheKey, JSON.stringify(finalResults), 'EX', 86400);
            console.log(`[RedditService] [DEEP_CACHE_SET] ${cleanCompetitor} (TTL: 24h)`);
        } catch (err) {
            console.error(`[RedditService] [DEEP_CACHE_ERR] Redis set failed:`, err);
        }

        const enriched = await this.checkMetadataCacheStatus(finalResults);
        return {
            results: enriched,
            isFromCache: false,
            scannedCount
        };
    }

    private static calculateRelevanceScore(post: any, compLower: string): number {
        const title = (post.title || '').toLowerCase();
        const text = (post.selftext || '').toLowerCase();
        const combined = title + " " + text;
        const subredditLower = (post.subreddit || '').toLowerCase();

        let score = 0;

        // Basic presence
        if (!combined.includes(compLower)) return 0;

        // Subreddit Quality
        const qualitySubs = ['saas', 'productivity', 'startups', 'sysadmin', 'entrepreneur', 'technology'];
        if (subredditLower === compLower) score += 20000;
        else if (qualitySubs.includes(subredditLower)) score += 10000;

        // Intent Signals
        const intentKeywords = ['annoying', 'frustrating', 'sucks', 'hate', 'broken', 'slow', 'expensive', 'switching', 'alternatives', 'vs'];
        intentKeywords.forEach(k => {
            if (combined.includes(k)) score += 2000;
        });

        // Engagement
        score += Math.min(post.num_comments, 100) * 10;

        return score;
    }
}
