import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { EXERCISES, buildContextPrompt, buildFocusedGradingPrompt } from "../constants/focusedExercises";
import { generateFocusedContext, gradeFocusedAnswer, saveFocusedSession } from "../api/focusedSessions";
import GradeCircle from "../components/GradeCircle";
import { sharedStyles, colors } from "../constants/styles";

const PHASES = { PICK:"pick", LOADING:"loading", EXERCISE:"exercise", GRADING:"grading", RESULTS:"results" };

function ExerciseCard({ exercise, onClick, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: hovered ? "rgba(99,102,241,0.08)" : "rgba(30,41,59,0.8)", border: `1px solid ${hovered ? colors.indigo : colors.border}`, borderRadius: 12, padding: isMobile ? "16px" : "20px 24px", cursor: "pointer", transition: "all 0.2s", transform: hovered ? "translateY(-2px)" : "none" }}>
      <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 8 }}>{exercise.emoji}</div>
      <div style={{ fontWeight: 800, fontSize: isMobile ? 14 : 15, marginBottom: 6, color: colors.text }}>{exercise.label}</div>
      {!isMobile && <div style={{ fontSize: 13, color: colors.slate, lineHeight: 1.6 }}>{exercise.description}</div>}
    </div>
  );
}

function ContextBlock({ label, content }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", border: "1px solid #4f46e5", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#818cf8", fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "#c7d2fe", margin: 0, whiteSpace: "pre-wrap" }}>{content}</p>
    </div>
  );
}

function FocusedResults({ results, exercise, onRetry, onPickNew, onDashboard, isMobile }) {
  return (
    <div>
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>{exercise.emoji} {exercise.label} — Results</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><GradeCircle score={results.score} letter={results.letterGrade} /></div>
        <p style={{ color: colors.slate, lineHeight: 1.7, margin: 0, fontSize: 14 }}>{results.feedback}</p>
      </div>
      {results.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.green, fontSize: 15 }}>✓ Strengths</h3>
          {results.strengths.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}
      {results.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.amber, fontSize: 15 }}>↑ Areas to Improve</h3>
          {results.improvements.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: 14 }} onClick={onRetry}>↺ Try Again</button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={onPickNew}>← Exercises</button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={onDashboard}>Dashboard →</button>
      </div>
    </div>
  );
}

export default function FocusedPractice({ onGoToDashboard }) {
  const { user } = useAuth();
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const [phase,      setPhase]      = useState(PHASES.PICK);
  const [exercise,   setExercise]   = useState(null);
  const [vision,     setVision]     = useState("");
  const [context,    setContext]    = useState("");
  const [answer,     setAnswer]     = useState("");
  const [results,    setResults]    = useState(null);
  const [error,      setError]      = useState("");

  async function handlePickExercise(ex) {
    setExercise(ex); setPhase(PHASES.LOADING); setError(""); setAnswer(""); setResults(null);
    try {
      const raw = await generateFocusedContext(buildContextPrompt(ex.key));
      const visionMatch = raw.match(/VISION:\s*([\s\S]*?)(?=\n[A-Z ]+:|$)/i);
      const extractedVision = visionMatch ? visionMatch[1].trim() : raw.trim();
      const afterVision = raw.replace(/VISION:\s*[\s\S]*?(?=\n[A-Z ]+:|$)/i, "").trim();
      setVision(extractedVision); setContext(afterVision); setPhase(PHASES.EXERCISE);
    } catch (e) { setError("Failed to generate exercise."); setPhase(PHASES.PICK); }
  }

  async function handleSubmit() {
    if (!answer.trim() || answer.trim().length < 30) { setError("Please write a more complete answer."); return; }
    setError(""); setPhase(PHASES.GRADING);
    try {
      const fullContext = vision + (context ? `\n\n${context}` : "");
      const data = await gradeFocusedAnswer(buildFocusedGradingPrompt(exercise, vision, fullContext, answer));
      await saveFocusedSession(user.id, exercise.key, vision, context, answer, data);
      setResults(data); setPhase(PHASES.RESULTS);
    } catch (e) { setError("Grading failed."); setPhase(PHASES.EXERCISE); }
  }

  return (
    <div>
      {phase === PHASES.PICK && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 22 : 28, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Focused Practice</h2>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: 14 }}>Drill a specific PM skill with targeted exercises.</p>
          </div>
          {error && <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#fca5a5", fontSize: 14 }}>⚠️ {error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr", gap: isMobile ? 10 : 16 }}>
            {EXERCISES.map(ex => <ExerciseCard key={ex.key} exercise={ex} onClick={() => handlePickExercise(ex)} isMobile={isMobile} />)}
          </div>
        </>
      )}

      {phase === PHASES.LOADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: isMobile ? "40px 20px" : "60px 32px" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>{exercise?.emoji}</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Generating exercise...</h2>
          <p style={{ color: colors.slate, margin: 0, fontSize: 14 }}>Building your {exercise?.label} challenge.</p>
        </div>
      )}

      {phase === PHASES.EXERCISE && (
        <>
          <button onClick={() => setPhase(PHASES.PICK)} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, marginBottom: 20, fontSize: 13 }}>← Back</button>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.indigo, fontWeight: 700, marginBottom: 4 }}>{exercise.emoji} Focused Exercise</div>
            <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 800 }}>{exercise.label}</h2>
          </div>
          <ContextBlock label="Product Vision" content={vision} />
          {context && <ContextBlock label={exercise.contextLabel} content={context} />}
          <div style={sharedStyles.card}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{exercise.inputLabel}</label>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder={exercise.inputHint} rows={exercise.rows} style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${error ? colors.red : colors.border}`, borderRadius: 8, color: colors.text, fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = colors.indigo} onBlur={e => e.target.style.borderColor = error ? colors.red : colors.border} />
            {error && <p style={{ color: colors.red, fontSize: 13, margin: "6px 0 0" }}>⚠️ {error}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: 14 }} onClick={handleSubmit}>Submit →</button>
              <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={() => handlePickExercise(exercise)}>New Prompt</button>
            </div>
          </div>
        </>
      )}

      {phase === PHASES.GRADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: isMobile ? "40px 20px" : "60px 32px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Grading your answer...</h2>
          <p style={{ color: colors.slate, margin: 0, fontSize: 14 }}>Reviewing your {exercise?.label} response.</p>
        </div>
      )}

      {phase === PHASES.RESULTS && results && (
        <>
          <ContextBlock label="Product Vision" content={vision} />
          {context && <ContextBlock label={exercise.contextLabel} content={context} />}
          <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Your Answer</div>
            <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{answer}</p>
          </div>
          <FocusedResults results={results} exercise={exercise} onRetry={() => handlePickExercise(exercise)} onPickNew={() => setPhase(PHASES.PICK)} onDashboard={onGoToDashboard} isMobile={isMobile} />
        </>
      )}
    </div>
  );
}