const fs = require('fs');

let content = fs.readFileSync('src/components/ar/ARQuiz.tsx', 'utf8');

// The file has mixed line endings - first line LF, rest CRLF
// We'll use a regex approach to handle this
const oldBlockRegex = /export const ARQuiz: React\.FC<ARQuizProps> = \(\{ pageType, topic, language, onSpeak, onClose \}\) => \{\r?\n  const queryTopic = topic \|\| pageType;\r?\n  const \{ incrementQuizzes \} = useAuth\(\);\r?\n  const questions = quizDatabase\[pageType\]\?\.\[language\] \|\| \[\];\r?\n  const canvasRef = useRef<HTMLCanvasElement>\(null\);\r?\n  const \[currentIdx, setCurrentIdx\] = useState\(0\);\r?\n  const \[selectedOpt, setSelectedOpt\] = useState<number \| null>\(null\);\r?\n  const \[isAnswered, setIsAnswered\] = useState\(false\);\r?\n  const \[score, setScore\] = useState\(0\);\r?\n  const \[quizFinished, setQuizFinished\] = useState\(false\);\r?\n\r?\n  \/\/ If no questions \(unknown type\), don't render anything\r?\n  if \(questions\.length === 0\) return null;/;

const newBlock = `export const ARQuiz: React.FC<ARQuizProps> = ({ pageType, topic, language, onSpeak, onClose }) => {
  const queryTopic = topic || pageType;
  const { incrementQuizzes } = useAuth();

  // Dynamic questions from API, with static fallback
  const staticQuestions = quizDatabase[pageType]?.[language] || [];
  const [questions, setQuestions] = useState<QuizQuestion[]>(staticQuestions);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Fetch 5 dynamic questions from backend AI
  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoadingQuiz(true);
      try {
        const res = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: queryTopic, language })
        });
        if (!res.ok) throw new Error('Quiz API failed');
        const data = await res.json();
        if (data.quiz && Array.isArray(data.quiz) && data.quiz.length > 0) {
          setQuestions(data.quiz);
        } else if (staticQuestions.length > 0) {
          setQuestions(staticQuestions);
        }
      } catch {
        if (staticQuestions.length > 0) setQuestions(staticQuestions);
      } finally {
        setIsLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, [queryTopic, language]);

  // Show loading spinner while fetching
  if (isLoadingQuiz) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', gap: 16
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(139,92,246,0.3)',
          borderTopColor: '#8b5cf6',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#8b5cf6', fontSize: 13, fontWeight: 600, margin: 0 }}>
          Generating quiz for "{queryTopic}"...
        </p>
      </div>
    );
  }

  // If no questions at all, show a message
  if (questions.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
      Quiz not available for this topic right now.
    </div>
  );`;

if (!oldBlockRegex.test(content)) {
  console.error('REGEX NOT MATCHED. Writing debug info...');
  const idx = content.indexOf('export const ARQuiz');
  const snippet = JSON.stringify(content.substring(idx, idx + 600));
  console.log('Snippet:', snippet);
  process.exit(1);
}

content = content.replace(oldBlockRegex, newBlock);
fs.writeFileSync('src/components/ar/ARQuiz.tsx', content, 'utf8');
console.log('SUCCESS: ARQuiz now fetches 5 dynamic quiz questions from /api/generate-quiz!');
