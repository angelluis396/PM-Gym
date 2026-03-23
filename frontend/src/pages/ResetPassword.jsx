import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { sharedStyles, colors } from "../constants/styles";
import { useWindowWidth } from "../hooks/useWindowWidth";

function validatePassword(password) {
  return [
    { test: password.length >= 8,          label: "At least 8 characters" },
    { test: /[a-z]/.test(password),        label: "One lowercase letter" },
    { test: /[A-Z]/.test(password),        label: "One uppercase letter" },
    { test: /[0-9]/.test(password),        label: "One number" },
    { test: /[^a-zA-Z0-9]/.test(password), label: "One symbol (e.g. !@#$)" },
  ];
}

export default function ResetPassword() {
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [done,       setDone]       = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash — exchange it for a session
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setValidSession(true);
    });
  }, []);

  async function handleSubmit() {
    if (!validatePassword(password).every((r) => r.test)) { setError("Password doesn't meet all requirements."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setSubmitting(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setSubmitting(false); return; }
    setDone(true);
    setSubmitting(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "center", padding: isMobile ? "24px 16px" : "24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Playfair Display', Georgia, serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PM Gym
          </h1>
        </div>

        {done ? (
          <div style={{ ...sharedStyles.card, textAlign: "center", padding: "40px 32px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800 }}>Password updated</h2>
            <p style={{ color: colors.slate, fontSize: 15, margin: "0 0 24px", lineHeight: 1.7 }}>
              Your password has been changed successfully.
            </p>
            <button
              onClick={() => window.location.href = "/login"}
              style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, width: "100%", justifyContent: "center" }}
            >
              Back to login
            </button>
          </div>
        ) : !validSession ? (
          <div style={{ ...sharedStyles.card, textAlign: "center", padding: "40px 32px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
            <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800 }}>Waiting for reset link</h2>
            <p style={{ color: colors.slate, fontSize: 14, margin: "0 0 24px", lineHeight: 1.7 }}>
              Open the reset link from your email to continue. If you didn't request a reset, you can ignore this.
            </p>
            <button
              onClick={() => window.location.href = "/login"}
              style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, width: "100%", justifyContent: "center" }}
            >
              Back to login
            </button>
          </div>
        ) : (
          <div style={{ ...sharedStyles.card, padding: isMobile ? "24px 20px" : "32px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>Choose a new password</h2>
            <p style={{ color: colors.textMuted, fontSize: 14, margin: "0 0 24px" }}>
              Make it strong — you won't be asked again.
            </p>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>New Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.text, fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = colors.indigo}
                onBlur={e => e.target.style.borderColor = colors.border}
              />
              {/* Strength indicator */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {validatePassword(password).map((r, i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: r.test ? colors.green : colors.border, transition: "background 0.2s" }} />
                    ))}
                  </div>
                  {validatePassword(password).map((r, i) => (
                    <div key={i} style={{ fontSize: 12, color: r.test ? colors.green : colors.slate, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{r.test ? "✓" : "○"}</span>{r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 20, marginTop: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Confirm Password</label>
              <input
                type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter your new password"
                style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${confirm && confirm !== password ? colors.red : colors.border}`, borderRadius: 8, color: colors.text, fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = colors.indigo}
                onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? colors.red : colors.border}
              />
              {confirm && confirm !== password && (
                <p style={{ color: colors.red, fontSize: 12, margin: "6px 0 0" }}>Passwords don't match.</p>
              )}
            </div>

            {error && (
              <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#fca5a5", fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, width: "100%", justifyContent: "center", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Updating..." : "Update password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}