const fs = require('fs');

let overlay = fs.readFileSync('src/components/overlays/DynamicAIOverlay.tsx', 'utf8');

const oldState = `  // Auto-generated content from /api/generate-ar
  const [generatedExplanation, setGeneratedExplanation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);`;

const newState = `  // Auto-generated content from /api/generate-ar
  const [generatedExplanation, setGeneratedExplanation] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedLabels, setGeneratedLabels] = useState<HologramLabel[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);`;

overlay = overlay.replace(oldState, newState);

const oldFetch = `      .then(data => {
        if (data.aiExplanation) setGeneratedExplanation(data.aiExplanation);
      })`;

const newFetch = `      .then(data => {
        if (data.aiExplanation) setGeneratedExplanation(data.aiExplanation);
        if (data.hologramHtml) setGeneratedHtml(data.hologramHtml);
        if (data.hologramLabels) setGeneratedLabels(data.hologramLabels);
      })`;

overlay = overlay.replace(oldFetch, newFetch);

// Fix the labels usage: use generatedLabels if propLabels is missing
const oldLabelsUsage = `const currentExplanation = activeLabel ? activeLabel.description : baseExplanation;`;
const newLabelsUsage = `const currentLabels = propLabels || generatedLabels;
  const currentHtml = hologramHtml || generatedHtml;
  const currentExplanation = activeLabel ? activeLabel.description : baseExplanation;`;

overlay = overlay.replace(oldLabelsUsage, newLabelsUsage);

overlay = overlay.replace(/propLabels/g, 'currentLabels');
overlay = overlay.replace(
  /<iframe\n\s*srcDoc=\{hologramHtml\}/,
  '<iframe\n                    srcDoc={currentHtml}'
);
overlay = overlay.replace(
  /hologramHtml \? \(/,
  'currentHtml ? ('
);

fs.writeFileSync('src/components/overlays/DynamicAIOverlay.tsx', overlay, 'utf8');
console.log('Successfully updated DynamicAIOverlay!');
