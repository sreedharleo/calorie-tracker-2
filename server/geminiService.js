import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './systemPrompt.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

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
