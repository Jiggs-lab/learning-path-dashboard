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
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    const systemPrompt = `Create a comprehensive roadmap for learning "${topic}" at an "${level}" level. Return strictly a JSON object: {"title": "Mastery Blueprint", "milestones": [{"id": 1, "topic": "Concept", "description": "Learn it", "estimatedHours": 5}]}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt,
            config: { responseMimeType: "application/json" }
        });
        res.json(JSON.parse(response.text));
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.listen(PORT, () => console.log(`🚀 PathAI Server running at http://localhost:${PORT}`));