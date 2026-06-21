const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("YogaMind AI backend is running");
});

app.post("/api/generate-yoga-plan", async (req, res) => {
  try {
    const { goal, level, duration } = req.body;

    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a safe yoga wellness assistant. Create general yoga routines only. Do not give medical diagnosis or treatment advice. Always return valid JSON only.",
          },
          {
            role: "user",
            content: `Create a ${duration} yoga routine for ${level} level. Goal: ${goal}.

Return ONLY valid JSON in this format:
{
  "title": "Short yoga plan title",
  "goal": "${goal}",
  "level": "${level}",
  "duration": "${duration}",
  "exercises": [
    {
      "name": "Exercise name",
      "time": "2 min",
      "instruction": "Short simple instruction",
      "benefit": "Short benefit"
    }
  ],
  "breathingTip": "One short breathing tip",
  "safetyNote": "One short safety note"
}

Use exactly 5 exercises.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    res.json({
      plan: data.choices?.[0]?.message?.content || "No plan generated.",
    });
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({ error: "Failed to generate yoga plan" });
  }
});

app.post("/api/yoga-chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are YogaMind AI Coach. Help users with yoga, stretching, breathing, mindfulness, posture, flexibility and relaxation. Never provide medical diagnosis. Keep answers friendly and practical.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    res.json({
      reply:
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.",
    });
  } catch (error) {
    console.error("AI Chat Error:", error);

    res.status(500).json({
      error: "Failed to get AI response",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Yoga AI backend running on port ${PORT}`);
});