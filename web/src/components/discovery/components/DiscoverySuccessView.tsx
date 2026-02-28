import React from 'react';
import { CheckCircle, Search, ArrowRight, Folder as FolderIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './DiscoverySuccessView.css';

interface DiscoverySuccessViewProps {
    count: number;
    folderName: string;
    folderId: string;
    onReset: () => void;
}

export const DiscoverySuccessView: React.FC<DiscoverySuccessViewProps> = ({
    count,
    folderName,
    folderId,
    onReset
}) => {
    return (
        <div className="discovery-success-view">
            <div className="success-icon-wrapper">
                <CheckCircle size={64} className="success-icon" />
            </div>

            <div className="success-content">
                <h2>Sync Complete!</h2>
                <p>
                    Successfully added <b>{count} {count === 1 ? 'thread' : 'threads'}</b> to the
                    <span className="folder-name-highlight">
                        <FolderIcon size={14} /> {folderName}
                    </span> bucket.
                </p>
            </div>

            <div className="success-actions">
                <button className="search-more-btn" onClick={onReset}>
                    <Search size={18} />
                    Search More
                </button>
                <Link to={`/folders/${folderId}`} className="go-to-folder-btn">
                    View Folder
                    <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
};
