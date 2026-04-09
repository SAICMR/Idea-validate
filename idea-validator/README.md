# IdeaValidator — AI-Powered Startup Idea Validator

Submit a startup idea, get an AI-generated validation report in seconds.

---

## Quick Start (Frontend only — no backend needed)

1. Open `client/index.html` in your browser
2. In the file, find this line: `const ANTHROPIC_API_KEY = '';`
3. Paste your Anthropic API key between the quotes
4. Save and refresh — done!

---

## Full Setup (Frontend + Backend)

### Requirements
- Node.js 18 or higher → download from https://nodejs.org
- Anthropic API key → get from https://console.anthropic.com

### Step 1 — Install backend dependencies
```bash
cd server
npm install
```

### Step 2 — Add your API key
```bash
cp .env.example .env
```
Open `.env` and replace `sk-ant-your-key-here` with your real key.

### Step 3 — Start the backend server
```bash
node index.js
```
You will see:
```
✅ Server running on http://localhost:5000
```

### Step 4 — Connect frontend to backend
Open `client/index.html` and find:
```js
const API_BASE = '';
```
Change it to:
```js
const API_BASE = 'http://localhost:5000';
```

### Step 5 — Open the frontend
Double-click `client/index.html` to open it in your browser.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /health | Server health check |
| POST | /ideas | Submit idea + trigger AI analysis |
| GET | /ideas | Get all stored ideas |
| GET | /ideas/:id | Get one idea with full report |
| DELETE | /ideas/:id | Delete an idea |

### Example — Submit an idea
```bash
curl -X POST http://localhost:5000/ideas \
  -H "Content-Type: application/json" \
  -d '{"title":"AI fitness coach","description":"An app that uses AI to generate personalized workout plans based on your body type, goals, and available equipment."}'
```

---

## Project Structure

```
idea-validator/
├── client/
│   └── index.html        ← Full frontend app (single file)
├── server/
│   ├── index.js          ← Express backend
│   ├── package.json
│   ├── .env.example
│   └── .env              ← Your API key (create this)
└── README.md
```

---

## AI Prompt Used

```
You are an expert startup consultant. Analyze the startup idea and return ONLY valid JSON with:
- problem: 2-3 sentence problem statement
- customer: target customer persona
- market: market size and opportunity
- competitors: exactly 3 with one-line differentiation each
- tech_stack: 4-6 MVP technologies
- risk_level: Low / Medium / High
- profitability_score: integer 0-100
- justification: 2-3 sentence explanation
```

---

## Common Errors

| Error | Fix |
|-------|-----|
| `Cannot find module` | Run `npm install` inside the `server/` folder |
| `Invalid API key` | Check your `.env` file — no spaces around the key |
| `EADDRINUSE port 5000` | Change `PORT=5001` in `.env` |
| CORS error in browser | Make sure the backend server is running |
