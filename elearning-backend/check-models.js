/**
 * Run with: node check-models.js
 * Lists all Gemini models available for your API key.
 */
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
    console.log('🔍 Fetching available models...\n');

    try {
        // List models
        const models = await ai.models.list();

        const generateContentModels = [];

        for await (const model of models) {
            const supportsGenerate = model.supportedActions?.includes('generateContent');
            if (supportsGenerate) {
                generateContentModels.push(model.name);
            }
        }

        if (generateContentModels.length === 0) {
            console.log('⚠️  No models with generateContent support found.');
        } else {
            console.log(`✅ Models supporting generateContent (${generateContentModels.length} total):\n`);
            generateContentModels.forEach(name => console.log('  -', name));
        }

        // Quick test with gemini-2.0-flash
        console.log('\n🧪 Testing gemini-2.0-flash...');
        try {
            const res = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: 'Say "OK" in one word.',
            });
            console.log('✅ gemini-2.0-flash works:', res.text?.trim());
        } catch (e) {
            console.error('❌ gemini-2.0-flash failed:', e.message);
        }

    } catch (err) {
        console.error('❌ Error listing models:', err.message);
    }
}

main();
