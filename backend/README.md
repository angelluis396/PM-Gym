# PM Gym — Backend

Express.js backend that proxies requests to the Anthropic Claude API.
Keeps your API key secret and off the frontend.

## Endpoints

| Method | Path                   | Description                        |
|--------|------------------------|------------------------------------|
| GET    | /health                | Health check                       |
| POST   | /api/generate-vision   | Returns a random AI product vision |
| POST   | /api/grade             | Grades a PM planning document      |

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your environment
```bash
cp .env.example .env
```
Then open `.env` and paste in your Anthropic API key from https://console.anthropic.com

### 3. Start the server
```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Server runs on http://localhost:3001 by default.

---

## Deploying to Render (free tier)

1. Push this folder to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your repo
4. Set the following:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Add environment variables in the Render dashboard:
   - `ANTHROPIC_API_KEY` → your key
   - `FRONTEND_URL` → your deployed frontend URL
6. Deploy — Render gives you a public URL like `https://pm-gym-backend.onrender.com`

Then update your frontend's API base URL to point to that Render URL.

---

## Deploying to Railway (alternative)

1. Push to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add the same environment variables
4. Railway auto-detects Node and deploys

---

## Request / Response Reference

### POST /api/generate-vision
**Request body:** none required

**Response:**
```json
{ "vision": "For busy parents who struggle to find healthy recipes..." }
```

---

### POST /api/grade
**Request body:**
```json
{
  "vision": "The product vision text...",
  "form": {
    "targetGroup": "...",
    "goal": "...",
    "needs": "...",
    "value": "...",
    "keyFeatures": "...",
    "roadmap": "...",
    "releasePlan": "...",
    "themesEpicsStories": "..."
  }
}
```

**Response:**
```json
{
  "score": 82,
  "letterGrade": "B",
  "overallFeedback": "...",
  "sections": {
    "targetGroup": { "score": 90, "feedback": "..." },
    ...
  },
  "strengths": ["..."],
  "improvements": ["..."]
}
```
