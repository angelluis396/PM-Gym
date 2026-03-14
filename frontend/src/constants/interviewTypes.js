// ─── Question types ───────────────────────────────────────────────────────────

export const INTERVIEW_TYPES = [
  {
    key:         "behavioral",
    label:       "Behavioral",
    emoji:       "🧠",
    color:       "#6366f1",
    description: "Tell me about a time you...",
    tip:         "Use the STAR framework: Situation, Task, Action, Result.",
    framework:   ["Situation", "Task", "Action", "Result"],
  },
  {
    key:         "product_design",
    label:       "Product Design",
    emoji:       "🎨",
    color:       "#8b5cf6",
    description: "Design a product for...",
    tip:         "Clarify goals, define users, identify needs, then propose solutions.",
    framework:   ["Clarify & Goals", "Target User", "User Needs & Pain Points", "Solutions & Features", "Prioritisation", "Trade-offs & Metrics"],
  },
  {
    key:         "estimation",
    label:       "Estimation",
    emoji:       "🔢",
    color:       "#06b6d4",
    description: "How many X are there in Y?",
    tip:         "Break the problem into components, estimate each, then sanity check.",
    framework:   ["Clarify the Question", "Break into Components", "Estimate Each Part", "Calculate Total", "Sanity Check"],
  },
  {
    key:         "metrics",
    label:       "Metrics",
    emoji:       "📉",
    color:       "#f59e0b",
    description: "A metric dropped — what do you do?",
    tip:         "Confirm the data, segment it, form hypotheses, then recommend action.",
    framework:   ["Confirm & Clarify", "Segment the Data", "Generate Hypotheses", "Investigate Root Cause", "Recommended Action"],
  },
  {
    key:         "strategy",
    label:       "Strategy",
    emoji:       "♟️",
    color:       "#10b981",
    description: "Should [company] build/enter/invest in X?",
    tip:         "Frame the business context, analyse options, make a clear recommendation.",
    framework:   ["Company Context & Goals", "Market & Opportunity", "Options & Analysis", "Recommendation", "Risks & Trade-offs"],
  },
  {
    key:         "technical",
    label:       "Technical",
    emoji:       "⚙️",
    color:       "#ef4444",
    description: "How would you build / approach X technically?",
    tip:         "Clarify requirements, outline the architecture, discuss trade-offs.",
    framework:   ["Clarify Requirements", "High-Level Approach", "Key Components", "Trade-offs & Alternatives", "Scaling Considerations"],
  },
];

// ─── Company types ────────────────────────────────────────────────────────────

export const COMPANY_TYPES = [
  {
    key:         "faang",
    label:       "FAANG / Big Tech",
    emoji:       "🏢",
    description: "Google, Meta, Amazon, Apple, Microsoft",
    color:       "#6366f1",
  },
  {
    key:         "startup",
    label:       "Startup / Growth",
    emoji:       "🚀",
    description: "Series A–C, fast-moving, resource-constrained",
    color:       "#10b981",
  },
];

// ─── Prompt builders ──────────────────────────────────────────────────────────

export function buildInterviewQuestionPrompt(typeKey, companyKey) {
  const type    = INTERVIEW_TYPES.find(t => t.key === typeKey);
  const company = COMPANY_TYPES.find(c => c.key === companyKey);

  const companyContext = companyKey === "faang"
    ? "a large tech company (think Google, Meta, or Amazon) with millions of users, complex org structures, and high engineering standards"
    : "a Series B startup with 50–200 employees, limited resources, moving fast, and trying to find product-market fit";

  const typeInstructions = {
    behavioral:     "Generate a challenging behavioral interview question that tests leadership, conflict resolution, prioritisation, or stakeholder management. Use 'Tell me about a time when...' or 'Describe a situation where...' format.",
    product_design: "Generate a product design question asking the candidate to design a new product or feature for a specific user group or problem space. Be specific — name a user group and a context.",
    estimation:     "Generate a market sizing or estimation question relevant to a tech PM. Ask the candidate to estimate a specific number (e.g. daily active users, revenue, count of something). Be specific.",
    metrics:        "Generate a metrics question where a specific KPI has dropped or behaved unexpectedly. Name the product, the metric, and the percentage change. Ask what the candidate would do.",
    strategy:       "Generate a product strategy question asking whether the company should enter a market, build a feature, acquire a company, or make a major product bet. Be specific about the decision.",
    technical:      "Generate a technical PM question about system design, data pipelines, APIs, or technical architecture relevant to a PM (not a pure engineering question). Ask how they would approach building or evaluating something.",
  };

  return `You are a senior PM interviewer at ${companyContext}.

${typeInstructions[typeKey]}

The question should be realistic, specific, and appropriately challenging for a mid-to-senior PM candidate.

Respond ONLY in this exact JSON format, no markdown fences, no extra text:
{
  "question": "The full interview question text",
  "context": "1-2 sentences of additional context or constraints the interviewer adds after asking (optional — leave empty string if not needed)"
}`;
}

export function buildInterviewGradingPrompt(type, companyType, question, answerMode, answer) {
  const companyContext = companyType === "faang"
    ? "a large tech company (Google, Meta, Amazon level)"
    : "a Series B startup";

  const frameworkNote = answerMode === "structured"
    ? `The candidate used a structured framework with sections: ${type.framework.join(" → ")}. Evaluate how well they used each section.`
    : "The candidate answered freeform. Evaluate the quality, structure, and depth of their response.";

  return `You are a senior PM interviewer at ${companyContext} evaluating a candidate's answer to a ${type.label} interview question.

Question: "${question}"

${frameworkNote}

Candidate's answer:
"${answer}"

Grade this answer fairly but rigorously as you would in a real PM interview. Consider clarity, structure, depth, specificity, and whether it demonstrates strong PM thinking.

Respond ONLY in this exact JSON format, no markdown fences, no extra text:
{
  "score": <integer 50-100>,
  "letterGrade": "<A|B|C|D|F>",
  "feedback": "2-3 sentence overall assessment of the answer",
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "modelAnswer": "A strong model answer to this question — 150-250 words, well-structured, specific",
  "interviewerPerspective": "What a real interviewer would think and feel reading this answer — be honest, specific, and candid. 2-3 sentences written in first person as the interviewer."
}`;
}
