
import { useState, useEffect, useRef } from 'react';
import './Folders.css';

export function Lab() {
    const [prompt, setPrompt] = useState('TITLE: [ID:1] Best marketing tools for indie hackers?\nUSER: u/indie_builder: I am looking for a tool to find reddit threads automatically. Any suggestions?\nUSER: u/marketing_pro: Gummysearch was great but now I use manual search.');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('checking');
    const [isAvailable, setIsAvailable] = useState(false);

    const [hardware, setHardware] = useState({ gpuTier: 'Checking...', webglStatus: 'Checking...' });
    const [modelStatus, setModelStatus] = useState('idle');
    const [progress, setProgress] = useState(0);

    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        checkAvailability();
        checkHardware().then(setHardware);

        workerRef.current = new Worker(new URL('../lib/worker.ts', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (event) => {
            const { status, output, progress } = event.data;
            if (status) setModelStatus(status);
            if (output) setOutput(output);
            if (progress) setProgress(progress);
        };

        return () => workerRef.current?.terminate();
    }, []);

    async function checkAvailability() {
        if (!('ai' in self)) {
            setStatus('missing_api');
            return;
        }
        try {
            // @ts-ignore
            const capabilities = await self.ai.languageModel.capabilities();
            if (capabilities.available === 'readily') {
                setStatus('ready');
                setIsAvailable(true);
            } else {
                setStatus(`availability_${capabilities.available}`);
            }
        } catch (e) {
            setStatus('error_checking');
        }
    }

    async function checkHardware() {
        const gpuTier = 'gpu' in navigator ? 'WebGPU Available 🚀' : 'WebGPU Missing';
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const webglStatus = gl ? 'WebGL Available' : 'WebGL Missing';
        return { gpuTier, webglStatus };
    }

    function renderOutput(content: string) {
        try {
            const parsed = JSON.parse(content);
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: '#ffffff' }}>
                    {parsed.executive_summary && (
                        <div style={{ borderLeft: '4px solid #4f46e5', padding: '0.5rem 1rem', background: 'rgba(79, 70, 229, 0.05)' }}>
                            <strong style={{ color: '#818cf8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>EXECUTIVE SUMMARY</strong>
                            <p style={{ margin: '0.5rem 0', color: '#ffffff', lineHeight: 1.6 }}>{parsed.executive_summary}</p>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '12px', border: '1px solid #222' }}>
                            <span style={{ color: '#888', fontSize: '0.8rem' }}>Research Score</span>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4ade80', marginTop: '0.3rem' }}>{parsed.quality_score || 0}%</div>
                        </div>
                        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '12px', border: '1px solid #222' }}>
                            <span style={{ color: '#888', fontSize: '0.8rem' }}>Intent Signals</span>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#818cf8', marginTop: '0.3rem' }}>{parsed.buying_intent_signals?.length || 0}</div>
                        </div>
                    </div>

                    {parsed.buying_intent_signals?.length > 0 && (
                        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '12px', border: '1px solid #222' }}>
                            <strong style={{ color: '#818cf8', fontSize: '0.75rem', display: 'block', marginBottom: '1rem' }}>BUYING INTENT SIGNALS</strong>
                            {parsed.buying_intent_signals.map((s: any, i: number) => (
                                <div key={i} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#000', borderRadius: '6px', borderLeft: '3px solid #818cf8' }}>
                                    <span style={{ fontWeight: '500' }}>{s.signal}</span>
                                    <span style={{ float: 'right', fontSize: '0.7rem', color: '#888' }}>{s.confidence} Confidence</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: '1rem', opacity: 0.6 }}>
                        <small style={{ color: '#666' }}>Engine: {modelStatus === 'complete' ? 'Transformers.js (Flan-T5)' : 'Processing...'}</small>
                        <details style={{ marginTop: '0.5rem' }}>
                            <summary style={{ fontSize: '0.7rem', cursor: 'pointer' }}>View Raw Payload</summary>
                            <pre style={{ fontSize: '0.7rem', background: '#000', padding: '0.5rem', color: '#aaa', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{content}</pre>
                        </details>
                    </div>
                </div>
            );
        } catch (e) {
            return <div style={{ color: '#ffffff', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{content}</div>;
        }
    }

    async function runChromeAI() {
        if (!isAvailable) return;
        setOutput('Waking up Gemini Nano...');
        try {
            // @ts-ignore
            const session = await self.ai.languageModel.create();
            // @ts-ignore
            const result = await session.prompt("Perform a deep research analysis on this reddit data. Return JSON with 'executive_summary', 'quality_score', 'buying_intent_signals'. DATA: " + prompt);
            setOutput(result);
            session.destroy();
        } catch (e: any) {
            setOutput('Error: ' + e.message);
            setModelStatus('error');
        }
    }

    function runUniversalAI() {
        if (!workerRef.current) return;
        setModelStatus('loading');
        workerRef.current.postMessage({ text: prompt });
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            padding: '3rem 1rem',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(to right, #fff, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Research Lab</h1>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>Comparing local AI performance & quality</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Hardware: {hardware.gpuTier}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Native AI: <span style={{ color: isAvailable ? '#4ade80' : '#f87171' }}>{status === 'ready' ? 'Enabled' : 'Disabled'}</span></div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '2rem',
                    alignItems: 'start'
                }}>
                    <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '24px', border: '1px solid #222' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📝</span> Data Input
                        </h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            style={{
                                width: '100%',
                                height: '300px',
                                padding: '1.2rem',
                                background: '#111',
                                color: '#fff',
                                border: '1px solid #333',
                                borderRadius: '16px',
                                fontSize: '0.95rem',
                                fontFamily: 'monospace',
                                resize: 'none',
                                outline: 'none',
                                marginBottom: '1.5rem'
                            }}
                            placeholder="Paste Reddit data here..."
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={runChromeAI}
                                disabled={!isAvailable}
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #333',
                                    background: isAvailable ? '#fff' : '#111', color: isAvailable ? '#000' : '#444',
                                    fontWeight: 'bold', cursor: 'pointer', opacity: isAvailable ? 1 : 0.5
                                }}
                            >
                                Run Gemini Nano
                            </button>
                            <button
                                onClick={runUniversalAI}
                                disabled={modelStatus === 'loading' || modelStatus === 'running'}
                                style={{
                                    flex: 1, padding: '1rem', borderRadius: '12px', border: 'none',
                                    background: '#4f46e5', color: '#fff',
                                    fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                {modelStatus === 'loading' ? `Installing (${Math.round(progress)}%)` : 'Run Local LLM'}
                            </button>
                        </div>
                    </div>

                    <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '24px', border: '1px solid #222', minHeight: '500px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📊</span> Intelligence Results
                        </h3>
                        {output ? (
                            <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                {modelStatus === 'error' ? (
                                    <div style={{ color: '#ff4444', padding: '1rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{output}</div>
                                ) : (
                                    renderOutput(output)
                                )}
                            </div>
                        ) : (
                            <div style={{ color: '#444', textAlign: 'center', marginTop: '100px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                                <p>Select an engine to start analysis</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
