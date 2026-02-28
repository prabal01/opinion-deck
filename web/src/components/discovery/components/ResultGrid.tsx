import React from 'react';
import { ThumbsUp, MessageSquare, ExternalLink, Check } from 'lucide-react';
import type { DiscoveryResult } from '../hooks/useDiscovery';

interface DiscoveryCardProps {
    thread: DiscoveryResult;
    isSelected: boolean;
    onToggle: (id: string) => void;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ thread, isSelected, onToggle }) => {
    return (
        <div
            className={`thread-card-discovery ${isSelected ? 'selected' : ''}`}
            onClick={() => onToggle(thread.id)}
        >
            <div className="checkbox-indicator">
                {isSelected && <Check size={16} />}
            </div>
            <div className="thread-card-header">
                <div className={`platform-logo-wrapper ${thread.source || 'reddit'}`}>
                    {thread.source === 'hn' ? (
                        <div className="hn-logo-svg">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <rect width="24" height="24" fill="#FF6600" />
                                <path d="M7 7h2l3 5 3-5h2l-4 7v6h-2v-6z" fill="white" />
                            </svg>
                            <span>Hacker News</span>
                        </div>
                    ) : (
                        <div className="reddit-logo-svg">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#FF4500" />
                                <path d="M18.9 12.1c0-.8-.7-1.5-1.5-1.5-.4 0-.7.1-1 .4-1.3-.9-3-1.5-4.9-1.6l1.1-5.1 3.5.8c0 .6.5 1.1 1.1 1.1.6 0 1.1-.5 1.1-1.1S17.7 4 17.1 4c-.5 0-.9.3-1.1.7l-3.9-.9c-.2 0-.4.1-.4.3l-1.2 5.5c-1.9 0-3.6.6-4.9 1.6-.3-.3-.6-.4-1-.4-.8 0-1.5.7-1.5 1.5 0 .6.3 1.1.8 1.4-.1.2-.1.5-.1.7 0 2.4 2.8 4.3 6.3 4.3s6.3-1.9 6.3-4.3c0-.2 0-.5-.1-.7.5-.3.8-.8.8-1.4zM9.5 13.5c.6 0 1.1.5 1.1 1.1 0 .6-.5 1.1-1.1 1.1-.6 0-1.1-.5-1.1-1.1 0-.6.5-1.1 1.1-1.1zm5.8 4.1c-1.1 1.1-3.1 1.2-4.1.2 0-.1-.1-.3 0-.4s.3-.1.4 0c.8.8 2.4.8 3.3 0 .1-.1.3-.1.4 0s.1.3 0 .4zm-.4-1.9c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z" fill="white" />
                            </svg>
                            <span>r/{thread.subreddit}</span>
                        </div>
                    )}
                </div>
                <div className="header-right-discovery">
                    {thread.isCached && <span className="cached-badge">CACHED</span>}
                    <a
                        href={thread.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link-icon"
                        onClick={(e) => e.stopPropagation()}
                        title={thread.source === 'hn' ? "Open in Hacker News" : "Open in Reddit"}
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>
            <h3 className="thread-title-discovery">{thread.title}</h3>

            <div className="thread-footer-discovery">
                <div className="intent-markers">
                    {thread.intentMarkers?.length === 0 && (
                        <span className="intent-badge partial-match">Partial Match</span>
                    )}
                    {thread.intentMarkers?.map(marker => (
                        <span key={marker} className={`intent-badge ${marker}`}>
                            {marker.replace('_', ' ')}
                        </span>
                    ))}
                </div>
                <div className="thread-stats-discovery">
                    <div className="stat-item" title={thread.source === 'hn' ? 'Points' : 'Upvotes'}>
                        <ThumbsUp size={14} /> {thread.ups}
                    </div>
                    <div className="stat-item">
                        <MessageSquare size={14} /> {thread.num_comments}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ResultGrid.tsx ---

interface ResultGridProps {
    results: DiscoveryResult[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
}

export const ResultGrid: React.FC<ResultGridProps> = ({ results, selectedIds, onToggle }) => {
    if (results.length === 0) return null;

    return (
        <div className="results-grid">
            {results.map(thread => (
                <DiscoveryCard
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedIds.has(thread.id)}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
};
