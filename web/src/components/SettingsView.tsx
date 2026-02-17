import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PricingPage } from './PricingPage';

export const SettingsView: React.FC = () => {
    const { user, plan } = useAuth();

    return (
        <div className="dashboard-home">
            <header className="dashboard-header">
                <h1>Settings</h1>
                <p className="subtitle">Manage your account and preferences.</p>
            </header>

            <div className="settings-section" style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '30px' }}>
                <h3>Account Details</h3>
                <div style={{ marginTop: '20px', display: 'grid', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Email</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user?.email}</div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Current Plan</label>
                        <div style={{ display: 'inline-block', padding: '4px 12px', background: plan === 'pro' ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bg-secondary)', color: plan === 'pro' ? 'var(--primary-color)' : 'var(--text-muted)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
                            {plan === 'pro' ? 'OpinionDeck Pro' : 'Free Plan'}
                        </div>
                    </div>
                </div>
            </div>

            {plan !== 'pro' && (
                <div className="settings-section">
                    <h3>Upgrade Plan</h3>
                    <PricingPage />
                </div>
            )}
        </div>
    );
};
