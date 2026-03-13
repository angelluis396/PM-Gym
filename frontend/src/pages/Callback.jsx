import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { colors } from "../constants/styles";

/**
 * Handles two scenarios:
 *
 * 1. OAuth redirect from Google — Supabase has already exchanged the code
 *    for a session. Check MFA status and route accordingly.
 *
 * 2. Email confirmation link — user clicked the link in their inbox.
 *    Supabase sets the session. We then create their profile row using
 *    the username they chose at signup (stored in user metadata).
 */
export default function Callback() {
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setError("Authentication failed. Please try signing in again.");
        setTimeout(() => { window.location.href = "/login"; }, 3000);
        return;
      }

      if (!data?.session) {
        window.location.href = "/login";
        return;
      }

      const user = data.session.user;

      // ── Create profile for email signups ───────────────────────────────────
      // Google signups are handled by the Supabase trigger (handle_new_user).
      // Email signups need to create their profile here after confirmation.
      const isEmailSignup = user.app_metadata?.provider === "email";
      if (isEmailSignup) {
        const username = user.user_metadata?.username;
        if (username) {
          // Use upsert so re-clicking the confirmation link doesn't throw an error
          await supabase.from("profiles").upsert(
            { id: user.id, username },
            { onConflict: "id" }
          );
        }
      }

      // ── MFA check ──────────────────────────────────────────────────────────
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasVerifiedMFA = factors?.totp?.some((f) => f.status === "verified");

      if (hasVerifiedMFA) {
        const { data: challengeData, error: challengeError } =
          await supabase.auth.mfa.challenge({ factorId: factors.totp[0].id });

        if (challengeError) {
          window.location.href = "/app";
          return;
        }

        sessionStorage.setItem("mfa_challenge_id", challengeData.id);
        sessionStorage.setItem("mfa_factor_id", factors.totp[0].id);
        sessionStorage.setItem("mfa_mode", "verify");
        window.location.href = "/mfa-setup";
      } else {
        window.location.href = "/app";
      }
    }

    handleCallback();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", color: colors.text, gap: 16,
    }}>
      {error ? (
        <>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <p style={{ color: colors.red, fontSize: 15 }}>{error}</p>
          <p style={{ color: colors.textMuted, fontSize: 13 }}>Redirecting to login...</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 40 }}>✦</div>
          <p style={{ color: colors.slate, fontSize: 15 }}>Signing you in...</p>
        </>
      )}
    </div>
  );
}