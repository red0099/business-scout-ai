import express from 'express';
import cors from 'cors';
import { executePipeline } from './orchestrator.js';

const app = express();
const PORT = 3000;

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Agents Server running on http://localhost:${PORT}`);
});
