import { supabase } from "../lib/supabase";

/**
 * Save a completed quiz session to Supabase.
 */
export async function saveQuizSession(userId, categoryKey, questionCount, score, letterGrade, gradedQuestions) {
  const { error } = await supabase.from("quiz_sessions").insert({
    user_id:        userId,
    category:       categoryKey,
    question_count: questionCount,
    score,
    letter_grade:   letterGrade,
    questions:      gradedQuestions,
  });

  if (error) {
    console.error("Failed to save quiz session:", error.message);
    throw error;
  }
}

/**
 * Fetch all quiz sessions for a user, newest first.
 */
export async function fetchQuizSessions(userId) {
  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
