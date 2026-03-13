// ─── Scenario categories ──────────────────────────────────────────────────────

export const SCENARIO_CATEGORIES = [
  {
    key:         "stakeholder",
    label:       "Stakeholder Management",
    emoji:       "🤝",
    description: "Navigate competing priorities, executive pressure, and cross-team alignment challenges.",
    color:       "#6366f1",
  },
  {
    key:         "prioritization",
    label:       "Prioritization & Backlog",
    emoji:       "📊",
    description: "Make tough calls on what to build, when, and how to defend your decisions with data.",
    color:       "#8b5cf6",
  },
  {
    key:         "crisis",
    label:       "Crisis & Escalation",
    emoji:       "🚨",
    description: "Respond to production incidents, angry customers, and high-pressure situations in real time.",
    color:       "#ef4444",
  },
  {
    key:         "build_vs_buy",
    label:       "Build vs Buy",
    emoji:       "⚖️",
    description: "Evaluate whether to build in-house or purchase a vendor solution under time and resource constraints.",
    color:       "#f59e0b",
  },
  {
    key:         "roadmap",
    label:       "Roadmap & Strategy",
    emoji:       "🗺️",
    description: "Set direction, handle scope changes, and align leadership on long-term product strategy.",
    color:       "#22c55e",
  },
  {
    key:         "user_research",
    label:       "User Feedback & Research",
    emoji:       "🔍",
    description: "Synthesize conflicting user feedback, decide what to act on, and translate insights into action.",
    color:       "#06b6d4",
  },
  {
    key:         "collaboration",
    label:       "Cross-functional Collaboration",
    emoji:       "👥",
    description: "Work through engineering trade-offs, design disagreements, and sales vs product conflicts.",
    color:       "#f97316",
  },
  {
    key:         "metrics",
    label:       "Metrics & Data",
    emoji:       "📈",
    description: "Define success metrics, investigate unexpected data, and make decisions under uncertainty.",
    color:       "#a855f7",
  },
];

// ─── Scenario generation prompt ───────────────────────────────────────────────

export const buildScenarioPrompt = (categoryKey) => {
  const categoryContext = {
    stakeholder:    "stakeholder management — e.g. executive pressure, conflicting team priorities, managing up, getting buy-in",
    prioritization: "backlog prioritization — e.g. competing feature requests, sprint planning conflicts, RICE/ICE scoring, capacity constraints",
    crisis:         "crisis and escalation — e.g. production bugs affecting revenue, angry enterprise clients, post-launch failures, war room situations",
    build_vs_buy:   "build vs buy decisions — e.g. evaluating vendor solutions, TCO analysis, integration risk, time-to-market tradeoffs",
    roadmap:        "roadmap and strategy — e.g. CEO scope changes, roadmap reprioritization, communicating trade-offs to leadership, quarterly planning",
    user_research:  "user feedback and research — e.g. conflicting NPS data, interpreting qualitative interviews, deciding what feedback to act on",
    collaboration:  "cross-functional collaboration — e.g. engineering pushback, design disagreements, sales making promises to customers, legal blocks",
    metrics:        "metrics and data — e.g. unexpected metric drops, defining success criteria, OKR setting, A/B test interpretation",
  };

  return `You are a senior PM creating a realistic scenario for a PM practice tool.

Create a challenging real-world scenario about ${categoryContext[categoryKey] || categoryKey}.

The scenario should:
- Be specific and realistic, set at a believable tech company
- Include concrete details (numbers, names, timelines) to make it feel real
- Present a genuine challenge with competing pressures
- Be answerable in 3-8 sentences by someone with good PM instincts
- Feel urgent and high-stakes

Format your response EXACTLY like this with no extra text:
SCENARIO:
[2-4 sentences describing the specific situation. Be vivid and specific.]

CHALLENGE:
[1-2 sentences stating exactly what the PM needs to do or decide right now.]`;
};

// ─── Grading prompt ───────────────────────────────────────────────────────────

export const buildScenarioGradingPrompt = (category, scenario, challenge, answer) => `
You are a senior Product Manager evaluating a student's response to a PM scenario.

Category: ${category.label}

Scenario:
${scenario}

Challenge:
${challenge}

Student's answer:
${answer}

Evaluate the response on these criteria:
- Does it directly address the challenge?
- Is the thinking structured and clear?
- Does it show good PM judgment and prioritization?
- Are the proposed actions specific and actionable (not vague)?
- Does it demonstrate awareness of stakeholders and trade-offs?

Grade this response on a scale of 50-100 (also express as a letter grade A/B/C/D/F).

Also write a model answer showing what an ideal response looks like — specific, structured, and actionable. The model answer should be 3-6 sentences.

Respond ONLY in this exact JSON format, no markdown fences, no extra text:
{
  "score": 82,
  "letterGrade": "B",
  "feedback": "2-3 sentence assessment of what the student did well and what was missing.",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "modelAnswer": "A clear, specific, senior-PM-level response to the scenario that demonstrates ideal thinking and action."
}`;