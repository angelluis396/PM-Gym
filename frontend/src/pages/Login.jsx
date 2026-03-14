import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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

function PasswordStrength({ password }) {
  if (!password) return null;
  const rules  = validatePassword(password);
  const passed = rules.filter((r) => r.test).length;
  const barColor = passed <= 2 ? colors.red : passed <= 3 ? colors.amber : colors.green;
  return (
    <div style={{ marginTop: 8, marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {rules.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < passed ? barColor : colors.border, transition: "background 0.2s" }} />
        ))}
      </div>
      {rules.map((r, i) => (
        <div key={i} style={{ fontSize: 12, color: r.test ? colors.green : colors.slate, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{r.test ? "✓" : "○"}</span>{r.label}
        </div>
      ))}
    </div>
  );
}

function Input({ type = "text", placeholder, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: "100%", padding: "12px 14px", background: "#1e293b",
        border: `1px solid ${error ? colors.red : focused ? colors.indigo : colors.border}`,
        borderRadius: 8, color: colors.text, fontSize: 15,
        outline: "none", fontFamily: "inherit", boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
    />
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children}
    </label>
  );
}

export default function Login() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const [mode,       setMode]       = useState("login");
  const [email,      setEmail]      = useState("");
  const [username,   setUsername]   = useState("");
  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [emailSent,  setEmailSent]  = useState(false);

  useEffect(() => { if (!loading && user) window.location.href = "/app"; }, [user, loading]);

  function resetForm() { setEmail(""); setUsername(""); setPassword(""); setConfirm(""); setError(""); }
  function switchMode(m) { setMode(m); resetForm(); }

  async function handleGoogleSignIn() {
    setError("");
    const { error } = await signInWithGoogle();
    if (error) setError("Google sign in failed. Please try again.");
  }

  async function handleEmailSignIn() {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setSubmitting(true); setError("");
    const { error } = await signInWithEmail(email, password);
    if (error) setError(error.message.includes("Invalid login") ? "Incorrect email or password." : error.message);
    setSubmitting(false);
  }

  async function handleEmailSignUp() {
    setError("");
    if (!username.trim()) { setError("Please choose a username."); return; }
    if (username.trim().length < 3) { setError("Username must be at least 3 characters."); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError("Username can only contain letters, numbers, and underscores."); return; }
    if (!validatePassword(password).every((r) => r.test)) { setError("Password doesn't meet all requirements."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (!email) { setError("Please enter your email."); return; }
    setSubmitting(true);
    const { data: existing } = await supabase.from("profiles").select("username").eq("username", username.trim()).maybeSingle();
    if (existing) { setError("That username is already taken."); setSubmitting(false); return; }
    const { error } = await signUpWithEmail(email, password, username.trim());
    if (error) setError(error.message); else setEmailSent(true);
    setSubmitting(false);
  }

  if (emailSent) {
    return (
      <PageShell isMobile={isMobile}>
        <div style={{ ...sharedStyles.card, textAlign: "center", padding: isMobile ? "32px 20px" : "40px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: colors.text }}>Check your email</h2>
          <p style={{ color: colors.slate, fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>
            We sent a confirmation link to <strong style={{ color: colors.text }}>{email}</strong>.
          </p>
          <p style={{ color: colors.textMuted, fontSize: 13, margin: 0 }}>
            Didn't get it?{" "}
            <button onClick={() => { setEmailSent(false); resetForm(); }} style={{ background: "none", border: "none", color: colors.indigo, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 }}>
              try again
            </button>.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell isMobile={isMobile}>
      <div style={{ ...sharedStyles.card, padding: isMobile ? "24px 20px" : "40px 32px" }}>
        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#0f172a", borderRadius: 10, padding: 4, marginBottom: 24, border: `1px solid ${colors.border}` }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 14, fontFamily: "inherit", transition: "all 0.2s",
              background: mode === m ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
              color: mode === m ? "white" : colors.slate,
              boxShadow: mode === m ? "0 2px 8px rgba(99,102,241,0.4)" : "none",
            }}>
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Google */}
        <button onClick={handleGoogleSignIn} disabled={loading || submitting} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 12, padding: "13px 24px", background: "white", border: "none",
          borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15,
          color: "#1a1a1a", fontFamily: "inherit", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", transition: "transform 0.15s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {mode === "login" ? "Continue with Google" : "Sign up with Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ color: colors.textMuted, fontSize: 13 }}>or</span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        {/* Username (signup) */}
        {mode === "signup" && (
          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Username</FieldLabel>
            <Input placeholder="e.g. pm_angel" value={username} onChange={setUsername} error={!!error && !username} />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" placeholder="you@example.com" value={email} onChange={setEmail} error={!!error && !email} />
        </div>

        <div style={{ marginBottom: mode === "signup" ? 8 : 20 }}>
          <FieldLabel>Password</FieldLabel>
          <Input type="password" placeholder={mode === "signup" ? "Create a strong password" : "Your password"} value={password} onChange={setPassword} error={!!error && !password} />
          {mode === "signup" && <PasswordStrength password={password} />}
        </div>

        {mode === "signup" && (
          <div style={{ marginBottom: 20, marginTop: 12 }}>
            <FieldLabel>Confirm Password</FieldLabel>
            <Input type="password" placeholder="Re-enter your password" value={confirm} onChange={setConfirm} error={confirm.length > 0 && confirm !== password} />
            {confirm.length > 0 && confirm !== password && (
              <p style={{ color: colors.red, fontSize: 12, margin: "6px 0 0" }}>Passwords don't match.</p>
            )}
          </div>
        )}

        {error && (
          <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#fca5a5", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={mode === "login" ? handleEmailSignIn : handleEmailSignUp}
          disabled={submitting}
          style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, width: "100%", justifyContent: "center", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create Account"}
        </button>

        <p style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", margin: "16px 0 0", lineHeight: 1.6 }}>
          By continuing you agree to our terms of service.
        </p>
      </div>
    </PageShell>
  );
}

function PageShell({ children, isMobile }) {
  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "center", padding: isMobile ? "24px 16px" : "24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 40 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", color: "#6366f1", fontWeight: 700, marginBottom: 10 }}>✦ AI-Powered Practice Tool</div>
          <h1 style={{ fontSize: isMobile ? 40 : 48, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Playfair Display', Georgia, serif", background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PM Gym
          </h1>
          <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Sharpen your product management skills</p>
        </div>
        {children}
      </div>
    </div>
  );
}