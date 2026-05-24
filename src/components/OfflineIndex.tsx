import React from 'react';
import type { PageType } from '../types';
import { Heart, Droplet, Hash, Compass, BookOpen } from 'lucide-react';

interface OfflineIndexProps {
  onSelectSubject: (subject: PageType) => void;
}

export const OfflineIndex: React.FC<OfflineIndexProps> = ({ onSelectSubject }) => {
  const subjects: {
    type: PageType;
    title: string;
    chapter: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    glow: string;
  }[] = [
    {
      type: 'heart',
      chapter: 'Biology • Chapter 4',
      title: 'The Human Heart',
      description: 'Explore the 3D beating chambers, aorta, and valves with voice guides.',
      icon: <Heart size={28} />,
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    {
      type: 'water_cycle',
      chapter: 'Geography • Chapter 2',
      title: 'The Water Cycle',
      description: 'See clouds form, rain fall, and rivers flow in real-time synced overlays.',
      icon: <Droplet size={28} />,
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.4)',
    },
    {
      type: 'math',
      chapter: 'Algebra • Chapter 7',
      title: 'Algebraic Equation Solver',
      description: 'Solve balance-beam equations using tactile variable and unit blocks.',
      icon: <Hash size={28} />,
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
    {
      type: 'history',
      chapter: 'History • Chapter 11',
      title: 'Battle of Panipat (1526)',
      description: 'Scrub through history and watch troop arrows advance on interactive maps.',
      icon: <Compass size={28} />,
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.4)',
    },
  ];

  return (
    <div style={{ padding: '24px 16px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '50px',
          color: 'var(--primary)',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '12px'
        }}>
          <BookOpen size={16} />
          <span>Interactive Textbook Index</span>
        </div>
        <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '8px' }}>
          Select a Textbook Lesson
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '15px' }}>
          Tap on any lesson cover below to instantly launch the augmented reality overlays, quizzes, and guides!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {subjects.map((subj) => (
          <div
            key={subj.type}
            onClick={() => onSelectSubject(subj.type)}
            className="glass-card"
            style={{
              padding: '24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = subj.color;
              e.currentTarget.style.boxShadow = `0 12px 30px -10px ${subj.glow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Ambient Background Glow */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: subj.color,
              opacity: 0.05,
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }} />

            <div>
              <span style={{
                fontSize: '12px',
                color: subj.color,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {subj.chapter}
              </span>
              <h3 style={{
                fontSize: '20px',
                fontFamily: 'var(--font-heading)',
                color: '#fff',
                marginTop: '6px',
                marginBottom: '10px'
              }}>
                {subj.title}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}>
                {subj.description}
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${subj.color}22 0%, ${subj.color}44 100%)`,
                border: `1px solid ${subj.color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: subj.color
              }}>
                {subj.icon}
              </div>
              <span className="glass-btn" style={{
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                Open Lesson →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
