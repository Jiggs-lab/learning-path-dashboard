import { GoogleGenAI } from '@google/genai';
import express from 'express';
const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/generate-path', async (req, res) => {
    const { topic, level } = req.body;

    const prompt = `Create a detailed, structured learning roadmap for learning "${topic}" at an "${level}" level. 
    Return the response strictly as a JSON object with the following structure:
    {
      "title": "Mastering ${topic} (${level})",
      "totalEstimatedHours": 24, 
      "milestones": [
        { 
          "id": 1, 
          "topic": "Core Fundamentals", 
          "description": "Understand the baseline concepts and terminology.",
          "estimatedHours": 3,
          "resources": [
            { "type": "Documentation", "label": "Official Docs", "query": "https://www.google.com/search?q=${topic}+official+documentation" },
            { "type": "Video", "label": "Recommended Search", "query": "${topic} tutorial for beginners youtube" }
          ]
        }
      ]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" } 
        });

        res.json(JSON.parse(response.text));
    } catch (error) {
        res.status(500).json({ error: "Failed to generate comprehensive roadmap" });
    }
});