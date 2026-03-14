import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { QUIZ_CATEGORIES, buildQuiz, gradeQuiz } from "../constants/quizLogic";
import { saveQuizSession } from "../api/quizSessions";
import GradeCircle from "../components/GradeCircle";
import { sharedStyles, colors } from "../constants/styles";

const PHASES = { SETUP:"setup", QUIZ:"quiz", RESULTS:"results" };

function QuizSetup({ onStart, isMobile }) {
  const [categoryKey,   setCategoryKey]   = useState("all");
  const [questionCount, setQuestionCount] = useState(5);
  const selectedCat = QUIZ_CATEGORIES.find(c => c.key === categoryKey);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 22 : 28, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Glossary Quiz</h2>
        <p style={{ color: colors.textMuted, margin: 0, fontSize: 14 }}>Test your knowledge of PM terminology.</p>
      </div>
      <div style={sharedStyles.card}>
        {/* Category picker */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>Category</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {QUIZ_CATEGORIES.map(cat => {
              const active = categoryKey === cat.key;
              return (
                <button key={cat.key} onClick={() => setCategoryKey(cat.key)} style={{ padding: isMobile ? "10px 10px" : "12px 14px", borderRadius: 10, border: `1px solid ${active ? colors.indigo : colors.border}`, background: active ? "rgba(99,102,241,0.12)" : "rgba(30,41,59,0.6)", color: active ? "#c7d2fe" : colors.slate, fontWeight: active ? 700 : 600, fontSize: isMobile ? 12 : 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6, textAlign: "left" }}>
                  <span>{cat.emoji}</span><span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question count */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>Questions</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[5, 10].map(n => {
              const active = questionCount === n;
              return (
                <button key={n} onClick={() => setQuestionCount(n)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${active ? colors.indigo : colors.border}`, background: active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(30,41,59,0.6)", color: active ? "white" : colors.slate, fontWeight: 800, fontSize: 18, cursor: "pointer", fontFamily: "'Playfair Display', serif", transition: "all 0.15s", boxShadow: active ? "0 2px 12px rgba(99,102,241,0.4)" : "none" }}>
                  {n}<div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, fontFamily: "'Inter', sans-serif" }}>questions</div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={() => onStart(categoryKey, questionCount)} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, width: "100%", justifyContent: "center", fontSize: 15 }}>
          {selectedCat?.emoji} Start {questionCount}-Question Quiz →
        </button>
      </div>
    </div>
  );
}

function QuizQuestion({ question, questionNumber, totalQuestions, onAnswer, isMobile }) {
  const [selected, setSelected] = useState(null);
  const isLastQuestion = questionNumber === totalQuestions;

  function handleSelect(text) { if (selected) return; setSelected(text); }
  function handleNext() { if (!selected) return; onAnswer(selected); setSelected(null); }

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>Question {questionNumber} of {totalQuestions}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, color: "#a5b4fc" }}>{question.categoryLabel}</span>
        </div>
        <div style={{ height: 4, background: colors.border, borderRadius: 2 }}>
          <div style={{ height: "100%", width: `${((questionNumber - 1) / totalQuestions) * 100}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Term */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", border: "1px solid #4f46e5", borderRadius: 12, padding: isMobile ? "20px 16px" : "28px 24px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#818cf8", fontWeight: 700, marginBottom: 8 }}>Which definition matches?</div>
        <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: "#e2e8f0", fontFamily: "'Playfair Display', serif" }}>{question.termName}</div>
      </div>

      {/* Choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {question.choices.map((choice, i) => {
          const isSelected = selected === choice.text;
          const isCorrect  = choice.correct;
          let borderColor = colors.border, bg = "rgba(30,41,59,0.8)", textColor = colors.slateLight;
          if (selected) {
            if (isCorrect) { borderColor = colors.green; bg = "rgba(34,197,94,0.1)"; textColor = "#86efac"; }
            else if (isSelected) { borderColor = colors.red; bg = "rgba(239,68,68,0.1)"; textColor = "#fca5a5"; }
          }
          return (
            <button key={i} onClick={() => handleSelect(choice.text)} disabled={!!selected} style={{ padding: isMobile ? "12px 14px" : "16px 18px", borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: isMobile ? 13 : 14, lineHeight: 1.6, textAlign: "left", cursor: selected ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `2px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: selected && isCorrect ? colors.green : selected && isSelected ? colors.red : colors.slate }}>
                {selected && isCorrect ? "✓" : selected && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
              </span>
              {choice.text}
            </button>
          );
        })}
      </div>

      {selected && (
        <button onClick={handleNext} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, width: "100%", justifyContent: "center", fontSize: 15 }}>
          {isLastQuestion ? "See Results →" : "Next Question →"}
        </button>
      )}
    </div>
  );
}

function QuizResults({ result, onRetry, onNewQuiz, onDashboard, isMobile }) {
  const { graded, score, letterGrade, numCorrect, total } = result;
  const wrongTerms = graded.filter(q => !q.correct);
  const rightTerms = graded.filter(q => q.correct);

  return (
    <div>
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>📚 Quiz Results</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><GradeCircle score={score} letter={letterGrade} /></div>
        <p style={{ color: colors.slate, fontSize: 14, margin: 0 }}>You got <strong style={{ color: colors.text }}>{numCorrect} out of {total}</strong> correct.</p>
      </div>

      {wrongTerms.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.red}` }}>
          <h3 style={{ margin: "0 0 14px", color: colors.red, fontSize: 15 }}>✗ Terms to Review ({wrongTerms.length})</h3>
          {wrongTerms.map((q, i) => (
            <div key={i} style={{ marginBottom: 14, padding: "12px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: colors.red, marginBottom: 6 }}>{q.termName}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 3 }}>Correct</div>
              <div style={{ fontSize: 13, color: colors.slateLight, lineHeight: 1.6 }}>{q.choices.find(c => c.correct)?.text}</div>
              {q.userAnswer && <>
                <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginTop: 8, marginBottom: 3 }}>Your Answer</div>
                <div style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.6 }}>{q.userAnswer}</div>
              </>}
            </div>
          ))}
        </div>
      )}

      {rightTerms.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.green, fontSize: 15 }}>✓ Terms You Knew ({rightTerms.length})</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {rightTerms.map((q, i) => <span key={i} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac", fontSize: 12, fontWeight: 600 }}>{q.termName}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: 14 }} onClick={onRetry}>↺ Retry</button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={onNewQuiz}>← New Quiz</button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={onDashboard}>Dashboard →</button>
      </div>
    </div>
  );
}

export default function GlossaryQuiz({ onGoToDashboard }) {
  const { user } = useAuth();
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const [phase,         setPhase]         = useState(PHASES.SETUP);
  const [questions,     setQuestions]     = useState([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [result,        setResult]        = useState(null);
  const [categoryKey,   setCategoryKey]   = useState("all");
  const [questionCount, setQuestionCount] = useState(5);

  function handleStart(catKey, qCount) {
    const quiz = buildQuiz(catKey, qCount);
    setCategoryKey(catKey); setQuestionCount(qCount);
    setQuestions(quiz); setCurrentIndex(0); setResult(null);
    setPhase(PHASES.QUIZ);
  }

  function handleAnswer(choiceText) {
    const updated = questions.map((q, i) => i === currentIndex ? { ...q, userAnswer: choiceText } : q);
    setQuestions(updated);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz(updated);
    }
  }

  async function finishQuiz(finalQuestions) {
    const gradeResult = gradeQuiz(finalQuestions);
    setResult(gradeResult); setPhase(PHASES.RESULTS);
    try { await saveQuizSession(user.id, categoryKey, questionCount, gradeResult.score, gradeResult.letterGrade, gradeResult.graded); } catch (e) {}
  }

  return (
    <div>
      {phase === PHASES.SETUP   && <QuizSetup onStart={handleStart} isMobile={isMobile} />}
      {phase === PHASES.QUIZ    && questions.length > 0 && <QuizQuestion question={questions[currentIndex]} questionNumber={currentIndex + 1} totalQuestions={questions.length} onAnswer={handleAnswer} isMobile={isMobile} />}
      {phase === PHASES.RESULTS && result && <QuizResults result={result} onRetry={() => handleStart(categoryKey, questionCount)} onNewQuiz={() => setPhase(PHASES.SETUP)} onDashboard={onGoToDashboard} isMobile={isMobile} />}
    </div>
  );
}