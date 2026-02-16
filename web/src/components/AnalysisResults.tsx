
import React from 'react';
import './AnalysisResults.css';

interface Theme {
    title: string;
    description: string;
    confidence: number;
    sentiment: "Positive" | "Neutral" | "Negative";
    citations: string[];
}

interface FeatureRequest {
    feature: string;
    frequency: "High" | "Medium" | "Low";
    context: string;
}

interface PainPoint {
    issue: string;
    severity: "Critical" | "Major" | "Minor";
    description: string;
}

interface BuyingSignal {
    signal: string;
    context: string;
    confidence: "High" | "Medium" | "Low";
}

interface EngagementOpportunity {
    thread_id: string;
    reason: string;
    talking_points: string[];
}

interface AnalysisData {
    executive_summary: string;
    themes: Theme[];
    feature_requests: FeatureRequest[];
    pain_points: PainPoint[];
    sentiment_breakdown: {
        positive: number;
        neutral: number;
        negative: number;
    };
    // New Fields
    quality_score?: number;
    relevance_explanation?: string;
    buying_intent_signals?: BuyingSignal[];
    engagement_opportunities?: EngagementOpportunity[];
}

export const AnalysisResults: React.FC<{ data: AnalysisData, onCitationClick?: (id: string) => void }> = ({ data, onCitationClick }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'var(--success-color)';
        if (score >= 50) return 'var(--warning-color)';
        return 'var(--error-color)';
    };

    return (
        <div className="analysis-results">
            <div className="analysis-header">
                <div className="header-top">
                    <h2>📊 AI Research Report</h2>
                    {data.quality_score !== undefined && (
                        <div className="quality-badge" style={{ borderColor: getScoreColor(data.quality_score) }}>
                            <span className="score-label">Research Quality</span>
                            <span className="score-value" style={{ color: getScoreColor(data.quality_score) }}>
                                {data.quality_score}/100
                            </span>
                        </div>
                    )}
                </div>

                <div className="sentiment-summary">
                    <div className="sentiment-bar">
                        <div className="seg pos" style={{ flex: data.sentiment_breakdown.positive }} title={`Positive: ${data.sentiment_breakdown.positive}%`} />
                        <div className="seg neu" style={{ flex: data.sentiment_breakdown.neutral }} title={`Neutral: ${data.sentiment_breakdown.neutral}%`} />
                        <div className="seg neg" style={{ flex: data.sentiment_breakdown.negative }} title={`Negative: ${data.sentiment_breakdown.negative}%`} />
                    </div>
                    <div className="sentiment-legend">
                        <span>🟢 {data.sentiment_breakdown.positive}% Positive</span>
                        <span>⚪ {data.sentiment_breakdown.neutral}% Neutral</span>
                        <span>🔴 {data.sentiment_breakdown.negative}% Negative</span>
                    </div>
                </div>
            </div>

            <div className="analysis-section">
                <h3>Executive Summary</h3>
                <p className="exec-summary">{data.executive_summary}</p>
                {data.relevance_explanation && (
                    <p className="relevance-note">
                        <strong>Why this score?</strong> {data.relevance_explanation}
                    </p>
                )}
            </div>

            {/* Buying Intent Signals */}
            {(data.buying_intent_signals && data.buying_intent_signals.length > 0) && (
                <div className="analysis-card buying-intent">
                    <div className="card-header-accent">🎯 High Value Signals</div>
                    <h3>Buying Intent Detected</h3>
                    <ul className="intent-list">
                        {data.buying_intent_signals.map((signal, i) => (
                            <li key={i} className="intent-item">
                                <div className="intent-header">
                                    <span className="signal-type">{signal.signal}</span>
                                    <span className={`confidence-tag ${signal.confidence.toLowerCase()}`}>
                                        {signal.confidence} Confidence
                                    </span>
                                </div>
                                <p>"{signal.context}"</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="analysis-grid">
                {/* Engagement Opportunities */}
                {(data.engagement_opportunities && data.engagement_opportunities.length > 0) && (
                    <div className="analysis-card engagement">
                        <h3>💬 Engagement Opportunities</h3>
                        <ul className="engagement-list">
                            {data.engagement_opportunities.map((opp, i) => (
                                <li key={i} className="engagement-item">
                                    <strong>Why: {opp.reason}</strong>
                                    <ul>
                                        {opp.talking_points.map((tp, j) => (
                                            <li key={j}>👉 {tp}</li>
                                        ))}
                                    </ul>
                                    <button
                                        className="btn-text"
                                        onClick={() => onCitationClick && onCitationClick(opp.thread_id)}
                                    >
                                        View Thread →
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="analysis-card themes">
                    <h3>🏆 Top Themes</h3>
                    <ul className="theme-list">
                        {data.themes.map((theme, i) => (
                            <li key={i} className="theme-item">
                                <div className="theme-header">
                                    <span className="theme-title">{theme.title}</span>
                                    <span className={`confidence-badge c-${Math.floor(theme.confidence / 10) * 10}`}>
                                        {theme.confidence}% Conf.
                                    </span>
                                </div>
                                <p>{theme.description}</p>
                                <div className="citations">
                                    {theme.citations.map(c => (
                                        <button
                                            key={c}
                                            className="citation-pill"
                                            title="View source comment"
                                            onClick={() => onCitationClick && onCitationClick(c)}
                                        >
                                            {c.replace('ID:', '')}
                                        </button>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="analysis-card features">
                    <h3>💡 Feature Requests</h3>
                    <ul className="feature-list">
                        {data.feature_requests.map((req, i) => (
                            <li key={i} className="feature-item">
                                <div className="feature-header">
                                    <strong>{req.feature}</strong>
                                    <span className={`freq-badge f-${req.frequency.toLowerCase()}`}>
                                        {req.frequency} Freq
                                    </span>
                                </div>
                                <p className="context">"{req.context}"</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="analysis-card pain-points">
                    <h3>🐛 Pain Points & Bugs</h3>
                    <ul className="pain-list">
                        {data.pain_points.map((pp, i) => (
                            <li key={i} className="pain-item">
                                <div className="pain-header">
                                    <strong>{pp.issue}</strong>
                                    <span className={`severity-badge s-${pp.severity.toLowerCase()}`}>
                                        {pp.severity}
                                    </span>
                                </div>
                                <p>{pp.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
