# PM Gym

**AI-powered practice platform for product managers.**

PM Gym is a full-stack web and mobile app for aspiring and practicing PMs to sharpen their skills through structured exercises, real-world scenarios, and personalized AI feedback — inspired by what Replit is for developers.

---

## Screenshots

> Add screenshots here before publishing. Suggested shots:
> - Dashboard (desktop)
> - Dashboard (mobile, showing bottom nav)
> - Full PM Plan — form view
> - Full PM Plan — results with grade
> - Focused Practice — exercise picker
> - Scenario Run — question and answer
> - Interview Prep — structured answer mode
> - Glossary Quiz — question screen
> - PM Glossary — category expanded

| | | |
|---|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Practice](screenshots/practice.png) | ![Interview](screenshots/interview.png) |
| Dashboard | Practice | Interview Prep |
| ![Mobile](screenshots/mobile.png) | ![Quiz](screenshots/quiz.png) | ![Glossary](screenshots/glossary.png) |
| Mobile | Glossary Quiz | Glossary |

---

## What it does

- **Full PM Plan** — generate a product vision, build a complete PM plan across 8 sections, get AI grading with a letter grade, score, strengths, and areas to improve.
- **Focused Practice** — drill one skill at a time: epics & stories, roadmap, release plan, key features, target group, or problem & metrics.
- **Scenario Runs** — respond to realistic PM challenges across 8 categories. Graded with a model answer to compare against.
- **Interview Prep** — practice behavioral, product design, estimation, metrics, strategy, and technical PM interview questions. Choose FAANG or startup context, answer freeform or with a guided framework, get interviewer perspective and a model answer.
- **Glossary Quiz** — multiple choice quiz on PM terminology, 5 or 10 questions, by category or all terms.
- **PM Glossary** — 19 essential PM terms with definitions, real-world examples, and PM tips.
- **Performance Summary** — AI analysis of your strengths, focus areas, and trends across all sessions.
- **Practice Streak** — daily activity tracking with a 7-day history strip.

---

## Project Structure

```
pm-gym/
│
├── frontend/                               ← React + Vite
│   ├── src/
│   │   ├── App.jsx                         ← Root component, routing, state
│   │   ├── hooks/
│   │   │   └── useWindowWidth.js           ← Responsive breakpoint hook
│   │   ├── api/
│   │   │   ├── claude.js                   ← Full PM plan API calls
│   │   │   ├── sessions.js                 ← Full PM plan sessions
│   │   │   ├── focusedSessions.js
│   │   │   ├── scenarioSessions.js
│   │   │   ├── quizSessions.js
│   │   │   ├── interviewSessions.js
│   │   │   └── streak.js
│   │   ├── constants/
│   │   │   ├── prompts.js
│   │   │   ├── styles.js
│   │   │   ├── focusedExercises.js
│   │   │   ├── scenarioCategories.js
│   │   │   ├── interviewTypes.js
│   │   │   ├── glossaryContent.js
│   │   │   └── quizLogic.js
│   │   ├── components/
│   │   │   ├── GradeCircle.jsx
│   │   │   ├── SectionScore.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── VisionBox.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StreakCard.jsx
│   │   │   └── BottomTabBar.jsx            ← Mobile floating nav
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Callback.jsx
│   │       ├── MFASetup.jsx
│   │       ├── Profile.jsx
│   │       ├── Dashboard.jsx
│   │       ├── SessionDetail.jsx
│   │       ├── Home.jsx
│   │       ├── Vision.jsx
│   │       ├── Form.jsx
│   │       ├── Results.jsx
│   │       ├── FocusedPractice.jsx
│   │       ├── ScenarioRuns.jsx
│   │       ├── InterviewPrep.jsx
│   │       ├── GlossaryQuiz.jsx
│   │       └── Glossary.jsx
│
├── backend/                                ← Node.js + Express
│   ├── index.js
│   └── routes/
│       ├── claude.js                       ← /api/generate-vision, /api/grade
│       ├── focused.js                      ← /api/focused-context, /api/focused-grade
│       ├── scenarios.js                    ← /api/generate-scenario, /api/grade-scenario
│       ├── interview.js                    ← /api/interview-question, /api/interview-grade
│       └── summary.js                      ← /api/performance-summary
│
└── README.md
```

---

## Running locally

You need two terminal tabs — one for the backend, one for the frontend.

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY
npm run dev
# http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
# http://localhost:5173
```

---

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React, Vite |
| Backend  | Node.js, Express |
| Auth & DB | Supabase (PostgreSQL + RLS) |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Hosting | Vercel (frontend), Render (backend) |

---

## Supabase tables

| Table | Description |
|-------|-------------|
| `profiles` | Username per user |
| `sessions` | Full PM plan sessions |
| `focused_sessions` | Focused practice sessions |
| `scenario_sessions` | Scenario run sessions |
| `quiz_sessions` | Glossary quiz results |
| `interview_sessions` | Interview prep sessions |
| `performance_summaries` | Persisted AI performance summary |
| `streaks` | Daily practice streak per user |

All tables have Row Level Security — users can only access their own data.

---

## Deployment

### Backend → Render
1. New Web Service → connect repo → root: `backend/`
2. Build: `npm install` · Start: `npm start`
3. Environment variables: `ANTHROPIC_API_KEY`, `FRONTEND_URL`

### Frontend → Vercel
1. New Project → connect repo → root: `frontend/`
2. Environment variables: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

After deploying, update `FRONTEND_URL` on Render to your Vercel URL, and add the Vercel URL to your Supabase allowed redirect URLs.

---

## Roadmap

- [x] Full PM plan exercise with AI grading
- [x] User auth — Google OAuth, email/password, MFA
- [x] User profiles with editable username
- [x] Progress dashboard with stacked session history
- [x] Performance summary — AI analysis of strengths, focus areas, trends
- [x] Focused practice — 6 exercise types
- [x] Scenario runs — 8 categories with model answers
- [x] Interview prep — 6 question types, 2 company contexts, structured + freeform answers
- [x] PM Glossary — 19 terms, grouped, collapsible
- [x] Glossary Quiz — multiple choice, by category or all terms
- [x] Mobile responsive — floating bottom tab navigation
- [x] Practice streak
- [ ] Structured learning paths
- [ ] LinkedIn progress card
- [ ] AI Mentor / Ask Anything
- [ ] Real company case studies
- [ ] Leaderboard
- [ ] Grading tuning