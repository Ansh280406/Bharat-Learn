const fs = require('fs');

// 1. Update CameraFeed.tsx
let cf = fs.readFileSync('src/components/scanner/CameraFeed.tsx', 'utf8');

if (!cf.includes("import { useAuth }")) {
  cf = cf.replace(
    /import \{ RecentScans \} from '\.\/RecentScans';/,
    "import { useAuth } from '../../context/AuthContext';\nimport { RecentScans } from './RecentScans';"
  );
}

cf = cf.replace(
  /const fileInputRef = useRef<HTMLInputElement>\(null\);/g,
  "const fileInputRef = useRef<HTMLInputElement>(null);\n  const { user, useCredit } = useAuth();"
);

// Add check inside handleScan
cf = cf.replace(
  /const handleScan = async \(\) => \{\n    if \(!videoRef.current \|\| !canvasRef.current\) return;\n    setIsScanning\(true\);/g,
  `const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (user && user.credits < 10) {
      alert("Not enough credits! Please refill your credits from your profile.");
      return;
    }
    useCredit(10);
    setIsScanning(true);`
);

// Add check inside processImageFile
cf = cf.replace(
  /const processImageFile = \(file: File\) => \{\n    if \(!canvasRef.current \|\| isScanning\) return;\n\n    setIsScanning\(true\);/g,
  `const processImageFile = (file: File) => {
    if (!canvasRef.current || isScanning) return;
    if (user && user.credits < 10) {
      alert("Not enough credits! Please refill your credits from your profile.");
      return;
    }
    useCredit(10);

    setIsScanning(true);`
);

// Add check inside simulateMockScan
cf = cf.replace(
  /const simulateMockScan = \(mockKey: PageType\) => \{\n    setIsScanning\(true\);/g,
  `const simulateMockScan = (mockKey: PageType) => {
    if (user && user.credits < 10) {
      alert("Not enough credits! Please refill your credits from your profile.");
      return;
    }
    useCredit(10);
    setIsScanning(true);`
);

fs.writeFileSync('src/components/scanner/CameraFeed.tsx', cf, 'utf8');

// 2. Update DynamicAIOverlay.tsx
let ai = fs.readFileSync('src/components/overlays/DynamicAIOverlay.tsx', 'utf8');

if (!ai.includes("import { useAuth }")) {
  ai = ai.replace(
    /import \{ CustomARScene, hasCustomARScene, CUSTOM_AR_SCENES \} from '\.\.\/ar\/CustomARScene';/,
    "import { CustomARScene, hasCustomARScene, CUSTOM_AR_SCENES } from '../ar/CustomARScene';\nimport { useAuth } from '../../context/AuthContext';"
  );
}

ai = ai.replace(
  /const \[isGenerating, setIsGenerating\] = useState\(false\);/g,
  "const [isGenerating, setIsGenerating] = useState(false);\n  const { user, useCredit } = useAuth();"
);

ai = ai.replace(
  /setIsGenerating\(true\);\n    fetch\('\/api\/generate-ar', \{/g,
  `if (user && user.credits < 2) {
      alert("Not enough credits for AI generation.");
      return;
    }
    useCredit(2);
    
    setIsGenerating(true);
    fetch('/api/generate-ar', {`
);

fs.writeFileSync('src/components/overlays/DynamicAIOverlay.tsx', ai, 'utf8');

console.log('Refactored CameraFeed and DynamicAIOverlay');
