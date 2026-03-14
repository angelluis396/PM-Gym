import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import ProtectedRoute    from "./components/ProtectedRoute";
import { PHASES, EMPTY_FORM } from "./constants/prompts";
import { generateVision, gradeSubmission } from "./api/claude";
import { saveSession } from "./api/sessions";

import Login           from "./pages/Login";
import Callback        from "./pages/Callback";
import MFASetup        from "./pages/MFASetup";
import Profile         from "./pages/Profile";
import Dashboard       from "./pages/Dashboard";
import SessionDetail   from "./pages/SessionDetail";
import FocusedPractice from "./pages/FocusedPractice";
import ScenarioRuns    from "./pages/ScenarioRuns";
import GlossaryQuiz    from "./pages/GlossaryQuiz";
import Glossary        from "./pages/Glossary";
import Home            from "./pages/Home";
import Vision          from "./pages/Vision";
import Form            from "./pages/Form";
import Results         from "./pages/Results";

// ─── Router ───────────────────────────────────────────────────────────────────

function Router() {
  const path = window.location.pathname;
  if (path === "/login")         return <Login />;
  if (path === "/auth/callback") return <Callback />;
  if (path === "/mfa-setup")     return <MFASetup />;
  if (path === "/profile")       return <ProtectedRoute><Profile /></ProtectedRoute>;
  if (path === "/app" || path === "/") return <ProtectedRoute><PMGymApp /></ProtectedRoute>;
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#94a3b8", fontFamily: "sans-serif" }}>
      Page not found. <a href="/app" style={{ color: "#6366f1", marginLeft: 8 }}>Go home →</a>
    </div>
  );
}

// ─── Nav tab ──────────────────────────────────────────────────────────────────

function NavTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit", color: active ? "#e2e8f0" : "#64748b", padding: "6px 2px", borderBottom: active ? "2px solid #6366f1" : "2px solid transparent", transition: "color 0.2s, border-color 0.2s", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

// ─── Practice mode toggle ─────────────────────────────────────────────────────

function ModeToggle({ mode, onChange }) {
  const modes = [
    { key: "full",     label: "📋 Full PM Plan" },
    { key: "focused",  label: "🎯 Focused" },
    { key: "scenario", label: "⚡ Scenarios" },
    { key: "quiz",     label: "📚 Quiz" },
  ];
  return (
    <div style={{ display: "flex", background: "#0f172a", borderRadius: 10, padding: 4, marginBottom: 36, border: "1px solid #334155" }}>
      {modes.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", transition: "all 0.2s", background: mode === key ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", color: mode === key ? "white" : "#64748b", boxShadow: mode === key ? "0 2px 8px rgba(99,102,241,0.4)" : "none" }}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────

function PMGymApp() {
  const { user } = useAuth();

  const [view,          setView]          = useState("dashboard");
  const [practiceMode,  setPracticeMode]  = useState("full");
  const [activeSession, setActiveSession] = useState(null);

  const [phase,   setPhase]   = useState(PHASES.HOME);
  const [vision,  setVision]  = useState("");
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const [username, setUsername] = useState("");
  const avatarUrl = user?.user_metadata?.avatar_url;

  useEffect(() => {
    async function fetchUsername() {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      setUsername(data?.username || user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "PM Athlete");
    }
    fetchUsername();
  }, [user]);

  function startPractice(mode = "full") {
    setPracticeMode(mode);
    setView("practice");
    setPhase(PHASES.HOME);
    setVision(""); setForm(EMPTY_FORM); setResults(null); setError("");
  }

  async function handleGenerateVision() {
    setLoading(true); setError("");
    try {
      const v = await generateVision();
      setVision(v); setPhase(PHASES.VISION);
    } catch (e) { setError(e.message || "Failed to generate vision. Please try again."); }
    setLoading(false);
  }

  function handleFormChange(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function handleGrade() {
    const filled = Object.values(form).filter((v) => v.trim().length > 0).length;
    if (filled < 4) { setError("Please fill in at least 4 sections before submitting."); return; }
    setPhase(PHASES.GRADING); setError("");
    try {
      const data = await gradeSubmission(vision, form);
      setSaving(true);
      await saveSession(user.id, vision, form, data);
      setSaving(false);
      setResults(data); setPhase(PHASES.RESULTS);
    } catch (e) { setError(e.message || "Grading failed. Please try again."); setPhase(PHASES.FORM); setSaving(false); }
  }

  function handleReset() { setPhase(PHASES.HOME); setVision(""); setForm(EMPTY_FORM); setResults(null); setError(""); }
  function handleViewSession(session) { setActiveSession(session); setView("session"); }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#e2e8f0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "0 24px", position: "sticky", top: 0, zIndex: 10, background: "rgba(15,23,42,0.95)", backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <span onClick={() => setView("dashboard")} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 20, background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer" }}>
            PM Gym
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            <NavTab label="Dashboard" active={view === "dashboard" || view === "session"} onClick={() => setView("dashboard")} />
            <NavTab label="Practice"  active={view === "practice"}  onClick={() => startPractice("full")} />
            <NavTab label="Glossary"  active={view === "glossary"}  onClick={() => setView("glossary")} />
          </div>
          <button onClick={() => { window.location.href = "/profile"; }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>{username}</span>
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} style={{ width: 32, height: 32, borderRadius: "50%" }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white" }}>
                {username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>

        {view === "dashboard" && (
          <Dashboard
            onStartSession={() => startPractice("full")}
            onStartFocused={() => startPractice("focused")}
            onStartScenario={() => startPractice("scenario")}
            onStartQuiz={() => startPractice("quiz")}
            onViewSession={handleViewSession}
          />
        )}

        {view === "session"  && activeSession && <SessionDetail session={activeSession} onBack={() => setView("dashboard")} />}
        {view === "glossary" && <Glossary />}

        {view === "practice" && (
          <>
            <ModeToggle mode={practiceMode} onChange={(m) => { setPracticeMode(m); handleReset(); }} />

            {practiceMode === "quiz"     && <GlossaryQuiz    onGoToDashboard={() => setView("dashboard")} />}
            {practiceMode === "scenario" && <ScenarioRuns    onGoToDashboard={() => setView("dashboard")} />}
            {practiceMode === "focused"  && <FocusedPractice onGoToDashboard={() => setView("dashboard")} />}

            {practiceMode === "full" && (
              <>
                {phase === PHASES.HOME && (
                  <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: "#6366f1", fontWeight: 700, marginBottom: 12 }}>✦ Full PM Plan Exercise</div>
                    <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Playfair Display', Georgia, serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PM Plan Exercise</h1>
                    <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>Get a product vision and build a complete PM plan for grading.</p>
                  </div>
                )}
                {error && <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#fca5a5", fontSize: 14 }}>⚠️ {error}</div>}
                {phase === PHASES.HOME    && <Home onStart={handleGenerateVision} loading={loading} />}
                {phase === PHASES.VISION  && <Vision vision={vision} onStartPlan={() => setPhase(PHASES.FORM)} onRegenerate={handleGenerateVision} loading={loading} />}
                {phase === PHASES.FORM    && <Form vision={vision} form={form} onChange={handleFormChange} onSubmit={handleGrade} onBack={() => setPhase(PHASES.VISION)} />}
                {phase === PHASES.GRADING && (
                  <div style={{ background: "rgba(30,41,59,0.8)", borderRadius: 16, padding: 60, border: "1px solid #334155", textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
                    <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Grading your PM plan...</h2>
                    <p style={{ color: "#64748b", margin: 0 }}>{saving ? "Saving your results..." : "AI is reviewing each section carefully."}</p>
                  </div>
                )}
                {phase === PHASES.RESULTS && results && (
                  <>
                    <Results vision={vision} results={results} onRetry={handleReset} onEdit={() => setPhase(PHASES.FORM)} />
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>View on Dashboard →</button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><Router /></AuthProvider>;
}