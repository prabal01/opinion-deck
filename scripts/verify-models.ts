
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function verifyModels() {
    console.log("🔍 1. Listing ALL available models via REST API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    let availableModels: string[] = [];

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ HTTP Error listing models: ${response.status} ${response.statusText}`);
            console.log(JSON.stringify(data, null, 2));
            return;
        }

        if (data.models) {
            availableModels = data.models
                .map((m: any) => m.name.replace('models/', ''))
                .filter((name: string) => name.includes('flash') || name.includes('pro')); // Focus on Flash/Pro

            console.log(`✅ Found ${availableModels.length} candidate models:`);
            console.log(availableModels.join(", "));
        } else {
            console.log("⚠️ No models returned.");
            return;
        }

    } catch (error) {
        console.error("❌ Network Error listing models:", error);
        return;
    }

    console.log("\n🧪 2. Testing Generation (Hello World) on Candidates...");

    for (const modelName of availableModels) {
        process.stdout.write(`Testing [${modelName}]... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const start = Date.now();
            const result = await model.generateContent("Hi");
            const response = await result.response;
            const text = response.text();
            const duration = Date.now() - start;

            console.log(`✅ OK (${duration}ms)`);
        } catch (error: any) {
            let msg = error.message || "Unknown Error";
            if (msg.includes("404")) msg = "404 Not Found (Access Denied)";
            if (msg.includes("429")) msg = "429 Rate Limited (Quota Exceeded)";
            if (msg.includes("limit: 0")) msg = "429 (No Free Tier Access)";

            console.log(`❌ FAIL: ${msg}`);
        }
    }
}

verifyModels();
