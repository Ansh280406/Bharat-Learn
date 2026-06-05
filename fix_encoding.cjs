const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ar', 'CustomARScene.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  'eâ »': 'e⁻',
  'pâ º': 'p⁺',
  'nâ °': 'n⁰',
  'Hâ‚ƒ': 'H₃',
  'CHâ‚ƒ': 'CH₃',
  'Hâ‚‚': 'H₂',
  'Oâ‚‚': 'O₂',
  'COâ‚‚': 'CO₂',
  'Î´âˆ’': 'δ⁻',
  'Î´+': 'δ⁺',
  'Nuâ »': 'Nu⁻',
  'Agâ º': 'Ag⁺',
  'â†’': '→',
  'â†‘': '↑',
  'â€”': '—',
  'âœ¨': '✨',
  'Î»': 'λ',
  'Î¼': 'μ',
  'Î¸â‚ ': 'θ₁',
  'Î¸â‚‚': 'θ₂',
  'nâ‚ ': 'n₁',
  'nâ‚‚': 'n₂',
  'rÂ²': 'r²',
  'â‰ˆ': '≈',
  'âœ“': '✓',
  'NaBHâ‚„': 'NaBH₄',
  'âˆ’': '-',
  'â‚€': '₀',
  'Î¼â‚€': 'μ₀',
  'âˆ†': '∆',
  'â€¢': '•',
  'â€¦': '…',
  'â€œ': '“',
  'â€ ': '”',
  'â€˜': '‘',
  'â€™': '’',
  'â• ': '═',
  'â”€': '─'
};

let count = 0;
for (const [bad, good] of Object.entries(replacements)) {
  if (content.includes(bad)) {
    content = content.split(bad).join(good);
    count++;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced ' + count + ' different corrupted patterns in CustomARScene.tsx');
