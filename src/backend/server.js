import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

if (!process.env.Gemini_API_Key) {
    console.error("❌ ERROR: Gemini_API_Key is missing from .env file!");
    process.exit(1); 
} else {
    console.log("✅ API Key detected. Starting server...");
}

const genAI = new GoogleGenerativeAI(process.env.Gemini_API_Key);

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/ExtractData', async (req, res) => {
    try {
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64) {
            return res.status(400).send({ error: 'No image data provided' });
        }

        // FIX 1: Use a valid model name. "gemini-2.5-flash" does not exist.
        // Use "gemini-1.5-flash" or "gemini-2.0-flash-exp"
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = "Convert this image to a structural list of item_name, item_price, and quantity. Return ONLY a valid JSON array of objects.";

        const imagePart = {
            inlineData: {
                data: imageBase64, 
                mimeType: mimeType || "image/jpeg"
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = await result.response.text();

        // FIX 2: Corrected Regex. Your old regex (/son|```/g) was accidentally 
        // removing the letters "son" from words like "JSON"!
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        
        res.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error("AI Error:", error);
        // Special handling for Quota errors (429)
        if (error.message.includes("429")) {
            return res.status(429).json({ error: "Quota exceeded. Please wait a minute and try again." });
        }
        res.status(500).json({ error: "Failed to process image", details: error.message });
    }
});

app.get('/list-models', async (req, res) => {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.Gemini_API_Key}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => console.log(`Server: http://localhost:${port}`));