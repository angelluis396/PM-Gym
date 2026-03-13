import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  SCENARIO_CATEGORIES,
  buildScenarioPrompt,
  buildScenarioGradingPrompt,
} from "../constants/scenarioCategories";
import {
  generateScenario,
  gradeScenario,
  saveScenarioSession,
} from "../api/scenarioSessions";
import GradeCircle from "../components/GradeCircle";
import { sharedStyles, colors } from "../constants/styles";

// ─── Phases ───────────────────────────────────────────────────────────────────

const PHASES = {
  PICK:     "pick",
  LOADING:  "loading",
  ANSWER:   "answer",
  GRADING:  "grading",
  RESULTS:  "results",
};

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({ category, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `${category.color}12` : "rgba(30,41,59,0.8)",
        border: `1px solid ${hovered ? category.color : colors.border}`,
        borderRadius: 12, padding: "20px 24px", cursor: "pointer",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{category.emoji}</div>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6, color: colors.text }}>
        {category.label}
      </div>
      <div style={{ fontSize: 13, color: colors.slate, lineHeight: 1.6 }}>
        {category.description}
      </div>
    </div>
  );
}

// ─── Scenario block ───────────────────────────────────────────────────────────

function ScenarioBlock({ category, scenario, challenge }) {
  return (
    <>
      <div style={{
        background: `linear-gradient(135deg, ${category.color}18, ${category.color}08)`,
        border: `1px solid ${category.color}40`,
        borderRadius: 12, padding: 24, marginBottom: 16,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
          color: category.color, fontWeight: 700, marginBottom: 10,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {category.emoji} {category.label} Scenario
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: colors.text, margin: 0 }}>
          {scenario}
        </p>
      </div>

      <div style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 12, padding: 20, marginBottom: 24,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
          color: colors.red, fontWeight: 700, marginBottom: 8,
        }}>
          ⚡ Your Challenge
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "#fca5a5", margin: 0, fontWeight: 600 }}>
          {challenge}
        </p>
      </div>
    </>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────

function ScenarioResults({ results, category, scenario, challenge, answer, onRetry, onPickNew, onDashboard }) {
  const [showModel, setShowModel] = useState(false);

  return (
    <div>
      {/* Scenario recap */}
      <ScenarioBlock category={category} scenario={scenario} challenge={challenge} />

      {/* Grade */}
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>
          {category.emoji} {category.label} — Results
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
          <h3 style={{ margin: "0 0 12px", color: colors.green, fontSize: 16 }}>✓ What you did well</h3>
          {results.strengths.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 14, marginBottom: 6, paddingLeft: 12 }}>• {s}</div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {results.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}` }}>
          <h3 style={{ margin: "0 0 12px", color: colors.amber, fontSize: 16 }}>↑ What could be stronger</h3>
          {results.improvements.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 14, marginBottom: 6, paddingLeft: 12 }}>• {s}</div>
          ))}
        </div>
      )}

      {/* Your answer */}
      <div style={sharedStyles.card}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800 }}>Your Answer</h3>
        <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {answer}
        </p>
      </div>

      {/* Model answer — collapsible, always present */}
      <div style={sharedStyles.card}>
        <button
          onClick={() => setShowModel(!showModel)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", padding: 0, fontFamily: "inherit",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: colors.text }}>
            💡 Model Answer
          </h3>
          <span style={{
            color: colors.slate, fontSize: 20,
            transition: "transform 0.2s",
            transform: showModel ? "rotate(180deg)" : "none",
            display: "inline-block",
          }}>
            ↓
          </span>
        </button>

        {showModel && (
          <div style={{
            marginTop: 16, padding: 16,
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 8,
          }}>
            <p style={{ margin: 0, fontSize: 14, color: "#c7d2fe", lineHeight: 1.8 }}>
              {results.modelAnswer}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center" }}
          onClick={onRetry}
        >
          ↺ New {category.label} Scenario
        </button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }} onClick={onPickNew}>
          ← Categories
        </button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }} onClick={onDashboard}>
          Dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── Main ScenarioRuns page ───────────────────────────────────────────────────

export default function ScenarioRuns({ onGoToDashboard }) {
  const { user } = useAuth();

  const [phase,     setPhase]     = useState(PHASES.PICK);
  const [category,  setCategory]  = useState(null);
  const [scenario,  setScenario]  = useState("");
  const [challenge, setChallenge] = useState("");
  const [answer,    setAnswer]    = useState("");
  const [results,   setResults]   = useState(null);
  const [error,     setError]     = useState("");

  async function handlePickCategory(cat) {
    setCategory(cat);
    setPhase(PHASES.LOADING);
    setError(""); setAnswer(""); setResults(null);
    try {
      const prompt = buildScenarioPrompt(cat.key);
      const data   = await generateScenario(prompt);
      setScenario(data.scenario);
      setChallenge(data.challenge);
      setPhase(PHASES.ANSWER);
    } catch (e) {
      setError("Failed to generate scenario. Please try again.");
      setPhase(PHASES.PICK);
    }
  }

  async function handleSubmit() {
    if (!answer.trim() || answer.trim().length < 20) {
      setError("Please write a more complete answer before submitting.");
      return;
    }
    setError("");
    setPhase(PHASES.GRADING);
    try {
      const gradingPrompt = buildScenarioGradingPrompt(category, scenario, challenge, answer);
      const data = await gradeScenario(gradingPrompt);
      await saveScenarioSession(user.id, category.key, scenario, challenge, answer, data);
      setResults(data);
      setPhase(PHASES.RESULTS);
    } catch (e) {
      setError("Grading failed. Please try again.");
      setPhase(PHASES.ANSWER);
    }
  }

  async function handleRetry() {
    await handlePickCategory(category);
  }

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
              Scenario Runs
            </h2>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: 15 }}>
              Pick a category and respond to a realistic PM scenario. Graded A–F with a model answer to compare against.
            </p>
          </div>

          {error && (
            <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#fca5a5", fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {SCENARIO_CATEGORIES.map((cat) => (
              <CategoryCard key={cat.key} category={cat} onClick={() => handlePickCategory(cat)} />
            ))}
          </div>
        </>
      )}

      {/* ── LOADING ── */}
      {phase === PHASES.LOADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{category?.emoji}</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Building your scenario...</h2>
          <p style={{ color: colors.slate, margin: 0 }}>Creating a {category?.label} challenge for you.</p>
        </div>
      )}

      {/* ── ANSWER ── */}
      {phase === PHASES.ANSWER && (
        <>
          <button
            onClick={() => setPhase(PHASES.PICK)}
            style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, marginBottom: 24, fontSize: 13 }}
          >
            ← Back to Categories
          </button>

          <ScenarioBlock category={category} scenario={scenario} challenge={challenge} />

          <div style={sharedStyles.card}>
            <label style={{
              display: "block", fontSize: 13, fontWeight: 700,
              color: colors.slateLight, marginBottom: 6,
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>
              Your Response
            </label>
            <p style={{ color: colors.textMuted, fontSize: 13, margin: "0 0 12px" }}>
              Answer in 3–8 sentences. Be specific, structured, and decisive.
            </p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="What do you do? Walk through your thinking and the specific actions you'd take..."
              rows={6}
              style={{
                width: "100%", padding: "12px 14px", background: "#1e293b",
                border: `1px solid ${error ? colors.red : colors.border}`,
                borderRadius: 8, color: colors.text, fontSize: 14,
                lineHeight: 1.6, resize: "vertical", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = colors.indigo}
              onBlur={(e)  => e.target.style.borderColor = error ? colors.red : colors.border}
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
                New Scenario
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── GRADING ── */}
      {phase === PHASES.GRADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Grading your response...</h2>
          <p style={{ color: colors.slate, margin: 0 }}>
            Evaluating your {category?.label} answer and preparing a model response.
          </p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase === PHASES.RESULTS && results && (
        <ScenarioResults
          results={results}
          category={category}
          scenario={scenario}
          challenge={challenge}
          answer={answer}
          onRetry={handleRetry}
          onPickNew={() => setPhase(PHASES.PICK)}
          onDashboard={onGoToDashboard}
        />
      )}
    </div>
  );
}