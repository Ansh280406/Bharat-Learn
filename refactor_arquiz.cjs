const fs = require('fs');

let quizContent = fs.readFileSync('src/components/ar/ARQuiz.tsx', 'utf8');

const oldLogicStart = `  const questions = quizDatabase[pageType]?.[language] || [];
  const canvasRef = useRef<HTMLCanvasElement>(null);`;

const newLogicStart = `  const [dynamicQuestions, setDynamicQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const staticQuestions = quizDatabase[pageType]?.[language] || [];
  const questions = staticQuestions.length > 0 ? staticQuestions : dynamicQuestions;

  useEffect(() => {
    if (staticQuestions.length === 0 && dynamicQuestions.length === 0 && !isGeneratingQuiz) {
      setIsGeneratingQuiz(true);
      fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: pageType, language })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.quiz) {
          setDynamicQuestions(data.quiz);
        } else {
          setDynamicQuestions([{
            question: "Failed to generate quiz for " + pageType,
            options: ["Okay"],
            answerIndex: 0,
            explanation: "An error occurred."
          }]);
        }
      })
      .catch(err => {
        setDynamicQuestions([{
          question: "Failed to connect to AI for " + pageType,
          options: ["Okay"],
          answerIndex: 0,
          explanation: "An error occurred."
        }]);
      })
      .finally(() => setIsGeneratingQuiz(false));
    }
  }, [pageType, language, staticQuestions.length, dynamicQuestions.length]);
`;

quizContent = quizContent.replace(oldLogicStart, newLogicStart);

const oldReturnNull = `  // If no questions (unknown type), don't render anything
  if (questions.length === 0) return null;`;

const newReturnNull = `  // Show loading state while generating quiz
  if (isGeneratingQuiz) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--emerald-light)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>AI is writing your quiz...</h3>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Generating 5 dynamic questions for {pageType}</p>
      </div>
    );
  }

  // If no questions and not generating, don't render
  if (questions.length === 0) return null;`;

quizContent = quizContent.replace(oldReturnNull, newReturnNull);

fs.writeFileSync('src/components/ar/ARQuiz.tsx', quizContent, 'utf8');
console.log('Successfully updated ARQuiz to use /api/generate-quiz!');
