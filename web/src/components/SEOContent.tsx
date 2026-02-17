export function SEOContent() {
    return (
        <div className="seo-content">
            <section className="features-intro">
                <h3>Why OpinionDeck?</h3>
                <p className="features-subtitle">
                    The most authentic human conversations on the internet, now structured for AI, research, and archives across all your favorite platforms.
                </p>
            </section>

            <section className="seo-section grid">
                <div className="benefit-card">
                    <div className="benefit-icon">🤖</div>
                    <h4>AI-Ready Context</h4>
                    <p>
                        Export threads with full hierarchy and metadata. Perfect for fine-tuning LLMs or building RAG pipelines.
                    </p>
                </div>
                <div className="benefit-card">
                    <div className="benefit-icon">📊</div>
                    <h4>Deep Analysis</h4>
                    <p>
                        Analyze sentiment, trends, and discourse patterns. We preserve the exact structure of global conversations.
                    </p>
                </div>
                <div className="benefit-card">
                    <div className="benefit-icon">💾</div>
                    <h4>Offline Archives</h4>
                    <p>
                        Never lose a legendary thread. Keep local backups of tutorials, AMAs, and discussions in Markdown or JSON.
                    </p>
                </div>
            </section>

            <section className="seo-section faq">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-item">
                    <p className="faq-q">Is OpinionDeck free?</p>
                    <p className="faq-a">Yes! You can fetch any thread for free. We show up to 50 comments per thread for free users, which covers most discussions.</p>
                </div>
                <div className="faq-item">
                    <p className="faq-q">How do I export all comments?</p>
                    <p className="faq-a">For deeply nested or massive threads with hundreds of comments, our Pro plan allows you to "fetch more" and resolve the entire tree with one click.</p>
                </div>
                <div className="faq-item">
                    <p className="faq-q">What formats are supported?</p>
                    <p className="faq-a">We currently support Markdown (best for reading/LLMs), JSON (best for developers), and Plain Text.</p>
                </div>
            </section>
        </div>
    );
}
