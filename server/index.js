import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { SYSTEM_PROMPT } from './systemPrompt.js';
import { analyzeImage } from './geminiService.js';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure Multer for memory storage (we'll send buffer to AI)
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
    res.send('Calorie Tracker 2 Backend is running');
});

app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
        const { bmi } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ error: 'No image provided' });
        }

        if (!bmi) {
            return res.status(400).json({ error: 'No BMI provided' });
        }

        console.log(`Received analysis request. BMI: ${bmi}, Image size: ${imageFile.size} bytes`);

        // Connect to Gemini API
        console.log('Sending image to Gemini...');
        const result = await analyzeImage(imageFile.buffer, imageFile.mimetype, bmi);

        console.log('Gemini Analysis result:', JSON.stringify(result, null, 2));
        res.json(result);

    } catch (error) {
        console.error('Analysis failed FULL ERROR:', error);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Error Response:', JSON.stringify(error.response));
        }
        res.status(500).json({ error: 'Analysis failed: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
