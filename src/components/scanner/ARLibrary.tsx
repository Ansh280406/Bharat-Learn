import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, RefreshCw } from 'lucide-react';
import type { PageType } from '../../types';

interface LibraryEntry {
  id: number;
  title: string;
  page_type: PageType;
  description: string;
  subject: string;
  class_level: string;
  emoji: string;
}

interface ARLibraryProps {
  onLaunch: (pageType: PageType, title: string, description: string, isLibrary?: boolean) => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  Biology:     '#f43f5e',
  Geography:   '#0ea5e9',
  Chemistry:   '#14b8a6',
  Mathematics: '#10b981',
  Physics:     '#8b5cf6',
  History:     '#f59e0b',
};

export const ARLibrary: React.FC<ARLibraryProps> = ({ onLaunch }) => {
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<string>('All');

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ar/library');
      if (!res.ok) throw new Error('Server offline');
      const data = await res.json();
      setLibrary(data.library || []);
    } catch {
      setLibrary([]); // leave blank, server may be starting
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLibrary(); }, []);

  const subjects = ['All', ...Array.from(new Set(library.map(l => l.subject)))];
  const filtered = filter === 'All' ? library : library.filter(l => l.subject === filter);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
        <RefreshCw size={16} style={{ color: 'var(--text-muted)', animation: 'spin-slow 1s linear infinite' }} />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading NCERT Library…</span>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '20px 22px', border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(7,14,28,0.75)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--indigo-light)',
        }}>
          <BookOpen size={16} />
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--text-primary)' }}>
            NCERT AR Library
          </h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
            Famous models — tap to launch AR instantly
          </p>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '14px' }}>
        {subjects.map(sub => {
          const active = filter === sub;
          const color  = SUBJECT_COLORS[sub] || '#6366f1';
          return (
            <button
              key={sub}
              onClick={() => setFilter(sub)}
              style={{
                padding: '4px 12px', borderRadius: '999px',
                fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                background: active ? `${color}25` : 'rgba(7,14,28,0.6)',
                border: active ? `1px solid ${color}60` : '1px solid rgba(255,255,255,0.08)',
                color: active ? color : 'var(--text-muted)',
                transition: 'all 0.2s ease',
              }}
            >
              {sub}
            </button>
          );
        })}
      </div>

      <div className="divider" style={{ marginBottom: '14px' }} />

      {/* Library Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {filtered.map(item => {
          const color = SUBJECT_COLORS[item.subject] || '#6366f1';
          return (
            <button
              key={item.id}
              onClick={() => onLaunch(item.page_type, item.title, item.description, true)}
              className="glass-btn ghost"
              style={{
                padding: '12px', borderRadius: '12px',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: '6px', textAlign: 'left',
                borderColor: `${color}25`,
                background: `${color}08`,
                transition: 'all 0.25s ease',
                minHeight: '90px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${color}18`;
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `${color}08`;
                e.currentTarget.style.borderColor = `${color}25`;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '22px' }}>{item.emoji}</span>
                <ChevronRight size={14} style={{ color, marginTop: '4px', flexShrink: 0 }} />
              </div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.3', margin: 0 }}>
                {item.title}
              </p>
              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                borderRadius: '999px', background: `${color}20`, color,
              }}>
                {item.class_level}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
          No models found for this subject.
        </p>
      )}
    </div>
  );
};
