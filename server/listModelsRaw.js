import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function listModelsRaw() {
    try {
        console.log(`Querying: ${url}`);
        const response = await axios.get(url);
        console.log("Response Status:", response.status);
        console.log("Available Models:");
        const models = response.data.models;
        if (models) {
            models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found in response.");
        }
    } catch (error) {
        console.error("AXIOS ERROR:", error.response ? error.response.status : error.message);
        if (error.response && error.response.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        }
    }
}

listModelsRaw();
