import React, { useState } from 'react';
import { X, UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { useFolders } from '../contexts/FolderContext';
import './Folders.css';

interface BulkImportModalProps {
    folderId: string;
    onClose: () => void;
    onSuccess: (count: number) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ folderId, onClose, onSuccess }) => {
    const { syncThreads } = useFolders();
    const [urlsText, setUrlsText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async () => {
        setError(null);

        // Extract URLs
        const extractedUrls = urlsText
            .split(/[\n,]+/)
            .map(u => u.trim())
            .filter(u => u.includes('reddit.com') || u.includes('news.ycombinator.com'));

        if (extractedUrls.length === 0) {
            setError("No valid Reddit or Hacker News URLs found.");
            return;
        }

        // Deduplicate
        const uniqueUrls = [...new Set(extractedUrls)];

        setIsSubmitting(true);
        try {
            await syncThreads(folderId, uniqueUrls);
            onSuccess(uniqueUrls.length);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to start import");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                        <UploadCloud size={24} style={{ color: 'var(--primary-color)' }} />
                        Bulk Import Threads
                    </h2>
                    <button className="btn-icon-v2" onClick={onClose}><X size={20} /></button>
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Paste a list of Reddit or Hacker News thread URLs. You can separate them by newlines or commas.
                    The system will automatically fetch, process, and analyze them in the background.
                </p>

                {error && (
                    <div className="error-banner" style={{ marginBottom: '16px' }}>
                        <AlertCircle size={20} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <textarea
                    value={urlsText}
                    onChange={e => setUrlsText(e.target.value)}
                    placeholder="https://www.reddit.com/r/Entrepreneur/comments/...
https://news.ycombinator.com/item?id=..."
                    style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        color: 'white',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                        marginBottom: '20px',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                    disabled={isSubmitting}
                />

                <div className="modal-actions" style={{ marginTop: 0 }}>
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleImport}
                        disabled={isSubmitting || !urlsText.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Importing...
                            </>
                        ) : (
                            <>
                                <UploadCloud size={18} />
                                Import URLs
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
