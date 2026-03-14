const express  = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const router   = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = "claude-sonnet-4-20250514";

// ─── POST /api/performance-summary ───────────────────────────────────────────

router.post("/performance-summary", async (req, res) => {
  const { payload } = req.body;

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Missing or invalid 'payload' field." });
  }

  const {
    fullPMSessions   = [],
    focusedSessions  = [],
    scenarioSessions = [],
    sectionAverages  = {},
    averageScore,
    personalBest,
  } = payload;

  const totalSessions = fullPMSessions.length + focusedSessions.length + scenarioSessions.length;

  if (totalSessions < 6) {
    return res.status(400).json({ error: "Not enough sessions to generate a summary." });
  }

  // Build a concise summary of performance data for the prompt
  const sectionSummary = Object.entries(sectionAverages)
    .sort((a, b) => a[1] - b[1])
    .map(([key, score]) => `${key}: ${score}`)
    .join(", ");

  const focusedBreakdown = focusedSessions.reduce((acc, s) => {
    if (!acc[s.exerciseType]) acc[s.exerciseType] = [];
    acc[s.exerciseType].push(s.score);
    return acc;
  }, {});

  const focusedSummary = Object.entries(focusedBreakdown)
    .map(([type, scores]) => `${type}: avg ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}`)
    .join(", ");

  const scenarioBreakdown = scenarioSessions.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s.score);
    return acc;
  }, {});

  const scenarioSummary = Object.entries(scenarioBreakdown)
    .map(([cat, scores]) => `${cat}: avg ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}`)
    .join(", ");

  // Score trends — compare first half vs second half of full PM sessions
  let trendNote = "";
  if (fullPMSessions.length >= 4) {
    const sorted = [...fullPMSessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const half   = Math.floor(sorted.length / 2);
    const early  = sorted.slice(0, half).map((s) => s.score);
    const recent = sorted.slice(half).map((s) => s.score);
    const earlyAvg  = Math.round(early.reduce((a, b) => a + b, 0) / early.length);
    const recentAvg = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    trendNote = `Full PM plan score trend: early sessions averaged ${earlyAvg}, recent sessions averaged ${recentAvg}.`;
  }

  const prompt = `You are a senior PM coach analysing a student's practice performance across a PM training app called PM Gym.

Here is their performance data:

Total sessions: ${totalSessions} (${fullPMSessions.length} full PM plans, ${focusedSessions.length} focused exercises, ${scenarioSessions.length} scenario runs)
Full PM plan average score: ${averageScore ?? "N/A"} | Personal best: ${personalBest ?? "N/A"}
${sectionSummary ? `Section averages (weakest to strongest): ${sectionSummary}` : ""}
${focusedSummary ? `Focused exercise averages: ${focusedSummary}` : ""}
${scenarioSummary ? `Scenario category averages: ${scenarioSummary}` : ""}
${trendNote}

Based on this data, provide a personalised performance analysis.

Respond ONLY in this exact JSON format, no markdown fences, no extra text:
{
  "overallVerdict": "2-3 sentence honest, encouraging overall assessment of where they are in their PM journey.",
  "strengths": ["Specific strength 1 backed by their data", "Specific strength 2"],
  "improvements": ["Specific area to improve 1 with actionable advice", "Specific area to improve 2"],
  "trends": ["A positive trend you can see in their data — only include if there is genuine evidence of improvement"],
  "recommendation": "One specific, actionable next step they should take in PM Gym to improve the most — reference a specific exercise type or category."
}`;

  try {
    const message = await client.messages.create({
      model: MODEL, max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse performance summary JSON:", cleaned);
      return res.status(500).json({ error: "AI returned an unexpected format. Please try again." });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error generating performance summary:", err?.message || err);
    res.status(500).json({ error: "Failed to generate summary. Please try again." });
  }
});

module.exports = router;
