const fs = require('fs');

// ─── FIX 1: ARQuiz hook violation ────────────────────────────────
let quiz = fs.readFileSync('src/components/ar/ARQuiz.tsx', 'utf8');

// The confetti useEffect block to move up (from after conditional returns to before them)
// Find the block: "// Confetti Particle Engine\n  useEffect(...), [quizFinished, score]);\n"
const confettiStart = quiz.indexOf('  // Confetti Particle Engine\r\n  useEffect(');
const confettiEnd = quiz.indexOf('  }, [quizFinished, score]);\r\n') + '  }, [quizFinished, score]);\r\n'.length;

if (confettiStart === -1) {
  console.error('Could not find confetti useEffect');
  process.exit(1);
}

const confettiBlock = quiz.substring(confettiStart, confettiEnd);

// Remove from its current position
quiz = quiz.substring(0, confettiStart) + quiz.substring(confettiEnd);

// Insert it BEFORE the conditional loading return
// The conditional returns start at "  // Show loading spinner while fetching\n  if (isLoadingQuiz)"
const insertBefore = '  // Show loading spinner while fetching\n  if (isLoadingQuiz)';
const insertPos = quiz.indexOf(insertBefore);
if (insertPos === -1) {
  console.error('Could not find loading spinner return');
  process.exit(1);
}

quiz = quiz.substring(0, insertPos) + confettiBlock + '\n  ' + quiz.substring(insertPos);

// Also fix the currentQuestion reference - it's used inside the confetti block after the move,
// but currentQuestion is defined after the conditional returns.
// We need to make currentQuestion safe by computing it early.
// Replace "const currentQuestion = questions[currentIdx];" to before the confetti block.
// First remove existing one
quiz = quiz.replace(/\r?\n  const currentQuestion = questions\[currentIdx\];\r?\n/, '\n');

// Add it after the quizFinished state declaration
quiz = quiz.replace(
  'const [quizFinished, setQuizFinished] = useState(false);\n',
  'const [quizFinished, setQuizFinished] = useState(false);\n  const currentQuestion = questions[currentIdx] || questions[0] || null;\n'
);

fs.writeFileSync('src/components/ar/ARQuiz.tsx', quiz, 'utf8');
console.log('✅ Fixed ARQuiz hook violation - confetti useEffect moved before conditional returns');
