const fs = require('fs');

const authContextContent = `import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string | number;
  username: string;
  displayName: string;
  email: string;
  avatar: string; // initials
  grade: string;
  school: string;
  joinedDate: string;
  credits: number;
  xp: number;
  streak: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  scansUsed: number;
  isTeacher: boolean;
  lastLoginDate: string;
  bookmarks: Array<{ pageType: string; title: string }>;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, _password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, displayName: string, grade: string, school: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateXP: (amount: number) => void;
  useCredit: (cost?: number) => boolean;
  addCredits: (amount: number) => void;
  incrementLessons: () => void;
  incrementQuizzes: () => void;
  resetProgress: () => void;
  toggleBookmark: (pageType: string, title: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bharat_learn_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bharat_learn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bharat_learn_user');
    }
  }, [user]);

  // Sync update to backend
  const syncBackend = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    try {
      await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: user.username, 
          credits: updated.credits, 
          xp: updated.xp, 
          lessons_completed: updated.lessonsCompleted, 
          quizzes_passed: updated.quizzesPassed, 
          scans_used: updated.scansUsed 
        })
      });
    } catch (e) {
      console.error('Failed to sync user data', e);
    }
  };

  const formatDBUser = (dbUser: any): UserProfile => ({
    id: dbUser.id,
    username: dbUser.username,
    displayName: dbUser.display_name,
    email: dbUser.email || \`\${dbUser.username}@bharatlearn.in\`,
    avatar: dbUser.display_name.charAt(0).toUpperCase(),
    grade: dbUser.grade || 'Class X',
    school: dbUser.school || '',
    joinedDate: dbUser.joined_date || 'Jun 2026',
    credits: dbUser.credits,
    xp: dbUser.xp,
    streak: dbUser.streak,
    lessonsCompleted: dbUser.lessons_completed,
    quizzesPassed: dbUser.quizzes_passed,
    scansUsed: dbUser.scans_used,
    isTeacher: false,
    lastLoginDate: dbUser.last_login_date,
    bookmarks: user?.bookmarks || []
  });

  const login = async (username: string, _password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: _password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(formatDBUser(data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: 'Network error.' };
    }
  };

  const register = async (username: string, _password: string, displayName: string, grade: string, school: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: _password, displayName, grade, school })
      });
      const data = await res.json();
      if (data.success) {
        setUser(formatDBUser(data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: 'Network error.' };
    }
  };

  const logout = () => setUser(null);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(u => u ? { ...u, ...updates } : u);
  };

  const updateXP = (amount: number) => {
    if (!user) return;
    const updates = { xp: user.xp + amount };
    setUser(u => u ? { ...u, ...updates } : u);
    syncBackend(updates);
  };

  const useCredit = (cost: number = 25) => {
    if (!user || user.credits < cost) return false;
    const updates = { credits: user.credits - cost, scansUsed: user.scansUsed + 1 };
    setUser(u => u ? { ...u, ...updates } : u);
    syncBackend(updates);
    return true;
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    const updates = { credits: user.credits + amount };
    setUser(u => u ? { ...u, ...updates } : u);
    syncBackend(updates);
  };

  const incrementLessons = () => {
    if (!user) return;
    const updates = { lessonsCompleted: user.lessonsCompleted + 1, xp: user.xp + 15 };
    setUser(u => u ? { ...u, ...updates } : u);
    syncBackend(updates);
  };

  const incrementQuizzes = () => {
    if (!user) return;
    const updates = { quizzesPassed: user.quizzesPassed + 1, xp: user.xp + 25 };
    setUser(u => u ? { ...u, ...updates } : u);
    syncBackend(updates);
  };

  const resetProgress = () => {
    if (!user) return;
    const updates = { xp: 0, streak: 0, lessonsCompleted: 0, quizzesPassed: 0, scansUsed: 0, credits: 50 };
    setUser(u => u ? { ...u, ...updates, bookmarks: [] } : u);
    syncBackend(updates);
  };

  const toggleBookmark = (pageType: string, title: string) => {
    setUser(u => {
      if (!u) return u;
      const exists = u.bookmarks?.some(b => b.pageType === pageType);
      const bookmarks = exists 
        ? u.bookmarks.filter(b => b.pageType !== pageType)
        : [...(u.bookmarks || []), { pageType, title }];
      return { ...u, bookmarks };
    });
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, login, register, logout, updateProfile,
      updateXP, useCredit, addCredits, incrementLessons, incrementQuizzes,
      resetProgress, toggleBookmark
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
`;

fs.writeFileSync('src/context/AuthContext.tsx', authContextContent, 'utf8');

let loginContent = fs.readFileSync('src/components/auth/Login.tsx', 'utf8');
loginContent = loginContent.replace(/const handleSubmit = \(e: React\.FormEvent\) => \{/g, 'const handleSubmit = async (e: React.FormEvent) => {');
loginContent = loginContent.replace(/setTimeout\(\(\) => \{/g, '');
loginContent = loginContent.replace(/result = register/g, 'result = await register');
loginContent = loginContent.replace(/result = login/g, 'result = await login');
loginContent = loginContent.replace(/      if \(!result\.success\) \{\n        setError\(result\.error \|\| 'Authentication failed'\);\n        setIsLoading\(false\);\n      \}\n    \}, 800\);/g, "      if (!result.success) {\n        setError(result.error || 'Authentication failed');\n      }\n      setIsLoading(false);");
fs.writeFileSync('src/components/auth/Login.tsx', loginContent, 'utf8');

console.log('Refactored AuthContext.tsx and Login.tsx');
