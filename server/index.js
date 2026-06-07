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

  CREATE TABLE IF NOT EXISTS users (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    username         TEXT UNIQUE NOT NULL,
    password         TEXT NOT NULL,
    display_name     TEXT NOT NULL,
    email            TEXT,
    grade            TEXT,
    school           TEXT,
    joined_date      TEXT,
    credits          INTEGER DEFAULT 50,
    xp               INTEGER DEFAULT 0,
    streak           INTEGER DEFAULT 1,
    lessons_completed INTEGER DEFAULT 0,
    quizzes_passed   INTEGER DEFAULT 0,
    scans_used       INTEGER DEFAULT 0,
    last_login_date  TEXT
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

// ── Auth Endpoints ──────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { username, password, displayName, grade, school } = req.body;
  const today = new Date().toISOString().split('T')[0];
  try {
    const insert = db.prepare(`
      INSERT INTO users (username, password, display_name, email, grade, school, joined_date, last_login_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = insert.run(username.toLowerCase().trim(), password, displayName, `${username}@bharatlearn.in`, grade, school, 'Jun 2026', today);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, user });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: 'Username taken.' });
    } else {
      res.status(500).json({ success: false, error: 'Registration failed.' });
    }
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username.toLowerCase().trim(), password);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials.' });

  let { streak, credits, last_login_date } = user;
  if (last_login_date !== today) {
    const lastDate = new Date(last_login_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
    credits = 50;
    db.prepare('UPDATE users SET streak = ?, credits = ?, last_login_date = ? WHERE id = ?').run(streak, credits, today, user.id);
    user.streak = streak;
    user.credits = credits;
    user.last_login_date = today;
  }
  res.json({ success: true, user });
});

app.post('/api/auth/update', (req, res) => {
  const { username, credits, xp, lessons_completed, quizzes_passed, scans_used } = req.body;
  try {
    const update = db.prepare(`
      UPDATE users 
      SET credits = coalesce(?, credits), xp = coalesce(?, xp),
          lessons_completed = coalesce(?, lessons_completed),
          quizzes_passed = coalesce(?, quizzes_passed),
          scans_used = coalesce(?, scans_used)
      WHERE username = ?
    `);
    update.run(credits, xp, lessons_completed, quizzes_passed, scans_used, username);
    const updatedUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Update failed.' });
  }
});

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

// ── Local Keyword Classifier (Offline/Sandbox Fallback) ───────
const OFFLINE_MOCK_DATA = {
  heart: {
    extractedInfo: {
      title: "Human Heart Anatomy",
      details: "Beating 3D heart biology overlay.",
      isLibrary: true,
      wikipediaQuery: "Heart"
    },
    aiExplanation: "This textbook page covers Human Heart Anatomy. The human heart is a muscular organ that pumps blood through the circulatory system. In Class 10 NCERT Biology, you learn about its key components: the aorta, the left and right ventricles, and the valves that prevent backflow. You can tap the interactive labels on the model to learn about their specific functions."
  },
  water_cycle: {
    extractedInfo: {
      title: "Earth's Water Cycle",
      details: "Interactive evaporation & rain overlay.",
      isLibrary: true,
      wikipediaQuery: "Water cycle"
    },
    aiExplanation: "This page describes the Water Cycle (Hydrological Cycle). In Class 7 Geography, we study how water constantly moves between the Earth's surface and the atmosphere. The key stages are Evaporation (water turning to vapor due to solar heat), Condensation (vapor cooling to form clouds), and Precipitation (rain or snow falling back to earth). Tap each label to see how water cycles through our ecosystem."
  },
  math: {
    extractedInfo: {
      title: "Algebra Equations",
      details: "Tactile equation balancer.",
      mathEquation: "2x + 4 = 10",
      isLibrary: true
    },
    aiExplanation: "This page covers linear equations and algebra. In NCERT Class 8 Mathematics, we solve equations by maintaining balance on both sides of the equal sign. An equation like 2x + 4 = 10 represents a balanced scale where we isolate the variable x to find its value. Tap the interactive balancer to see the steps."
  },
  math_3d: {
    extractedInfo: {
      title: "3D Geometry Explorer",
      details: "Visualize planes and vectors in 3D space.",
      isLibrary: true,
      wikipediaQuery: "Platonic solid"
    },
    aiExplanation: "This page covers 3D Geometry and Solid Figures. In NCERT Class 9 Surface Areas and Volumes, we study 3D shapes like cubes, spheres, and cones. Exploring these shapes in three dimensions helps us calculate their volumes and surface areas. Use the controls to rotate the 3D solid model and identify its vertices, edges, and faces."
  },
  history: {
    extractedInfo: {
      title: "Battle of Panipat (1526)",
      details: "Mughal vs. Lodi historical map.",
      battleName: "Battle of Panipat (1526)",
      isLibrary: true
    },
    aiExplanation: "This page describes the historic First Battle of Panipat (1526). In Class 11 History, we study how Babur's smaller army defeated Ibrahim Lodi's massive force using advanced tactics like the Tulughma (encirclement) and chained carts (Araba) to shield his cannons. This victory marked the beginning of the Mughal Empire in India. Use the timeline slider to view each phase of the battle."
  },
  physics: {
    extractedInfo: {
      title: "Optics & Light Lab",
      details: "Interactive light refraction lab.",
      isLibrary: true,
      wikipediaQuery: "Prism"
    },
    aiExplanation: "This page explains light refraction and dispersion through a glass prism. In Class 10 Physics, we study how white light splits into its constituent colors (VIBGYOR) when passing through a denser medium. This happens because different wavelengths of light bend at different angles due to different refractive indices in glass. Tap the labels to see how refraction works."
  },
  chemistry: {
    extractedInfo: {
      title: "Organic Chemistry",
      details: "3D molecular bond visualization.",
      isLibrary: true,
      wikipediaQuery: "Methane"
    },
    aiExplanation: "This page covers Organic Compounds and Molecular Bonding. In NCERT Class 9 & 10 Chemistry, we learn about molecules like Water (H₂O) and Methane (CH₄). Atoms share electrons to form covalent bonds, creating specific geometric angles like the 104.5° bent structure of water or the 109.5° tetrahedral shape of methane. Explore the 3D structures in the viewer."
  },
  unknown: {
    extractedInfo: {
      title: "AI Educational Companion",
      details: "Interactive 3D shape overview.",
      isLibrary: true
    },
    aiExplanation: "⚠️ Sandbox Mode. Add GEMINI_API_KEY to server/.env to enable real AI classification of custom topics."
  }
};

function classifyTextLocally(text) {
  const cleanText = (text || '').toLowerCase();
  
  const keywords = {
    heart: ['heart', 'ventricle', 'aorta', 'atrium', 'circulatory', 'blood', 'cardiac', 'valve'],
    water_cycle: ['water cycle', 'evaporation', 'condensation', 'precipitation', 'runoff', 'transpiration', 'aquifer', 'rain', 'cloud'],
    math_3d: ['geometry', 'cube', 'sphere', 'cone', 'cylinder', 'torus', 'surface area', 'volume', 'dimension', '3d shape'],
    math: ['equation', 'algebra', 'solve', 'x +', 'x -', 'variable', 'linear equation', 'quadratic', 'mathematics'],
    physics: ['motion', 'force', 'gravity', 'optics', 'prism', 'refraction', 'newton', 'wavelength', 'spectrum', 'light ray', 'dispersion'],
    chemistry: ['molecule', 'atom', 'bond', 'chemical', 'reaction', 'methane', 'co2', 'h2o', 'compound', 'covalent', 'organic chemistry', 'propanal', 'aldehyde'],
    history: ['battle', 'panipat', 'babur', 'lodi', 'mughal', 'empire', 'french revolution', 'bastille', 'louis xvi', 'history', 'dynasty', 'battlefield']
  };

  let bestCategory = 'unknown';
  let maxScore = 0;

  for (const [category, words] of Object.entries(keywords)) {
    let score = 0;
    for (const word of words) {
      if (cleanText.includes(word)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return { pageType: bestCategory, score: maxScore };
}

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

  // Sandbox fallback using local keyword classifier
  if (!geminiKey && !anthropicKey) {
    console.warn('⚠️  No API key — running local classifier fallback for classify-text.');
    const classification = classifyTextLocally(text);
    const pageType = classification.pageType;
    const mockData = OFFLINE_MOCK_DATA[pageType] || OFFLINE_MOCK_DATA.unknown;
    
    // Auto-save offline classification to DB
    try {
      db.prepare(`
        INSERT INTO scan_history (page_type, title, explanation, confidence)
        VALUES (?, ?, ?, ?)
      `).run(
        pageType,
        mockData.extractedInfo.title,
        mockData.aiExplanation,
        pageType === 'unknown' ? 0.5 : 0.95
      );
      console.log(`💾 Saved offline scan: ${pageType} — "${mockData.extractedInfo.title}"`);
    } catch (dbErr) {
      console.warn('⚠️ DB save failed:', dbErr.message);
    }

    return res.json({
      status: 'success',
      mode: 'sandbox_fallback',
      pageType: pageType,
      confidence: pageType === 'unknown' ? 0.5 : 0.95,
      extractedInfo: mockData.extractedInfo,
      aiExplanation: mockData.aiExplanation
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

2. EXPLAIN the concept in simple, friendly language for a Class 6-10 Indian student. Provide a detailed, engaging explanation (5-7 sentences). Make sure they thoroughly understand the concept.

3. DESIGN A 2.5D HOLOGRAM: To make this concept visual, provide a short (max 15 words) image generation prompt that will create a highly detailed 3D render of the central object on a completely pure black background. Also provide 3 to 5 interactive labels for specific parts of the object.

Return ONLY valid JSON:
{
  "status": "success",
  "pageType": "<one of the 8 categories above>",
  "confidence": <0.0 to 1.0>,
  "extractedInfo": {
    "title": "<short descriptive title>",
    "details": "<one short sentence summary>",
    "mathEquation": "<the equation string if pageType is math, else null>",
    "battleName": "<the battle or map name if pageType is history, else null>",
    "hologramImagePrompt": "detailed anatomical illustration of <concept>, glowing neon style, black background, educational, vibrant",
    "hologramLabels": [
      {
        "id": "part1",
        "name": "<Name of Part (e.g. Small Intestine)>",
        "description": "<Provide a detailed 2-3 sentence explanation of this specific part and its function>"
      }
    ]
  },
  "aiExplanation": "<friendly detailed 5-7 sentence explanation for a student>"
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
    console.warn('❌ classify-text API error, falling back to local classification:', error.message);
    
    // Fail-safe local classifier fallback
    const classification = classifyTextLocally(text);
    const pageType = classification.pageType;
    const mockData = OFFLINE_MOCK_DATA[pageType] || OFFLINE_MOCK_DATA.unknown;
    
    // Auto-save to scan_history
    try {
      db.prepare(`
        INSERT INTO scan_history (page_type, title, explanation, confidence)
        VALUES (?, ?, ?, ?)
      `).run(
        pageType,
        mockData.extractedInfo.title,
        mockData.aiExplanation,
        pageType === 'unknown' ? 0.5 : 0.95
      );
      console.log(`💾 Saved offline scan (fail-safe): ${pageType} — "${mockData.extractedInfo.title}"`);
    } catch (dbErr) {
      console.warn('⚠️ DB save failed:', dbErr.message);
    }

    res.json({
      status: 'success',
      mode: 'offline_api_error_fallback',
      pageType: pageType,
      confidence: pageType === 'unknown' ? 0.5 : 0.95,
      extractedInfo: mockData.extractedInfo,
      aiExplanation: mockData.aiExplanation
    });
  }
});

// ── /api/locate-labels ─────────────────────────────────────────
// AI Spatial Labeling: Uses Gemini Vision to find X,Y coordinates of parts in an image
app.post('/api/locate-labels', async (req, res) => {
  const { imageUrl, labels } = req.body;
  if (!imageUrl || !labels || !Array.isArray(labels)) {
    return res.status(400).json({ error: 'imageUrl and labels array are required' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    // Sandbox mode: return random coordinates
    const coords = {};
    labels.forEach(l => {
      coords[l.id] = { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 };
    });
    return res.json({ status: 'success', coordinates: coords });
  }

  try {
    console.log('🤖 [AI Spatial Labeling] Fetching image from Pollinations...');
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error('Failed to fetch generated image');
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';

    const labelNamesList = labels.map(l => `ID: ${l.id} - Name: ${l.name}`).join('\\n');

    const prompt = `You are a spatial labeling assistant. I have provided an image.
Find the following parts in the image:
${labelNamesList}

For each part, determine its rough center point as a percentage of the image width (x) and height (y) from the top-left corner.
0,0 is top-left. 100,100 is bottom-right.
If a part is not clearly visible, guess its logical approximate position on the central object.

Return ONLY valid JSON in this exact format:
{
  "coordinates": {
    "part1_id": { "x": 50, "y": 25 },
    "part2_id": { "x": 75, "y": 60 }
  }
}`;

    console.log('🤖 [AI Spatial Labeling] Asking Gemini Vision for coordinates...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Image } }
            ]
          }],
          generationConfig: { 
            temperature: 0.1, 
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let parsedResult;
    let jsonString = assistantMessage.trim();
    if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.replace(/^\`\`\`(json)?\n?/, '').replace(/\n?\`\`\`$/, '');
    }
    parsedResult = JSON.parse(jsonString);

    console.log('✅ [AI Spatial Labeling] Coordinates received successfully!');
    res.json({ status: 'success', coordinates: parsedResult.coordinates || {} });

  } catch (error) {
    console.error('❌ locate-labels error:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});


// ── /api/generate-quiz ─────────────────────────────────────────
app.post('/api/generate-quiz', async (req, res) => {
  const { topic, language } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  
  const langNames = { en: 'English', hi: 'Hindi', gu: 'Gujarati' };
  const targetLang = langNames[language || 'en'] || 'English';

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return res.json({
      status: 'success',
      quiz: [{ question: 'Mock Question: What is ' + topic + '?', options: ['1','2','3','4'], answerIndex: 0, explanation: 'Mock quiz.' }]
    });
  }

  const prompt = `Generate exactly 5 multiple-choice questions about "${topic}". 
The questions and explanations MUST be written in ${targetLang}.
Format the output strictly as a JSON array of objects, with no markdown wrappers or code blocks.
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 2,
    "explanation": "Brief explanation of why Option C is correct."
  }
]`;

  try {
    let assistantMessage = '';
    if (geminiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048, responseMimeType: 'application/json' }
        })
      });
      const data = await response.json();
      assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 2048, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await response.json();
      assistantMessage = data.content?.[0]?.text || '';
    }

    let jsonString = assistantMessage.trim().replace(/^\s*```(json)?\n?/, '').replace(/\n?```\s*$/, '');
    const parsed = JSON.parse(jsonString);
    res.json({ status: 'success', quiz: parsed });
  } catch (err) {
    console.error('generate-quiz error:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// ── /api/generate-ar ───────────────────────────────────────────
app.post('/api/generate-ar', async (req, res) => {
  const { topic, description, language } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return res.json({
      status: 'success',
      source: 'fallback',
      aiExplanation: `${topic} is an important concept. Explore the interactive AR diagram by tapping each label to learn about its specific components and functions.`,
      hologramLabels: [
        { id: 'main', name: topic, description: `Core concept: ${topic}. This is the primary subject of this AR lesson.` },
      ],
      hologramHtml: null,
    });
  }

  const targetLang = language === 'hi' ? 'Hindi' : language === 'gu' ? 'Gujarati' : 'English';

  const prompt = `You are an expert creative coder and educational designer building an AR simulator for Indian school students.

Generate an educational holographic visualization for: "${topic}"

You must return EXACTLY two parts:
1. A JSON block containing the explanation and labels.
2. A raw HTML block containing the visualization.

Use this EXACT format for your response:

\`\`\`json
{
  "aiExplanation": "5-7 sentence engaging explanation in ${targetLang} for a Class 6-12 Indian student. Use analogies, mention NCERT, explain WHY it matters.",
  "hologramLabels": [
    {"id": "part1", "name": "Part Name in ${targetLang}", "description": "2-3 sentences about this part's function in ${targetLang}."}
  ]
}
\`\`\`
===HTML===
<!DOCTYPE html>
<html>
<!-- YOUR FULL HTML HERE -->
</html>

CRITICAL RULES FOR THE HTML:
1. Write a COMPLETE self-contained HTML file with ALL CSS and JS inline
2. The background MUST be #000000 (pure black) or transparent
3. Use SVG elements to draw a RECOGNIZABLE diagram of "${topic}" — not just circles or blobs
4. Label key parts directly in the SVG with <text> elements
5. Add smooth CSS animations: @keyframes for pulsing, rotating, flowing, glowing effects
6. Make it look like a real educational textbook diagram but animated and glowing
7. Use bright neon colors: cyan (#00ffff), lime (#00ff88), orange (#ff8800), magenta (#ff00ff) for glow effects on dark background
8. Include interactive hover effects where elements glow brighter on mouseover
9. The diagram must fill the full viewport (100vw x 100vh)
10. Add a small title at top in glowing text

EXAMPLE STRUCTURE for a heart diagram (adapt for "${topic}"):
- Draw the main shape with SVG paths
- Add labeled arrows pointing to key parts
- Animate blood flow with moving dots along paths
- Make chambers pulse with scale animations

The HTML MUST be visually impressive, scientifically accurate, and clearly show what "${topic}" looks like.`;

  try {
    let assistantMessage = '';

    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (data?.error?.code === 503) {
           throw new Error("Model is overloaded (503). Please try again in a moment.");
        }
        throw new Error(`Gemini API error: ${data?.error?.message || response.statusText}`);
      }
      assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`✅ [generate-ar] Got response for topic: ${topic} | finishReason: ${data.candidates?.[0]?.finishReason}`);
    } else if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Claude API error: ${data?.error?.message || response.statusText}`);
      assistantMessage = data.content?.[0]?.text || '';
    }

    if (!assistantMessage || assistantMessage.trim() === '') {
       throw new Error("AI returned an empty response. It might be overloaded.");
    }

    let parsed = { aiExplanation: '', hologramLabels: [], hologramHtml: '' };
    try {
      let jsonPart = assistantMessage;
      let htmlPart = '';
      
      if (assistantMessage.includes('===HTML===')) {
        const parts = assistantMessage.split('===HTML===');
        jsonPart = parts[0];
        htmlPart = parts[1]?.trim() || '';
      }

      let jsonString = jsonPart.trim().replace(/^\s*```(json)?\n?/, '').replace(/\n?```\s*$/, '');
      const parsedJson = JSON.parse(jsonString);
      
      parsed.aiExplanation = parsedJson.aiExplanation || '';
      parsed.hologramLabels = parsedJson.hologramLabels || [];
      parsed.hologramHtml = htmlPart || parsedJson.hologramHtml || '';
    } catch (parseError) {
      console.error(`[generate-ar] Parsing Error:`, parseError.message);
      console.log(`[generate-ar] Raw AI output was:\n`, assistantMessage);
      
      // Fallback if the LLM failed to produce valid format (usually due to mid-stream truncation)
      parsed = {
        aiExplanation: `Here is a simulation of ${topic}. (Note: The AI was interrupted due to high network load and couldn't finish generating the interactive features. Please click Re-scan to try again.)`,
        hologramLabels: [
          { id: '1', name: "Generation Interrupted", description: "The AI was overloaded and stopped generating midway." }
        ],
        hologramHtml: `<div style="color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#020509; font-family:sans-serif; text-align:center; padding: 20px;">
          <h2 style="color: #ef4444; margin-bottom: 10px;">⚠️ Server Overloaded</h2>
          <p style="color: rgba(255,255,255,0.7); max-width: 300px;">The AI model is currently experiencing high demand and cut off the generation midway.</p>
          <p style="color: #8b5cf6; font-weight: bold; margin-top: 20px;">Please tap "Re-scan" in the top right to try again.</p>
        </div>`
      };
    }

    return res.json({
      status: 'success',
      source: geminiKey ? 'gemini' : 'claude',
      aiExplanation: parsed.aiExplanation,
      hologramLabels: parsed.hologramLabels || [],
      hologramHtml: parsed.hologramHtml,
    });
  } catch (err) {
    console.error('generate-ar error:', err.message);
    res.status(500).json({ error: 'Failed to generate AR content', details: err.message });
  }
});

// ── Serve frontend (production build) ────────────────────────────
app.use(express.static('../dist'));

app.listen(PORT, () => {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const mode = hasGemini
    ? '🟢 Gemini 2.5 Flash — AI Active'
    : hasAnthropic
    ? '🟡 Claude AI Active'
    : '🔴 Sandbox Mode (add GEMINI_API_KEY to server/.env)';
  console.log(`\n🚀 Bharat-Learn API Server on port ${PORT}`);
  console.log(`   ${mode}`);
  console.log(`   SQLite DB: ${path.join(__dirname, 'bharat_learn.db')}\n`);
});

