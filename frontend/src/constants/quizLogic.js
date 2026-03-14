import { GLOSSARY } from "./glossaryContent";

// ─── Flatten all terms from all categories ────────────────────────────────────

export const ALL_TERMS = GLOSSARY.flatMap((cat) =>
  cat.terms.map((term) => ({ ...term, category: cat.key, categoryLabel: cat.label }))
);

// ─── Get terms for a given category key (or all) ──────────────────────────────

export function getTermsForCategory(categoryKey) {
  if (categoryKey === "all") return ALL_TERMS;
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
// Takes the correct term and picks 3 wrong definitions from the pool

function generateChoices(correctTerm, allTerms) {
  const wrong = shuffle(
    allTerms.filter((t) => t.name !== correctTerm.name)
  ).slice(0, 3);

  const choices = shuffle([
    { text: correctTerm.definition, correct: true },
    ...wrong.map((t) => ({ text: t.definition, correct: false })),
  ]);

  return choices;
}

// ─── Build a quiz ─────────────────────────────────────────────────────────────
// Returns an array of question objects ready to render

export function buildQuiz(categoryKey, questionCount) {
  const pool    = getTermsForCategory(categoryKey);
  const picked  = shuffle(pool).slice(0, questionCount);

  return picked.map((term) => ({
    termName:     term.name,
    category:     term.category,
    categoryLabel: term.categoryLabel,
    choices:      generateChoices(term, ALL_TERMS),
    userAnswer:   null,   // filled in as user answers
    correct:      false,  // filled in after grading
  }));
}

// ─── Grade a completed quiz ───────────────────────────────────────────────────

export function gradeQuiz(questions) {
  const graded = questions.map((q) => {
    const correctChoice = q.choices.find((c) => c.correct);
    const correct = q.userAnswer === correctChoice?.text;
    return { ...q, correct };
  });

  const numCorrect  = graded.filter((q) => q.correct).length;
  const total       = graded.length;
  const pct         = numCorrect / total;

  // Map to 50-100 scale to match the rest of the app
  const score = Math.round(50 + pct * 50);

  const letterGrade =
    pct >= 0.9 ? "A" :
    pct >= 0.8 ? "B" :
    pct >= 0.7 ? "C" :
    pct >= 0.6 ? "D" : "F";

  return { graded, score, letterGrade, numCorrect, total };
}

// ─── Category options for the picker ─────────────────────────────────────────

export const QUIZ_CATEGORIES = [
  { key: "all", label: "All Categories", emoji: "🎲" },
  ...GLOSSARY.map((cat) => ({ key: cat.key, label: cat.label, emoji: cat.emoji })),
];
