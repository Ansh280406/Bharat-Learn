const fs = require('fs');

let indexContent = fs.readFileSync('server/index.js', 'utf8');

const missingEndpoints = `
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
      aiExplanation: \`\${topic} is an important concept. Explore the AR diagram above by tapping each label to learn about its specific components and functions.\`,
      hologramLabels: [
        { id: 'main', name: topic, description: \`Core concept: \${topic}. This is the primary subject of this AR lesson.\` },
      ],
    });
  }

  const targetLang = language === 'hi' ? 'Hindi' : language === 'gu' ? 'Gujarati' : 'English';

  const prompt = \`You are an expert interactive educator.
Your task is to generate a beautiful, dynamic, and educational holographic visualization and explanation for the topic: "\${topic}".

Return ONLY valid JSON (no markdown, no code blocks):
{
  "aiExplanation": "A detailed, engaging 5-7 sentence explanation for an Indian school student. Use analogies, mention NCERT connections, and make it exciting. Explain WHY this concept matters. Must be in \${targetLang}.",
  "hologramLabels": [
    {
      "id": "unique_id",
      "name": "Part/Concept Name",
      "description": "2-3 detailed sentences explaining this specific part, its function, and its importance. Must be in \${targetLang}."
    }
  ],
  "hologramHtml": "<!DOCTYPE html><html><head><style>body { margin:0; overflow:hidden; background:transparent; display:flex; justify-content:center; align-items:center; height:100vh; color:white; font-family:sans-serif; } .shape { /* CSS animations here */ }</style></head><body><div class='shape'>Animated Interactive Representation of Concept</div></body></html>"
}

Provide exactly 4-6 hologramLabels covering the most important parts of this concept.
For hologramHtml, write a fully self-contained HTML file (with inline CSS and JS) that beautifully visually simulates or represents the concept (e.g. pulsing cells, orbiting electrons, moving waves, or an interactive CSS-art diagram). Use dark mode colors. It must be highly engaging and animated.\`;

  try {
    let assistantMessage = '';

    if (geminiKey) {
      const response = await fetch(
        \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiKey}\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048, responseMimeType: 'application/json' }
          })
        }
      );
      if (!response.ok) throw new Error(\`Gemini API error: \${response.statusText}\`);
      const data = await response.json();
      assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!response.ok) throw new Error(\`Claude API error: \${response.statusText}\`);
      const data = await response.json();
      assistantMessage = data.content?.[0]?.text || '';
    }

    let jsonString = assistantMessage.trim().replace(/^\\s*\`\`\`(json)?\\n?/, '').replace(/\\n?\`\`\`\\s*$/, '');
    const parsed = JSON.parse(jsonString);
    res.json({ status: 'success', source: 'ai', ...parsed });
  } catch (err) {
    console.error('generate-ar error:', err.message);
    res.status(500).json({ error: 'Failed to generate AR content' });
  }
});
\n`;

// Append before serving frontend logic
const serveRegex = /app\.use\(express\.static\(path\.join\(__dirname, '\.\.\/dist'\)\)\);/;
if (indexContent.includes('app.use(express.static(path.join(__dirname, \'../dist\')));')) {
    indexContent = indexContent.replace(serveRegex, missingEndpoints + '\napp.use(express.static(path.join(__dirname, \'../dist\')));');
} else {
    // Just append to the end of the file if not found
    indexContent += '\n' + missingEndpoints;
}

fs.writeFileSync('server/index.js', indexContent, 'utf8');
console.log('Successfully injected generate-ar back into server/index.js');
