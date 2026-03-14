import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { fetchSessions, computeMetrics } from "../api/sessions";
import { fetchFocusedSessions } from "../api/focusedSessions";
import { fetchScenarioSessions } from "../api/scenarioSessions";
import { fetchQuizSessions } from "../api/quizSessions";
import { EXERCISES } from "../constants/focusedExercises";
import { SCENARIO_CATEGORIES } from "../constants/scenarioCategories";
import { QUIZ_CATEGORIES } from "../constants/quizLogic";
import GradeCircle from "../components/GradeCircle";
import { sharedStyles, colors } from "../constants/styles";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECTION_LABELS = {
  targetGroup: "Target Group", goal: "Goal", needs: "User Needs",
  value: "Value Proposition", keyFeatures: "Key Features",
  roadmap: "Roadmap", releasePlan: "Release Plan",
  themesEpicsStories: "Epics & Stories",
};

const SESSIONS_PER_SUMMARY = 6;

function gradeColor(letter) {
  return letter === "A" ? colors.green : letter === "B" ? colors.blue
    : letter === "C" ? colors.amber : letter === "D" ? colors.orange : colors.red;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function exerciseLabel(key) { return EXERCISES.find((e) => e.key === key)?.label || key; }
function exerciseEmoji(key) { return EXERCISES.find((e) => e.key === key)?.emoji || "🎯"; }
function categoryLabel(key) { return SCENARIO_CATEGORIES.find((c) => c.key === key)?.label || key; }
function categoryEmoji(key) { return SCENARIO_CATEGORIES.find((c) => c.key === key)?.emoji || "⚡"; }
function quizCategoryLabel(key) { return QUIZ_CATEGORIES.find((c) => c.key === key)?.label || key; }
function quizCategoryEmoji(key) { return QUIZ_CATEGORIES.find((c) => c.key === key)?.emoji || "📚"; }

// ─── Grade badge ──────────────────────────────────────────────────────────────

function GradeBadge({ letter, score }) {
  const color = gradeColor(letter);
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      border: `2px solid ${color}`, background: `${color}15`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontSize: 13, fontWeight: 900, color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{letter}</div>
      <div style={{ fontSize: 9, color: colors.slate, fontWeight: 600, lineHeight: 1 }}>{score}</div>
    </div>
  );
}

// ─── Category pill ────────────────────────────────────────────────────────────

function Pill({ children, color = colors.indigo }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 7px",
      background: `${color}18`, border: `1px solid ${color}35`,
      borderRadius: 20, color, whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

// ─── Session row content (shared inner layout) ────────────────────────────────

function SessionRowContent({ badge, center, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
      {badge}
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {center}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function FullPMContent({ session }) {
  return (
    <SessionRowContent
      badge={<GradeBadge letter={session.letter_grade} score={session.score} />}
      center={
        <span style={{ fontSize: 13, color: colors.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
          {session.vision?.slice(0, 60)}{session.vision?.length > 60 ? "..." : ""}
        </span>
      }
      right={<span style={{ fontSize: 12, color: colors.textMuted }}>{formatDate(session.created_at)}</span>}
    />
  );
}

function FocusedContent({ session }) {
  return (
    <SessionRowContent
      badge={<GradeBadge letter={session.letter_grade} score={session.score} />}
      center={
        <>
          <Pill>{exerciseEmoji(session.exercise_type)} {exerciseLabel(session.exercise_type)}</Pill>
          <span style={{ fontSize: 12, color: colors.slate, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
            {session.vision?.slice(0, 40)}{session.vision?.length > 40 ? "..." : ""}
          </span>
        </>
      }
      right={<span style={{ fontSize: 12, color: colors.textMuted }}>{formatDate(session.created_at)}</span>}
    />
  );
}

function ScenarioContent({ session }) {
  const cat = SCENARIO_CATEGORIES.find((c) => c.key === session.category);
  return (
    <SessionRowContent
      badge={<GradeBadge letter={session.letter_grade} score={session.score} />}
      center={
        <>
          <Pill color={cat?.color || colors.indigo}>{cat?.emoji} {cat?.label}</Pill>
          <span style={{ fontSize: 12, color: colors.slate, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
            {session.scenario?.slice(0, 40)}{session.scenario?.length > 40 ? "..." : ""}
          </span>
        </>
      }
      right={<span style={{ fontSize: 12, color: colors.textMuted }}>{formatDate(session.created_at)}</span>}
    />
  );
}

function QuizContent({ session }) {
  const wrongTerms = session.questions?.filter((q) => !q.correct) || [];
  return (
    <SessionRowContent
      badge={<GradeBadge letter={session.letter_grade} score={session.score} />}
      center={
        <>
          <Pill>{quizCategoryEmoji(session.category)} {quizCategoryLabel(session.category)}</Pill>
          <span style={{ fontSize: 12, color: colors.slate }}>{session.question_count}Q</span>
          {wrongTerms.slice(0, 2).map((q, i) => (
            <span key={i} style={{ fontSize: 11, padding: "1px 6px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: colors.red, fontWeight: 600 }}>
              {q.termName}
            </span>
          ))}
          {wrongTerms.length > 2 && <span style={{ fontSize: 11, color: colors.textMuted }}>+{wrongTerms.length - 2}</span>}
        </>
      }
      right={<span style={{ fontSize: 12, color: colors.textMuted }}>{formatDate(session.created_at)}</span>}
    />
  );
}

// ─── Stacked deck component ───────────────────────────────────────────────────

function StackedDeck({ sessions, renderContent, onClickSession, accentColor = colors.indigo }) {
  const [expanded, setExpanded] = useState(false);

  if (sessions.length === 0) return null;

  const top     = sessions[0];
  const rest    = sessions.slice(1);
  const hasMore = rest.length > 0;

  // Peek cards behind the top card (max 2 peek layers)
  const peekCount = Math.min(rest.length, 2);

  return (
    <div style={{ position: "relative", marginBottom: expanded ? 0 : `${peekCount * 6}px` }}>

      {/* Peek layers — only shown when collapsed */}
      {!expanded && Array.from({ length: peekCount }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${(peekCount - i) * 6}px`,
            left: `${(peekCount - i) * 3}px`,
            right: `${(peekCount - i) * 3}px`,
            height: 56,
            background: i === 0
              ? "rgba(30,41,59,0.5)"
              : "rgba(30,41,59,0.3)",
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            zIndex: i,
          }}
        />
      ))}

      {/* Top card — always visible */}
      <div
        style={{
          position: "relative",
          zIndex: peekCount + 1,
          background: "rgba(30,41,59,0.95)",
          border: `1px solid ${expanded ? accentColor : colors.border}`,
          borderRadius: 12,
          overflow: "hidden",
          transition: "border-color 0.2s",
          cursor: "pointer",
        }}
      >
        {/* Top session row */}
        <div
          onClick={() => onClickSession(top)}
          style={{ borderBottom: expanded && hasMore ? `1px solid ${colors.border}` : "none" }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>{renderContent(top)}</div>
            {hasMore && (
              <div
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                style={{
                  padding: "10px 12px", cursor: "pointer",
                  borderLeft: `1px solid ${colors.border}`,
                  color: colors.slate, fontSize: 12, fontWeight: 700,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 2, flexShrink: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.slate}
              >
                <span style={{ fontSize: 14, display: "inline-block", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>↓</span>
                <span style={{ fontSize: 10 }}>{rest.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fanned sessions — shown when expanded */}
        {expanded && rest.map((session, i) => (
          <div
            key={session.id}
            onClick={() => onClickSession(session)}
            style={{
              borderBottom: i < rest.length - 1 ? `1px solid ${colors.border}` : "none",
              background: i % 2 === 0 ? "rgba(15,23,42,0.6)" : "rgba(15,23,42,0.4)",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "rgba(15,23,42,0.6)" : "rgba(15,23,42,0.4)"}
          >
            {renderContent(session)}
          </div>
        ))}

        {/* Collapse footer */}
        {expanded && hasMore && (
          <div
            onClick={() => setExpanded(false)}
            style={{
              textAlign: "center", padding: "7px",
              borderTop: `1px solid ${colors.border}`,
              color: colors.slate, fontSize: 11, fontWeight: 700,
              cursor: "pointer", background: "rgba(15,23,42,0.4)",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.text; e.currentTarget.style.background = "rgba(99,102,241,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.slate; e.currentTarget.style.background = "rgba(15,23,42,0.4)"; }}
          >
            ↑ Collapse
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, onNew }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h3>
      <button onClick={onNew} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 12, padding: "7px 14px" }}>✦ New</button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ emoji, title, message, buttonLabel, onAction }) {
  return (
    <div style={{ background: "rgba(30,41,59,0.8)", border: `1px solid ${colors.border}`, borderRadius: 12, textAlign: "center", padding: "28px 24px" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800 }}>{title}</h3>
      <p style={{ color: colors.slate, margin: "0 0 14px", fontSize: 13, lineHeight: 1.6 }}>{message}</p>
      <button onClick={onAction} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 12, padding: "8px 16px" }}>{buttonLabel}</button>
    </div>
  );
}

// ─── AI Performance Summary ───────────────────────────────────────────────────

function PerformanceSummary({ userId, sessions, focusedSessions, scenarioSessions }) {
  const [summary,        setSummary]        = useState(null);
  const [sessionsAtGen,  setSessionsAtGen]  = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error,          setError]          = useState("");
  const [expanded,       setExpanded]       = useState(true);

  const totalSessions = sessions.length + focusedSessions.length + scenarioSessions.length;

  useEffect(() => {
    async function loadSummary() {
      const { data } = await supabase
        .from("performance_summaries")
        .select("summary, sessions_at_generation")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) { setSummary(data.summary); setSessionsAtGen(data.sessions_at_generation); }
      setInitialLoading(false);
    }
    if (userId) loadSummary();
  }, [userId]);

  const sessionsSinceLastGen = totalSessions - sessionsAtGen;
  const dueForRefresh = summary && sessionsSinceLastGen >= SESSIONS_PER_SUMMARY;
  const canGenerate   = totalSessions >= SESSIONS_PER_SUMMARY;

  async function saveSummary(newSummary, count) {
    await supabase.from("performance_summaries").upsert(
      { user_id: userId, summary: newSummary, sessions_at_generation: count, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  }

  async function generateSummary() {
    setLoading(true); setError("");
    try {
      const metrics = computeMetrics(sessions);
      const payload = {
        fullPMSessions:   sessions.map((s) => ({ score: s.score, letterGrade: s.letter_grade, sections: s.sections, date: s.created_at })),
        focusedSessions:  focusedSessions.map((s) => ({ exerciseType: s.exercise_type, score: s.score, letterGrade: s.letter_grade, date: s.created_at })),
        scenarioSessions: scenarioSessions.map((s) => ({ category: s.category, score: s.score, letterGrade: s.letter_grade, date: s.created_at })),
        sectionAverages:  metrics.sectionAverages,
        averageScore:     metrics.averageScore,
        personalBest:     metrics.personalBest,
      };
      const res = await fetch(`${API_BASE}/api/performance-summary`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      await saveSummary(data, totalSessions);
      setSummary(data); setSessionsAtGen(totalSessions); setExpanded(true);
    } catch (e) { setError("Failed to generate summary. Please try again."); }
    setLoading(false);
  }

  if (initialLoading || (!canGenerate && !summary)) return null;

  return (
    <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.indigo}`, marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: summary && expanded ? 16 : 0 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800 }}>✦ AI Performance Summary</h3>
          <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
            {summary
              ? dueForRefresh
                ? `Updated ${sessionsSinceLastGen} sessions ago — ready for a fresh analysis.`
                : `Based on your last ${sessionsAtGen} sessions. Refreshes every ${SESSIONS_PER_SUMMARY} new sessions.`
              : `Complete ${SESSIONS_PER_SUMMARY - totalSessions} more session${SESSIONS_PER_SUMMARY - totalSessions !== 1 ? "s" : ""} to unlock your personalised analysis.`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          {(!summary || dueForRefresh) && canGenerate && (
            <button onClick={generateSummary} disabled={loading} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "8px 16px", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Analysing..." : summary ? "↺ Refresh" : "Generate ✦"}
            </button>
          )}
          {summary && (
            <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: colors.slate, fontSize: 18, cursor: "pointer", display: "inline-block", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</button>
          )}
        </div>
      </div>
      {error && <p style={{ color: colors.red, fontSize: 13, margin: "8px 0 0" }}>⚠️ {error}</p>}
      {loading && <div style={{ marginTop: 12, color: colors.slate, fontSize: 14 }}>Analysing your performance across {totalSessions} sessions...</div>}
      {summary && expanded && !loading && (
        <div>
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 15, color: "#c7d2fe", lineHeight: 1.8 }}>{summary.overallVerdict}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>✓ Your Strengths</div>
              {summary.strengths?.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#86efac", marginBottom: 6, lineHeight: 1.5 }}>• {s}</div>)}
            </div>
            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>↑ Focus Areas</div>
              {summary.improvements?.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#fcd34d", marginBottom: 6, lineHeight: 1.5 }}>• {s}</div>)}
            </div>
          </div>
          {summary.trends?.length > 0 && (
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>📈 Trending in the Right Direction</div>
              {summary.trends.map((t, i) => <div key={i} style={{ fontSize: 13, color: "#93c5fd", marginBottom: 6, lineHeight: 1.5 }}>• {t}</div>)}
            </div>
          )}
          <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🎯 Next Best Action</div>
            <p style={{ margin: 0, fontSize: 13, color: "#d8b4fe", lineHeight: 1.6 }}>{summary.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stats + section bars ─────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "rgba(30,41,59,0.8)", border: `1px solid ${colors.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 13, color: colors.slate, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: colors.text, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function SectionBar({ label, score }) {
  const pct   = ((score - 50) / 50) * 100;
  const color = score >= 85 ? colors.green : score >= 70 ? colors.blue : score >= 60 ? colors.amber : colors.red;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: colors.slateLight, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color, fontWeight: 800 }}>{score}</span>
      </div>
      <div style={{ height: 6, background: "#1e293b", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ModalShell({ onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
      <div style={{ background: "#0f172a", border: `1px solid ${colors.border}`, borderRadius: 16, width: "100%", maxWidth: 600, padding: 32 }}>
        {children}
        <button onClick={onClose} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, width: "100%", justifyContent: "center", marginTop: 8 }}>Close</button>
      </div>
    </div>
  );
}

function FocusedSessionDetail({ session, onClose }) {
  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>{exerciseEmoji(session.exercise_type)} {exerciseLabel(session.exercise_type)} · {formatDate(session.created_at)}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Session Review</h2>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: colors.slate, fontSize: 24, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ ...sharedStyles.visionBox, marginBottom: 16 }}>
        <div style={sharedStyles.visionLabel}>Product Vision</div>
        <p style={{ ...sharedStyles.visionText, margin: 0 }}>{session.vision}</p>
      </div>
      <div style={{ ...sharedStyles.card, textAlign: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><GradeCircle score={session.score} letter={session.letter_grade} /></div>
        <p style={{ color: colors.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{session.feedback}</p>
      </div>
      <div style={{ ...sharedStyles.card, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Answer</div>
        <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{session.answer}</p>
      </div>
      {session.strengths?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}`, marginBottom: 12 }}>
          <h3 style={{ margin: "0 0 10px", color: colors.green, fontSize: 15 }}>✓ Strengths</h3>
          {session.strengths.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 4, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}
      {session.improvements?.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.amber}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 10px", color: colors.amber, fontSize: 15 }}>↑ Areas to Improve</h3>
          {session.improvements.map((s, i) => <div key={i} style={{ color: colors.slate, fontSize: 13, marginBottom: 4, paddingLeft: 10 }}>• {s}</div>)}
        </div>
      )}
    </ModalShell>
  );
}

function ScenarioSessionDetail({ session, onClose }) {
  const [showModel, setShowModel] = useState(false);
  const cat = SCENARIO_CATEGORIES.find((c) => c.key === session.category);
  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>{cat?.emoji} {cat?.label} · {formatDate(session.created_at)}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Scenario Review</h2>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: colors.slate, fontSize: 24, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ background: `${cat?.color}12`, border: `1px solid ${cat?.color}40`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: cat?.color, fontWeight: 700, marginBottom: 8 }}>{cat?.emoji} Scenario</div>
        <p style={{ margin: 0, fontSize: 14, color: colors.text, lineHeight: 1.7 }}>{session.scenario}</p>
      </div>
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.red, fontWeight: 700, marginBottom: 6 }}>⚡ Challenge</div>
        <p style={{ margin: 0, fontSize: 14, color: "#fca5a5", fontWeight: 600, lineHeight: 1.6 }}>{session.challenge}</p>
      </div>
      <div style={{ ...sharedStyles.card, textAlign: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><GradeCircle score={session.score} letter={session.letter_grade} /></div>
        <p style={{ color: colors.slate, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{session.feedback}</p>
      </div>
      <div style={{ ...sharedStyles.card, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.slate, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Answer</div>
        <p style={{ margin: 0, fontSize: 14, color: colors.slateLight, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{session.answer}</p>
      </div>
      <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
        <button onClick={() => setShowModel(!showModel)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0, fontFamily: "inherit" }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: colors.text }}>💡 Model Answer</span>
          <span style={{ color: colors.slate, fontSize: 18, display: "inline-block", transform: showModel ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>↓</span>
        </button>
        {showModel && (
          <div style={{ marginTop: 14, padding: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 14, color: "#c7d2fe", lineHeight: 1.8 }}>{session.model_answer}</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function QuizDetail({ session, onClose }) {
  const wrongTerms = session.questions?.filter((q) => !q.correct) || [];
  const rightTerms = session.questions?.filter((q) => q.correct) || [];
  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>{quizCategoryEmoji(session.category)} {quizCategoryLabel(session.category)} · {session.question_count} questions · {formatDate(session.created_at)}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Quiz Review</h2>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: colors.slate, fontSize: 24, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ ...sharedStyles.card, textAlign: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><GradeCircle score={session.score} letter={session.letter_grade} /></div>
        <p style={{ color: colors.slate, fontSize: 14, margin: 0 }}>{rightTerms.length} out of {session.question_count} correct</p>
      </div>
      {wrongTerms.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.red}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 14px", color: colors.red, fontSize: 15 }}>✗ Terms to Review</h3>
          {wrongTerms.map((q, i) => (
            <div key={i} style={{ marginBottom: 14, padding: "12px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: colors.red, marginBottom: 6 }}>{q.termName}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>Correct Definition</div>
              <div style={{ fontSize: 13, color: colors.slateLight, lineHeight: 1.6 }}>{q.choices?.find((c) => c.correct)?.text}</div>
              {q.userAnswer && <>
                <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginTop: 8, marginBottom: 4 }}>Your Answer</div>
                <div style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.6 }}>{q.userAnswer}</div>
              </>}
            </div>
          ))}
        </div>
      )}
      {rightTerms.length > 0 && (
        <div style={{ ...sharedStyles.card, borderLeft: `3px solid ${colors.green}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", color: colors.green, fontSize: 15 }}>✓ Terms You Knew</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {rightTerms.map((q, i) => (
              <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac", fontSize: 13, fontWeight: 600 }}>{q.termName}</span>
            ))}
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ onStartSession, onStartFocused, onStartScenario, onStartQuiz, onViewSession }) {
  const { user } = useAuth();

  const [sessions,         setSessions]         = useState([]);
  const [focusedSessions,  setFocusedSessions]  = useState([]);
  const [scenarioSessions, setScenarioSessions] = useState([]);
  const [quizSessions,     setQuizSessions]     = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState("");
  const [focusedDetail,    setFocusedDetail]    = useState(null);
  const [scenarioDetail,   setScenarioDetail]   = useState(null);
  const [quizDetail,       setQuizDetail]       = useState(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [full, focused, scenario, quiz] = await Promise.all([
          fetchSessions(user.id),
          fetchFocusedSessions(user.id),
          fetchScenarioSessions(user.id),
          fetchQuizSessions(user.id),
        ]);
        setSessions(full);
        setFocusedSessions(focused);
        setScenarioSessions(scenario);
        setQuizSessions(quiz);
      } catch (e) { setError("Failed to load sessions. Please refresh."); }
      setLoading(false);
    }
    load();
  }, [user]);

  const metrics         = computeMetrics(sessions);
  const hasAny          = sessions.length > 0 || focusedSessions.length > 0 || scenarioSessions.length > 0 || quizSessions.length > 0;
  const hasFullSessions = sessions.length > 0;

  if (loading) return <div style={{ textAlign: "center", padding: "80px 0", color: colors.slate }}>Loading your progress...</div>;
  if (error)   return <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "12px 16px", color: "#fca5a5", fontSize: 14 }}>⚠️ {error}</div>;

  return (
    <div>
      {focusedDetail  && <FocusedSessionDetail  session={focusedDetail}  onClose={() => setFocusedDetail(null)} />}
      {scenarioDetail && <ScenarioSessionDetail session={scenarioDetail} onClose={() => setScenarioDetail(null)} />}
      {quizDetail     && <QuizDetail            session={quizDetail}     onClose={() => setQuizDetail(null)} />}

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Progress</h2>
        <p style={{ color: colors.textMuted, margin: 0, fontSize: 15 }}>Track how your PM skills are developing over time.</p>
      </div>

      {!hasAny && (
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
          <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800 }}>No sessions yet</h2>
          <p style={{ color: colors.slate, margin: "0 0 28px", fontSize: 15, lineHeight: 1.6 }}>Complete your first exercise to start tracking your progress.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onStartSession}  style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary }}>📋 Full PM Plan</button>
            <button onClick={onStartFocused}  style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}>🎯 Focused Practice</button>
            <button onClick={onStartScenario} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}>⚡ Scenario Runs</button>
            <button onClick={onStartQuiz}     style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary }}>📚 Glossary Quiz</button>
          </div>
        </div>
      )}

      {hasAny && (
        <>
          <PerformanceSummary userId={user.id} sessions={sessions} focusedSessions={focusedSessions} scenarioSessions={scenarioSessions} />

          {hasFullSessions && (
            <>
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard label="Average Score" value={metrics.averageScore} sub="full PM plan sessions" />
                <StatCard label="Personal Best"  value={metrics.personalBest}  sub="out of 100" />
                <StatCard label="Sessions"        value={metrics.totalSessions} sub="completed" />
              </div>
              {Object.keys(metrics.sectionAverages).length > 0 && (
                <div style={{ ...sharedStyles.card, marginBottom: 28 }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 800 }}>Average Score by Section</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 32px" }}>
                    {Object.entries(metrics.sectionAverages).sort((a, b) => a[1] - b[1]).map(([key, avg]) => (
                      <SectionBar key={key} label={SECTION_LABELS[key] || key} score={avg} />
                    ))}
                  </div>
                  <p style={{ color: colors.textMuted, fontSize: 12, margin: "16px 0 0" }}>Sorted weakest to strongest.</p>
                </div>
              )}
            </>
          )}

          {/* Full PM Plan */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="📋 Full PM Plan" onNew={onStartSession} />
            {sessions.length > 0 ? (
              <StackedDeck
                sessions={sessions}
                renderContent={(s) => <FullPMContent session={s} />}
                onClickSession={onViewSession}
              />
            ) : (
              <EmptyState emoji="📋" title="No full PM plan sessions yet" message="Complete a full PM plan exercise to see results here." buttonLabel="Start" onAction={onStartSession} />
            )}
          </div>

          {/* Focused Practice */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="🎯 Focused Practice" onNew={onStartFocused} />
            {focusedSessions.length > 0 ? (
              <StackedDeck
                sessions={focusedSessions}
                renderContent={(s) => <FocusedContent session={s} />}
                onClickSession={(s) => setFocusedDetail(s)}
                accentColor={colors.indigo}
              />
            ) : (
              <EmptyState emoji="🎯" title="No focused practice sessions yet" message="Pick a specific skill to drill." buttonLabel="Start" onAction={onStartFocused} />
            )}
          </div>

          {/* Scenario Runs */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="⚡ Scenario Runs" onNew={onStartScenario} />
            {scenarioSessions.length > 0 ? (
              <StackedDeck
                sessions={scenarioSessions}
                renderContent={(s) => <ScenarioContent session={s} />}
                onClickSession={(s) => setScenarioDetail(s)}
                accentColor={colors.amber}
              />
            ) : (
              <EmptyState emoji="⚡" title="No scenario runs yet" message="Respond to realistic PM challenges across 8 categories." buttonLabel="Start" onAction={onStartScenario} />
            )}
          </div>

          {/* Glossary Quizzes */}
          <div>
            <SectionHeader title="📚 Glossary Quizzes" onNew={onStartQuiz} />
            {quizSessions.length > 0 ? (
              <StackedDeck
                sessions={quizSessions}
                renderContent={(s) => <QuizContent session={s} />}
                onClickSession={(s) => setQuizDetail(s)}
                accentColor={colors.green}
              />
            ) : (
              <EmptyState emoji="📚" title="No quizzes yet" message="Test your knowledge of PM terms." buttonLabel="Start" onAction={onStartQuiz} />
            )}
          </div>
        </>
      )}
    </div>
  );
}