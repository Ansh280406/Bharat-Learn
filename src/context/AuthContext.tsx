import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
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
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateXP: (amount: number) => void;
  useCredit: () => boolean;
  addCredits: (amount: number) => void;
  incrementLessons: () => void;
  incrementQuizzes: () => void;
}

const DEMO_USERS: Record<string, { password: string; profile: UserProfile }> = {
  demo: {
    password: '0',
    profile: {
      id: 'usr_demo_001',
      username: 'demo',
      displayName: 'Arjun Sharma',
      email: 'arjun@bharatlearn.in',
      avatar: 'AS',
      grade: 'Class X',
      school: 'Delhi Public School, Dwarka',
      joinedDate: 'Jan 2026',
      credits: 50,
      xp: 0,
      streak: 0,
      lessonsCompleted: 0,
      quizzesPassed: 0,
      scansUsed: 0,
      isTeacher: true,
    },
  },
};

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

  const login = (username: string, password: string) => {
    const entry = DEMO_USERS[username.toLowerCase().trim()];
    if (!entry) return { success: false, error: 'User not found.' };
    if (entry.password !== password.trim()) return { success: false, error: 'Incorrect password.' };
    setUser({ ...entry.profile });
    return { success: true };
  };

  const logout = () => setUser(null);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(u => u ? { ...u, ...updates } : u);
  };

  const updateXP = (amount: number) =>
    setUser(u => u ? { ...u, xp: u.xp + amount, streak: u.streak } : u);

  const useCredit = () => {
    if (!user || user.credits <= 0) return false;
    setUser(u => u ? { ...u, credits: u.credits - 1, scansUsed: u.scansUsed + 1 } : u);
    return true;
  };

  const addCredits = (amount: number) =>
    setUser(u => u ? { ...u, credits: u.credits + amount } : u);

  const incrementLessons = () =>
    setUser(u => u ? { ...u, lessonsCompleted: u.lessonsCompleted + 1, xp: u.xp + 15 } : u);

  const incrementQuizzes = () =>
    setUser(u => u ? { ...u, quizzesPassed: u.quizzesPassed + 1, xp: u.xp + 25 } : u);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, login, logout, updateProfile,
      updateXP, useCredit, addCredits, incrementLessons, incrementQuizzes,
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
