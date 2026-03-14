import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWindowWidth } from "../hooks/useWindowWidth";
import {
  INTERVIEW_TYPES,
  COMPANY_TYPES,
  buildInterviewQuestionPrompt,
  buildInterviewGradingPrompt,
} from "../constants/interviewTypes";
import {
  generateInterviewQuestion,
  gradeInterviewAnswer,
  saveInterviewSession,
} from "../api/interviewSessions";
import { updateStreak } from "../api/streak";
import GradeCircle from "../components/GradeCircle";
import { sharedStyles, colors } from "../constants/styles";

const PHASES = {
  SETUP:    "setup",
  LOADING:  "loading",
  ANSWER:   "answer",
  GRADING:  "grading",
  RESULTS:  "results",
};

// ─── Setup screen ─────────────────────────────────────────────────────────────

function InterviewSetup({ onStart, isMobile }) {
  const [typeKey,    setTypeKey]    = useState("behavioral");
  const [companyKey, setCompanyKey] = useState("faang");

  const selectedType    = INTERVIEW_TYPES.find(t => t.key === typeKey);
  const selectedCompany = COMPANY_TYPES.find(c => c.key === companyKey);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 22 : 28, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Interview Prep
        </h2>
        <p style={{ color: colors.textMuted, margin: 0, fontSize: 14 }}>
          Practice real PM interview questions with AI feedback and model answers.
        </p>
      </div>

      <div style={sharedStyles.card}>
        {/* Question type */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Question Type
          </label>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8 }}>
            {INTERVIEW_TYPES.map(type => {
              const active = typeKey === type.key;
              return (
                <button
                  key={type.key}
                  onClick={() => setTypeKey(type.key)}
                  style={{
                    padding: "12px 10px", borderRadius: 10,
                    border: `1px solid ${active ? type.color : colors.border}`,
                    background: active ? `${type.color}15` : "rgba(30,41,59,0.6)",
                    color: active ? type.color : colors.slate,
                    fontWeight: active ? 700 : 600,
                    fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s", textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: isMobile ? 18 : 20, marginBottom: 4 }}>{type.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{type.label}</div>
                  {!isMobile && <div style={{ fontSize: 11, color: active ? type.color : colors.textMuted, marginTop: 2 }}>{type.description}</div>}
                </button>
              );
            })}
          </div>
          {selectedType && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 13, color: "#c7d2fe" }}>
              💡 {selectedType.tip}
            </div>
          )}
        </div>

        {/* Company type */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Company Context
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {COMPANY_TYPES.map(company => {
              const active = companyKey === company.key;
              return (
                <button
                  key={company.key}
                  onClick={() => setCompanyKey(company.key)}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 10,
                    border: `1px solid ${active ? company.color : colors.border}`,
                    background: active ? `${company.color}15` : "rgba(30,41,59,0.6)",
                    color: active ? company.color : colors.slate,
                    fontWeight: active ? 700 : 600,
                    fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s", textAlign: "left",
                    boxShadow: active ? `0 2px 12px ${company.color}30` : "none",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{company.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{company.label}</div>
                  <div style={{ fontSize: 12, color: active ? company.color : colors.textMuted }}>{company.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => onStart(typeKey, companyKey)}
          style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, width: "100%", justifyContent: "center", fontSize: 15 }}
        >
          {selectedType?.emoji} Generate {selectedType?.label} Question →
        </button>
      </div>
    </div>
  );
}

// ─── Answer mode picker ───────────────────────────────────────────────────────

function AnswerModePicker({ type, onPick, isMobile }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        How do you want to answer?
      </label>
      <div style={{ display: "flex", gap: 10, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <button
          onClick={() => onPick("structured")}
          style={{
            flex: 1, padding: "14px 16px", borderRadius: 10,
            border: `1px solid ${colors.indigo}`,
            background: "rgba(99,102,241,0.08)",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}
        >
          <div style={{ fontWeight: 800, fontSize: 14, color: "#c7d2fe", marginBottom: 4 }}>📋 Structured</div>
          <div style={{ fontSize: 12, color: colors.slate, lineHeight: 1.5 }}>
            Guided sections: {type.framework.join(" → ")}
          </div>
        </button>
        <button
          onClick={() => onPick("freeform")}
          style={{
            flex: 1, padding: "14px 16px", borderRadius: 10,
            border: `1px solid ${colors.border}`,
            background: "rgba(30,41,59,0.6)",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(30,41,59,0.9)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(30,41,59,0.6)"}
        >
          <div style={{ fontWeight: 800, fontSize: 14, color: colors.text, marginBottom: 4 }}>✍️ Freeform</div>
          <div style={{ fontSize: 12, color: colors.slate, lineHeight: 1.5 }}>
            Answer in your own words with no prompts.
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Structured answer form ───────────────────────────────────────────────────

function StructuredForm({ type, answers, onChange, isMobile }) {
  return (
    <div>
      {type.framework.map((section, i) => (
        <div key={section} style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 6, letterSpacing: "0.04em" }}>
            {i + 1}. {section}
          </label>
          <textarea
            value={answers[section] || ""}
            onChange={e => onChange(section, e.target.value)}
            placeholder={`Your ${section.toLowerCase()}...`}
            rows={3}
            style={{ width: "100%", padding: "10px 12px", background: "#1e293b", border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.text, fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = colors.indigo}
            onBlur={e => e.target.style.borderColor = colors.border}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function InterviewResults({ gradeData, question, answer, type, onRetry, onNewQuestion, onDashboard, isMobile }) {
  const [showModel,       setShowModel]       = useState(false);
  const [showInterviewer, setShowInterviewer] = useState(false);

  return (
    <div>
      {/* Grade */}
      <div style={{ ...sharedStyles.card, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>
          {type.emoji} {type.label} — Results
        </h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <GradeCircle score={gradeData.score} letter={gradeData.letterGrade} />
        </div>
        <p style={{ color: colors.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          {gradeData.feedback}
        </p>
      </div>

      {/* Strengths */}
      {gradeData.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.green, fontSize: 15 }}>✓ What you did well</h3>
          {gradeData.strengths.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {gradeData.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}` }}>
          <h3 style={{ margin: "0 0 10px", color: colors.amber, fontSize: 15 }}>↑ What could be stronger</h3>
          {gradeData.improvements.map((s, i) => (
            <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 5, paddingLeft: 10 }}>• {s}</div>
          ))}
        </div>
      )}

      {/* Interviewer perspective */}
      <div style={sharedStyles.card}>
        <button
          onClick={() => setShowInterviewer(!showInterviewer)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0, fontFamily: "inherit" }}
        >
          <span style={{ fontWeight: 800, fontSize: 15, color: colors.text }}>🎙 Interviewer's Perspective</span>
          <span style={{ color: colors.slate, fontSize: 18, display: "inline-block", transform: showInterviewer ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
        </button>
        {showInterviewer && (
          <div style={{ marginTop: 14, padding: 14, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 14, color: "#fcd34d", lineHeight: 1.8, fontStyle: "italic" }}>
              "{gradeData.interviewerPerspective}"
            </p>
          </div>
        )}
      </div>

      {/* Model answer */}
      <div style={sharedStyles.card}>
        <button
          onClick={() => setShowModel(!showModel)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0, fontFamily: "inherit" }}
        >
          <span style={{ fontWeight: 800, fontSize: 15, color: colors.text }}>💡 Model Answer</span>
          <span style={{ color: colors.slate, fontSize: 18, display: "inline-block", transform: showModel ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
        </button>
        {showModel && (
          <div style={{ marginTop: 14, padding: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 14, color: "#c7d2fe", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {gradeData.modelAnswer}
            </p>
          </div>
        )}
      </div>

      {/* Your answer */}
      <div style={sharedStyles.card}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Answer</div>
        <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{answer}</p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: 14 }} onClick={onRetry}>
          ↺ Try Again
        </button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={onNewQuestion}>
          ← New Question
        </button>
        <button style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }} onClick={onDashboard}>
          Dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── Main InterviewPrep page ──────────────────────────────────────────────────

export default function InterviewPrep({ onGoToDashboard }) {
  const { user }  = useAuth();
  const width     = useWindowWidth();
  const isMobile  = width < 768;

  const [phase,      setPhase]      = useState(PHASES.SETUP);
  const [typeKey,    setTypeKey]    = useState(null);
  const [companyKey, setCompanyKey] = useState(null);
  const [question,   setQuestion]   = useState("");
  const [context,    setContext]    = useState("");
  const [answerMode, setAnswerMode] = useState(null); // "structured" | "freeform"
  const [freeAnswer, setFreeAnswer] = useState("");
  const [structured, setStructured] = useState({}); // { [section]: value }
  const [gradeData,  setGradeData]  = useState(null);
  const [error,      setError]      = useState("");

  const type    = INTERVIEW_TYPES.find(t => t.key === typeKey);
  const company = COMPANY_TYPES.find(c => c.key === companyKey);

  // ── Start: generate question ───────────────────────────────────────────────

  async function handleStart(tKey, cKey) {
    setTypeKey(tKey); setCompanyKey(cKey);
    setPhase(PHASES.LOADING); setError("");
    setFreeAnswer(""); setStructured({}); setAnswerMode(null); setGradeData(null);
    try {
      const prompt = buildInterviewQuestionPrompt(tKey, cKey);
      const data   = await generateInterviewQuestion(prompt);
      setQuestion(data.question || "");
      setContext(data.context  || "");
      setPhase(PHASES.ANSWER);
    } catch (e) {
      setError("Failed to generate question. Please try again.");
      setPhase(PHASES.SETUP);
    }
  }

  // ── Build final answer string from structured sections ─────────────────────

  function buildAnswerFromStructured() {
    return type.framework
      .map(section => `${section}:\n${structured[section] || ""}`)
      .join("\n\n");
  }

  // ── Submit answer for grading ──────────────────────────────────────────────

  async function handleSubmit() {
    const finalAnswer = answerMode === "structured"
      ? buildAnswerFromStructured()
      : freeAnswer;

    const minLength = answerMode === "structured" ? 50 : 30;
    if (!finalAnswer.trim() || finalAnswer.trim().length < minLength) {
      setError("Please write a more complete answer before submitting.");
      return;
    }

    setError(""); setPhase(PHASES.GRADING);
    try {
      const prompt = buildInterviewGradingPrompt(type, companyKey, question, answerMode, finalAnswer);
      const data   = await gradeInterviewAnswer(prompt);
      await saveInterviewSession(user.id, typeKey, companyKey, question, answerMode, finalAnswer, data);
      await updateStreak(user.id);
      setGradeData(data); setPhase(PHASES.RESULTS);
    } catch (e) {
      setError("Grading failed. Please try again.");
      setPhase(PHASES.ANSWER);
    }
  }

  function handleStructuredChange(section, value) {
    setStructured(prev => ({ ...prev, [section]: value }));
  }

  return (
    <div>
      {/* Setup */}
      {phase === PHASES.SETUP && (
        <InterviewSetup onStart={handleStart} isMobile={isMobile} />
      )}

      {/* Loading */}
      {phase === PHASES.LOADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: isMobile ? "40px 20px" : "60px 32px" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>{INTERVIEW_TYPES.find(t => t.key === typeKey)?.emoji}</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Generating question...</h2>
          <p style={{ color: colors.slate, margin: 0, fontSize: 14 }}>Building your {INTERVIEW_TYPES.find(t => t.key === typeKey)?.label} interview question.</p>
        </div>
      )}

      {/* Answer */}
      {phase === PHASES.ANSWER && type && (
        <>
          <button onClick={() => setPhase(PHASES.SETUP)} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, marginBottom: 20, fontSize: 13 }}>
            ← Back
          </button>

          {/* Question card */}
          <div style={{
            background: `linear-gradient(135deg, ${type.color}18, ${type.color}08)`,
            border: `1px solid ${type.color}40`,
            borderRadius: 12, padding: isMobile ? "18px 16px" : "24px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: type.color, fontWeight: 700, marginBottom: 10 }}>
              {type.emoji} {type.label} · {company?.label}
            </div>
            <p style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: colors.text, margin: "0 0 8px", lineHeight: 1.6 }}>
              {question}
            </p>
            {context && (
              <p style={{ fontSize: 13, color: colors.slate, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                {context}
              </p>
            )}
          </div>

          {/* Answer mode picker — shown until user picks */}
          {!answerMode && (
            <div style={sharedStyles.card}>
              <AnswerModePicker type={type} onPick={setAnswerMode} isMobile={isMobile} />
            </div>
          )}

          {/* Answer form */}
          {answerMode && (
            <div style={sharedStyles.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.slateLight, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {answerMode === "structured" ? "📋 Structured Answer" : "✍️ Freeform Answer"}
                </div>
                <button
                  onClick={() => setAnswerMode(null)}
                  style={{ background: "none", border: "none", color: colors.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Switch mode
                </button>
              </div>

              {answerMode === "structured" ? (
                <StructuredForm
                  type={type}
                  answers={structured}
                  onChange={handleStructuredChange}
                  isMobile={isMobile}
                />
              ) : (
                <textarea
                  value={freeAnswer}
                  onChange={e => setFreeAnswer(e.target.value)}
                  placeholder="Write your answer here — be specific, structured, and concise..."
                  rows={10}
                  style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${error ? colors.red : colors.border}`, borderRadius: 8, color: colors.text, fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = colors.indigo}
                  onBlur={e => e.target.style.borderColor = error ? colors.red : colors.border}
                />
              )}

              {error && <p style={{ color: colors.red, fontSize: 13, margin: "8px 0 0" }}>⚠️ {error}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, flex: 1, justifyContent: "center", fontSize: 14 }}
                  onClick={handleSubmit}
                >
                  Submit for Grading →
                </button>
                <button
                  style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }}
                  onClick={() => handleStart(typeKey, companyKey)}
                >
                  New Question
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Grading */}
      {phase === PHASES.GRADING && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: isMobile ? "40px 20px" : "60px 32px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Grading your answer...</h2>
          <p style={{ color: colors.slate, margin: 0, fontSize: 14 }}>Evaluating your {type?.label} response.</p>
        </div>
      )}

      {/* Results */}
      {phase === PHASES.RESULTS && gradeData && (
        <>
          {/* Show question context above results */}
          <div style={{
            background: `${type.color}12`,
            border: `1px solid ${type.color}30`,
            borderRadius: 10, padding: "14px 16px", marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: type.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              {type.emoji} {type.label} · {company?.label}
            </div>
            <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6 }}>{question}</p>
          </div>

          <InterviewResults
            gradeData={gradeData}
            question={question}
            answer={answerMode === "structured" ? buildAnswerFromStructured() : freeAnswer}
            type={type}
            onRetry={() => {
              setFreeAnswer(""); setStructured({}); setAnswerMode(null);
              setPhase(PHASES.ANSWER);
            }}
            onNewQuestion={() => setPhase(PHASES.SETUP)}
            onDashboard={onGoToDashboard}
            isMobile={isMobile}
          />
        </>
      )}
    </div>
  );
}
