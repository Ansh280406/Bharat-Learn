import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// ── Setup ──────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));
app.use(cors());

// ── SQLite Database ────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'bharat_learn.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS scan_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    page_type   TEXT NOT NULL,
    title       TEXT NOT NULL,
    explanation TEXT,
    confidence  REAL,
    scanned_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ar_library (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL,
    page_type    TEXT NOT NULL,
    description  TEXT NOT NULL,
    subject      TEXT NOT NULL,
    class_level  TEXT NOT NULL,
    emoji        TEXT NOT NULL
  );
`);

// Seed NCERT library if empty
const libraryCount = db.prepare('SELECT COUNT(*) as cnt FROM ar_library').get();
if (libraryCount.cnt === 0) {
  const insertLib = db.prepare(`
    INSERT INTO ar_library (title, page_type, description, subject, class_level, emoji)
    VALUES (@title, @page_type, @description, @subject, @class_level, @emoji)
  `);
  const seedLibrary = db.transaction((items) => {
    for (const item of items) insertLib.run(item);
  });
  seedLibrary([
    { title: 'Human Heart', page_type: 'heart', description: 'Anatomy of the human heart — chambers, valves, and blood flow. NCERT Class 10 Biology.', subject: 'Biology', class_level: 'Class 10', emoji: '❤️' },
    { title: 'Water Cycle', page_type: 'water_cycle', description: 'Evaporation, condensation, precipitation and runoff cycle. NCERT Class 7 Geography.', subject: 'Geography', class_level: 'Class 7', emoji: '💧' },
    { title: 'Water Molecule (H₂O)', page_type: 'chemistry', description: '3D model of the water molecule — 2 hydrogen and 1 oxygen atom. NCERT Class 9 Chemistry.', subject: 'Chemistry', class_level: 'Class 9', emoji: '🧪' },
    { title: 'Methane (CH₄)', page_type: 'chemistry', description: 'Tetrahedral 3D structure of methane. NCERT Class 10 Carbon Compounds.', subject: 'Chemistry', class_level: 'Class 10', emoji: '⚗️' },
    { title: '3D Cube & Geometry', page_type: 'math_3d', description: 'Visualize a 3D cube, sphere and cone. NCERT Class 9 Surface Areas and Volumes.', subject: 'Mathematics', class_level: 'Class 9', emoji: '🧊' },
    { title: 'Laws of Motion', page_type: 'physics', description: "Newton's laws of motion — gravity, force and inertia. NCERT Class 9 Physics.", subject: 'Physics', class_level: 'Class 9', emoji: '⚡' },
    { title: 'Battle of Panipat (1526)', page_type: 'history', description: 'Animated map of the First Battle of Panipat — Babur vs Ibrahim Lodi. NCERT Class 11 History.', subject: 'History', class_level: 'Class 11', emoji: '⚔️' },
    { title: 'Algebra Equations', page_type: 'math', description: 'Solve linear equations step-by-step. NCERT Class 8 Algebra.', subject: 'Mathematics', class_level: 'Class 8', emoji: '📐' },
  ]);
  console.log('✅ NCERT AR Library seeded with 8 entries.');
}

// ── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    status: 'ok',
    time: new Date(),
    mode: (hasGemini || hasAnthropic) ? 'ai_active' : 'sandbox_mock',
    provider: hasGemini ? 'gemini' : hasAnthropic ? 'anthropic' : 'none',
    db: 'sqlite_connected'
  });
});

// ── MAIN: AI Vision Classify + Explain Endpoint ─────────────────
// Accepts a base64 image → Gemini → returns AR pageType, explanation, confidence
// Also auto-saves the result into scan_history
app.post('/api/classify', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'Image data is required (base64 encoded jpeg).' });

  // Strip data URI prefix
  let cleanBase64 = image;
  let mediaType = 'image/jpeg';
  if (image.startsWith('data:')) {
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) { mediaType = match[1]; cleanBase64 = match[2]; }
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // ── SANDBOX MODE ──────────────────────────────────────────────
  if (!geminiKey && !anthropicKey) {
    console.warn('⚠️  No AI API Key found. Running in SANDBOX/MOCK Mode.');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return res.json({
      status: 'success',
      mode: 'sandbox_fallback',
      pageType: 'heart',
      confidence: 0.95,
      extractedInfo: { title: 'Anatomy of the Human Heart', details: 'The human heart is a muscular organ that pumps blood throughout the body.' },
      aiExplanation: '⚠️ Sandbox Mode — No API key configured. Add GEMINI_API_KEY to server/.env to enable real AI.'
    });
  }

  // ── PROMPT: classify into ALL 8 page types + explain ──────────
  const prompt = `You are an educational AI assistant for "Bharat-Learn", an AR textbook companion app for Indian school students (Classes 6–12, NCERT curriculum).

Analyze the image carefully. It may be a textbook page, diagram, handwritten note, or real-world object.

Do TWO things:

1. CLASSIFY the content into exactly one of these categories:
   - "heart"       → Biology/Anatomy diagram of the human heart (ventricles, aorta, blood vessels)
   - "water_cycle" → Geography diagram showing evaporation, condensation, rain, rivers
   - "math"        → Math/Algebra content — equations, numbers, graphs, formulas
   - "math_3d"     → 3D Geometry — cubes, spheres, cones, torus, solid shapes, volumes
   - "physics"     → Physics content — laws of motion, optics, electricity, force, gravity, waves
   - "chemistry"   → Chemistry content — molecules, bonds, periodic table, reactions, compounds
   - "history"     → Historical maps, battles, ancient kingdoms, timelines, political maps
   - "unknown"     → Anything else — regular photos, random text, faces, unrelated content

2. EXPLAIN the educational concept shown in the image in simple, friendly language for a Class 6–10 Indian student. Be engaging — 3 to 5 sentences. If math is visible, mention the equation. If chemistry, name the compound.

Return ONLY valid JSON (no markdown, no code blocks, no extra text). Format:
{
  "status": "success",
  "pageType": "heart" | "water_cycle" | "math" | "math_3d" | "physics" | "chemistry" | "history" | "unknown",
  "confidence": 0.0 to 1.0,
  "extractedInfo": {
    "title": "Short descriptive title of the content",
    "details": "One sentence summary",
    "mathEquation": "The equation string if pageType is math, else null",
    "battleName": "Battle or map name if pageType is history, else null"
  },
  "aiExplanation": "Your friendly 3–5 sentence explanation for a student."
}`;

  try {
    let assistantMessage = '';

    // ── GEMINI 1.5 Flash ──────────────────────────────────────
    if (geminiKey) {
      console.log('🤖 Sending image to Gemini 1.5 Flash...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
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
            generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
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

    // ── ANTHROPIC CLAUDE (fallback) ───────────────────────────
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

    // ── Parse AI JSON ─────────────────────────────────────────
    let parsedResult;
    try {
      let jsonString = assistantMessage.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Failed to parse AI JSON. Raw output:', assistantMessage);
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.', rawText: assistantMessage });
    }

    // ── Auto-save to scan_history ─────────────────────────────
    try {
      db.prepare(`
        INSERT INTO scan_history (page_type, title, explanation, confidence)
        VALUES (?, ?, ?, ?)
      `).run(
        parsedResult.pageType || 'unknown',
        parsedResult.extractedInfo?.title || 'Scanned Page',
        parsedResult.aiExplanation || '',
        parsedResult.confidence || 0
      );
      console.log('💾 Saved scan to history DB');
    } catch (dbErr) {
      console.warn('⚠️ Could not save to history DB:', dbErr.message);
    }

    res.json(parsedResult);

  } catch (error) {
    console.error('❌ Classify route error:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// ── GET /api/ar/history — Return recent scans (last 20) ─────────
app.get('/api/ar/history', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const rows = db.prepare(`
      SELECT id, page_type, title, explanation, confidence, scanned_at
        FROM scan_history
      ORDER BY scanned_at DESC
      LIMIT ?
    `).all(limit);
    res.json({ status: 'ok', history: rows });
  } catch (err) {
    console.error('History fetch error:', err.message);
    res.status(500).json({ error: 'Could not fetch history.' });
  }
});

// ── DELETE /api/ar/history/:id — Delete a specific scan ─────────
app.delete('/api/ar/history/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM scan_history WHERE id = ?').run(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete entry.' });
  }
});

// ── GET /api/ar/library — NCERT famous AR models ─────────────────
app.get('/api/ar/library', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, title, page_type, description, subject, class_level, emoji
        FROM ar_library
      ORDER BY id ASC
    `).all();
    res.json({ status: 'ok', library: rows });
  } catch (err) {
    console.error('Library fetch error:', err.message);
    res.status(500).json({ error: 'Could not fetch library.' });
  }
});

// ── /api/classify-text ─────────────────────────────────────────
// PRIMARY scan endpoint: client sends OCR-extracted text → Gemini
// classifies it into a pageType and generates a fresh explanation.
// No image is needed; no library lookup is done.
app.post('/api/classify-text', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 5) {
    return res.status(400).json({ error: 'Text too short or missing. Make sure OCR extracted content.' });
  }

  const geminiKey    = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Sandbox fallback
  if (!geminiKey && !anthropicKey) {
    console.warn('⚠️  No API key — returning sandbox mock for classify-text.');
    return res.json({
      status: 'success',
      mode: 'sandbox_fallback',
      pageType: 'unknown',
      confidence: 0.5,
      extractedInfo: { title: 'Sandbox Mode', details: 'Add GEMINI_API_KEY to server/.env.' },
      aiExplanation: '⚠️ Sandbox Mode. Add GEMINI_API_KEY to enable real AI.'
    });
  }

  const prompt = `You are an educational AI assistant for "Bharat-Learn", an AR textbook companion for Indian students (Classes 6-12, NCERT curriculum).

A student scanned a textbook page with OCR. The extracted text is below.

1. CLASSIFY the content into exactly one category:
   - "heart"       → Biology/Anatomy — human heart, ventricles, aorta, circulatory system
   - "water_cycle" → Geography — evaporation, condensation, precipitation, rivers
   - "math"        → Mathematics — equations, algebra, arithmetic, numbers, formulas
   - "math_3d"     → 3D Geometry — cubes, spheres, cones, torus, solid shapes, volumes
   - "physics"     → Physics — laws of motion, optics, electricity, force, gravity, waves
   - "chemistry"   → Chemistry — molecules, atoms, bonds, periodic table, reactions
   - "history"     → History — battles, kingdoms, ancient maps, timelines, rulers
   - "unknown"     → Anything else that doesn't clearly fit the above

2. EXPLAIN the concept in simple, friendly language for a Class 6-10 Indian student (3-5 engaging sentences).

3. DESIGN A 2.5D HOLOGRAM: To make this concept visual, provide a short (max 15 words) image generation prompt that will create a highly detailed 3D render of the central object on a completely pure black background. Also provide 3 to 5 interactive labels for specific parts of the object.

Return ONLY valid JSON:
{
  "status": "success",
  "pageType": "<one of the 8 categories above>",
  "confidence": <0.0 to 1.0>,
  "extractedInfo": {
    "title": "<short descriptive title>",
    "details": "<one short sentence summary>",
    "hologramImagePrompt": "detailed anatomical illustration of <concept>, glowing neon style, black background, educational, vibrant",
    "hologramLabels": [
      {
        "id": "part1",
        "name": "<Name of Part (e.g. Small Intestine)>",
        "description": "<MAX 10 WORDS explanation of this specific part>"
      }
    ]
  },
  "aiExplanation": "<friendly MAX 2 SENTENCES explanation for a student>"
}

OCR-extracted text:
"""
${text.trim()}
"""`;

  try {
    let assistantMessage = '';

    if (geminiKey) {
      console.log('📝 [classify-text] Sending OCR text to Gemini 2.5 Flash...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ],
            generationConfig: { 
              temperature: 0.2, 
              maxOutputTokens: 8192,
              responseMimeType: "application/json"
            }
          })
        }
      );
      if (!response.ok) {
        const err = await response.text();
        console.error('Gemini error:', err);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      const data = await response.json();
      assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const finishReason = data.candidates?.[0]?.finishReason;
      if (finishReason !== 'STOP') {
        console.warn('⚠️ Gemini stopped early. Reason:', finishReason);
      }
      console.log('✅ Gemini responded:', assistantMessage.substring(0, 100) + '...');

    } else if (anthropicKey) {
      console.log('📝 [classify-text] Sending OCR text to Claude...');
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
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!response.ok) throw new Error(`Claude API error: ${response.statusText}`);
      const data = await response.json();
      assistantMessage = data.content?.[0]?.text || '';
    }

    // Parse JSON
    let parsedResult;
    try {
      let jsonString = assistantMessage.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }
      parsedResult = JSON.parse(jsonString);
    } catch {
      console.error('❌ Failed to parse AI JSON. Raw:', assistantMessage);
      return res.status(500).json({ error: 'AI returned unexpected format. Try again.', rawText: assistantMessage });
    }

    // Auto-save to scan_history
    try {
      db.prepare(`
        INSERT INTO scan_history (page_type, title, explanation, confidence)
        VALUES (?, ?, ?, ?)
      `).run(
        parsedResult.pageType || 'unknown',
        parsedResult.extractedInfo?.title || 'Scanned Page',
        parsedResult.aiExplanation || '',
        parsedResult.confidence || 0
      );
      console.log(`💾 Saved: ${parsedResult.pageType} — "${parsedResult.extractedInfo?.title}"`);
    } catch (dbErr) {
      console.warn('⚠️ DB save failed:', dbErr.message);
    }

    res.json(parsedResult);

  } catch (error) {
    console.error('❌ classify-text error:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// ── Serve frontend (production build) ────────────────────────────
app.use(express.static('../dist'));


app.listen(PORT, () => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const mode = hasGemini
    ? '🟢 Gemini 1.5 Flash — AI Active'
    : hasAnthropic
    ? '🟡 Claude AI Active'
    : '🔴 Sandbox Mode (add GEMINI_API_KEY to server/.env)';
  console.log(`\n🚀 Bharat-Learn API Server on port ${PORT}`);
  console.log(`   ${mode}`);
  console.log(`   SQLite DB: ${path.join(__dirname, 'bharat_learn.db')}\n`);
});

