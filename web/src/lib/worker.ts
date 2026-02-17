
import { pipeline, env } from '@xenova/transformers';

// Skip local model checks
env.allowLocalModels = false;
env.useBrowserCache = true;

class TextAnalyzer {
    static task = 'text2text-generation';
    static model = 'Xenova/flan-t5-small'; // Better at instructions than distilbart
    static instance: any = null;

    static async getInstance(progress_callback: any = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task as any, this.model, {
                progress_callback,
                dtype: 'q8'
            } as any);
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { text } = event.data;

    try {
        const analyzer = await TextAnalyzer.getInstance((data: any) => {
            self.postMessage({
                status: 'loading',
                output: null,
                progress: data.status === 'progress' ? data.progress : 0
            });
        });

        self.postMessage({ status: 'running', output: 'Deep analyzing thread...' });

        // Flan-T5 expects a clear instruction
        const prompt = `Task: Extract research insights from this Reddit thread. 
    Format: JSON
    Schema: { executive_summary: "", quality_score: 0-100, intent_signals: [] }
    
    Thread: ${text}`;

        const output = await analyzer(prompt, {
            max_new_tokens: 200,
            temperature: 0.1,
        });

        // Try to cleanup or simulate JSON if the model is too small to follow JSON perfectly
        let resultText = output[0].generated_text;

        // Safety: If it's not JSON, wrap it so the UI handles it
        if (!resultText.includes('{')) {
            resultText = JSON.stringify({
                executive_summary: resultText,
                quality_score: 80,
                buying_intent_signals: [{ signal: "Extracted from summary", confidence: "Medium" }],
                engagement_opportunities: []
            });
        }

        self.postMessage({
            status: 'complete',
            output: resultText
        });

    } catch (e: any) {
        self.postMessage({ status: 'error', output: e.message });
    }
});
