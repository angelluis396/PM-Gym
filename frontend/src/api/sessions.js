import { supabase } from "../lib/supabase";

/**
 * Save a completed graded session to the database.
 * @param {string} userId   - The logged in user's ID
 * @param {string} vision   - The product vision that was given
 * @param {object} form     - The user's filled in PM plan
 * @param {object} results  - The grading results from the AI
 */
export async function saveSession(userId, vision, form, results) {
  const { error } = await supabase.from("sessions").insert({
    user_id:          userId,
    vision,
    form,
    score:            results.score,
    letter_grade:     results.letterGrade,
    overall_feedback: results.overallFeedback,
    sections:         results.sections,
    strengths:        results.strengths,
    improvements:     results.improvements,
  });

  if (error) {
    console.error("Failed to save session:", error.message);
    throw error;
  }
}

/**
 * Fetch all sessions for the current user, newest first.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function fetchSessions(userId) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch sessions:", error.message);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single session by ID.
 * @param {string} sessionId
 * @returns {Promise<object>}
 */
export async function fetchSession(sessionId) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Failed to fetch session:", error.message);
    throw error;
  }

  return data;
}

/**
 * Compute dashboard metrics from a list of sessions.
 * @param {Array} sessions
 * @returns {object} metrics
 */
export function computeMetrics(sessions) {
  if (!sessions.length) {
    return {
      averageScore:    null,
      personalBest:    null,
      totalSessions:   0,
      sectionAverages: {},
    };
  }

  const scores = sessions.map((s) => s.score);
  const averageScore  = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const personalBest  = Math.max(...scores);

  // Average score per section across all sessions
  const sectionTotals = {};
  const sectionCounts = {};

  sessions.forEach((s) => {
    if (!s.sections) return;
    Object.entries(s.sections).forEach(([key, val]) => {
      sectionTotals[key] = (sectionTotals[key] || 0) + val.score;
      sectionCounts[key] = (sectionCounts[key] || 0) + 1;
    });
  });

  const sectionAverages = {};
  Object.keys(sectionTotals).forEach((key) => {
    sectionAverages[key] = Math.round(sectionTotals[key] / sectionCounts[key]);
  });

  return { averageScore, personalBest, totalSessions: sessions.length, sectionAverages };
}
