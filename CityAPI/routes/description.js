import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/', async (req, res) => {
  const { city = "Unnamed", province = "", culture = "", population = "" } = req.body;
  const prompt = `Write a paragraph describing the city of ${city} in the province of ${province}. Culture: ${culture}, Population: ${population}. Style: evocative, fantasy, immersive.`;

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
