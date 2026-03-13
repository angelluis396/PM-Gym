const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const router = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-20250514";

// ─── Prompts ──────────────────────────────────────────────────────────────────

const VISION_SYSTEM_PROMPT = `You are a creative product manager. Generate a 2-3 sentence product vision for a completely made-up mobile or web application.

The vision should follow this format:
"For [target users] who [need/problem], the [Product Name] is a [product type] that [key benefit]. Unlike [competitor/alternative], our product [differentiator]."

Make it specific, interesting, and realistic enough that a PM student could build a full planning document around it. Vary the industry — fitness, food, education, finance, travel, healthcare, etc.

Respond with ONLY the vision text — no labels, no extra commentary.`;

const buildGradingPrompt = (vision, form) => `
You are a senior Product Manager evaluating a student's PM planning document.

The student was given this product vision:
"${vision}"

They submitted the following PM planning document:
- Target Group: ${form.targetGroup || "(not provided)"}
- Goal: ${form.goal || "(not provided)"}
- User Needs: ${form.needs || "(not provided)"}
- Value: ${form.value || "(not provided)"}
- Key Features: ${form.keyFeatures || "(not provided)"}
- Product Roadmap: ${form.roadmap || "(not provided)"}
- Release Plan: ${form.releasePlan || "(not provided)"}
- Themes/Features/Epics/Stories: ${form.themesEpicsStories || "(not provided)"}

Grade this document on a scale of 50-100 (also express as a letter grade A/B/C/D/F).
Evaluate each section individually and holistically.

Respond ONLY in this exact JSON format, no markdown fences, no extra text:
{
  "score": 82,
  "letterGrade": "B",
  "overallFeedback": "2-3 sentence overall summary of the submission quality.",
  "sections": {
    "targetGroup":        { "score": 90, "feedback": "Specific feedback here." },
    "goal":               { "score": 85, "feedback": "Specific feedback here." },
    "needs":              { "score": 80, "feedback": "Specific feedback here." },
    "value":              { "score": 75, "feedback": "Specific feedback here." },
    "keyFeatures":        { "score": 70, "feedback": "Specific feedback here." },
    "roadmap":            { "score": 65, "feedback": "Specific feedback here." },
    "releasePlan":        { "score": 80, "feedback": "Specific feedback here." },
    "themesEpicsStories": { "score": 72, "feedback": "Specific feedback here." }
  },
  "strengths":    ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"]
}`;

// ─── POST /api/generate-vision ────────────────────────────────────────────────

router.post("/generate-vision", async (req, res) => {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: VISION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: "Generate a product vision." }],
    });

    const vision = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!vision) {
      return res.status(500).json({ error: "No vision text returned from AI." });
    }

    res.json({ vision });
  } catch (err) {
    console.error("Error generating vision:", err?.message || err);
    res.status(500).json({ error: "Failed to generate product vision. Please try again." });
  }
});

// ─── POST /api/grade ──────────────────────────────────────────────────────────

router.post("/grade", async (req, res) => {
  const { vision, form } = req.body;

  // Basic validation
  if (!vision || typeof vision !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'vision' field." });
  }
  if (!form || typeof form !== "object") {
    return res.status(400).json({ error: "Missing or invalid 'form' field." });
  }

  const filledSections = Object.values(form).filter(
    (v) => typeof v === "string" && v.trim().length > 0
  ).length;

  if (filledSections < 4) {
    return res.status(400).json({ error: "Please fill in at least 4 sections before submitting for grading." });
  }

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: buildGradingPrompt(vision, form) }],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    // Strip markdown fences if model adds them despite instructions
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse grading JSON:", cleaned);
      return res.status(500).json({ error: "AI returned an unexpected response format. Please try again." });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error grading submission:", err?.message || err);
    res.status(500).json({ error: "Failed to grade submission. Please try again." });
  }
});

module.exports = router;
