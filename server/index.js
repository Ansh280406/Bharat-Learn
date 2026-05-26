import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from server/ directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Increase payload limit since we're receiving base64 image strings
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    status: 'ok',
    time: new Date(),
    mode: (hasGemini || hasAnthropic) ? 'ai_active' : 'sandbox_mock',
    provider: hasGemini ? 'gemini' : hasAnthropic ? 'anthropic' : 'none'
  });
});

// ─────────────────────────────────────────────────────────────
// MAIN: AI Vision Classify + Explain Endpoint
// Accepts a base64 image, sends to Gemini (or Claude as fallback),
// returns BOTH a classification (pageType) AND a real AI explanation.
// ─────────────────────────────────────────────────────────────
app.post('/api/classify', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image data is required (base64 encoded jpeg).' });
  }

  // Strip data URI prefix if present
  let cleanBase64 = image;
  let mediaType = 'image/jpeg';
  if (image.startsWith('data:')) {
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mediaType = match[1];
      cleanBase64 = match[2];
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // ── SANDBOX MODE (no API key configured) ──────────────────
  if (!geminiKey && !anthropicKey) {
    console.warn('⚠️  No AI API Key found. Running in SANDBOX/MOCK Mode.');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return res.json({
      status: 'success',
      mode: 'sandbox_fallback',
      pageType: 'heart',
      confidence: 0.95,
      extractedInfo: {
        title: 'Anatomy of the Human Heart',
        details: 'The human heart is a muscular organ that pumps blood throughout the body.',
      },
      aiExplanation: '⚠️ Sandbox Mode — No API key configured.\n\nTo get real AI explanations, add your GEMINI_API_KEY to the server/.env file and restart the server.\n\nGet a free key at: https://aistudio.google.com/app/apikey'
    });
  }

  // ── UNIFIED PROMPT: classify + explain in one shot ────────
  const prompt = `You are an educational AI assistant for "Bharat-Learn", an AR textbook companion app for Indian school students.

Analyze the image carefully. It may be a textbook page, diagram, handwritten note, or a real-world object.

Do TWO things:

1. CLASSIFY the content into exactly one of these categories:
   - "heart"       → Biology/Anatomy diagram of the human heart (ventricles, aorta, etc.)
   - "water_cycle" → Geography diagram showing evaporation, condensation, rain, rivers
   - "math"        → Math/Algebra content with equations or numbers
   - "history"     → Historical map, battle diagram, or ancient political map
   - "unknown"     → Anything else (regular photo, random text, faces, etc.)

2. EXPLAIN the educational concept shown in the image in simple, friendly language for a Class 6–10 Indian student. Be thorough but engaging — 3 to 5 sentences. If the image is a real object or scene (not a textbook diagram), still explain what it is and its educational relevance. If math is visible, mention the equation and how to solve it.

Return ONLY valid JSON (no markdown, no code blocks). Format:
{
  "status": "success",
  "pageType": "heart" | "water_cycle" | "math" | "history" | "unknown",
  "confidence": 0.0 to 1.0,
  "extractedInfo": {
    "title": "Short descriptive title of the content",
    "details": "One sentence summary",
    "mathEquation": "The equation string if pageType is math, else null",
    "battleName": "Battle or map name if pageType is history, else null"
  },
  "aiExplanation": "Your friendly 3–5 sentence explanation of the concept for a student."
}`;

  try {
    let assistantMessage = '';

    // ── GEMINI (Free) ────────────────────────────────────────
    if (geminiKey) {
      console.log('🤖 Sending image to Gemini 1.5 Flash...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mediaType, data: cleanBase64 } }
              ]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('Gemini API error:', errText);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('✅ Gemini responded:', assistantMessage.substring(0, 120) + '...');

    // ── ANTHROPIC CLAUDE (Paid fallback) ─────────────────────
    } else if (anthropicKey) {
      console.log('🤖 Sending image to Claude...');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: cleanBase64 } },
              { type: 'text', text: prompt }
            ]
          }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Claude API error:', errText);
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      assistantMessage = data.content?.[0]?.text || '';
      console.log('✅ Claude responded:', assistantMessage.substring(0, 120) + '...');
    }

    // ── Parse JSON from AI response ───────────────────────────
    let parsedResult;
    try {
      let jsonString = assistantMessage.trim();
      // Strip markdown code fences if AI wrapped in them
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Failed to parse AI JSON. Raw output:', assistantMessage);
      return res.status(500).json({
        error: 'AI returned an unexpected format. Please try again.',
        rawText: assistantMessage
      });
    }

    res.json(parsedResult);

  } catch (error) {
    console.error('❌ Classify route error:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// Serve frontend in production
app.use(express.static('../dist'));

app.listen(PORT, () => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const mode = hasGemini ? '🟢 Gemini AI Active' : hasAnthropic ? '🟡 Claude AI Active' : '🔴 Sandbox Mock Mode (add GEMINI_API_KEY to enable real AI)';
  console.log(`🚀 Bharat-Learn API Server running on port ${PORT}`);
  console.log(`   Mode: ${mode}`);
});
