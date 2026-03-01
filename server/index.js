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

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

import { supabase } from './supabaseClient.js';

app.get('/', (req, res) => {
    res.send('Calorie Tracker Backend is Running!');
});

app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
        const { bmi } = req.body;
        const imageFile = req.file;

        // Get the Authorization header (Bearer token)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        if (!imageFile) {
            return res.status(400).json({ error: 'No image provided' });
        }

        if (!bmi) {
            return res.status(400).json({ error: 'No BMI provided' });
        }

        console.log(`Received analysis request from User ${user.id}. BMI: ${bmi}`);

        // 1. Upload Image to Supabase Storage
        const fileName = `${user.id}/${Date.now()}_${imageFile.originalname}`;
        const { error: uploadError } = await supabase.storage
            .from('food-images')
            .upload(fileName, imageFile.buffer, {
                contentType: imageFile.mimetype,
            });

        if (uploadError) {
            console.error('Supabase Upload Error:', uploadError);
            throw new Error('Failed to upload image to storage');
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);

        // 2. Perform Gemini Analysis
        console.log('Sending image to Gemini...');
        const result = await analyzeImage(imageFile.buffer, imageFile.mimetype, bmi);

        // Return result AND image url for manual logging later
        res.json({
            ...result,
            image_url: publicUrl
        });

    } catch (error) {
        console.error('Analysis failed:', error);
        res.status(500).json({ error: 'Analysis failed: ' + error.message });
    }
});

app.post('/api/save', async (req, res) => {
    try {
        const { image_url, food_identified, nutrition_estimate } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { error: dbError } = await supabase
            .from('analysis_logs')
            .insert({
                user_id: user.id,
                image_url,
                food_items: food_identified,
                nutrition_totals: nutrition_estimate,
            });

        if (dbError) {
            console.error('Database Insert Error:', dbError);
            return res.status(500).json({ error: 'Failed to save log' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Save failed:', error);
        res.status(500).json({ error: 'Save failed: ' + error.message });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
