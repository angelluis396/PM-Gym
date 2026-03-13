const express  = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const router   = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = "claude-sonnet-4-20250514";

// ─── POST /api/generate-scenario ─────────────────────────────────────────────

router.post("/generate-scenario", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt' field." });
  }
  try {
    const message = await client.messages.create({
      model: MODEL, max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = message.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    const scenarioMatch  = raw.match(/SCENARIO:\s*([\s\S]*?)(?=CHALLENGE:|$)/i);
    const challengeMatch = raw.match(/CHALLENGE:\s*([\s\S]*?)$/i);
    const scenario  = scenarioMatch  ? scenarioMatch[1].trim()  : raw.trim();
    const challenge = challengeMatch ? challengeMatch[1].trim() : "";
    if (!scenario) return res.status(500).json({ error: "No scenario returned from AI." });
    res.json({ scenario, challenge });
  } catch (err) {
    console.error("Error generating scenario:", err?.message || err);
    res.status(500).json({ error: "Failed to generate scenario. Please try again." });
  }
});

// ─── POST /api/grade-scenario ─────────────────────────────────────────────────

router.post("/grade-scenario", async (req, res) => {
  const { gradingPrompt } = req.body;
  if (!gradingPrompt || typeof gradingPrompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'gradingPrompt' field." });
  }
  try {
    const message = await client.messages.create({
      model: MODEL, max_tokens: 1000,
      messages: [{ role: "user", content: gradingPrompt }],
    });
    const rawText = message.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse scenario grading JSON:", cleaned);
      return res.status(500).json({ error: "AI returned an unexpected format. Please try again." });
    }
    // Validate score and letterGrade
    parsed.score       = Math.min(100, Math.max(50, Number(parsed.score) || 70));
    parsed.letterGrade = ["A", "B", "C", "D", "F"].includes(parsed.letterGrade) ? parsed.letterGrade : "C";
    res.json(parsed);
  } catch (err) {
    console.error("Error grading scenario:", err?.message || err);
    res.status(500).json({ error: "Failed to grade scenario. Please try again." });
  }
});

module.exports = router;