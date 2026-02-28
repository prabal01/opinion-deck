import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Zap, Search, BarChart2, Mail } from 'lucide-react';
import './IntelligenceScanner.css';

interface IntelligenceScannerProps {
    isAnalyzing: boolean;
}

export const IntelligenceScanner: React.FC<IntelligenceScannerProps> = ({ isAnalyzing }) => {
    const [loadingMsg, setLoadingMsg] = useState("Initializing AI...");
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const messages = [
        { text: "Reading executive summary...", icon: <Search size={20} /> },
        { text: "Identifying top themes...", icon: <Brain size={20} /> },
        { text: "Extracting feature requests...", icon: <Sparkles size={20} /> },
        { text: "Locating pain points & bugs...", icon: <Zap size={20} /> },
        { text: "Calculating sentiment scores...", icon: <BarChart2 size={20} /> },
        { text: "Finalizing research report...", icon: <Sparkles size={20} /> }
    ];

    useEffect(() => {
        if (!isAnalyzing) {
            setDuration(0);
            setProgress(0);
            return;
        }

        let i = 0;
        setLoadingMsg(messages[0].text);

        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingMsg(messages[i].text);
            setProgress(prev => Math.min(prev + (100 / messages.length), 95));
        }, 2500);

        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, [isAnalyzing]);

    if (!isAnalyzing) return null;

    return (
        <div className="intelligence-scanner-container">
            <div className="scanner-card">
                <div className="scanner-visual">
                    <div className="orb-container">
                        <div className="orb-pulse" />
                        <div className="orb-core">
                            <Brain size={40} className="brain-icon" />
                        </div>
                        <div className="scan-line" />
                    </div>

                    <div className="data-stream">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`data-bit bit-${i}`}>
                                {['0', '1', 'AI', 'INTEL', 'SAVE', 'SCAN'][i % 6]}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="scanner-info">
                    <div className="scanner-header">
                        <Sparkles size={18} className="sparkle-icon" />
                        <h3>OpinionDeck AI Intelligence Scanner</h3>
                    </div>

                    <div className="message-container">
                        <p className="scanner-message">{loadingMsg}</p>
                    </div>

                    <div className="progress-container">
                        <div className="progress-bar-wrapper">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="progress-percentage">{Math.round(progress)}%</span>
                    </div>

                    {duration >= 180 && (
                        <div className="scanner-timeout-notice">
                            <div className="notice-icon">
                                <Mail size={16} />
                            </div>
                            <div className="notice-content">
                                <p><strong>Heavy Analysis detected:</strong> This report has a lot of details. You can safely leave this page; we'll notify you via email when it's ready.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
