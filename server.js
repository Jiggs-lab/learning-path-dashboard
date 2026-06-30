import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, 'users.json');
//const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const ai = new GoogleGenAI({});

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Database File Utils
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
};
const writeUsers = (data) => fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));

// HTML Page Routing Configuration Matrix
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(__dirname, 'signup.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

// API Routes
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    const users = readUsers();
    if (users.find(u => u.email === email.toLowerCase())) return res.json({ success: false, message: 'User exists' });
    users.push({ name, email: email.toLowerCase(), password });
    writeUsers(users);
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = readUsers().find(u => u.email === email.toLowerCase() && u.password === password);
    if (!user) return res.json({ success: false, message: 'Invalid credentials' });
    res.json({ success: true, userName: user.name });
});

app.post('/generate-path', async (req, res) => {
    const { topic, level } = req.body;

    if (!topic || !level) {
        return res.status(400).json({ error: "Missing required parameters: topic and level." });
    }

    // NEW ENHANCED ADAPTIVE SCHEMA PROMPT
    const systemPrompt = `You are an expert interactive curriculum architect. Create a structured, milestone-driven learning roadmap for learning "${topic}" tailored precisely for a user at the "${level}" skill tier.

    CRITICAL INSTRUCTIONS BASED ON LEVEL:
    - If level is "Beginner": Start with fundamental primitives (e.g., variables, constants, basic tags, attributes). Focus on foundational scaffolding.
    - If level is "Advanced": STRICTLY SKIP all basic primitives. Do NOT include basic variables, intro tags, or installation setups. Jump straight into advanced architectural paradigms (e.g., semantic layouts, interactive/collapsible layers, media responsiveness, optimization matrices, data visualization components).
    - If level is "Intermediate": Provide a brief transition bridge directly into design patterns, APIs, and intermediate implementations.

    You MUST return your response strictly as a single JSON object matching this exact structural configuration layout schema:
    {
      "title": "Adaptive Masterclass: ${topic} (${level})",
      "modules": [
        {
          "moduleName": "Name of Section/Core Phase (e.g., Frontend Architecture)",
          "topics": [
            {
              "id": 101,
              "label": "Name of specific concept to learn (e.g., Semantic & Structural Elements)",
              "description": "Short, clear outcome objective of what they will master here.",
              "estimatedHours": 3,
              "referenceQuery": "https://www.google.com/search?q=${topic}+advanced+concepts"
            }
          ]
        }
      ]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt,
            config: { responseMimeType: "application/json" }
        });

        res.json(JSON.parse(response.text));
    } catch (err) {
        console.error("Gemini API Pipeline Error:", err);
        res.status(500).json({ error: 'Failed to construct curriculum models.' });
    }
});

app.listen(PORT, () => console.log(`🚀 PathAI Server running at http://localhost:${PORT}`));