import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/', async (req, res) => {
  const { city = "Unnamed", type = "general goods" } = req.body;
  const prompt = `Create a fantasy shop in ${city}. Type: ${type}. Include shop name, owner, and a unique feature or product.`;

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
