import { GLOSSARY } from "./glossaryContent";

// ─── Flatten all terms from all categories ────────────────────────────────────

export const ALL_TERMS = GLOSSARY.flatMap((cat) =>
  cat.terms.map((term) => ({ ...term, category: cat.key, categoryLabel: cat.label }))
);

// ─── Get terms for a given category key ──────────────────────────────────────
// "all"    → every term across all categories
// "random" → same pool, but question count is always 5 or 10
// anything else → just that category's terms

export function getTermsForCategory(categoryKey) {
  if (categoryKey === "all" || categoryKey === "random") return ALL_TERMS;
  return ALL_TERMS.filter((t) => t.category === categoryKey);
}

// ─── Shuffle array ────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Generate multiple choice options ────────────────────────────────────────

function generateChoices(correctTerm, allTerms) {
  const wrong = shuffle(
    allTerms.filter((t) => t.name !== correctTerm.name)
  ).slice(0, 3);

  return shuffle([
    { text: correctTerm.definition, correct: true },
    ...wrong.map((t) => ({ text: t.definition, correct: false })),
  ]);
}

// ─── Build a quiz ─────────────────────────────────────────────────────────────
// questionCount: 5 | 10 | "all"
// "all" uses every term in the pool (no cap)

export function buildQuiz(categoryKey, questionCount) {
  const pool   = getTermsForCategory(categoryKey);
  const picked = questionCount === "all"
    ? shuffle(pool)
    : shuffle(pool).slice(0, questionCount);

  return picked.map((term) => ({
    termName:      term.name,
    category:      term.category,
    categoryLabel: term.categoryLabel,
    choices:       generateChoices(term, ALL_TERMS),
    userAnswer:    null,
    correct:       false,
  }));
}

// ─── Grade a completed quiz ───────────────────────────────────────────────────

export function gradeQuiz(questions) {
  const graded = questions.map((q) => {
    const correctChoice = q.choices.find((c) => c.correct);
    const correct = q.userAnswer === correctChoice?.text;
    return { ...q, correct };
  });

  const numCorrect = graded.filter((q) => q.correct).length;
  const total      = graded.length;
  const pct        = numCorrect / total;
  const score      = Math.round(50 + pct * 50);

  const letterGrade =
    pct >= 0.9 ? "A" :
    pct >= 0.8 ? "B" :
    pct >= 0.7 ? "C" :
    pct >= 0.6 ? "D" : "F";

  return { graded, score, letterGrade, numCorrect, total };
}

// ─── Category options for the picker ─────────────────────────────────────────

export const QUIZ_CATEGORIES = [
  { key: "all", label: "All Categories", emoji: "📚", randomOnly: false },
  ...GLOSSARY.map((cat) => ({ key: cat.key, label: cat.label, emoji: cat.emoji, randomOnly: false })),
];