// index.js
const express = require('express');
const cors = require('cors');
const { HfInference } = require('@huggingface/inference');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // allow requests from Vite frontend
app.use(express.json());

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

const SYSTEM_PROMPT = "You are a helpful chef that provides creative and easy recipes.";

app.post('/api/get-recipe', async (req, res) => {
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Invalid ingredients format' });
  }

  try {
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `I have ${ingredients.join(", ")}. What should I cook?` },
      ],
      max_tokens: 1024,
    });

    res.json({ recipe: response.choices[0].message.content });
  } catch (err) {
    console.error('Hugging Face error:', err);
    res.status(500).json({ error: 'Failed to fetch from Hugging Face' });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

