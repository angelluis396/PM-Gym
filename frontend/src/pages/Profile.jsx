import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { sharedStyles, colors } from "../constants/styles";

function validatePassword(password) {
  return [
    { test: password.length >= 8,          label: "At least 8 characters" },
    { test: /[a-z]/.test(password),        label: "One lowercase letter" },
    { test: /[A-Z]/.test(password),        label: "One uppercase letter" },
    { test: /[0-9]/.test(password),        label: "One number" },
    { test: /[^a-zA-Z0-9]/.test(password), label: "One symbol (e.g. !@#$)" },
  ];
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel, deleting }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ background: "#0f172a", border: `1px solid ${colors.red}`, borderRadius: 16, width: "100%", maxWidth: 400, padding: 28 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: colors.text }}>Delete your account?</h2>
        <p style={{ color: colors.slate, fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>
          This will permanently delete all your sessions, scores, and progress.
        </p>
        <p style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.6, margin: "0 0 24px" }}>
          Your email will be blocked from creating a new account for 30 days.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{ ...sharedStyles.btn, flex: 1, justifyContent: "center", background: colors.red, border: "none", color: "white", fontSize: 14, opacity: deleting ? 0.7 : 1, cursor: deleting ? "not-allowed" : "pointer" }}
          >
            {deleting ? "Deleting..." : "Yes, delete my account"}
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 14 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile page ─────────────────────────────────────────────────────────────

export default function Profile({ onBack }) {
  const { user, signOut } = useAuth();
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const isEmailUser = user?.app_metadata?.provider !== "google";

  // Username
  const [username,     setUsername]     = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editing,      setEditing]      = useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [savingName,   setSavingName]   = useState(false);

  // MFA
  const [mfaEnabled,  setMfaEnabled]  = useState(false);
  const [loadingMFA,  setLoadingMFA]  = useState(true);

  // Change password
  const [showPwForm,   setShowPwForm]   = useState(false);
  const [newPassword,  setNewPassword]  = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [pwError,      setPwError]      = useState("");
  const [pwSuccess,    setPwSuccess]    = useState(false);
  const [savingPw,     setSavingPw]     = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [deleteError,     setDeleteError]     = useState("");

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
    if (error) { setSaveError("Failed to save."); }
    else { setUsername(trimmed); setEditing(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
    setSavingName(false);
  }

  async function handleChangePassword() {
    setPwError(""); setPwSuccess(false);
    if (!validatePassword(newPassword).every(r => r.test)) { setPwError("Password doesn't meet all requirements."); return; }
    if (newPassword !== confirmPw) { setPwError("Passwords don't match."); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPwError(error.message); }
    else {
      setPwSuccess(true);
      setNewPassword(""); setConfirmPw(""); setShowPwForm(false);
      setTimeout(() => setPwSuccess(false), 4000);
    }
    setSavingPw(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true); setDeleteError("");
    try {
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      await signOut();
      window.location.href = "/login";
    } catch (e) {
      setDeleteError("Failed to delete account. Please try again.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  async function handleSignOut() { await signOut(); window.location.href = "/login"; }
  function handleSetupMFA() { sessionStorage.setItem("mfa_mode", "enroll"); window.location.href = "/mfa-setup"; }
  async function handleRemoveMFA() {
    const { data } = await supabase.auth.mfa.listFactors();
    const factor = data?.totp?.find(f => f.status === "verified");
    if (factor) { await supabase.auth.mfa.unenroll({ factorId: factor.id }); setMfaEnabled(false); }
  }

  return (
    <div>
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isMobile ? 24 : 32 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.slate, fontSize: 18, cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color 0.15s, color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.indigo; e.currentTarget.style.color = colors.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.slate; }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 28, fontWeight: 900, background: "linear-gradient(135deg, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Your Profile
        </h1>
      </div>

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
            {isEmailUser ? "Email account" : "Google account"}
          </div>
        </div>
      </div>

      {/* Username */}
      <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 800 }}>Username</h2>
        {saveSuccess && <div style={{ color: colors.green, fontSize: 13, marginBottom: 10 }}>✓ Username updated.</div>}
        {editing ? (
          <>
            <input value={editUsername} onChange={e => setEditUsername(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${saveError ? colors.red : colors.indigo}`, borderRadius: 8, color: colors.text, fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 8 }} />
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

      {/* Change password — email users only */}
      {isEmailUser && (
        <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showPwForm ? 16 : 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Password</h2>
            <button
              onClick={() => { setShowPwForm(!showPwForm); setPwError(""); setNewPassword(""); setConfirmPw(""); }}
              style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, fontSize: 13, padding: "7px 14px" }}
            >
              {showPwForm ? "Cancel" : "Change"}
            </button>
          </div>
          {pwSuccess && <div style={{ color: colors.green, fontSize: 13, marginTop: 8 }}>✓ Password updated successfully.</div>}
          {showPwForm && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>New Password</label>
                <input
                  type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Create a strong password"
                  style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = colors.indigo}
                  onBlur={e => e.target.style.borderColor = colors.border}
                />
                {newPassword && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {validatePassword(newPassword).map((r, i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: r.test ? colors.green : colors.border }} />
                      ))}
                    </div>
                    {validatePassword(newPassword).map((r, i) => (
                      <div key={i} style={{ fontSize: 12, color: r.test ? colors.green : colors.slate, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{r.test ? "✓" : "○"}</span>{r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: colors.slateLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Confirm New Password</label>
                <input
                  type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: `1px solid ${confirmPw && confirmPw !== newPassword ? colors.red : colors.border}`, borderRadius: 8, color: colors.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = colors.indigo}
                  onBlur={e => e.target.style.borderColor = confirmPw && confirmPw !== newPassword ? colors.red : colors.border}
                />
                {confirmPw && confirmPw !== newPassword && <p style={{ color: colors.red, fontSize: 12, margin: "4px 0 0" }}>Passwords don't match.</p>}
              </div>
              {pwError && <div style={{ background: "#450a0a", border: `1px solid ${colors.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, color: "#fca5a5", fontSize: 13 }}>⚠️ {pwError}</div>}
              <button onClick={handleChangePassword} disabled={savingPw} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 13, padding: "9px 18px", opacity: savingPw ? 0.7 : 1 }}>
                {savingPw ? "Updating..." : "Update password"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Security / MFA */}
      <div style={{ ...sharedStyles.card, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800 }}>Security</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, background: "#1e293b", borderRadius: 10, border: `1px solid ${colors.border}`, gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Two-factor authentication</div>
            <div style={{ color: colors.slate, fontSize: 12 }}>{loadingMFA ? "Checking..." : mfaEnabled ? "✓ Enabled" : "Not enabled"}</div>
          </div>
          {!loadingMFA && (mfaEnabled ? (
            <button onClick={handleRemoveMFA} style={{ ...sharedStyles.btn, background: "transparent", border: `1px solid ${colors.red}`, color: colors.red, fontSize: 12, padding: "7px 14px", flexShrink: 0 }}>Remove</button>
          ) : (
            <button onClick={handleSetupMFA} style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, fontSize: 12, padding: "7px 14px", flexShrink: 0 }}>Set up →</button>
          ))}
        </div>
      </div>

      {/* Account actions */}
      <div style={sharedStyles.card}>
        <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800 }}>Account</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleSignOut} style={{ ...sharedStyles.btn, background: "transparent", border: `1px solid ${colors.border}`, color: colors.slate, fontSize: 14, justifyContent: "flex-start" }}>
            Sign out
          </button>
          {deleteError && <p style={{ color: colors.red, fontSize: 13, margin: "4px 0 0" }}>⚠️ {deleteError}</p>}
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{ ...sharedStyles.btn, background: "transparent", border: `1px solid rgba(239,68,68,0.3)`, color: colors.red, fontSize: 14, justifyContent: "flex-start" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = colors.red}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"}
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Version */}
      <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
        <span style={{ fontSize: 12, color: colors.textMuted, letterSpacing: "0.05em" }}>
          PM Gym — Version 1.3.7
        </span>
      </div>
    </div>
  );
}