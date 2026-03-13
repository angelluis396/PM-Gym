import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import ProtectedRoute from "./components/ProtectedRoute";
import { PHASES, EMPTY_FORM } from "./constants/prompts";
import { generateVision, gradeSubmission } from "./api/claude";

import Login    from "./pages/Login";
import Callback from "./pages/Callback";
import MFASetup from "./pages/MFASetup";
import Profile  from "./pages/Profile";
import Home     from "./pages/Home";
import Vision   from "./pages/Vision";
import Form     from "./pages/Form";
import Results  from "./pages/Results";

// ─── Router ───────────────────────────────────────────────────────────────────

function Router() {
  const path = window.location.pathname;
  if (path === "/login")         return <Login />;
  if (path === "/auth/callback") return <Callback />;
  if (path === "/mfa-setup")     return <MFASetup />;
  if (path === "/profile")       return <ProtectedRoute><Profile /></ProtectedRoute>;
  if (path === "/app" || path === "/") return <ProtectedRoute><PMGymApp /></ProtectedRoute>;
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0f172a", color: "#94a3b8", fontFamily: "sans-serif",
    }}>
      Page not found. <a href="/app" style={{ color: "#6366f1", marginLeft: 8 }}>Go home →</a>
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────

function PMGymApp() {
  const { user } = useAuth();

  const [phase,    setPhase]    = useState(PHASES.HOME);
  const [vision,   setVision]   = useState("");
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Username — prefer profiles table, fall back to Google name, then email prefix
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetchUsername() {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.username) {
        setUsername(data.username);
      } else {
        // Fallback: Google first name or email prefix
        const fallback =
          user.user_metadata?.full_name?.split(" ")[0] ||
          user.email?.split("@")[0] ||
          "PM Athlete";
        setUsername(fallback);
      }
    }
    fetchUsername();
  }, [user]);

  const avatarUrl = user?.user_metadata?.avatar_url;

  async function handleGenerateVision() {
    setLoading(true); setError("");
    try {
      const v = await generateVision();
      setVision(v);
      setPhase(PHASES.VISION);
    } catch (e) {
      setError(e.message || "Failed to generate vision. Please try again.");
    }
    setLoading(false);
  }

  function handleFormChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGrade() {
    const filled = Object.values(form).filter((v) => v.trim().length > 0).length;
    if (filled < 4) { setError("Please fill in at least 4 sections before submitting."); return; }
    setPhase(PHASES.GRADING); setError("");
    try {
      const data = await gradeSubmission(vision, form);
      setResults(data);
      setPhase(PHASES.RESULTS);
    } catch (e) {
      setError(e.message || "Grading failed. Please try again.");
      setPhase(PHASES.FORM);
    }
  }

  function handleReset() {
    setPhase(PHASES.HOME); setVision(""); setForm(EMPTY_FORM); setResults(null); setError("");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Navbar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px", borderBottom: "1px solid #1e293b",
        maxWidth: 720, margin: "0 auto",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 20,
          background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          PM Gym
        </span>

        {/* Avatar + username */}
        <button
          onClick={() => { window.location.href = "/profile"; }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>
            {username}
          </span>
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} style={{ width: 32, height: 32, borderRadius: "50%" }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "white",
            }}>
              {username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: "#6366f1", fontWeight: 700, marginBottom: 12 }}>
            ✦ AI-Powered Practice Tool
          </div>
          <h1 style={{
            fontSize: 42, fontWeight: 900, margin: "0 0 8px",
            fontFamily: "'Playfair Display', Georgia, serif",
            background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            PM Gym
          </h1>
          <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>
            Sharpen your product management skills with AI feedback
          </p>
        </div>

        {error && (
          <div style={{
            background: "#450a0a", border: "1px solid #ef4444",
            borderRadius: 8, padding: "12px 16px", marginBottom: 20,
            color: "#fca5a5", fontSize: 14,
          }}>
            ⚠️ {error}
          </div>
        )}

        {phase === PHASES.HOME    && <Home onStart={handleGenerateVision} loading={loading} />}
        {phase === PHASES.VISION  && <Vision vision={vision} onStartPlan={() => setPhase(PHASES.FORM)} onRegenerate={handleGenerateVision} loading={loading} />}
        {phase === PHASES.FORM    && <Form vision={vision} form={form} onChange={handleFormChange} onSubmit={handleGrade} onBack={() => setPhase(PHASES.VISION)} />}
        {phase === PHASES.GRADING && (
          <div style={{ background: "rgba(30,41,59,0.8)", borderRadius: 16, padding: 60, border: "1px solid #334155", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Grading your PM plan...</h2>
            <p style={{ color: "#64748b", margin: 0 }}>AI is reviewing each section carefully.</p>
          </div>
        )}
        {phase === PHASES.RESULTS && results && (
          <Results vision={vision} results={results} onRetry={handleReset} onEdit={() => setPhase(PHASES.FORM)} />
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}