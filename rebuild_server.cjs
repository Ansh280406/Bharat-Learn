const fs = require('fs');

let indexContent = fs.readFileSync('server/index.js', 'utf8');

// 1. Add users table
const tableRegex = /CREATE TABLE IF NOT EXISTS ar_library \(/;
const usersTable = `CREATE TABLE IF NOT EXISTS users (
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

  CREATE TABLE IF NOT EXISTS ar_library (`
indexContent = indexContent.replace(tableRegex, usersTable);

// 2. Add auth endpoints
const healthRegex = /\/\/ ── Health Check ────────────────────────────────────────────────/;
const authEndpoints = `// ── Auth Endpoints ──────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { username, password, displayName, grade, school } = req.body;
  const today = new Date().toISOString().split('T')[0];
  try {
    const insert = db.prepare(\`
      INSERT INTO users (username, password, display_name, email, grade, school, joined_date, last_login_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`);
    const info = insert.run(username.toLowerCase().trim(), password, displayName, \`\${username}@bharatlearn.in\`, grade, school, 'Jun 2026', today);
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
    const update = db.prepare(\`
      UPDATE users 
      SET credits = coalesce(?, credits), xp = coalesce(?, xp),
          lessons_completed = coalesce(?, lessons_completed),
          quizzes_passed = coalesce(?, quizzes_passed),
          scans_used = coalesce(?, scans_used)
      WHERE username = ?
    \`);
    update.run(credits, xp, lessons_completed, quizzes_passed, scans_used, username);
    const updatedUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Update failed.' });
  }
});

// ── Health Check ────────────────────────────────────────────────`
indexContent = indexContent.replace(healthRegex, authEndpoints);

// 3. Fix /api/generate-ar prompt
const oldPrompt = `Return ONLY valid JSON (no markdown, no code blocks):
{
  "aiExplanation": "A detailed, engaging 5-7 sentence explanation for an Indian school student. Use analogies, mention NCERT connections, and make it exciting. Explain WHY this concept matters.",
  "hologramLabels": [
    {
      "id": "unique_id",
      "name": "Part/Concept Name",
      "description": "2-3 detailed sentences explaining this specific part, its function, and its importance."
    }
  ]
}

Provide exactly 4-6 hologramLabels covering the most important parts of this concept.\`;`;

const newPrompt = `Return ONLY valid JSON (no markdown, no code blocks):
{
  "aiExplanation": "A detailed, engaging 5-7 sentence explanation for an Indian school student. Use analogies, mention NCERT connections, and make it exciting. Explain WHY this concept matters.",
  "hologramLabels": [
    {
      "id": "unique_id",
      "name": "Part/Concept Name",
      "description": "2-3 detailed sentences explaining this specific part, its function, and its importance."
    }
  ],
  "hologramHtml": "<!DOCTYPE html><html><head><style>body { margin:0; overflow:hidden; background:transparent; display:flex; justify-content:center; align-items:center; height:100vh; color:white; font-family:sans-serif; } .shape { /* CSS animations here */ }</style></head><body><div class='shape'>Animated Interactive Representation of Concept</div></body></html>"
}

Provide exactly 4-6 hologramLabels covering the most important parts of this concept.
For hologramHtml, write a fully self-contained HTML file (with inline CSS and JS) that beautifully visually simulates or represents the concept (e.g. pulsing cells, orbiting electrons, moving waves, or an interactive CSS-art diagram). Use dark mode colors. It must be highly engaging and animated.\`;`;
indexContent = indexContent.replace(oldPrompt, newPrompt);

// 4. Add /api/generate-quiz
const serveRegex = /\/\/ ── Serve frontend \(production build\) ────────────────────────────/;
const generateQuizEndpoint = `
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

  const prompt = \`Generate exactly 5 multiple-choice questions about "\${topic}". 
The questions and explanations MUST be written in \${targetLang}.
Format the output strictly as a JSON array of objects, with no markdown wrappers or code blocks.
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 2,
    "explanation": "Brief explanation of why Option C is correct."
  }
]\`;

  try {
    let assistantMessage = '';
    if (geminiKey) {
      const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiKey}\`, {
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

    let jsonString = assistantMessage.trim().replace(/^\\s*\`\`\`(json)?\\n?/, '').replace(/\\n?\`\`\`\\s*$/, '');
    const parsed = JSON.parse(jsonString);
    res.json({ status: 'success', quiz: parsed });
  } catch (err) {
    console.error('generate-quiz error:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// ── Serve frontend (production build) ────────────────────────────`;
indexContent = indexContent.replace(serveRegex, generateQuizEndpoint);

fs.writeFileSync('server/index.js', indexContent, 'utf8');
console.log('Successfully rebuilt backend index.js!');
