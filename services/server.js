import express from 'express';
import cors from 'cors';
import { executePipeline } from './orchestrator.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
    try {
        const { url } = req.body;
        console.log('جارٍ تحليل الموقع:', url);
        const result = await executePipeline(url);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('خطأ في التحليل:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// هذا التعديل هو اللي غادي يخلي Vercel يقبل السيرفر
export default app;
