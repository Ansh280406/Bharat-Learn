require('dotenv').config({ path: 'server/.env' });

async function test() {
  const prompt = `You are an expert creative coder and educational designer building an AR simulator for Indian school students.

Generate an educational holographic visualization for: "The Human Stomach"

You must return EXACTLY two parts:
1. A JSON block containing the explanation and labels.
2. A raw HTML block containing the visualization.

Use this EXACT format for your response:

\`\`\`json
{
  "aiExplanation": "5-7 sentence engaging explanation for a Class 6-12 Indian student. Use analogies, mention NCERT, explain WHY it matters.",
  "hologramLabels": [
    {"id": "part1", "name": "Part Name", "description": "2-3 sentences about this part's function."}
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
3. Use SVG elements to draw a RECOGNIZABLE diagram — not just circles or blobs
4. Label key parts directly in the SVG with <text> elements
5. Add smooth CSS animations: @keyframes for pulsing, rotating, flowing, glowing effects
6. Make it look like a real educational textbook diagram but animated and glowing
7. Use bright neon colors: cyan (#00ffff), lime (#00ff88), orange (#ff8800), magenta (#ff00ff) for glow effects on dark background
8. Include interactive hover effects where elements glow brighter on mouseover
9. The diagram must fill the full viewport (100vw x 100vh)
10. Add a small title at top in glowing text`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
  const candidate = data.candidates?.[0];
  console.log("Finish Reason:", candidate?.finishReason);
  console.log("Response text length:", candidate?.content?.parts?.[0]?.text?.length);
  console.log("Last 200 chars:\n", candidate?.content?.parts?.[0]?.text?.slice(-200));
}

test().catch(console.error);
