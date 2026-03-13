import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Generate a scenario from the backend.
 */
export async function generateScenario(prompt) {
  const res = await fetch(`${API_BASE}/api/generate-scenario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate scenario");
  }
  return res.json(); // { scenario, challenge }
}

/**
 * Grade a scenario answer.
 */
export async function gradeScenario(gradingPrompt) {
  const res = await fetch(`${API_BASE}/api/grade-scenario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gradingPrompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to grade scenario");
  }
  return res.json();
}

/**
 * Save a completed scenario session to Supabase.
 */
export async function saveScenarioSession(userId, categoryKey, scenario, challenge, answer, results) {
  const { error } = await supabase.from("scenario_sessions").insert({
    user_id:      userId,
    category:     categoryKey,
    scenario,
    challenge,
    answer,
    score:        results.score,
    letter_grade: results.letterGrade,
    feedback:     results.feedback,
    model_answer: results.modelAnswer,
  });
  if (error) {
    console.error("Failed to save scenario session:", error.message);
    throw error;
  }
}

/**
 * Fetch all scenario sessions for a user, newest first.
 */
export async function fetchScenarioSessions(userId) {
  const { data, error } = await supabase
    .from("scenario_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}