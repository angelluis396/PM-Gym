// ─── Exercise definitions ─────────────────────────────────────────────────────
// Each exercise has:
//   key         — matches exercise_type in the database
//   label       — display name
//   description — shown on the exercise picker card
//   contextLabel — label shown above the AI-provided context block
//   inputLabel  — label above the user's answer textarea
//   inputHint   — placeholder text
//   rows        — textarea height

export const EXERCISES = [
  {
    key:          "epics_stories",
    label:        "Epics & Stories",
    emoji:        "📖",
    description:  "Given a product vision and roadmap, write a meaningful epic and break it down into detailed user stories.",
    contextLabel: "Product Vision & Roadmap",
    inputLabel:   "Your Epic & User Stories",
    inputHint:    "Epic: As a [user], I need to [action], so I can [outcome].\n\nStories:\n• As a [user], I need to [specific action], so I can [outcome].\n• As a [user], I need to [specific action], so I can [outcome].",
    rows:         10,
  },
  {
    key:          "roadmap",
    label:        "Product Roadmap",
    emoji:        "🗺️",
    description:  "Given a product vision and key features, build a realistic quarterly roadmap that balances scope and delivery.",
    contextLabel: "Product Vision & Key Features",
    inputLabel:   "Your Product Roadmap",
    inputHint:    "Q1: ...\nQ2: ...\nQ3: ...\nQ4: ...\nNext Year: ...",
    rows:         8,
  },
  {
    key:          "release_plan",
    label:        "Release Plan",
    emoji:        "🚀",
    description:  "Given a product vision and roadmap, define clear release milestones with specific user-facing outcomes for each.",
    contextLabel: "Product Vision & Roadmap",
    inputLabel:   "Your Release Plan",
    inputHint:    "Release 1:\n• User can...\n• User can...\n\nRelease 2:\n• User can...\n\nRelease 3:\n• User can...",
    rows:         8,
  },
  {
    key:          "key_features",
    label:        "Key Features & Value Proposition",
    emoji:        "⭐",
    description:  "Given a product vision and target group, define the key features and articulate a clear value proposition.",
    contextLabel: "Product Vision & Target Group",
    inputLabel:   "Your Key Features & Value Proposition",
    inputHint:    "Key Features:\n• Feature 1: ...\n• Feature 2: ...\n• Feature 3: ...\n\nValue Proposition:\n...",
    rows:         8,
  },
  {
    key:          "target_group",
    label:        "Target Group & User Needs",
    emoji:        "🎯",
    description:  "Given a product vision, define the target group in detail and identify their core needs and pain points.",
    contextLabel: "Product Vision",
    inputLabel:   "Your Target Group & User Needs",
    inputHint:    "Target Group:\n...\n\nUser Needs:\n• Need 1: ...\n• Need 2: ...\n• Need 3: ...\n\nPain Points:\n• ...",
    rows:         8,
  },
  {
    key:          "problem_metrics",
    label:        "Problem Definition & Success Metrics",
    emoji:        "📊",
    description:  "Given a product vision, clearly define the problem being solved and establish measurable success metrics.",
    contextLabel: "Product Vision",
    inputLabel:   "Your Problem Definition & Success Metrics",
    inputHint:    "Problem Statement:\n...\n\nWho is affected:\n...\n\nSuccess Metrics:\n• Metric 1: ...\n• Metric 2: ...\n• Metric 3: ...",
    rows:         8,
  },
];

// ─── Context generation prompts ───────────────────────────────────────────────
// Each exercise gets a prompt to generate the vision + extra context

export const buildContextPrompt = (exerciseKey) => {
  const base = `You are a creative product manager. Generate a product vision for a completely made-up mobile or web application using this format:
"For [target users] who [need/problem], the [Product Name] is a [product type] that [key benefit]. Unlike [competitor/alternative], our product [differentiator]."

Vary the industry — fitness, food, education, finance, travel, healthcare, social, productivity, etc.`;

  const extras = {
    epics_stories: `After the vision, also generate a simple product roadmap with 4 quarters (Q1-Q4) and a "Next Year" column. List 2-3 features per quarter.

Format your response exactly like this:
VISION:
[vision text]

ROADMAP:
Q1: [features]
Q2: [features]
Q3: [features]
Q4: [features]
Next Year: [features]`,

    roadmap: `After the vision, list 5-7 key features of the product, each with a one-sentence description.

Format your response exactly like this:
VISION:
[vision text]

KEY FEATURES:
• [Feature name]: [description]
• [Feature name]: [description]
(continue for all features)`,

    release_plan: `After the vision, generate a simple product roadmap with 4 quarters (Q1-Q4).

Format your response exactly like this:
VISION:
[vision text]

ROADMAP:
Q1: [features]
Q2: [features]
Q3: [features]
Q4: [features]
Next Year: [features]`,

    key_features: `After the vision, describe the target group in 2-3 sentences — who they are, what their day looks like, and what frustrates them.

Format your response exactly like this:
VISION:
[vision text]

TARGET GROUP:
[description]`,

    target_group: `Just provide the vision. No extra context needed.

Format your response exactly like this:
VISION:
[vision text]`,

    problem_metrics: `Just provide the vision. No extra context needed.

Format your response exactly like this:
VISION:
[vision text]`,
  };

  return `${base}\n\n${extras[exerciseKey] || extras.target_group}\n\nRespond with ONLY the formatted content above — no extra commentary.`;
};

// ─── Grading prompts ──────────────────────────────────────────────────────────

export const buildFocusedGradingPrompt = (exercise, vision, context, answer) => {
  const rubrics = {
    epics_stories: `Evaluate:
- Does the epic follow the correct "As a [user], I need to [action], so I can [outcome]" format?
- Is the epic meaningful and aligned with the product vision?
- Are the user stories specific, actionable, and properly broken down from the epic?
- Do the stories follow the correct user story format?
- Is the scope of each story appropriate (not too broad, not too narrow)?`,

    roadmap: `Evaluate:
- Does the roadmap follow a logical progression from foundational to advanced features?
- Are features appropriately sequenced (core first, enhancements later)?
- Is the scope realistic for each quarter?
- Does the roadmap align with the product vision and key features provided?
- Is there a clear sense of priority and strategic thinking?`,

    release_plan: `Evaluate:
- Are releases clearly defined with specific user-facing outcomes?
- Do releases follow a logical progression of value delivery?
- Is each release scoped appropriately (not too big, not too small)?
- Does the release plan align with the roadmap provided?
- Are user stories in the correct format ("User can...")?`,

    key_features: `Evaluate:
- Are the features directly relevant to the product vision and target group?
- Is each feature clearly described and distinct?
- Does the value proposition clearly articulate what makes this product valuable?
- Does the value proposition differentiate from alternatives?
- Is there clear alignment between features and value proposition?`,

    target_group: `Evaluate:
- Is the target group specific and well-defined (not too broad)?
- Are the user needs clearly identified and relevant to the product?
- Are pain points specific and believable for this user group?
- Does the target group description align with the product vision?
- Is there evidence of empathy and understanding of the user?`,

    problem_metrics: `Evaluate:
- Is the problem statement clear, specific, and well-articulated?
- Does it identify who is affected and how?
- Are the success metrics measurable and specific (not vague)?
- Are the metrics realistic and relevant to the problem?
- Is there a logical connection between the problem and the proposed metrics?`,
  };

  return `You are a senior Product Manager evaluating a student's focused PM practice exercise.

Exercise type: ${exercise.label}

The student was given this context:
${context}

The student's answer:
${answer}

${rubrics[exercise.key] || ""}

Grade this response on a scale of 50-100 (also express as a letter grade A/B/C/D/F).
Be fair but thorough. Reward clear thinking, correct format usage, and alignment with the vision.

Respond ONLY in this exact JSON format, no markdown fences, no extra text:
{
  "score": 82,
  "letterGrade": "B",
  "feedback": "2-3 sentence overall assessment of the response quality.",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"]
}`;
};
