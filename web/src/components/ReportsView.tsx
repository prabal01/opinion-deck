import React from 'react';

export const ReportsView: React.FC = () => {
    return (
        <div className="dashboard-home">
            <header className="dashboard-header">
                <h1>AI Reports</h1>
                <p className="subtitle">View your generated intelligence reports.</p>
            </header>
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
                <h3>No Reports Generated Yet</h3>
                <p>Start a new analysis to see your reports here.</p>
            </div>
        </div>
    );
};
