# 🏋️ PM Gym

**Practice your Product Management skills with AI-powered exercises and feedback.**

PM Gym generates real-world product scenarios and grades your responses — helping you sharpen the skills that matter most as a PM.

---

## What it does

PM Gym gives you a randomly generated product vision and asks you to build a full PM plan around it — target group, goals, user needs, value proposition, key features, roadmap, release plan, and themes/epics/stories. When you submit, an AI grades each section individually and gives you a score, letter grade, strengths, and specific areas to improve.

---

## Project Structure

```
pm-gym/
│
├── frontend/                           ← React + Vite
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example                    ← Copy to .env, set VITE_API_URL
│   └── src/
│       ├── main.jsx                    ← Entry point
│       ├── App.jsx                     ← Root component, owns all state
│       ├── api/
│       │   └── claude.js               ← All backend API calls
│       ├── constants/
│       │   ├── prompts.js              ← AI prompts, phases, form shape
│       │   └── styles.js               ← Shared colors and style tokens
│       ├── components/
│       │   ├── GradeCircle.jsx         ← Letter grade badge
│       │   ├── SectionScore.jsx        ← Score bar + feedback per section
│       │   ├── FormField.jsx           ← Textarea input for PM plan
│       │   └── VisionBox.jsx           ← Product vision display
│       └── pages/
│           ├── Home.jsx                ← Landing / how it works
│           ├── Vision.jsx              ← Generated vision + start
│           ├── Form.jsx                ← PM plan form (8 sections)
│           └── Results.jsx             ← Grade, feedback, breakdown
│
├── backend/                            ← Node.js + Express
│   ├── index.js                        ← Server, middleware, rate limiting
│   ├── package.json
│   ├── .env.example                    ← Copy to .env, set ANTHROPIC_API_KEY
│   └── routes/
│       └── claude.js                   ← POST /api/generate-vision
│                                          POST /api/grade
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
  frontend/src/api/claude.js
    │
    │  POST /api/generate-vision
    │  POST /api/grade
    ▼
  backend/index.js  (Express)
    │
    │  Anthropic SDK
    ▼
  Claude API
  (API key stays on the backend — never exposed to the browser)
```

---

## Running locally

You'll need two terminal tabs — one for the backend, one for the frontend.

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Open .env and paste your Anthropic API key
npm run dev
# Running on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL is already set to http://localhost:3001
npm run dev
# Running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Tech stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React, Vite                   |
| Backend  | Node.js, Express              |
| AI       | Anthropic Claude API (Sonnet) |
| Hosting  | Vercel (frontend), Render (backend) |

---

## Deployment

### Backend → Render
1. Push to GitHub
2. New Web Service → connect repo → set root to `backend/`
3. Build command: `npm install` — Start command: `npm start`
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Copy the deployed URL (e.g. `https://pm-gym-backend.onrender.com`)

### Frontend → Vercel
1. New Project → connect repo → set root to `frontend/`
2. Add environment variable: `VITE_API_URL` → your Render backend URL
3. Deploy

---

## Roadmap

- [x] Full PM plan exercise with AI grading
- [x] User auth and profiles
- [x] Progress dashboard with performance metrics for PM Plan Exercise and Focused Practice
- [x] Focused practice mode (epics, stories, roadmaps, etc. individually)
- [x] Scenario runs — real-world PM situations to respond to
- [x] Glossary — definitions and examples of all PM concepts
- [x] Glossary Quiz — get quized on all the terms in the PM Glossary
- [x] Optimize Previous Quiz Stacking on Dashboard — allow quizes to stack for each category and fan out vertically
- [] Mobile Ready — app works on mobile, tablet, desktop, and laptops
- [] Fine Tune Grading Rubric — make less stringent
