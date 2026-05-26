import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, BookOpen, Target, Zap, TrendingUp, Star, Award, CheckCircle } from 'lucide-react';

const MILESTONES = [
  { xp: 0,    label: 'Newcomer',    icon: '🌱', color: '#94a3b8' },
  { xp: 100,  label: 'Explorer',   icon: '🔭', color: '#10b981' },
  { xp: 300,  label: 'Scholar',    icon: '📚', color: '#0ea5e9' },
  { xp: 600,  label: 'Achiever',   icon: '🏆', color: '#f59e0b' },
  { xp: 1000, label: 'Champion',   icon: '⭐', color: '#6366f1' },
  { xp: 2000, label: 'Legend',     icon: '🚀', color: '#f43f5e' },
];

const ACTIVITY_LOG = [
  { label: 'Scanned Human Heart diagram',       xp: 25,  time: '2h ago',   type: 'scan'   },
  { label: 'Completed Biology Quiz',             xp: 50,  time: '3h ago',   type: 'quiz'   },
  { label: 'Launched Water Cycle AR',            xp: 25,  time: 'Yesterday', type: 'lesson' },
  { label: 'Scanned Algebra Equations',          xp: 25,  time: 'Yesterday', type: 'scan'   },
  { label: 'Completed History Quiz',             xp: 50,  time: '2 days ago', type: 'quiz'  },
];

const SUBJECTS = [
  { name: 'Biology',   lessons: 3, icon: '🫀', color: '#f43f5e', progress: 60 },
  { name: 'Physics',   lessons: 2, icon: '🌈', color: '#8b5cf6', progress: 40 },
  { name: 'Chemistry', lessons: 1, icon: '🧪', color: '#14b8a6', progress: 20 },
  { name: 'Maths',     lessons: 2, icon: '📐', color: '#10b981', progress: 45 },
  { name: 'History',   lessons: 1, icon: '⚔️',  color: '#f59e0b', progress: 33 },
  { name: 'Geography', lessons: 1, icon: '💧', color: '#0ea5e9', progress: 25 },
];

export const ProgressTracker: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const currentMilestone = MILESTONES.filter(m => user.xp >= m.xp).pop()!;
  const nextMilestone = MILESTONES.find(m => m.xp > user.xp);
  const progressToNext = nextMilestone
    ? Math.min(((user.xp - currentMilestone.xp) / (nextMilestone.xp - currentMilestone.xp)) * 100, 100)
    : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
      
      {/* Hero Banner */}
      <div className="glass-card anim-scale-in" style={{
        padding: '32px 28px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(255,107,43,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>{currentMilestone.icon}</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {currentMilestone.label}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          {user.displayName} · {user.grade}
        </p>

        {/* XP Progress Bar */}
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--saffron)' }}>{user.xp} XP</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {nextMilestone ? `${nextMilestone.xp} XP → ${nextMilestone.label}` : 'Max Rank!'}
            </span>
          </div>
          <div style={{ height: '10px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressToNext}%`,
              borderRadius: '99px',
              background: 'linear-gradient(90deg, var(--saffron), var(--indigo))',
              boxShadow: '0 0 10px var(--saffron-glow)',
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { icon: <BookOpen size={20} />, label: 'Lessons Done',   value: user.lessonsCompleted, color: 'var(--sky)'     },
          { icon: <Trophy   size={20} />, label: 'Quizzes Passed', value: user.quizzesPassed,    color: 'var(--gold)'    },
          { icon: <Target   size={20} />, label: 'AR Scans',       value: user.scansUsed,        color: 'var(--saffron)' },
          { icon: <Zap      size={20} />, label: 'Day Streak',     value: user.streak,           color: 'var(--emerald)' },
        ].map((s, i) => (
          <div key={i} className="glass-card anim-fade-up" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: `${s.color}18`, border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-heading)', fontWeight: '900', color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Milestones Row */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={16} style={{ color: 'var(--gold)' }} /> Rank Milestones
        </h3>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {MILESTONES.map((m, i) => {
            const unlocked = user.xp >= m.xp;
            return (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                minWidth: '72px', padding: '12px 8px', borderRadius: '14px',
                background: unlocked ? `${m.color}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${unlocked ? m.color + '40' : 'var(--glass-border)'}`,
                opacity: unlocked ? 1 : 0.5,
              }}>
                <span style={{ fontSize: '22px' }}>{unlocked ? m.icon : '🔒'}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: unlocked ? m.color : 'var(--text-muted)', textAlign: 'center' }}>{m.label}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{m.xp} XP</span>
                {unlocked && <CheckCircle size={12} style={{ color: m.color }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Progress */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} style={{ color: 'var(--indigo)' }} /> Subject Progress
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {SUBJECTS.map((s, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {s.icon} {s.name}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.lessons} lessons · {s.progress}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', width: `${s.progress}%`, borderRadius: '99px', background: s.color, boxShadow: `0 0 8px ${s.color}66` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={16} style={{ color: 'var(--saffron)' }} /> Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ACTIVITY_LOG.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: a.type === 'scan' ? 'rgba(14,165,233,0.12)' : a.type === 'quiz' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                border: `1px solid ${a.type === 'scan' ? 'rgba(14,165,233,0.25)' : a.type === 'quiz' ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
              }}>
                {a.type === 'scan' ? '📷' : a.type === 'quiz' ? '🧠' : '📖'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.time}</p>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: '800', padding: '3px 10px', borderRadius: '999px',
                background: 'rgba(255,107,43,0.12)', color: 'var(--saffron)',
                border: '1px solid rgba(255,107,43,0.2)', flexShrink: 0,
              }}>+{a.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
