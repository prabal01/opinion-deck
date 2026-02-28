import React, { useState } from 'react';
import { useFolders } from '../../contexts/FolderContext';
import { useDiscovery } from './hooks/useDiscovery';
import { SearchHeader } from './components/SearchHeader';
import { ResultGrid } from './components/ResultGrid';
import { SelectionCart } from './components/SelectionCart';
import { DiscoverySuccessView } from './components/DiscoverySuccessView';
import { Info } from 'lucide-react';
import './DiscoveryWorkbench.css';

export const DiscoveryWorkbench: React.FC = () => {
    const { syncThreads, folders } = useFolders();
    const {
        results,
        selectedResults,
        loading,
        selectedIds,
        discoveryPlan,
        platformFilter,
        setPlatformFilter,
        intentFilter,
        setIntentFilter,
        search,
        toggleSelection,
        clearResults,
        status,
        setSelectedIds
    } = useDiscovery();

    const [competitor, setCompetitor] = useState('');
    const [isSearchingStarted, setIsSearchingStarted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSyncInfo, setLastSyncInfo] = useState<{ count: number, folderName: string, folderId: string } | null>(null);

    const handleSearch = async () => {
        if (!competitor.trim()) return;
        setIsSearchingStarted(true);
        await search(competitor);
    };

    const handleSaveSelection = async (folderId: string) => {
        const urls = selectedResults.map(r => r.url);
        const items = selectedResults.map(r => ({
            url: r.url,
            title: r.title,
            author: "unknown",
            subreddit: r.subreddit,
            num_comments: r.num_comments
        }));
        const folder = folders.find((f: any) => f.id === folderId);
        const count = selectedResults.length;

        setIsSaving(true);
        try {
            await syncThreads(folderId, urls, items);
            setLastSyncInfo({
                count,
                folderId,
                folderName: folder?.name || 'Selected Folder'
            });
            setSelectedIds(new Set());
            clearResults();
            setIsSearchingStarted(false);
            setCompetitor('');
        } catch (err) {
            console.error("Failed to save selection:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        clearResults();
        setIsSearchingStarted(false);
        setCompetitor('');
    };

    return (
        <div className={`discovery-workbench ${isSearchingStarted || results.length > 0 ? 'active' : 'hero'}`}>
            <header className="workbench-header">
                <h1>Discovery Workbench</h1>
                <p>Build your research intelligence from Reddit & Hacker News.</p>
            </header>

            <SearchHeader
                competitor={competitor}
                setCompetitor={setCompetitor}
                onSearch={handleSearch}
                loading={loading}
                platformFilter={platformFilter}
                setPlatformFilter={setPlatformFilter}
                intentFilter={intentFilter}
                setIntentFilter={setIntentFilter}
            />

            {status && <div className="workbench-status">{status}</div>}

            {discoveryPlan && !loading && (
                <div className="discovery-summary-bar">
                    <div className="summary-pills">
                        <span className="summary-pill">Scanned: <b>{discoveryPlan.scannedCount}</b></span>
                        <span className="summary-pill">High Signal: <b>{discoveryPlan.totalFound}</b></span>
                        {discoveryPlan.isFromCache && <span className="summary-pill cache"><Info size={12} /> Cached</span>}
                    </div>
                </div>
            )}

            <main className="workbench-main">
                {lastSyncInfo ? (
                    <DiscoverySuccessView
                        {...lastSyncInfo}
                        onReset={() => setLastSyncInfo(null)}
                    />
                ) : (
                    <ResultGrid
                        results={results}
                        selectedIds={selectedIds}
                        onToggle={toggleSelection}
                    />
                )}
            </main>

            <SelectionCart
                selectedCount={selectedIds.size}
                onSave={handleSaveSelection}
                onClear={handleClear}
                loading={isSaving}
            />
        </div>
    );
};
