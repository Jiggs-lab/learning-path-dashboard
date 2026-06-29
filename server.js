import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs'; // Built-in Node tool to read/write local files

// Load environmental variable strings
dotenv.config();

// Verify API Key presence immediately on startup
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing from your .env file!");
} else {
    const maskedKey = process.env.GEMINI_API_KEY.substring(0, 4) + "••••••••••••••••";
    console.log(`✅ Environment loaded successfully. API Key detected: ${maskedKey}`);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve directory paths for standard ES Modules execution contexts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize the Google Gen AI SDK client mapping configuration
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware setups
app.use(cors()); // Allow requests from any frontend port (Live Server, etc.)
app.use(express.json());
app.use(express.static(__dirname)); // Serves your HTML files from root if accessed via 3000
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serves CSS/JS

// --- LOCAL SYSTEM DATABASE UTILITIES ---

// Helper function to read users from our JSON file safely
const readUsersFromFile = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        return [];
    }
};

// Helper function to write users to our JSON file safely
const writeUsersToFile = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
};

// --- ROUTES ---

/**
 * Root Gateway Route
 * Directs incoming public traffic cleanly straight onto the Landing Page view
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

/**
 * AI Path Generation Endpoint
 * Captures user input parameters and requests structured schemas from Gemini
 */
app.post('/generate-path', async (req, res) => {
    const { topic, level } = req.body;

    if (!topic || !level) {
        return res.status(400).json({ error: "Missing required parameters: topic and level." });
    }

    const systemPrompt = `Create a comprehensive, milestone-driven learning roadmap for learning "${topic}" at an "${level}" user skill tier level.
    You MUST return your response strictly as a single JSON object matching this exact structural schema:
    {
      "title": "Mastery Blueprint: Topic Name (Level)",
      "totalEstimatedHours": 20,
      "milestones": [
        {
          "id": 1,
          "topic": "Name of Phase or Concept",
          "description": "Clear explanation of what the user must learn or build here.",
          "estimatedHours": 5,
          "resources": [
            { "type": "Docs", "label": "Google Search Reference", "query": "https://www.google.com/search?q=topic+query" },
            { "type": "Video", "label": "YouTube Search Link", "query": "https://www.youtube.com/results?search_query=topic+tutorial" }
          ]
        }
      ]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const parsedRoadmap = JSON.parse(response.text);
        res.json(parsedRoadmap);

    } catch (error) {
        console.error("Gemini API Pipeline Error:", error);
        res.status(500).json({ error: "Failed to generate dynamic curriculum mapping schemas." });
    }
});

/**
 * Real User Registration Route
 */
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const users = readUsersFromFile();

    // Check if the email is already registered
    const userExists = users.find(u => u.email === email.toLowerCase());
    if (userExists) {
        return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    // Append new user data packet
    const newUser = { id: Date.now(), name, email: email.toLowerCase(), password };
    users.push(newUser);
    writeUsersToFile(users);

    res.json({ success: true, message: "Registration successful!" });
});

/**
 * Real User Login Route
 */
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const users = readUsersFromFile();
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);

    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Login successful
    res.json({ success: true, message: "Login successful!", userName: user.name });
});

/**
 * Temporary testing endpoint
 */
app.get('/test-ai', async (req, res) => {
    try {
        const testResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Respond with exactly the word "Connected" if you can read this message.',
        });

        res.json({
            status: "Success",
            message: "Your backend server is completely connected to the Gemini API pipeline!",
            aiResponse: testResponse.text.trim()
        });
    } catch (error) {
        console.error("Diagnostic Pipeline Failure:", error);
        res.status(500).json({
            status: "Failure",
            message: "Authentication or Connection error. Check server console for full error logs.",
            errorDetails: error.message
        });
    }
});

// Start listening for inbound connections (Kept cleanly at the bottom)
app.listen(PORT, () => {
    console.log(`🚀 PathAI System Server humming along at http://localhost:${PORT}`);
});