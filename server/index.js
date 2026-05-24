import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Increase payload limit since we're receiving base64 image strings
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Claude Vision API Proxy Endpoint
app.post('/api/classify', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image data is required (base64 encoded jpeg).' });
  }

  // Extract base64 clean data (strip data:image/jpeg;base64, prefix if present)
  let cleanBase64 = image;
  let mediaType = 'image/jpeg';
  if (image.startsWith('data:')) {
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mediaType = match[1];
      cleanBase64 = match[2];
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ ANTHROPIC_API_KEY not found in environment. Running in SANDBOX/MOCK Mode.');
    // Simulated classification for testing if API key is not configured
    // We will do a random or simulated detection after a short delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Simple heuristic: if user sends a mock string or to make debugging easy,
    // we can return a default simulated response. The frontend can also simulate this.
    return res.json({
      status: 'success',
      mode: 'sandbox_fallback',
      pageType: 'heart', // Default mock, frontend can override or display choices
      confidence: 0.95,
      extractedInfo: {
        title: 'Anatomy of the Human Heart',
        parts: ['aorta', 'left_ventricle', 'right_ventricle', 'pulmonary_valve']
      }
    });
  }

  try {
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: cleanBase64
                }
              },
              {
                type: 'text',
                text: `You are the core vision classifier for "Bharat-Learn", a web-based educational AR textbook companion.
Analyze the provided image of a textbook page or diagram. 
Categorize it strictly into one of these Page Types:
1. "heart" (Anatomy/Biology diagram of the human heart showing ventricles, aorta, etc.)
2. "water_cycle" (Geography/Water cycle diagram showing clouds, rain, river, evaporation)
3. "math" (A mathematics textbook section displaying equations, e.g. "2x + 4 = 10" or similar math problem)
4. "history" (A historical map showing troop movements, arrows, routes, or ancient battle details)
5. "unknown" (Any other textbook page, random text, background, or noise that doesn't fit the categories)

Return a JSON object only. Do NOT format with markdown code blocks (e.g. do not write \`\`\`json ... \`\`\`). Return exactly this JSON structure:
{
  "status": "success",
  "pageType": "heart" | "water_cycle" | "math" | "history" | "unknown",
  "confidence": 0.0 to 1.0,
  "extractedInfo": {
    "title": "A short descriptive title for the scanned section",
    "details": "A 1-sentence summary of the subject matter",
    "mathEquation": "If pageType is math, include the detected algebraic equation string (e.g. '2x + 4 = 10'), else null",
    "battleName": "If pageType is history, include the detected battle or map name (e.g. 'Battle of Panipat' or 'Mughal Empire Map'), else null"
  }
}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', errorText);
      return res.status(response.status).json({
        error: `Claude API request failed: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text || '';
    
    // Parse JSON safely from Assistant text (in case there's extra text, or markdown codeblocks)
    let parsedResult;
    try {
      let jsonString = assistantMessage.trim();
      // Strip markdown code block formatting if present
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
      }
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Claude JSON response. Raw output:', assistantMessage);
      return res.status(500).json({
        error: 'Invalid JSON response from Claude Vision classifier.',
        rawText: assistantMessage
      });
    }

    res.json(parsedResult);

  } catch (error) {
    console.error('Express Classify Route Error:', error);
    res.status(500).json({ error: 'Internal server error while classifying the page.' });
  }
});

// Serve frontend assets in production
// (Will configure this to serve the dist directory if compiled)
app.use(express.static('../dist'));

app.listen(PORT, () => {
  console.log(`🚀 Bharat-Learn API Server running on port ${PORT}`);
});
