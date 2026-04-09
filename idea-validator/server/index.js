const express = require("express");
const cors = require("cors");
const https = require("https");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-memory DB (replace with MongoDB in production) ─────────────────────
let ideas = [];
let counter = 1;

// ─── AI Prompt ──────────────────────────────────────────────────────────────
function buildPrompt(title, desc) {
  return `You are an expert startup consultant. Analyze the startup idea below and return ONLY a valid JSON object — no markdown, no explanation, no backticks.

JSON schema:
{
  "problem": "2-3 sentence problem statement",
  "customer": "Specific target customer persona with demographics",
  "market": "Market size and growth opportunity in 2-3 sentences",
  "competitors": [
    {"name": "CompetitorName", "differentiation": "One sentence on how this idea differs"},
    {"name": "CompetitorName", "differentiation": "One sentence on how this idea differs"},
    {"name": "CompetitorName", "differentiation": "One sentence on how this idea differs"}
  ],
  "tech_stack": ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"],
  "risk_level": "Medium",
  "profitability_score": 72,
  "justification": "2-3 sentence justification for the score and risk level"
}

Rules:
- risk_level must be exactly: Low, Medium, or High
- profitability_score must be an integer between 0 and 100
- competitors must have exactly 3 entries
- tech_stack must have 4 to 6 items
- Keep all answers concise and realistic

Idea: 
Title: ${title}
Description: ${desc}`;
}

// ─── Helper: Call Google Gemini via REST API ────────────────────────────────
function callGeminiAPI(prompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            const text = response.candidates[0].content.parts[0].text;
            resolve(text);
          } else {
            reject(new Error(`API Error: ${res.statusCode} ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", ideas: ideas.length, time: new Date().toISOString() });
});

// POST /ideas — submit + analyze
app.post("/ideas", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description || description.length < 10) {
    return res.status(400).json({ error: "title and description required (description min 10 chars)" });
  }

  try {
    console.log("Calling Gemini API via REST...");
    const raw = await callGeminiAPI(buildPrompt(title, description));
    
    const jsonStr = raw
      .trim()
      .replace(/```json|```/g, "")
      .trim();

    console.log("Parsed response:", jsonStr);
    const report = JSON.parse(jsonStr);
    
    const idea = {
      id: String(counter++),
      title,
      description,
      report,
      createdAt: new Date().toISOString(),
    };
    ideas.unshift(idea);
    res.status(201).json(idea);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message || "AI analysis failed" });
  }
});

// GET /ideas — list all
app.get("/ideas", (req, res) => {
  res.json(ideas);
});

// GET /ideas/:id — get one
app.get("/ideas/:id", (req, res) => {
  const idea = ideas.find((i) => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: "Idea not found" });
  res.json(idea);
});

// DELETE /ideas/:id
app.delete("/ideas/:id", (req, res) => {
  const idx = ideas.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Idea not found" });
  ideas.splice(idx, 1);
  res.json({ success: true, message: "Idea deleted" });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`   Using Google Gemini 2.0 Flash API`);
  console.log(`   POST   http://localhost:${PORT}/ideas`);
  console.log(`   GET    http://localhost:${PORT}/ideas`);
  console.log(`   GET    http://localhost:${PORT}/ideas/:id`);
  console.log(`   DELETE http://localhost:${PORT}/ideas/:id\n`);
});
