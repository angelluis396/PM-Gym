import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  EXERCISES,
  buildContextPrompt,
  buildFocusedGradingPrompt,
} from "../constants/focusedExercises";
import {
  generateFocusedContext,
  gradeFocusedAnswer,
  saveFocusedSession,
} from "../api/focusedSessions";
import GradeCircle from "../components/GradeCircle";
import { sharedStyles, colors } from "../constants/styles";

// ─── Phases ───────────────────────────────────────────────────────────────────

const PHASES = {
  PICK:     "pick",
  LOADING:  "loading",
  EXERCISE: "exercise",
  GRADING:  "grading",
  RESULTS:  "results",
};

// ─── Exercise picker card ─────────────────────────────────────────────────────

function ExerciseCard({ exercise, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(99,102,241,0.08)" : "rgba(30,41,59,0.8)",
        border: `1px solid ${hovered ? colors.indigo : colors.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{exercise.emoji}</div>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6, color: colors.text }}>
        {exercise.label}
      </div>
      <div style={{ fontSize: 13, color: colors.slate, lineHeight: 1.6 }}>
        {exercise.description}
      </div>
    </div>
  );
}

// ─── Context block ────────────────────────────────────────────────────────────

function ContextBlock({ label, content }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e1b4b, #312e81)",
      border: "1px solid #4f46e5",
      borderRadius: 12,
      padding: 24,
      marginBottom: 24,
    }}>
      <div style={{
        fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "#818cf8", fontWeight: 700, marginBottom: 10,
      }}>
        {label}
      </div>
      <p style={{
        fontSize: 15, lineHeight: 1.7, color: "#c7d2fe",
        margin: 0, whiteSpace: "pre-wrap",
      }}>
        {content}
      </p>
    </div>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────

function FocusedResults({ results, exercise, onRetry, onPickNew, onDashboard }) {
  return (
    <div>
      {/* Grade */}
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>
          {exercise.emoji} {exercise.label} — Results
        </h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <GradeCircle score={results.score} letter={results.letterGrade} />
        </div>
        <p style={{ color: colors.slate, lineHeight: 1.7, margin: 0, fontSize: 15 }}>
          {results.feedback}
        </p>
      </div>

      {/* Strengths */}
      {results.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}` }}>
          <h3 style={{ margin: "0 0 12px", color: colors.green, fontSize: 16 }}>✓ Strengths</h3>
          {results.strengths.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 14, marginBottom: 6, paddingLeft: 12 }}>
              • {s}
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {results.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}` }}>
          <h3 style={{ margin: "0 0 12px", color: colors.amber, fontSize: 16 }}>↑ Areas to Improve</h3>
          {results.improvements.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 14, marginBottom: 6, paddingLeft: 12 }}>
              • {s}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center" }}
          onClick={onRetry}
        >
          ↺ Try Again
        </button>
        <button
          style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}
          onClick={onPickNew}
        >
          ← Pick Exercise
        </button>
        <button
          style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}
          onClick={onDashboard}
        >
          Dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── Main FocusedPractice page ────────────────────────────────────────────────

export default function FocusedPractice({ onGoToDashboard }) {
  const { user } = useAuth();

  const [phase,      setPhase]      = useState(PHASES.PICK);
  const [exercise,   setExercise]   = useState(null);
  const [rawContext, setRawContext]  = useState(""); // full AI response
  const [vision,     setVision]     = useState("");  // extracted vision
  const [context,    setContext]    = useState("");  // extracted extra context
  const [answer,     setAnswer]     = useState("");
  const [results,    setResults]    = useState(null);
  const [error,      setError]      = useState("");

  // ─── Pick exercise ──────────────────────────────────────────────────────────
  async function handlePickExercise(ex) {
    setExercise(ex);
    setPhase(PHASES.LOADING);
    setError("");
    setAnswer("");
    setResults(null);

    try {
      const prompt = buildContextPrompt(ex.key);
      const raw    = await generateFocusedContext(prompt);

      // Parse VISION: and optional extra section from the AI response
      const visionMatch  = raw.match(/VISION:\s*([\s\S]*?)(?=\n[A-Z ]+:|$)/i);
      const extractedVision = visionMatch ? visionMatch[1].trim() : raw.trim();

      // Everything after the vision block is extra context
      const afterVision = raw.replace(/VISION:\s*[\s\S]*?(?=\n[A-Z ]+:|$)/i, "").trim();

      setVision(extractedVision);
      setContext(afterVision);
      setRawContext(raw);
      setPhase(PHASES.EXERCISE);
    } catch (e) {
      setError("Failed to generate exercise. Please try again.");
      setPhase(PHASES.PICK);
    }
  }

  // ─── Submit answer ──────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!answer.trim() || answer.trim().length < 30) {
      setError("Please write a more complete answer before submitting.");
      return;
    }
    setError("");
    setPhase(PHASES.GRADING);

    try {
      const fullContext = vision + (context ? `\n\n${context}` : "");
      const gradingPrompt = buildFocusedGradingPrompt(exercise, vision, fullContext, answer);
      const data = await gradeFocusedAnswer(gradingPrompt);

      // Save to Supabase
      await saveFocusedSession(user.id, exercise.key, vision, context, answer, data);

      setResults(data);
      setPhase(PHASES.RESULTS);
    } catch (e) {
      setError("Grading failed. Please try again.");
      setPhase(PHASES.EXERCISE);
    }
  }

  // ─── Retry same exercise ────────────────────────────────────────────────────
  async function handleRetry() {
    await handlePickExercise(exercise);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── PICK ── */}
      {phase === PHASES.PICK && (
        <>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              margin: "0 0 4px", fontSize: 28, fontWeight: 900,
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Focused Practice
            </h2>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: 15 }}>
              Drill a specific PM skill with targeted exercises and AI feedback.
            </p>
          </div>

          {error && (
            <div style={{
              background: "#450a0a", border: `1px solid ${colors.red}`,
              borderRadius: 8, padding: "12px 16px", marginBottom: 20,
              color: "#fca5a5", fontSize: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}>
            {EXERCISES.map((ex) => (
              <ExerciseCard
                key={ex.key}
                exercise={ex}
                onClick={() => handlePickExercise(ex)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── LOADING ── */}
      {phase === PHASES.LOADING && (
        <div style={{
          ...sharedStyles.card, textAlign: "center", padding: "60px 32px",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{exercise?.emoji}</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Generating your exercise...</h2>
          <p style={{ color: colors.slate, margin: 0 }}>Building your {exercise?.label} challenge.</p>
        </div>
      )}

      {/* ── EXERCISE ── */}
      {phase === PHASES.EXERCISE && (
        <>
          {/* Back button */}
          <button
            onClick={() => setPhase(PHASES.PICK)}
            style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, marginBottom: 24, fontSize: 13 }}
          >
            ← Back to Exercises
          </button>

          {/* Exercise title */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.indigo, fontWeight: 700, marginBottom: 6 }}>
              {exercise.emoji} Focused Exercise
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{exercise.label}</h2>
          </div>

          {/* Vision block */}
          <ContextBlock label="Product Vision" content={vision} />

          {/* Extra context block (roadmap, features, etc.) */}
          {context && (
            <ContextBlock label={exercise.contextLabel} content={context} />
          )}

          {/* Answer field */}
          <div style={sharedStyles.card}>
            <label style={{
              display: "block", fontSize: 13, fontWeight: 700,
              color: colors.slateLight, marginBottom: 6,
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>
              {exercise.inputLabel}
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={exercise.inputHint}
              rows={exercise.rows}
              style={{
                width: "100%", padding: "12px 14px", background: "#1e293b",
                border: `1px solid ${error ? colors.red : colors.border}`,
                borderRadius: 8, color: colors.text, fontSize: 14,
                lineHeight: 1.6, resize: "vertical", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = colors.indigo}
              onBlur={(e) => e.target.style.borderColor = error ? colors.red : colors.border}
            />

            {error && (
              <p style={{ color: colors.red, fontSize: 13, margin: "8px 0 0" }}>⚠️ {error}</p>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center" }}
                onClick={handleSubmit}
              >
                Submit for Grading →
              </button>
              <button
                style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}
                onClick={handleRetry}
              >
                New Prompt
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── GRADING ── */}
      {phase === PHASES.GRADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Grading your answer...</h2>
          <p style={{ color: colors.slate, margin: 0 }}>AI is reviewing your {exercise?.label} response.</p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase === PHASES.RESULTS && results && (
        <>
          <ContextBlock label="Product Vision" content={vision} />
          {context && <ContextBlock label={exercise.contextLabel} content={context} />}
          <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Your Answer
            </div>
            <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {answer}
            </p>
          </div>
          <FocusedResults
            results={results}
            exercise={exercise}
            onRetry={handleRetry}
            onPickNew={() => setPhase(PHASES.PICK)}
            onDashboard={onGoToDashboard}
          />
        </>
      )}

    </div>
  );
}
