import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import type { PlatformFilter, IntentFilter } from '../hooks/useDiscovery';

interface SearchHeaderProps {
    competitor: string;
    setCompetitor: (val: string) => void;
    onSearch: () => void;
    loading: boolean;
    platformFilter: PlatformFilter;
    setPlatformFilter: (val: PlatformFilter) => void;
    intentFilter: IntentFilter;
    setIntentFilter: (val: IntentFilter) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
    competitor, setCompetitor, onSearch, loading,
    platformFilter, setPlatformFilter,
    intentFilter, setIntentFilter
}) => {
    return (
        <div className="discovery-header-section">
            <div className="search-box-large">
                <input
                    type="text"
                    placeholder="e.g. Notion, Linear, Slack..."
                    value={competitor}
                    onChange={(e) => setCompetitor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
                <button className="search-button-large" onClick={onSearch} disabled={loading || !competitor.trim()}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    Search
                </button>
            </div>

            <div className="filter-toolbar">
                <div className="filter-group">
                    <span className="filter-label">Platform</span>
                    <div className="filter-pills">
                        {(['all', 'reddit', 'hn'] as PlatformFilter[]).map(p => (
                            <button
                                key={p}
                                data-platform={p}
                                className={`filter-pill ${platformFilter === p ? 'active' : ''}`}
                                onClick={() => setPlatformFilter(p)}
                            >
                                <div className="pill-content">
                                    {p === 'reddit' && (
                                        <svg viewBox="0 0 24 24" className="pill-logo" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="12" fill="currentColor" />
                                            <path d="M18.9 12.1c0-.8-.7-1.5-1.5-1.5-.4 0-.7.1-1 .4-1.3-.9-3-1.5-4.9-1.6l1.1-5.1 3.5.8c0 .6.5 1.1 1.1 1.1.6 0 1.1-.5 1.1-1.1S17.7 4 17.1 4c-.5 0-.9.3-1.1.7l-3.9-.9c-.2 0-.4.1-.4.3l-1.2 5.5c-1.9 0-3.6.6-4.9 1.6-.3-.3-.6-.4-1-.4-.8 0-1.5.7-1.5 1.5 0 .6.3 1.1.8 1.4-.1.2-.1.5-.1.7 0 2.4 2.8 4.3 6.3 4.3s6.3-1.9 6.3-4.3c0-.2 0-.5-.1-.7.5-.3.8-.8.8-1.4zM9.5 13.5c.6 0 1.1.5 1.1 1.1 0 .6-.5 1.1-1.1 1.1-.6 0-1.1-.5-1.1-1.1 0-.6.5-1.1 1.1-1.1zm5.8 4.1c-1.1 1.1-3.1 1.2-4.1.2 0-.1-.1-.3 0-.4s.3-.1.4 0c.8.8 2.4.8 3.3 0 .1-.1.3-.1.4 0s.1.3 0 .4zm-.4-1.9c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z" fill="white" />
                                        </svg>
                                    )}
                                    {p === 'hn' && (
                                        <svg viewBox="0 0 24 24" className="pill-logo" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="24" height="24" fill="currentColor" rx="4" />
                                            <path d="M7 7h2l3 5 3-5h2l-4 7v6h-2v-6z" fill="white" />
                                        </svg>
                                    )}
                                    {p.toUpperCase()}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-group">
                    <span className="filter-label">Intent</span>
                    <div className="filter-pills">
                        {(['all', 'frustration', 'alternative', 'high_engagement'] as IntentFilter[]).map(i => (
                            <button
                                key={i}
                                className={`filter-pill ${intentFilter === i ? 'active' : ''}`}
                                onClick={() => setIntentFilter(i)}
                            >
                                {i.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
