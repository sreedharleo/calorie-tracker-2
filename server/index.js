import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { SYSTEM_PROMPT } from './systemPrompt.js';
import { analyzeImage } from './geminiService.js';

dotenv.config();

const app = express();
// parse port number safely (strip comments/whitespace)
let port = 3000;
if (process.env.PORT) {
    const parsed = parseInt(process.env.PORT.toString().trim(), 10);
    if (!isNaN(parsed)) port = parsed;
    else console.warn(`Invalid PORT env value: '${process.env.PORT}', falling back to ${port}`);
}

app.use(cors());
app.use(express.json());

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

import { supabase } from './supabaseClient.js';
import PDFDocument from 'pdfkit';
import stream from 'stream';

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

// Generate report (weekly + monthly) and return as downloadable JSON
app.get('/api/report', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        // fetch profile (for bmi and goals)
        const { data: profile } = await supabase
            .from('profiles')
            .select('bmi,daily_calorie_goal')
            .eq('id', user.id)
            .single();

        const now = new Date();
        const start30 = new Date(now);
        start30.setDate(now.getDate() - 29); // include today -> 30 days
        start30.setHours(0, 0, 0, 0);

        // fetch logs for last 30 days
        const { data: logs } = await supabase
            .from('analysis_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', start30.toISOString())
            .order('created_at', { ascending: true });

        const dailyMap = {};
        (logs || []).forEach(log => {
            const d = new Date(log.created_at);
            const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
            const cals = (log.nutrition_totals && log.nutrition_totals.calories_kcal) ? log.nutrition_totals.calories_kcal : 0;
            if (!dailyMap[key]) dailyMap[key] = { date: key, totalCalories: 0, meals: [] };
            dailyMap[key].totalCalories += cals;
            dailyMap[key].meals.push({ id: log.id, time: log.created_at, calories: cals, food_items: log.food_items });
        });

        // Build arrays for last 30 and last 7 days
        const dailyArray = [];
        for (let i = 0; i < 30; i++) {
            const dt = new Date(start30);
            dt.setDate(start30.getDate() + i);
            const key = dt.toISOString().slice(0, 10);
            dailyArray.push(dailyMap[key] || { date: key, totalCalories: 0, meals: [] });
        }

        const last7 = dailyArray.slice(-7);
        const weeklyTotal = last7.reduce((s, d) => s + (d.totalCalories || 0), 0);
        const weeklyAvg = Math.round(weeklyTotal / 7);

        const monthlyTotal = dailyArray.reduce((s, d) => s + (d.totalCalories || 0), 0);
        const monthlyAvg = Math.round(monthlyTotal / 30);

        const report = {
            generated_at: now.toISOString(),
            user_id: user.id,
            bmi: profile?.bmi ?? null,
            daily_calorie_goal: profile?.daily_calorie_goal ?? null,
            weekly: {
                days: last7,
                totalCalories: weeklyTotal,
                averageDailyCalories: weeklyAvg
            },
            monthly: {
                days: dailyArray,
                totalCalories: monthlyTotal,
                averageDailyCalories: monthlyAvg
            }
        };

        const fileName = `report_${user.id}_${now.toISOString().slice(0, 10)}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(JSON.stringify(report, null, 2));

    } catch (error) {
        console.error('Report generation failed:', error);
        res.status(500).json({ error: 'Report generation failed' });
    }
});

// PDF report endpoint
app.get('/api/report.pdf', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        const { data: profile } = await supabase
            .from('profiles')
            .select('bmi,daily_calorie_goal')
            .eq('id', user.id)
            .single();

        const now = new Date();
        const start30 = new Date(now);
        start30.setDate(now.getDate() - 29);
        start30.setHours(0, 0, 0, 0);

        const { data: logs } = await supabase
            .from('analysis_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', start30.toISOString())
            .order('created_at', { ascending: true });

        const dailyMap = {};
        (logs || []).forEach(log => {
            const d = new Date(log.created_at);
            const key = d.toISOString().slice(0, 10);
            const cals = (log.nutrition_totals && log.nutrition_totals.calories_kcal) ? log.nutrition_totals.calories_kcal : 0;
            if (!dailyMap[key]) dailyMap[key] = { date: key, totalCalories: 0, meals: [] };
            dailyMap[key].totalCalories += cals;
            dailyMap[key].meals.push({ id: log.id, time: log.created_at, calories: cals, food_items: log.food_items });
        });

        const dailyArray = [];
        for (let i = 0; i < 30; i++) {
            const dt = new Date(start30);
            dt.setDate(start30.getDate() + i);
            const key = dt.toISOString().slice(0, 10);
            dailyArray.push(dailyMap[key] || { date: key, totalCalories: 0, meals: [] });
        }

        const last7 = dailyArray.slice(-7);
        const weeklyTotal = last7.reduce((s, d) => s + (d.totalCalories || 0), 0);
        const weeklyAvg = Math.round(weeklyTotal / 7);
        const monthlyTotal = dailyArray.reduce((s, d) => s + (d.totalCalories || 0), 0);
        const monthlyAvg = Math.round(monthlyTotal / 30);

        // Build PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // stream the PDF back
        res.setHeader('Content-Type', 'application/pdf');
        const fileName = `report_${user.id}_${now.toISOString().slice(0, 10)}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        const passthrough = new stream.PassThrough();
        doc.pipe(passthrough);
        passthrough.pipe(res);

        doc.fontSize(18).text('Calorie Tracker - Progress Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated: ${now.toISOString()}`);
        doc.text(`User ID: ${user.id}`);
        doc.text(`BMI: ${profile?.bmi ?? 'N/A'}`);
        doc.text(`Daily Calorie Goal: ${profile?.daily_calorie_goal ?? 'N/A'}`);
        doc.moveDown();

        doc.fontSize(14).text('Weekly Summary (last 7 days)');
        doc.fontSize(10).text(`Total Calories: ${weeklyTotal}`);
        doc.text(`Average Daily Calories: ${weeklyAvg}`);
        doc.moveDown();

        // Table header for last7
        doc.fontSize(12).text('Date       Calories   Meals');
        last7.forEach(d => {
            const mealsSummary = d.meals.map(m => `${Math.round(m.calories)}kcal`).join(', ');
            doc.fontSize(10).text(`${d.date}   ${d.totalCalories}   ${mealsSummary}`);
        });

        doc.addPage();
        doc.fontSize(14).text('Monthly Summary (last 30 days)');
        doc.fontSize(10).text(`Total Calories: ${monthlyTotal}`);
        doc.text(`Average Daily Calories: ${monthlyAvg}`);
        doc.moveDown();

        // Simple list for monthly days (date and calories)
        dailyArray.forEach(d => {
            doc.fontSize(9).text(`${d.date} - ${d.totalCalories} kcal`);
        });

        doc.end();

    } catch (error) {
        console.error('PDF report generation failed:', error);
        res.status(500).json({ error: 'PDF report generation failed' });
    }
});


const startServer = (p) => {


    app.listen(p, () => {
        console.log(`Server running at http://localhost:${p}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`port ${p} in use, trying next port`);
            startServer(p + 1);
        } else {
            console.error('Server failed to start:', err);
        }
    });
};

startServer(port);

