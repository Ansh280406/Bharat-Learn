const fs = require('fs');

// 1. Update ARQuiz.tsx to accept topic prop
let quiz = fs.readFileSync('src/components/ar/ARQuiz.tsx', 'utf8');

quiz = quiz.replace(
  /interface ARQuizProps \{/,
  'interface ARQuizProps {\n  topic?: string;'
);

quiz = quiz.replace(
  /export const ARQuiz: React.FC<ARQuizProps> = \(\{ pageType, language, onSpeak, onClose \}\) => \{/,
  'export const ARQuiz: React.FC<ARQuizProps> = ({ pageType, topic, language, onSpeak, onClose }) => {\n  const queryTopic = topic || pageType;'
);

quiz = quiz.replace(
  /body: JSON.stringify\(\{ topic: pageType, language \}\)/,
  'body: JSON.stringify({ topic: queryTopic, language })'
);

quiz = quiz.replace(
  /Generating 5 dynamic questions for \{pageType\}/g,
  'Generating 5 dynamic questions for {queryTopic}'
);
quiz = quiz.replace(
  /Failed to generate quiz for "\ \+\ pageType/g,
  'Failed to generate quiz for " + queryTopic'
);
quiz = quiz.replace(
  /Failed to connect to AI for "\ \+\ pageType/g,
  'Failed to connect to AI for " + queryTopic'
);
quiz = quiz.replace(
  /\[pageType, language/g,
  '[queryTopic, pageType, language'
);

fs.writeFileSync('src/components/ar/ARQuiz.tsx', quiz, 'utf8');

// 2. Update ARContainer.tsx to pass topic prop
let container = fs.readFileSync('src/components/ar/ARContainer.tsx', 'utf8');

container = container.replace(
  /<ARQuiz\n              pageType=\{pageType\} language=\{language\}\n              onSpeak=\{onSpeak\}\n              onClose=\{[^}]+\}\n            \/>/,
  `<ARQuiz
              pageType={pageType} topic={displayTitle} language={language}
              onSpeak={onSpeak}
              onClose={() => setShowQuiz(false)}
            />`
);

fs.writeFileSync('src/components/ar/ARContainer.tsx', container, 'utf8');
console.log('Successfully updated ARQuiz and ARContainer for queryTopic!');
