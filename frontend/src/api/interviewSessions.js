import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Generate interview question via backend ──────────────────────────────────

export async function generateInterviewQuestion(prompt) {
  const res = await fetch(`${API_BASE}/api/interview-question`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("Failed to generate question");
  const data = await res.json();
  return data; // { question, context }
}

// ─── Grade interview answer via backend ───────────────────────────────────────

export async function gradeInterviewAnswer(prompt) {
  const res = await fetch(`${API_BASE}/api/interview-grade`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("Failed to grade answer");
  const data = await res.json();
  return data; // { score, letterGrade, feedback, strengths, improvements, modelAnswer, interviewerPerspective }
}

// ─── Save session to Supabase ─────────────────────────────────────────────────

export async function saveInterviewSession(userId, typeKey, companyKey, question, answerMode, answer, gradeData) {
  const { error } = await supabase.from("interview_sessions").insert({
    user_id:                 userId,
    question_type:           typeKey,
    company_type:            companyKey,
    question,
    answer_mode:             answerMode,
    answer,
    score:                   gradeData.score,
    letter_grade:            gradeData.letterGrade,
    feedback:                gradeData.feedback,
    strengths:               gradeData.strengths,
    improvements:            gradeData.improvements,
    model_answer:            gradeData.modelAnswer,
    interviewer_perspective: gradeData.interviewerPerspective,
  });
  if (error) throw error;
}

// ─── Fetch all sessions ───────────────────────────────────────────────────────

export async function fetchInterviewSessions(userId) {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
