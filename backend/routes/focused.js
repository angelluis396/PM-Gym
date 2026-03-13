const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const router = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = "claude-sonnet-4-20250514";

// ─── POST /api/focused-context ────────────────────────────────────────────────
// Generates a product vision + extra context for a focused exercise

router.post("/focused-context", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt' field." });
  }

  try {
    const message = await client.messages.create({
      model:      MODEL,
      max_tokens: 600,
      messages:   [{ role: "user", content: prompt }],
    });

    const context = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!context) {
      return res.status(500).json({ error: "No context returned from AI." });
    }

    res.json({ context });
  } catch (err) {
    console.error("Error generating focused context:", err?.message || err);
    res.status(500).json({ error: "Failed to generate exercise context. Please try again." });
  }
});

// ─── POST /api/focused-grade ──────────────────────────────────────────────────
// Grades the user's focused exercise answer

router.post("/focused-grade", async (req, res) => {
  const { gradingPrompt } = req.body;

  if (!gradingPrompt || typeof gradingPrompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'gradingPrompt' field." });
  }

  try {
    const message = await client.messages.create({
      model:      MODEL,
      max_tokens: 800,
      messages:   [{ role: "user", content: gradingPrompt }],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse grading JSON:", cleaned);
      return res.status(500).json({ error: "AI returned an unexpected format. Please try again." });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error grading focused answer:", err?.message || err);
    res.status(500).json({ error: "Failed to grade answer. Please try again." });
  }
});

module.exports = router;
