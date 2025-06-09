import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/', async (req, res) => {
  const { city = "Unnamed", style = "adventurer-hub" } = req.body;
  const prompt = `Create a tavern in ${city} styled as "${style}". Include name, owner, and what makes it popular or notorious.`;

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
