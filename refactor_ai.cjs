const fs = require('fs');

let indexContent = fs.readFileSync('server/index.js', 'utf8');

// 1. Update the prompt in /api/generate-ar
const oldPrompt = `"hologramLabels": [
    {
      "id": "unique_id",
      "name": "Part/Concept Name",
      "description": "2-3 detailed sentences explaining this specific part, its function, and its importance."
    }
  ]
}

Provide exactly 4-6 hologramLabels covering the most important parts of this concept.\`;`;

const newPrompt = `"hologramLabels": [
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

// 2. Add /api/generate-quiz endpoint
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
      quiz: [
        {
          question: 'Mock Question: What is ' + topic + '?',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          answerIndex: 0,
          explanation: 'This is a mock quiz because no AI key is configured.'
        }
      ]
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
`;

indexContent = indexContent.replace(
  '// ── Serve frontend (production build) ────────────────────────────',
  generateQuizEndpoint + '\n// ── Serve frontend (production build) ────────────────────────────'
);

fs.writeFileSync('server/index.js', indexContent, 'utf8');
console.log('Successfully added hologramHtml prompt and /api/generate-quiz endpoint!');
