
import { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useFolders } from "../contexts/FolderContext";
import { UrlInput } from "./UrlInput";
import { FilterBar, type FilterState } from "./FilterBar";
import { ThreadView } from "./ThreadView";
import { ExportPanel } from "./ExportPanel";
import { UpgradePrompt } from "./UpgradePrompt";
import { PricingPage } from "./PricingPage";
import { SEOContent } from "./SEOContent";
import { useRedditThread } from "../hooks/useRedditThread";
import { FolderList } from "./FolderList";
import { applyFilters } from "@core/utils/filters.js";
import type { CLIOptions } from "@core/reddit/types.js";
import { useNavigate } from "react-router-dom";

export function HomeView() {
    const { plan } = useAuth();
    const { thread, metadata, loading, error, fetch: fetchThread } = useRedditThread();
    const [filters, setFilters] = useState<FilterState>({
        minScore: undefined,
        maxDepth: undefined,
        skipDeleted: false,
        opOnly: false,
        topN: undefined,
    });
    const navigate = useNavigate();
    const { saveThread, folders, createFolder } = useFolders();
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const newFolderInputRef = useRef<HTMLInputElement>(null);

    const handleFetch = (url: string, sort: string) => {
        fetchThread({ url, sort });
        setSaveStatus('idle');
    };

    const handleSaveToFolder = async (folderId: string) => {
        if (!thread) return;
        setSaveStatus('saving');
        try {
            await saveThread(folderId, thread);
            setSaveStatus('success');
        } catch (err) {
            setSaveStatus('error');
        }
    };

    const handleSelectChange = (value: string) => {
        if (value === '__new__') {
            setShowNewFolder(true);
            setNewFolderName('');
        } else if (value) {
            handleSaveToFolder(value);
        }
    };

    const handleCreateAndSave = async () => {
        const name = newFolderName.trim();
        if (!name || !thread) return;
        setSaveStatus('saving');
        try {
            const folder = await createFolder(name);
            await saveThread(folder.id, thread);
            setSaveStatus('success');
            setShowNewFolder(false);
            setNewFolderName('');
        } catch (err) {
            setSaveStatus('error');
        }
    };

    const handleNewFolderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateAndSave();
        } else if (e.key === 'Escape') {
            setShowNewFolder(false);
            setNewFolderName('');
        }
    };

    // Auto-focus the new folder input when it appears
    useEffect(() => {
        if (showNewFolder && newFolderInputRef.current) {
            newFolderInputRef.current.focus();
        }
    }, [showNewFolder]);

    const filteredThread = useMemo(() => {
        if (!thread) return null;

        const filterOpts: CLIOptions = {
            format: "md",
            stdout: false,
            copy: false,
            sort: "confidence",
            skipDeleted: filters.skipDeleted,
            opOnly: filters.opOnly,
            tokenCount: false,
            minScore: filters.minScore,
            maxDepth: filters.maxDepth,
            top: filters.topN,
        };

        const filteredComments = applyFilters(thread.comments, filterOpts);

        return {
            ...thread,
            comments: filteredComments,
        };
    }, [thread, filters]);

    const showUpgrade = metadata?.truncated === true && plan !== "pro";

    return (
        <>
            <UrlInput onFetch={handleFetch} loading={loading} />

            {error && (
                <div className="error-banner" role="alert">
                    <span className="error-icon" aria-hidden="true">⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            {loading && (
                <div className="loading-state" role="status" aria-label="Loading thread">
                    <div className="skeleton-post">
                        <div className="skeleton-line skeleton-title" />
                        <div className="skeleton-line skeleton-meta" />
                        <div className="skeleton-line skeleton-body" />
                        <div className="skeleton-line skeleton-body short" />
                    </div>
                    <div className="skeleton-comments">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton-comment" style={{ marginLeft: `${(i % 3) * 24}px` }}>
                                <div className="skeleton-line skeleton-comment-header" />
                                <div className="skeleton-line skeleton-comment-body" />
                            </div>
                        ))}
                    </div>
                    <p className="loading-text">Fetching thread from Reddit...</p>
                </div>
            )}

            {filteredThread && !loading && (
                <>
                    <div className="controls-bar">
                        <FilterBar {...filters} onChange={setFilters} />
                        <div className="action-buttons">
                            <ExportPanel thread={filteredThread} />
                            <div className="save-selector">
                                {!showNewFolder ? (
                                    <select
                                        onChange={(e) => handleSelectChange(e.target.value)}
                                        disabled={saveStatus === 'saving'}
                                        className="btn-secondary"
                                        value=""
                                        aria-label="Save thread to folder"
                                    >
                                        <option value="" disabled>Save to Folder...</option>
                                        {folders.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                        <option value="__new__">+ New Folder</option>
                                    </select>
                                ) : (
                                    <div className="new-folder-inline">
                                        <input
                                            ref={newFolderInputRef}
                                            type="text"
                                            className="new-folder-input"
                                            placeholder="Folder name..."
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={handleNewFolderKeyDown}
                                            disabled={saveStatus === 'saving'}
                                            aria-label="New folder name"
                                        />
                                        <button
                                            className="new-folder-save-btn"
                                            onClick={handleCreateAndSave}
                                            disabled={!newFolderName.trim() || saveStatus === 'saving'}
                                            aria-label="Create folder and save thread"
                                        >
                                            {saveStatus === 'saving' ? '...' : '✓'}
                                        </button>
                                        <button
                                            className="new-folder-cancel-btn"
                                            onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                                            disabled={saveStatus === 'saving'}
                                            aria-label="Cancel creating folder"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                {saveStatus === 'success' && <span className="save-indicator success">✓ Saved</span>}
                                {saveStatus === 'error' && <span className="save-indicator error">Failed</span>}
                            </div>
                        </div>
                    </div>

                    {showUpgrade && metadata && (
                        <UpgradePrompt
                            totalComments={metadata.totalCommentsFetched}
                            commentsShown={metadata.commentsReturned}
                        />
                    )}

                    <ThreadView thread={filteredThread} />
                </>
            )}

            {!thread && !loading && !error && (
                <>
                    <FolderList onSelect={(folder) => navigate(`/folders/${folder.id}`)} />
                    {plan !== "pro" && <PricingPage />}
                    <SEOContent />
                </>
            )}
        </>
    );
}
