import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModel(modelName) {
    console.log(`Checking model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`SUCCESS: ${modelName} works!`);
        return true;
    } catch (error) {
        console.log(`FAILED: ${modelName} - ${error.message}`);
        return false;
    }
}

async function testAll() {
    console.log("Starting Model Check...");
    await checkModel('gemini-2.0-flash');
    await checkModel('gemini-2.0-flash-lite');
    await checkModel('gemini-2.5-flash');
}

testAll();
