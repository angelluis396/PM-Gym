# PM Gym

**Practice your Product Management skills with AI-powered exercises and feedback.**

PM Gym is a full-stack web and mobile application that helps aspiring and practicing PMs sharpen their skills through structured exercises, real-world scenarios, and AI grading — inspired by what Replit is for developers.

---

## What it does

PM Gym covers the full spectrum of PM practice:

- **Full PM Plan** — get a randomly generated product vision and build a complete PM plan around it (target group, goals, user needs, value proposition, key features, roadmap, release plan, epics and stories). AI grades each section individually with a letter grade, score, strengths, and areas to improve.
- **Focused Practice** — drill a specific skill in isolation: epics & stories, product roadmap, release plan, key features & value proposition, target group & user needs, or problem definition & success metrics.
- **Scenario Runs** — respond to realistic high-pressure PM situations across 8 categories (stakeholder management, prioritization, crisis & escalation, build vs buy, roadmap & strategy, user feedback, cross-functional collaboration, metrics & data). Graded with a model answer to compare against.
- **Glossary Quiz** — multiple choice quiz on PM terminology, 5 or 10 questions, by category or across all terms. Wrong terms highlighted in red on your dashboard.
- **PM Glossary** — 19 essential PM terms grouped into 4 categories, each with a definition, real-world example, and PM tip.
- **Performance Summary** — AI-generated analysis of your strengths, focus areas, trends, and a recommended next action based on all your session data.

---

## Project Structure

```
pm-gym/
│
├── frontend/                               ← React + Vite
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example                        ← Copy to .env
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                         ← Root component, state, routing
│       ├── hooks/
│       │   └── useWindowWidth.js           ← Responsive breakpoint hook
│       ├── api/
│       │   ├── claude.js                   ← Full PM plan API calls
│       │   ├── sessions.js                 ← Full PM plan session storage
│       │   ├── focusedSessions.js          ← Focused practice storage
│       │   ├── scenarioSessions.js         ← Scenario run storage
│       │   └── quizSessions.js             ← Quiz session storage
│       ├── constants/
│       │   ├── prompts.js                  ← AI prompts, phases, form shape
│       │   ├── styles.js                   ← Shared colors and style tokens
│       │   ├── focusedExercises.js         ← Exercise definitions and prompts
│       │   ├── scenarioCategories.js       ← Scenario categories and prompts
│       │   ├── glossaryContent.js          ← All 19 glossary terms
│       │   └── quizLogic.js                ← Quiz generation and grading
│       ├── components/
│       │   ├── GradeCircle.jsx             ← Letter grade badge
│       │   ├── SectionScore.jsx            ← Score bar + feedback
│       │   ├── FormField.jsx               ← Textarea input
│       │   ├── VisionBox.jsx               ← Product vision display
│       │   ├── ProtectedRoute.jsx          ← Auth guard
│       │   └── BottomTabBar.jsx            ← Mobile bottom navigation
│       ├── context/
│       │   └── AuthContext.jsx             ← Global auth state
│       ├── lib/
│       │   └── supabase.js                 ← Supabase client
│       └── pages/
│           ├── Login.jsx                   ← Google OAuth + email/password
│           ├── Callback.jsx                ← OAuth redirect handler
│           ├── MFASetup.jsx                ← TOTP two-factor setup
│           ├── Profile.jsx                 ← Username, MFA, sign out
│           ├── Dashboard.jsx               ← Progress, metrics, session history
│           ├── SessionDetail.jsx           ← Full PM plan session review
│           ├── Home.jsx                    ← Exercise start screen
│           ├── Vision.jsx                  ← Generated vision display
│           ├── Form.jsx                    ← PM plan form (8 sections)
│           ├── Results.jsx                 ← Grading results
│           ├── FocusedPractice.jsx         ← Focused exercise flow
│           ├── ScenarioRuns.jsx            ← Scenario exercise flow
│           ├── GlossaryQuiz.jsx            ← Quiz flow
│           └── Glossary.jsx               ← Glossary browser
│
├── backend/                                ← Node.js + Express
│   ├── index.js                            ← Server, CORS, rate limiting
│   ├── package.json
│   ├── .env.example
│   └── routes/
│       ├── claude.js                       ← /api/generate-vision, /api/grade
│       ├── focused.js                      ← /api/focused-context, /api/focused-grade
│       ├── scenarios.js                    ← /api/generate-scenario, /api/grade-scenario
│       └── summary.js                      ← /api/performance-summary
│
├── .gitignore
└── README.md
```

---

## How it works

```
  Browser
    │
    │  fetch()
    ▼
  frontend/src/api/
    │
    │  POST /api/generate-vision
    │  POST /api/grade
    │  POST /api/focused-context
    │  POST /api/focused-grade
    │  POST /api/generate-scenario
    │  POST /api/grade-scenario
    │  POST /api/performance-summary
    ▼
  backend/index.js  (Express)
    │
    │  Anthropic SDK
    ▼
  Claude API
  (API key stays on the backend — never exposed to the browser)

  frontend ←→ Supabase
  (auth, profiles, all session data stored per user with RLS)
```

---

## Running locally

You'll need two terminal tabs — one for the backend, one for the frontend.

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Paste your Anthropic API key inside .env
npm run dev
# Running on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project
# VITE_API_URL defaults to http://localhost:3001
npm run dev
# Running on http://localhost:5173
```

---

## Tech stack

| Layer      | Tech                                        |
|------------|---------------------------------------------|
| Frontend   | React, Vite                                 |
| Backend    | Node.js, Express                            |
| Auth & DB  | Supabase (auth, RLS, PostgreSQL)            |
| AI         | Anthropic Claude API (claude-sonnet-4)      |
| Hosting    | Vercel (frontend), Render (backend)         |

---

## Supabase tables

| Table                   | Description                                  |
|-------------------------|----------------------------------------------|
| `profiles`              | Username per user                            |
| `sessions`              | Full PM plan graded sessions                 |
| `focused_sessions`      | Focused practice graded sessions             |
| `scenario_sessions`     | Scenario run graded sessions                 |
| `quiz_sessions`         | Glossary quiz results                        |
| `performance_summaries` | Persisted AI performance summary per user    |

All tables have Row Level Security enabled — users can only read and write their own data.

---

## Deployment

### Backend → Render
1. Push to GitHub
2. New Web Service → connect repo → set root to `backend/`
3. Build command: `npm install` — Start command: `npm start`
4. Add environment variables: `ANTHROPIC_API_KEY`, `FRONTEND_URL`
5. Copy the deployed URL (e.g. `https://pm-gym-backend.onrender.com`)

### Frontend → Vercel
1. New Project → connect repo → set root to `frontend/`
2. Add environment variables:
   - `VITE_API_URL` → your Render backend URL
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
3. Deploy

---

## Roadmap

- [x] Full PM plan exercise with AI grading
- [x] User auth — Google OAuth, email/password, MFA (TOTP)
- [x] User profiles with editable username
- [x] Progress dashboard with stacked session history
- [x] AI performance summary with strengths, focus areas, and trends
- [x] Focused practice mode — 6 exercise types
- [x] Scenario runs — 8 categories with model answers
- [x] PM Glossary — 19 terms, grouped, collapsible
- [x] Glossary Quiz — multiple choice, by category or all terms
- [x] Mobile responsive — bottom tab bar navigation
- [x] Practice streak
- [x] PM Interview Prep Mode
- [ ] Structured learning paths
- [ ] LinkedIn progress card
- [ ] AI Mentor / Ask Anything mode
- [ ] Real company case studies
- [ ] Leaderboard
- [ ] Fine-tune grading rubric