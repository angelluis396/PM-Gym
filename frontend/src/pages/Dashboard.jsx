import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { fetchSessions, computeMetrics } from "../api/sessions";
import { fetchFocusedSessions } from "../api/focusedSessions";
import { fetchScenarioSessions } from "../api/scenarioSessions";
import { EXERCISES } from "../constants/focusedExercises";
import { SCENARIO_CATEGORIES } from "../constants/scenarioCategories";
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

const SESSIONS_PER_SUMMARY = 6; // regenerate every N new sessions

function gradeColor(letter) {
  return letter === "A" ? colors.green : letter === "B" ? colors.blue
    : letter === "C" ? colors.amber : letter === "D" ? colors.orange : colors.red;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function exerciseLabel(key) { return EXERCISES.find((e) => e.key === key)?.label || key; }
function exerciseEmoji(key) { return EXERCISES.find((e) => e.key === key)?.emoji || "🎯"; }
function categoryLabel(key) { return SCENARIO_CATEGORIES.find((c) => c.key === key)?.label || key; }
function categoryEmoji(key) { return SCENARIO_CATEGORIES.find((c) => c.key === key)?.emoji || "⚡"; }

const PREVIEW_COUNT = 3;

// ─── AI Performance Summary ───────────────────────────────────────────────────

function PerformanceSummary({ userId, sessions, focusedSessions, scenarioSessions }) {
  const [summary,          setSummary]          = useState(null);
  const [sessionsAtGen,    setSessionsAtGen]     = useState(0);
  const [loading,          setLoading]           = useState(false);
  const [initialLoading,   setInitialLoading]    = useState(true);
  const [error,            setError]             = useState("");
  const [expanded,         setExpanded]          = useState(true);

  const totalSessions = sessions.length + focusedSessions.length + scenarioSessions.length;

  // ── Load existing summary from Supabase on mount ───────────────────────────
  useEffect(() => {
    async function loadSummary() {
      const { data } = await supabase
        .from("performance_summaries")
        .select("summary, sessions_at_generation")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setSummary(data.summary);
        setSessionsAtGen(data.sessions_at_generation);
      }
      setInitialLoading(false);
    }
    if (userId) loadSummary();
  }, [userId]);

  // How many sessions since the last summary was generated
  const sessionsSinceLastGen = totalSessions - sessionsAtGen;
  const dueForRefresh = summary && sessionsSinceLastGen >= SESSIONS_PER_SUMMARY;
  const canGenerate   = totalSessions >= SESSIONS_PER_SUMMARY;

  // ── Save summary to Supabase ───────────────────────────────────────────────
  async function saveSummary(newSummary, count) {
    await supabase.from("performance_summaries").upsert(
      {
        user_id:                userId,
        summary:                newSummary,
        sessions_at_generation: count,
        updated_at:             new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  // ── Generate summary ───────────────────────────────────────────────────────
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });

      if (!res.ok) throw new Error("Failed to generate summary");
      const data = await res.json();

      // Persist to Supabase
      await saveSummary(data, totalSessions);

      setSummary(data);
      setSessionsAtGen(totalSessions);
      setExpanded(true);
    } catch (e) {
      setError("Failed to generate summary. Please try again.");
    }
    setLoading(false);
  }

  // Don't render until we've checked Supabase for an existing summary
  if (initialLoading) return null;

  // Don't render if not enough sessions yet
  if (!canGenerate && !summary) return null;

  return (
    <div style={{
      ...sharedStyles.card,
      borderLeft: `3px solid ${colors.indigo}`,
      marginBottom: 28,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: summary && expanded ? 16 : 0 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800 }}>
            ✦ AI Performance Summary
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
            {summary
              ? dueForRefresh
                ? `Updated ${sessionsSinceLastGen} sessions ago — ready for a fresh analysis.`
                : `Based on your last ${sessionsAtGen} sessions. Refreshes every ${SESSIONS_PER_SUMMARY} new sessions.`
              : `Complete ${SESSIONS_PER_SUMMARY - totalSessions} more session${SESSIONS_PER_SUMMARY - totalSessions !== 1 ? "s" : ""} to unlock your personalised analysis.`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          {/* Generate / Refresh button */}
          {(!summary || dueForRefresh) && canGenerate && (
            <button
              onClick={generateSummary}
              disabled={loading}
              style={{
                ...sharedStyles.btn, ...sharedStyles.btnPrimary,
                fontSize: 13, padding: "8px 16px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Analysing..." : summary ? "↺ Refresh" : "Generate ✦"}
            </button>
          )}
          {/* Collapse toggle — only when summary exists */}
          {summary && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none", border: "none", color: colors.slate,
                fontSize: 18, cursor: "pointer", display: "inline-block",
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              ↓
            </button>
          )}
        </div>
      </div>

      {error && (
        <p style={{ color: colors.red, fontSize: 13, margin: "8px 0 0" }}>⚠️ {error}</p>
      )}

      {loading && (
        <div style={{ marginTop: 12, color: colors.slate, fontSize: 14 }}>
          Analysing your performance across {totalSessions} sessions...
        </div>
      )}

      {/* Summary content */}
      {summary && expanded && !loading && (
        <div>
          {/* Overall verdict */}
          <div style={{
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 10, padding: 16, marginBottom: 14,
          }}>
            <p style={{ margin: 0, fontSize: 15, color: "#c7d2fe", lineHeight: 1.8 }}>
              {summary.overallVerdict}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {/* Strengths */}
            <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                ✓ Your Strengths
              </div>
              {summary.strengths?.map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: "#86efac", marginBottom: 6, lineHeight: 1.5 }}>• {s}</div>
              ))}
            </div>

            {/* Focus areas */}
            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                ↑ Focus Areas
              </div>
              {summary.improvements?.map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: "#fcd34d", marginBottom: 6, lineHeight: 1.5 }}>• {s}</div>
              ))}
            </div>
          </div>

          {/* Trends */}
          {summary.trends?.length > 0 && (
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                📈 Trending in the Right Direction
              </div>
              {summary.trends.map((t, i) => (
                <div key={i} style={{ fontSize: 13, color: "#93c5fd", marginBottom: 6, lineHeight: 1.5 }}>• {t}</div>
              ))}
            </div>
          )}

          {/* Recommendation */}
          <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              🎯 Next Best Action
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#d8b4fe", lineHeight: 1.6 }}>
              {summary.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "rgba(30,41,59,0.8)", border: `1px solid ${colors.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 13, color: colors.slate, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: colors.text, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Section bar ─────────────────────────────────────────────────────────────

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

// ─── Grade badge ──────────────────────────────────────────────────────────────

function GradeBadge({ letter, score }) {
  const color = gradeColor(letter);
  return (
    <div style={{
      width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
      border: `3px solid ${color}`, background: `${color}15`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{letter}</div>
      <div style={{ fontSize: 10, color: colors.slate, fontWeight: 600 }}>{score}</div>
    </div>
  );
}

// ─── Session cards ────────────────────────────────────────────────────────────

function cardStyle(hovered) {
  return {
    background: "rgba(30,41,59,0.8)",
    border: `1px solid ${hovered ? colors.indigo : colors.border}`,
    borderRadius: 12, padding: "20px 24px", cursor: "pointer",
    transition: "border-color 0.2s, transform 0.15s",
    display: "flex", gap: 20, alignItems: "flex-start",
    transform: hovered ? "translateY(-2px)" : "none",
  };
}

function SessionCard({ session, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} style={cardStyle(hovered)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <GradeBadge letter={session.letter_grade} score={session.score} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>{formatDate(session.created_at)}</div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: colors.slateLight, fontStyle: "italic", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          "{session.vision}"
        </p>
        <div style={{ fontSize: 13, color: colors.slate }}>{session.overall_feedback?.slice(0, 100)}...</div>
      </div>
      <div style={{ color: colors.slate, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</div>
    </div>
  );
}

function FocusedSessionCard({ session, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} style={cardStyle(hovered)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <GradeBadge letter={session.letter_grade} score={session.score} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>{formatDate(session.created_at)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, color: "#a5b4fc" }}>
            {exerciseEmoji(session.exercise_type)} {exerciseLabel(session.exercise_type)}
          </span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: colors.slateLight, fontStyle: "italic", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          "{session.vision}"
        </p>
        <div style={{ fontSize: 13, color: colors.slate }}>{session.feedback?.slice(0, 100)}...</div>
      </div>
      <div style={{ color: colors.slate, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</div>
    </div>
  );
}

function ScenarioCard({ session, onClick }) {
  const [hovered, setHovered] = useState(false);
  const catColor = SCENARIO_CATEGORIES.find((c) => c.key === session.category)?.color || colors.indigo;
  return (
    <div onClick={onClick} style={cardStyle(hovered)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <GradeBadge letter={session.letter_grade} score={session.score} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>{formatDate(session.created_at)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: `${catColor}18`, border: `1px solid ${catColor}40`, borderRadius: 20, color: catColor }}>
            {categoryEmoji(session.category)} {categoryLabel(session.category)}
          </span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: colors.slateLight, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {session.scenario}
        </p>
        <div style={{ fontSize: 13, color: colors.slate }}>{session.feedback?.slice(0, 100)}...</div>
      </div>
      <div style={{ color: colors.slate, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>→</div>
    </div>
  );
}

// ─── Session list with see-all toggle ────────────────────────────────────────

function SessionList({ sessions, renderCard, emptyState }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sessions : sessions.slice(0, PREVIEW_COUNT);
  const hasMore = sessions.length > PREVIEW_COUNT;

  if (sessions.length === 0) return emptyState;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map(renderCard)}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            background: "none", border: `1px solid ${colors.border}`,
            borderRadius: 8, color: colors.slate, fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            padding: "10px", width: "100%", marginTop: 12,
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.indigo; e.currentTarget.style.color = colors.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.slate; }}
        >
          {showAll ? "↑ Show less" : `↓ Show all ${sessions.length} sessions`}
        </button>
      )}
    </>
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
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <GradeCircle score={session.score} letter={session.letter_grade} />
        </div>
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
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <GradeCircle score={session.score} letter={session.letter_grade} />
        </div>
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ emoji, title, message, buttonLabel, onAction }) {
  return (
    <div style={{ ...sharedStyles.card, textAlign: "center", padding: "32px" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{emoji}</div>
      <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800 }}>{title}</h3>
      <p style={{ color: colors.slate, margin: "0 0 16px", fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      <button onClick={onAction} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "10px 20px" }}>{buttonLabel}</button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ onStartSession, onStartFocused, onStartScenario, onViewSession }) {
  const { user } = useAuth();

  const [sessions,         setSessions]         = useState([]);
  const [focusedSessions,  setFocusedSessions]  = useState([]);
  const [scenarioSessions, setScenarioSessions] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState("");
  const [focusedDetail,    setFocusedDetail]    = useState(null);
  const [scenarioDetail,   setScenarioDetail]   = useState(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [full, focused, scenario] = await Promise.all([
          fetchSessions(user.id),
          fetchFocusedSessions(user.id),
          fetchScenarioSessions(user.id),
        ]);
        setSessions(full);
        setFocusedSessions(focused);
        setScenarioSessions(scenario);
      } catch (e) {
        setError("Failed to load sessions. Please refresh.");
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const metrics         = computeMetrics(sessions);
  const hasAny          = sessions.length > 0 || focusedSessions.length > 0 || scenarioSessions.length > 0;
  const hasFullSessions = sessions.length > 0;

  if (loading) return <div style={{ textAlign: "center", padding: "80px 0", color: colors.slate }}>Loading your progress...</div>;
  if (error)   return <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "12px 16px", color: "#fca5a5", fontSize: 14 }}>⚠️ {error}</div>;

  return (
    <div>
      {focusedDetail  && <FocusedSessionDetail  session={focusedDetail}  onClose={() => setFocusedDetail(null)} />}
      {scenarioDetail && <ScenarioSessionDetail session={scenarioDetail} onClose={() => setScenarioDetail(null)} />}

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Your Progress
        </h2>
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
          </div>
        </div>
      )}

      {hasAny && (
        <>
          {/* AI Performance Summary */}
          <PerformanceSummary
            userId={user.id}
            sessions={sessions}
            focusedSessions={focusedSessions}
            scenarioSessions={scenarioSessions}
          />

          {/* Stats */}
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

          {/* Full PM Plan sessions */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>📋 Full PM Plan Sessions</h3>
              <button onClick={onStartSession} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "10px 18px" }}>✦ New</button>
            </div>
            <SessionList
              sessions={sessions}
              renderCard={(s) => <SessionCard key={s.id} session={s} onClick={() => onViewSession(s)} />}
              emptyState={<EmptyState emoji="📋" title="No full PM plan sessions yet" message="Complete a full PM plan exercise to see results here." buttonLabel="Start" onAction={onStartSession} />}
            />
          </div>

          {/* Focused sessions */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>🎯 Focused Practice Sessions</h3>
              <button onClick={onStartFocused} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 13, padding: "10px 18px" }}>✦ New</button>
            </div>
            <SessionList
              sessions={focusedSessions}
              renderCard={(s) => <FocusedSessionCard key={s.id} session={s} onClick={() => setFocusedDetail(s)} />}
              emptyState={<EmptyState emoji="🎯" title="No focused practice sessions yet" message="Pick a specific skill to drill — epics, roadmaps, release plans and more." buttonLabel="Start" onAction={onStartFocused} />}
            />
          </div>

          {/* Scenario sessions */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>⚡ Scenario Runs</h3>
              <button onClick={onStartScenario} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 13, padding: "10px 18px" }}>✦ New</button>
            </div>
            <SessionList
              sessions={scenarioSessions}
              renderCard={(s) => <ScenarioCard key={s.id} session={s} onClick={() => setScenarioDetail(s)} />}
              emptyState={<EmptyState emoji="⚡" title="No scenario runs yet" message="Respond to realistic PM challenges across 8 categories." buttonLabel="Start" onAction={onStartScenario} />}
            />
          </div>
        </>
      )}
    </div>
  );
}