import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Ask the backend to generate a vision + context for a focused exercise.
 * @param {string} prompt - The context generation prompt
 * @returns {Promise<string>} Raw text with VISION: and optional extra context
 */
export async function generateFocusedContext(prompt) {
  const res = await fetch(`${API_BASE}/api/focused-context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate exercise context");
  }

  const data = await res.json();
  return data.context;
}

/**
 * Submit the user's focused exercise answer for grading.
 * @param {string} gradingPrompt - The full grading prompt
 * @returns {Promise<object>} Grading results
 */
export async function gradeFocusedAnswer(gradingPrompt) {
  const res = await fetch(`${API_BASE}/api/focused-grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gradingPrompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to grade answer");
  }

  return res.json();
}

/**
 * Save a completed focused session to Supabase.
 */
export async function saveFocusedSession(userId, exerciseKey, vision, context, answer, results) {
  const { error } = await supabase.from("focused_sessions").insert({
    user_id:      userId,
    exercise_type: exerciseKey,
    vision,
    context,
    answer,
    score:        results.score,
    letter_grade: results.letterGrade,
    feedback:     results.feedback,
    strengths:    results.strengths,
    improvements: results.improvements,
  });

  if (error) {
    console.error("Failed to save focused session:", error.message);
    throw error;
  }
}

/**
 * Fetch all focused sessions for the current user, newest first.
 */
export async function fetchFocusedSessions(userId) {
  const { data, error } = await supabase
    .from("focused_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
