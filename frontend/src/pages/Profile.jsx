import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { sharedStyles, colors } from "../constants/styles";

export default function Profile() {
  const { user, signOut } = useAuth();
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const [username,     setUsername]     = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editing,      setEditing]      = useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [savingName,   setSavingName]   = useState(false);
  const [mfaEnabled,   setMfaEnabled]   = useState(false);
  const [loadingMFA,   setLoadingMFA]   = useState(true);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const email     = user?.email;

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      const name = data?.username || user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "";
      setUsername(name); setEditUsername(name);
    }
    load();
  }, [user]);

  useEffect(() => {
    async function checkMFA() {
      const { data } = await supabase.auth.mfa.listFactors();
      setMfaEnabled(!!data?.totp?.some(f => f.status === "verified"));
      setLoadingMFA(false);
    }
    checkMFA();
  }, []);

  async function handleSaveUsername() {
    setSaveError(""); setSaveSuccess(false);
    const trimmed = editUsername.trim();
    if (!trimmed)                          { setSaveError("Username can't be empty."); return; }
    if (trimmed.length < 3)                { setSaveError("Must be at least 3 characters."); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setSaveError("Only letters, numbers, and underscores."); return; }
    if (trimmed === username)              { setEditing(false); return; }
    setSavingName(true);
    const { data: existing } = await supabase.from("profiles").select("username").eq("username", trimmed).maybeSingle();
    if (existing) { setSaveError("That username is already taken."); setSavingName(false); return; }
    const { error } = await supabase.from("profiles").upsert({ id: user.id, username: trimmed }, { onConflict: "id" });
    if (error) { setSaveError("Failed to save."); } else { setUsername(trimmed); setEditing(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
    setSavingName(false);
  }

  async function handleSignOut() { await signOut(); window.location.href = "/login"; }
  function handleSetupMFA() { sessionStorage.setItem("mfa_mode", "enroll"); window.location.href = "/mfa-setup"; }
  async function handleRemoveMFA() {
    const { data } = await supabase.auth.mfa.listFactors();
    const factor = data?.totp?.find(f => f.status === "verified");
    if (factor) { await supabase.auth.mfa.unenroll({ factorId: factor.id }); setMfaEnabled(false); }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: colors.text,
      padding: isMobile ? "20px 16px 100px" : "40px 24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {!isMobile && (
          <button onClick={() => { window.location.href = "/app"; }} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, marginBottom: 32, fontSize: 14 }}>
            ← Back to PM Gym
          </button>
        )}

        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 26 : 32, fontWeight: 900,
          margin: `0 0 ${isMobile ? 20 : 32}px`,
          background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Your Profile
        </h1>

        {/* User info */}
        <div style={{ ...sharedStyles.card, display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0, color: "white" }}>
              {username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{username}</div>
            <div style={{ color: colors.slate, fontSize: 13 }}>{email}</div>
            <div style={{ display: "inline-block", marginTop: 6, padding: "2px 10px", background: "#1e293b", borderRadius: 20, fontSize: 12, color: colors.slate, border: `1px solid ${colors.border}` }}>
              {user?.app_metadata?.provider === "google" ? "Google account" : "Email account"}
            </div>
          </div>
        </div>

        {/* Username editor */}
        <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800 }}>Username</h2>
          {saveSuccess && <div style={{ color: colors.green, fontSize: 13, marginBottom: 10 }}>✓ Username updated.</div>}
          {editing ? (
            <>
              <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${saveError ? colors.red : colors.indigo}`, borderRadius: 8, color: colors.text, fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 8 }} />
              {saveError && <p style={{ color: colors.red, fontSize: 13, margin: "0 0 10px" }}>⚠️ {saveError}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleSaveUsername} disabled={savingName} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "9px 18px" }}>{savingName ? "Saving..." : "Save"}</button>
                <button onClick={() => { setEditing(false); setEditUsername(username); setSaveError(""); }} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 13, padding: "9px 18px" }}>Cancel</button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, color: colors.text, fontWeight: 600 }}>@{username}</span>
              <button onClick={() => { setEditing(true); setSaveError(""); }} style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 13, padding: "7px 14px" }}>Edit</button>
            </div>
          )}
        </div>

        {/* Security */}
        <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800 }}>Security</h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", background: "#1e293b", borderRadius: 10, border: `1px solid ${colors.border}`, gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Two-factor authentication</div>
              <div style={{ color: colors.slate, fontSize: 12 }}>
                {loadingMFA ? "Checking..." : mfaEnabled ? "✓ Enabled" : "Not enabled"}
              </div>
            </div>
            {!loadingMFA && (mfaEnabled ? (
              <button onClick={handleRemoveMFA} style={{ ...sharedStyles.btn, background: "transparent", border: `1px solid ${colors.red}`, color: colors.red, fontSize: 12, padding: "7px 14px", flexShrink: 0 }}>Remove</button>
            ) : (
              <button onClick={handleSetupMFA} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 12, padding: "7px 14px", flexShrink: 0 }}>Set up →</button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div style={sharedStyles.card}>
          <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800 }}>Account</h2>
          <button onClick={handleSignOut} style={{ ...sharedStyles.btn, background: "transparent", border: `1px solid ${colors.border}`, color: colors.slate, fontSize: 14 }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}