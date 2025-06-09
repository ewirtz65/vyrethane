import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/', async (req, res) => {
  const { city = "Unnamed", isCapital = false } = req.body;
  const prompt = `Generate a fantasy political leader for ${city}. Is Capital: ${isCapital}. Include name, title, ruling style, and reputation.`;

  try {
    const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
      model: "mistral",
      prompt,
      stream: false
    });

    res.json({ result: ollamaRes.data.response.trim() });
  } catch (err) {
    res.status(500).json({ error: "Ollama error", details: err.message });
  }
});

export default router;
