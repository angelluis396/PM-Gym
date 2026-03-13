import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { sharedStyles, colors } from "../constants/styles";

/**
 * Handles two MFA flows depending on sessionStorage flags set by Callback.jsx:
 *
 * "enroll" mode — user is setting up MFA for the first time from their Profile page.
 *   Shows a QR code → user scans with authenticator app → enters 6-digit code → saves.
 *
 * "verify" mode — user has MFA and just signed in, needs to verify their second factor.
 *   Shows a code entry field → verifies against the challenge created in Callback.jsx.
 */
export default function MFASetup() {
  const mode        = sessionStorage.getItem("mfa_mode") || "enroll";
  const challengeId = sessionStorage.getItem("mfa_challenge_id");
  const factorId    = sessionStorage.getItem("mfa_factor_id");

  const [qrCode,    setQrCode]    = useState("");
  const [secret,    setSecret]    = useState("");
  const [newFactorId, setNewFactorId] = useState("");
  const [newChallengeId, setNewChallengeId] = useState("");
  const [code,      setCode]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [step,      setStep]      = useState(mode === "verify" ? "verify" : "scan");

  // Enroll mode: generate QR code on mount
  useEffect(() => {
    if (mode === "enroll") {
      enrollMFA();
    }
  }, []);

  async function enrollMFA() {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) {
      setError("Failed to start MFA setup. Please try again.");
      setLoading(false);
      return;
    }
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setNewFactorId(data.id);

    // Create a challenge immediately so we're ready to verify
    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: data.id });
    if (!challengeError) {
      setNewChallengeId(challengeData.id);
    }
    setLoading(false);
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");

    const resolvedFactorId    = mode === "enroll" ? newFactorId    : factorId;
    const resolvedChallengeId = mode === "enroll" ? newChallengeId : challengeId;

    const { error } = await supabase.auth.mfa.verify({
      factorId:    resolvedFactorId,
      challengeId: resolvedChallengeId,
      code,
    });

    if (error) {
      setError("Incorrect code. Please try again.");
      setLoading(false);
      return;
    }

    // Clean up sessionStorage
    sessionStorage.removeItem("mfa_challenge_id");
    sessionStorage.removeItem("mfa_factor_id");
    sessionStorage.removeItem("mfa_mode");

    window.location.href = "/app";
  }

  function handleSkip() {
    sessionStorage.removeItem("mfa_mode");
    window.location.href = "/app";
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: colors.text }}>
            {mode === "verify" ? "Verify your identity" : "Set up two-factor authentication"}
          </h1>
          <p style={{ color: colors.textMuted, margin: 0, fontSize: 15 }}>
            {mode === "verify"
              ? "Enter the 6-digit code from your authenticator app."
              : "Add an extra layer of security to your PM Gym account."}
          </p>
        </div>

        <div style={{ ...sharedStyles.card, padding: "32px" }}>

          {/* ENROLL — Step 1: Scan QR */}
          {step === "scan" && (
            <>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: colors.text }}>
                Step 1 — Scan this QR code
              </h3>
              <p style={{ color: colors.textMuted, fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
                Open <strong style={{ color: colors.text }}>Google Authenticator</strong> or{" "}
                <strong style={{ color: colors.text }}>Authy</strong> on your phone and scan the
                code below.
              </p>

              {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: colors.slate }}>
                  Generating QR code...
                </div>
              ) : (
                <>
                  {/* QR Code */}
                  <div style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}>
                    <img src={qrCode} alt="MFA QR Code" style={{ width: 180, height: 180 }} />
                  </div>

                  {/* Manual entry fallback */}
                  <div style={{
                    background: "#1e293b",
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 24,
                  }}>
                    <p style={{ color: colors.slate, fontSize: 12, margin: "0 0 6px" }}>
                      Can't scan? Enter this code manually:
                    </p>
                    <code style={{ color: colors.text, fontSize: 13, letterSpacing: "0.1em", wordBreak: "break-all" }}>
                      {secret}
                    </code>
                  </div>

                  <button
                    style={{ ...sharedStyles.btn, ...sharedStyles.btnPrimary, width: "100%", justifyContent: "center" }}
                    onClick={() => setStep("verify")}
                  >
                    I've scanned it →
                  </button>
                </>
              )}
            </>
          )}

          {/* VERIFY — Enter 6-digit code (both enroll step 2 and verify mode) */}
          {step === "verify" && (
            <>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: colors.text }}>
                {mode === "enroll" ? "Step 2 — Enter the code" : "Enter your authenticator code"}
              </h3>
              <p style={{ color: colors.textMuted, fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
                {mode === "enroll"
                  ? "Enter the 6-digit code shown in your authenticator app to confirm setup."
                  : "Open your authenticator app and enter the 6-digit code for PM Gym."}
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#1e293b",
                  border: `1px solid ${error ? colors.red : colors.border}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "0.3em",
                  textAlign: "center",
                  outline: "none",
                  fontFamily: "monospace",
                  boxSizing: "border-box",
                  marginBottom: 8,
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />

              {error && (
                <p style={{ color: colors.red, fontSize: 13, margin: "0 0 16px" }}>⚠️ {error}</p>
              )}

              <button
                style={{
                  ...sharedStyles.btn,
                  ...sharedStyles.btnPrimary,
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 8,
                  opacity: loading ? 0.7 : 1,
                }}
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verifying..." : mode === "enroll" ? "Enable MFA ✓" : "Verify →"}
              </button>

              {/* Back button for enroll flow */}
              {mode === "enroll" && (
                <button
                  style={{ ...sharedStyles.btn, ...sharedStyles.btnSecondary, width: "100%", justifyContent: "center", marginTop: 12 }}
                  onClick={() => { setStep("scan"); setCode(""); setError(""); }}
                >
                  ← Back
                </button>
              )}
            </>
          )}

          {/* Skip option for enroll mode only */}
          {mode === "enroll" && (
            <button
              onClick={handleSkip}
              style={{
                background: "none",
                border: "none",
                color: colors.textMuted,
                fontSize: 13,
                cursor: "pointer",
                width: "100%",
                textAlign: "center",
                marginTop: 16,
                padding: "8px",
                fontFamily: "inherit",
              }}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
