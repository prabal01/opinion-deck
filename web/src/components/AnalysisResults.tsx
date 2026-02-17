
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

interface PotentialLead {
    username: string;
    platform: string;
    intent_context: string;
    original_post_id: string;
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
    // New Fields
    quality_score?: number;
    quality_reasoning?: string;
    createdAt?: string;
    relevance_explanation?: string;
    buying_intent_signals?: BuyingSignal[];
    engagement_opportunities?: EngagementOpportunity[];
    potential_leads?: PotentialLead[];
}

export const AnalysisResults: React.FC<{ data: AnalysisData, onCitationClick?: (id: string) => void }> = ({ data, onCitationClick }) => {
    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OpinionDeck_Analysis_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleExportMarkdown = () => {
        const md = `# OpinionDeck Analysis Report - ${new Date().toLocaleDateString()}

## Executive Summary
${data.executive_summary || "No summary available."}

## Top Themes
${(data.themes || []).map(t => `### ${t.title} (${t.confidence}% Confidence)
${t.description}
*Sentiment: ${t.sentiment}*`).join('\n\n')}

## Feature Requests
${(data.feature_requests || []).map(f => `- **${f.feature}** (${f.frequency}): ${f.context}`).join('\n')}

## Pain Points
${(data.pain_points || []).map(p => `- **${p.issue}** (${p.severity}): ${p.description}`).join('\n')}

${data.potential_leads ? `## Potential Leads for Outreach
${data.potential_leads.map(l => `- **${l.username}** (${l.platform}): ${l.intent_context}`).join('\n')}` : ''}
`;
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OpinionDeck_Analysis_${new Date().toISOString().split('T')[0]}.md`;
        a.click();
    };

    return (
        <div className="analysis-results">
            <div className="analysis-header">
                <div>
                    <h2>📊 AI Research Report</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {data.createdAt && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                🕒 {new Date(data.createdAt).toLocaleString()}
                            </span>
                        )}
                    </div>
                    <div className="export-actions" style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                        <button className="btn-text" onClick={handleExportJSON} style={{ fontSize: '0.7rem', opacity: 0.7 }}>📥 Export JSON</button>
                        <button className="btn-text" onClick={handleExportMarkdown} style={{ fontSize: '0.7rem', opacity: 0.7 }}>📝 Export Markdown</button>
                    </div>
                </div>

                {data.quality_score !== undefined && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                        <div className="quality-badge">
                            <span className="score-label">Research Quality</span>
                            <div className="score-value" style={{ color: data.quality_score >= 80 ? 'var(--success-color)' : data.quality_score >= 50 ? 'var(--warning-color)' : 'var(--error-color)' }}>
                                {data.quality_score}/100
                            </div>
                        </div>
                        {data.quality_reasoning && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', maxWidth: '200px', textAlign: 'right', fontStyle: 'italic' }}>
                                "{data.quality_reasoning}"
                            </span>
                        )}
                    </div>
                )}

                {data.sentiment_breakdown && (
                    <div className="sentiment-summary">
                        <div className="sentiment-bar">
                            <div className="seg pos" style={{ flexGrow: data.sentiment_breakdown.positive || 0 }} title={`Positive: ${data.sentiment_breakdown.positive || 0}%`} />
                            <div className="seg neu" style={{ flexGrow: data.sentiment_breakdown.neutral || 0 }} title={`Neutral: ${data.sentiment_breakdown.neutral || 0}%`} />
                            <div className="seg neg" style={{ flexGrow: data.sentiment_breakdown.negative || 0 }} title={`Negative: ${data.sentiment_breakdown.negative || 0}%`} />
                        </div>
                        <div className="sentiment-legend">
                            <span>🟢 {data.sentiment_breakdown.positive || 0}% Positive</span>
                            <span>⚪ {data.sentiment_breakdown.neutral || 0}% Neutral</span>
                            <span>🔴 {data.sentiment_breakdown.negative || 0}% Negative</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="analysis-section">
                <h3>Executive Summary</h3>
                <p className="exec-summary">{data.executive_summary || "No summary available."}</p>
                {data.relevance_explanation && (
                    <p className="relevance-note">
                        <strong>Why this score?</strong> {data.relevance_explanation}
                    </p>
                )}
            </div>

            <div className="analysis-grid">
                {/* Potential Leads Section */}
                {data.potential_leads && data.potential_leads.length > 0 && (
                    <div className="analysis-card leads-card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header-accent outreach">📣 Potential Customer Outreach</div>
                        <h3>High Intent Leads</h3>
                        <div className="leads-list-compact" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginTop: '10px' }}>
                            {data.potential_leads.map((lead, i) => (
                                <div key={i} className="lead-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>{lead.username}</strong>
                                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5 }}>{lead.platform}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', margin: '0 0 8px 0', lineHeight: '1.4', opacity: 0.9 }}>{lead.intent_context}</p>
                                    <button
                                        className="btn-text"
                                        onClick={() => onCitationClick && onCitationClick(lead.original_post_id)}
                                        style={{ fontSize: '0.7rem', padding: 0 }}
                                    >
                                        View Source Post →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Buying Intent Signals */}
                {data.buying_intent_signals && data.buying_intent_signals.length > 0 && (
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

                {/* Engagement Opportunities */}
                {data.engagement_opportunities && data.engagement_opportunities.length > 0 && (
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

                {(data.themes || []).length > 0 && (
                    <div className="analysis-card themes">
                        <h3>🏆 Top Themes</h3>
                        <ul className="theme-list">
                            {(data.themes || []).map((theme, i) => (
                                <li key={i} className="theme-item">
                                    <div className="theme-header">
                                        <span className="theme-title">{theme.title}</span>
                                        <span className={`confidence-badge c-${Math.floor(theme.confidence / 10) * 10}`}>
                                            {theme.confidence}% Conf.
                                        </span>
                                    </div>
                                    <p>{theme.description}</p>
                                    <div className="citations">
                                        {(theme.citations || []).map(c => (
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
                )}

                {(data.feature_requests || []).length > 0 && (
                    <div className="analysis-card features">
                        <h3>💡 Feature Requests</h3>
                        <ul className="feature-list">
                            {(data.feature_requests || []).map((req, i) => (
                                <li key={i} className="feature-item">
                                    <div className="feature-header">
                                        <strong>{req.feature}</strong>
                                        <span className={`freq-badge f-${(req.frequency || 'medium').toLowerCase()}`}>
                                            {req.frequency} Freq
                                        </span>
                                    </div>
                                    <p className="context">"{req.context}"</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {(data.pain_points || []).length > 0 && (
                    <div className="analysis-card pain-points">
                        <h3>🐛 Pain Points & Bugs</h3>
                        <ul className="pain-list">
                            {(data.pain_points || []).map((pp, i) => (
                                <li key={i} className="pain-item">
                                    <div className="pain-header">
                                        <strong>{pp.issue}</strong>
                                        <span className={`severity-badge s-${(pp.severity || 'minor').toLowerCase()}`}>
                                            {pp.severity}
                                        </span>
                                    </div>
                                    <p>{pp.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
