import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { SCENARIO_CATEGORIES, buildScenarioPrompt, buildScenarioGradingPrompt } from "../constants/scenarioCategories";
import { generateScenario, gradeScenario, saveScenarioSession } from "../api/scenarioSessions";
import { updateStreak } from "../api/streak";
import GradeCircle from "../components/GradeCircle";
import { sharedStyles, colors } from "../constants/styles";

const PHASES = { PICK:"pick", LOADING:"loading", ANSWER:"answer", GRADING:"grading", RESULTS:"results" };

function CategoryCard({ category, onClick, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: hovered ? `${category.color}12` : "rgba(30,41,59,0.8)", border: `1px solid ${hovered ? category.color : colors.border}`, borderRadius: 12, padding: isMobile ? "16px" : "20px 24px", cursor: "pointer", transition: "all 0.2s", transform: hovered ? "translateY(-2px)" : "none" }}>
      <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 8 }}>{category.emoji}</div>
      <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15, marginBottom: isMobile ? 0 : 6, color: colors.text }}>{category.label}</div>
      {!isMobile && <div style={{ fontSize: 13, color: colors.slate, lineHeight: 1.6 }}>{category.description}</div>}
    </div>
  );
}

function ScenarioBlock({ category, scenario, challenge, isMobile }) {
  return (
    <>
      <div style={{ background: `linear-gradient(135deg, ${category.color}18, ${category.color}08)`, border: `1px solid ${category.color}40`, borderRadius: 12, padding: isMobile ? "16px" : "20px 24px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: category.color, fontWeight: 700, marginBottom: 8 }}>{category.emoji} {category.label}</div>
        <p style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.8, color: colors.text, margin: 0 }}>{scenario}</p>
      </div>
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: isMobile ? "14px" : "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.red, fontWeight: 700, marginBottom: 6 }}>⚡ Your Challenge</div>
        <p style={{ fontSize: isMobile ? 13 : 15, lineHeight: 1.7, color: "#fca5a5", margin: 0, fontWeight: 600 }}>{challenge}</p>
      </div>
    </>
  );
}

function ScenarioResults({ results, category, scenario, challenge, answer, onRetry, onPickNew, onDashboard }) {
  const [showModel, setShowModel] = useState(false);
  return (
    <div>
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>{category.emoji} {category.label} — Results</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><GradeCircle score={results.score} letter={results.letterGrade} /></div>
        <p style={{ color: colors.slate, lineHeight: 1.7, margin: 0, fontSize: 14 }}>{results.feedback}</p>
      </div>
      {results.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.green, fontSize: 15 }}>✓ What you did well</h3>
          {results.strengths.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}
      {results.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.amber, fontSize: 15 }}>↑ What could be stronger</h3>
          {results.improvements.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}
      <div style={sharedStyles.card}>
        <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800 }}>Your Answer</h3>
        <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{answer}</p>
      </div>
      <div style={sharedStyles.card}>
        <button onClick={() => setShowModel(!showModel)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0, fontFamily: "inherit" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: colors.text }}>💡 Model Answer</h3>
          <span style={{ color: colors.slate, fontSize: 18, display: "inline-block", transform: showModel ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
        </button>
        {showModel && <div style={{ marginTop: 14, padding: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8 }}><p style={{ margin: 0, fontSize: 14, color: "#c7d2fe", lineHeight: 1.8 }}>{results.modelAnswer}</p></div>}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: 14 }} onClick={onRetry}>↺ New Scenario</button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={onPickNew}>← Categories</button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={onDashboard}>Dashboard →</button>
      </div>
    </div>
  );
}

export default function ScenarioRuns({ onGoToDashboard }) {
  const { user } = useAuth();
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const [phase,     setPhase]     = useState(PHASES.PICK);
  const [category,  setCategory]  = useState(null);
  const [scenario,  setScenario]  = useState("");
  const [challenge, setChallenge] = useState("");
  const [answer,    setAnswer]    = useState("");
  const [results,   setResults]   = useState(null);
  const [error,     setError]     = useState("");

  async function handlePickCategory(cat) {
    setCategory(cat); setPhase(PHASES.LOADING); setError(""); setAnswer(""); setResults(null);
    try {
      const data = await generateScenario(buildScenarioPrompt(cat.key));
      setScenario(data.scenario); setChallenge(data.challenge); setPhase(PHASES.ANSWER);
    } catch (e) { setError("Failed to generate scenario."); setPhase(PHASES.PICK); }
  }

  async function handleSubmit() {
    if (!answer.trim() || answer.trim().length < 20) { setError("Please write a more complete answer."); return; }
    setError(""); setPhase(PHASES.GRADING);
    try {
      const data = await gradeScenario(buildScenarioGradingPrompt(category, scenario, challenge, answer));
      await saveScenarioSession(user.id, category.key, scenario, challenge, answer, data);
      await updateStreak(user.id);
      setResults(data); setPhase(PHASES.RESULTS);
    } catch (e) { setError("Grading failed."); setPhase(PHASES.ANSWER); }
  }

  return (
    <div>
      {phase === PHASES.PICK && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 22 : 28, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Scenario Runs</h2>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: 14 }}>Pick a category and respond to a realistic PM scenario.</p>
          </div>
          {error && <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#fca5a5", fontSize: 14 }}>⚠️ {error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 10 : 16 }}>
            {SCENARIO_CATEGORIES.map(cat => <CategoryCard key={cat.key} category={cat} onClick={() => handlePickCategory(cat)} isMobile={isMobile} />)}
          </div>
        </>
      )}

      {phase === PHASES.LOADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: isMobile ? "40px 20px" : "60px 32px" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>{category?.emoji}</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Building scenario...</h2>
          <p style={{ color: colors.slate, margin: 0, fontSize: 14 }}>Creating a {category?.label} challenge.</p>
        </div>
      )}

      {phase === PHASES.ANSWER && (
        <>
          <button onClick={() => setPhase(PHASES.PICK)} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, marginBottom: 20, fontSize: 13 }}>← Categories</button>
          <ScenarioBlock category={category} scenario={scenario} challenge={challenge} isMobile={isMobile} />
          <div style={sharedStyles.card}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Your Response</label>
            <p style={{ color: colors.textMuted, fontSize: 13, margin: "0 0 10px" }}>Answer in 3–8 sentences. Be specific and decisive.</p>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="What do you do? Walk through your thinking..." rows={6} style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${error ? colors.red : colors.border}`, borderRadius: 8, color: colors.text, fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = colors.indigo} onBlur={e => e.target.style.borderColor = error ? colors.red : colors.border} />
            {error && <p style={{ color: colors.red, fontSize: 13, margin: "6px 0 0" }}>⚠️ {error}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: 14 }} onClick={handleSubmit}>Submit →</button>
              <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={() => handlePickCategory(category)}>New Scenario</button>
            </div>
          </div>
        </>
      )}

      {phase === PHASES.GRADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: isMobile ? "40px 20px" : "60px 32px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Grading response...</h2>
          <p style={{ color: colors.slate, margin: 0, fontSize: 14 }}>Evaluating your {category?.label} answer.</p>
        </div>
      )}

      {phase === PHASES.RESULTS && results && (
        <>
          <ScenarioBlock category={category} scenario={scenario} challenge={challenge} isMobile={isMobile} />
          <ScenarioResults results={results} category={category} scenario={scenario} challenge={challenge} answer={answer} onRetry={() => handlePickCategory(category)} onPickNew={() => setPhase(PHASES.PICK)} onDashboard={onGoToDashboard} />
        </>
      )}
    </div>
  );
}