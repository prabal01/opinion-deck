export interface ExtractedData {
    id: string;
    source: 'reddit' | 'g2' | 'manual';
    url: string;
    title: string;
    content: any; // Raw platform-specific data
    extractedAt: string;
    isAnalyzed: boolean;
    analysisResults?: AnalysisResult;
}

export interface AnalysisResult {
    executive_summary: string;
    quality_score: number;
    buying_intent_signals: { signal: string; context: string; confidence: string }[];
    engagement_opportunities: { thread_id: string; reason: string; talking_points: string[] }[];
}
