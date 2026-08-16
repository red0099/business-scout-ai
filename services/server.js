import "dotenv/config";
import express from "express"; import cors from "cors"; import { executePipeline } from "./orchestrator.js"; const app = express(); app.use(cors()); app.use(express.json()); app.post("/api/analyze", async (req, res) => { try { const { url } = req.body; if (!url) { return res.status(400).json({ success: false, error: "URL is required" }); } console.log("جارٍ تحليل الموقع:", url); const result = await executePipeline(url); res.json({ success: true, data: result }); } catch (error) { console.error("خطأ في التحليل:", error.message); res.status(500).json({ success: false, error: error.message }); } }); console.log("🚀 Vercel Server Function is starting...");

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

export default app;
