import React, { useState } from 'react';
import { ArrowRight, Loader2, Check, X, Plus } from 'lucide-react';
import { useFolders } from '../../../contexts/FolderContext';
import { FolderSelect } from './FolderSelect';

interface SelectionCartProps {
    selectedCount: number;
    onSave: (folderId: string) => Promise<void>;
    onClear: () => void;
    loading: boolean;
}

export const SelectionCart: React.FC<SelectionCartProps> = ({ selectedCount, onSave, onClear, loading }) => {
    const { folders, createFolder } = useFolders();
    const [targetFolderId, setTargetFolderId] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isFolderLoading, setIsFolderLoading] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    if (selectedCount === 0) return null;

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsFolderLoading(true);
        try {
            const folder = await createFolder(newFolderName.trim());
            setTargetFolderId(folder.id);
            setNewFolderName('');
            setIsCreatingFolder(false);
        } catch (err) {
            console.error("Failed to create folder:", err);
        } finally {
            setIsFolderLoading(false);
        }
    };

    return (
        <>
            <div className="selection-cart-tray">
                <div className="cart-content">
                    <div className="selection-info">
                        <span className="count-badge">{selectedCount}</span>
                        <span>{selectedCount === 1 ? 'thread' : 'threads'} selected</span>
                        <button className="clear-btn" onClick={onClear}><X size={14} /> Clear</button>
                    </div>

                    <div className="cart-actions">
                        <button
                            className="new-folder-inline-btn"
                            onClick={() => setIsCreatingFolder(true)}
                            title="Create New Folder"
                        >
                            <Plus size={18} />
                        </button>

                        <FolderSelect
                            folders={folders}
                            selectedId={targetFolderId}
                            onSelect={setTargetFolderId}
                        />

                        <button
                            className="save-cart-btn"
                            disabled={loading || !targetFolderId}
                            onClick={() => onSave(targetFolderId)}
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                            Save & Sync
                        </button>
                    </div>
                </div>
            </div>

            {isCreatingFolder && (
                <div className="modal-overlay">
                    <div className="folder-create-modal">
                        <h3>New Research Bucket</h3>
                        <p className="modal-description">Give this collection a name to organize your findings.</p>
                        <input
                            type="text"
                            placeholder="e.g. Linear Frustrations"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleCreateFolder()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setIsCreatingFolder(false)} disabled={isFolderLoading}>Cancel</button>
                            <button className="create-btn" onClick={handleCreateFolder} disabled={!newFolderName.trim() || isFolderLoading}>
                                {isFolderLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
