# Pocket PM — Frontend

React + Vite frontend for the Pocket PM app.

## File Structure

```
src/
├── api/
│   └── claude.js              ← All backend API calls (generateVision, gradeSubmission)
├── constants/
│   ├── prompts.js             ← AI prompts, PHASES enum, EMPTY_FORM shape
│   └── styles.js              ← Shared colors and style objects
├── components/
│   ├── GradeCircle.jsx        ← Circular grade badge (A/B/C/D/F + score)
│   ├── SectionScore.jsx       ← Individual section score with progress bar
│   ├── FormField.jsx          ← Labelled textarea for the PM plan form
│   └── VisionBox.jsx          ← Indigo product vision display box
├── pages/
│   ├── Home.jsx               ← Landing page with how-it-works steps
│   ├── Vision.jsx             ← Shows generated vision, start/regenerate
│   ├── Form.jsx               ← Full PM plan form (8 sections)
│   └── Results.jsx            ← Grade, strengths, improvements, section breakdown
├── App.jsx                    ← Root component — owns all state and page routing
└── main.jsx                   ← React DOM entry point
```

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the backend URL
```bash
cp .env.example .env
```
The default (`http://localhost:3001`) works if you're running the backend locally.

### 3. Start the dev server
```bash
npm run dev
```

App runs at http://localhost:5173

---

## Deploying to Vercel (recommended)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import your repo
3. Add environment variable:
   - `VITE_API_URL` → your deployed backend URL (e.g. `https://pocket-pm-backend.onrender.com`)
4. Deploy — Vercel auto-detects Vite and handles the build

---

## Adding Features Later

- **Auth / user profiles**: Add [Clerk](https://clerk.com) or [Supabase Auth](https://supabase.com) — wrap `App.jsx` with their provider
- **Progress history**: Store results in Supabase after each grading call in `api/claude.js`
- **Difficulty levels**: Add a difficulty selector to `Home.jsx` and pass it into the grading prompt in `constants/prompts.js`
