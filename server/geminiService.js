import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './systemPrompt.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(buffer, mimeType) {
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType
        },
    };
}

export async function analyzeImage(imageBuffer, mimeType, bmi) {
    // If API key is not provided, return a mocked response so the app can run locally.
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found — returning mocked analysis result');
        // Lightweight mocked response matching the expected JSON schema
        return {
            food_identified: [
                { name: 'Mixed Vegetables', calories: 120 },
                { name: 'Steamed Rice', calories: 200 }
            ],
            nutrition_estimate: {
                calories_kcal: 320,
                protein_g: 8,
                carbs_g: 55,
                fat_g: 6
            },
            health_tips: (
                bmi && Number(bmi) > 25
            ) ? [
                'Reduce portion size of high-carb items',
                'Choose whole grains and add more vegetables',
                'Aim for 20–30 minutes of light activity daily'
            ] : [
                'Maintain a balanced diet with adequate protein',
                'Include a variety of vegetables for fiber',
                'Stay hydrated and follow regular meal times'
            ]
        };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${SYSTEM_PROMPT}
  
  Patient BMI context: ${bmi}
  
  Please analyze the attached food image accordingly.
  Remember to return ONLY valid JSON.`;

    const imagePart = fileToGenerativePart(imageBuffer, mimeType);

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini API Error in service:", error);
        throw error;
    }
}
