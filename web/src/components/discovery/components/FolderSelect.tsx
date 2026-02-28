import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Folder as FolderIcon, Check } from 'lucide-react';
import type { Folder } from '../../../contexts/FolderContext';
import './FolderSelect.css';

interface FolderSelectProps {
    folders: Folder[];
    selectedId: string;
    onSelect: (id: string) => void;
    placeholder?: string;
}

export const FolderSelect: React.FC<FolderSelectProps> = ({
    folders,
    selectedId,
    onSelect,
    placeholder = "Select Target Folder..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedFolder = folders.find(f => f.id === selectedId);

    const filteredFolders = folders.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`custom-folder-select ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
            <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
                <FolderIcon size={16} className="trigger-icon" />
                <span className="selected-value">
                    {selectedFolder ? selectedFolder.name : placeholder}
                </span>
                <ChevronDown size={16} className={`chevron ${isOpen ? 'up' : ''}`} />
            </div>

            {isOpen && (
                <div className="select-dropdown">
                    <div className="search-container">
                        <Search size={14} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Find folder..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="options-list">
                        {filteredFolders.length > 0 ? (
                            filteredFolders.map(folder => (
                                <div
                                    key={folder.id}
                                    className={`option-item ${folder.id === selectedId ? 'selected' : ''}`}
                                    onClick={() => {
                                        onSelect(folder.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="option-name">{folder.name}</span>
                                    {folder.id === selectedId && <Check size={14} className="check-icon" />}
                                </div>
                            ))
                        ) : (
                            <div className="no-options">No folders found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
