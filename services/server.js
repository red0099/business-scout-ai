const express = require('express');
const cors = require('cors');
const orchestrator = require('./orchestrator');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const input = req.body || {};
    const result = await orchestrator.runPipeline(input);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in /api/analyze', err);
    res.status(500).json({ success: false, error: err.message || 'Internal error' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
