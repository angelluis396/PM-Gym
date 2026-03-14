const express  = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const router   = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = "claude-sonnet-4-20250514";

// ─── POST /api/interview-question ─────────────────────────────────────────────

router.post("/interview-question", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const message = await client.messages.create({
      model: MODEL, max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const raw     = message.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch (e) { return res.status(500).json({ error: "AI returned unexpected format." }); }

    res.json(parsed);
  } catch (err) {
    console.error("interview-question error:", err?.message);
    res.status(500).json({ error: "Failed to generate question." });
  }
});

// ─── POST /api/interview-grade ────────────────────────────────────────────────

router.post("/interview-grade", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const message = await client.messages.create({
      model: MODEL, max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw     = message.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch (e) { return res.status(500).json({ error: "AI returned unexpected format." }); }

    res.json(parsed);
  } catch (err) {
    console.error("interview-grade error:", err?.message);
    res.status(500).json({ error: "Failed to grade answer." });
  }
});

module.exports = router;
