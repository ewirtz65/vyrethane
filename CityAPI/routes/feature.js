import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/', async (req, res) => {
  const { city = "Unnamed", feature = "temple", religion = "Uruk Spirits" } = req.body;
  const prompt = `Describe the ${feature} in the city of ${city}, dedicated to ${religion}. Include its appearance and role in local life.`;

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
