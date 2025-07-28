const express = require("express");
const cors = require("cors");
const { HfInference } = require("@huggingface/inference");

const app = express();
app.use(cors());
app.use(express.json());

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

const SYSTEM_PROMPT = "You are a helpful cooking assistant...";

app.post("/api/get-recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: "Invalid ingredients" });
  }

  const userPrompt = `I have ${ingredients.join(", ")}. Please give me a recipe you'd recommend I make!`;

  try {
    const result = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
    });

    res.json({ recipe: result.choices[0].message.content });
  } catch (error) {
    console.error("Hugging Face error:", error.message);
    res.status(500).json({ error: "Failed to fetch recipe from Hugging Face." });
  }
});

module.exports = app;
