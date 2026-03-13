import { useState } from "react";
import { PHASES, EMPTY_FORM } from "./constants/prompts";
import { generateVision, gradeSubmission } from "./api/claude";
import Home     from "./pages/Home";
import Vision   from "./pages/Vision";
import Form     from "./pages/Form";
import Results  from "./pages/Results";

export default function App() {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [phase,   setPhase]   = useState(PHASES.HOME);
  const [vision,  setVision]  = useState("");
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleGenerateVision() {
    setLoading(true);
    setError("");
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
    if (filled < 4) {
      setError("Please fill in at least 4 sections before submitting.");
      return;
    }
    setPhase(PHASES.GRADING);
    setError("");
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
    setPhase(PHASES.HOME);
    setVision("");
    setForm(EMPTY_FORM);
    setResults(null);
    setError("");
  }

  // ─── Layout ─────────────────────────────────────────────────────────────────

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

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
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
            Pocket PM
          </h1>
          <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>
            Sharpen your product management skills with AI feedback
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: "#450a0a", border: "1px solid #ef4444",
            borderRadius: 8, padding: "12px 16px", marginBottom: 20,
            color: "#fca5a5", fontSize: 14,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Pages */}
        {phase === PHASES.HOME && (
          <Home onStart={handleGenerateVision} loading={loading} />
        )}

        {phase === PHASES.VISION && (
          <Vision
            vision={vision}
            onStartPlan={() => setPhase(PHASES.FORM)}
            onRegenerate={handleGenerateVision}
            loading={loading}
          />
        )}

        {phase === PHASES.FORM && (
          <Form
            vision={vision}
            form={form}
            onChange={handleFormChange}
            onSubmit={handleGrade}
            onBack={() => setPhase(PHASES.VISION)}
          />
        )}

        {phase === PHASES.GRADING && (
          <div style={{
            background: "rgba(30,41,59,0.8)", borderRadius: 16,
            padding: 60, border: "1px solid #334155", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Grading your PM plan...</h2>
            <p style={{ color: "#64748b", margin: 0 }}>AI is reviewing each section carefully.</p>
          </div>
        )}

        {phase === PHASES.RESULTS && results && (
          <Results
            vision={vision}
            results={results}
            onRetry={handleReset}
            onEdit={() => setPhase(PHASES.FORM)}
          />
        )}
      </div>
    </div>
  );
}
