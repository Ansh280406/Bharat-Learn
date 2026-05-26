import React, { useState } from 'react';
import { BookmarkX, BookOpen, Sparkles, Clock, ChevronRight } from 'lucide-react';
import type { PageType } from '../../types';

interface Bookmark {
  id: string;
  pageType: PageType;
  title: string;
  subject: string;
  chapter: string;
  emoji: string;
  savedAt: string;
}

const DEMO_BOOKMARKS: Bookmark[] = [
  { id: '1', pageType: 'heart',       title: 'The Human Heart',       subject: 'Biology',   chapter: 'Chapter 6',  emoji: '❤️',  savedAt: '2 hours ago'  },
  { id: '2', pageType: 'physics',     title: 'Optics & Prisms',       subject: 'Physics',   chapter: 'Chapter 9',  emoji: '🌈',  savedAt: 'Yesterday'    },
  { id: '3', pageType: 'chemistry',   title: 'Organic Mechanisms',    subject: 'Chemistry', chapter: 'Chapter 12', emoji: '🧪',  savedAt: '2 days ago'   },
  { id: '4', pageType: 'water_cycle', title: 'The Water Cycle',       subject: 'Geography', chapter: 'Chapter 3',  emoji: '💧',  savedAt: '3 days ago'   },
];

const SUBJECT_COLORS: Record<string, string> = {
  Biology: '#f43f5e', Physics: '#8b5cf6', Chemistry: '#14b8a6',
  Geography: '#0ea5e9', History: '#f59e0b', Mathematics: '#10b981',
};

interface BookmarksPageProps {
  onLaunchAR: (pageType: PageType) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ onLaunchAR }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(DEMO_BOOKMARKS);

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  if (bookmarks.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔖</div>
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          No Bookmarks Yet
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Bookmark lessons from the Library to find them here quickly.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px',
          background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
        }}>
          <BookOpen size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
            My Bookmarks
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {bookmarks.length} saved lessons
          </p>
        </div>
      </div>

      {/* Bookmark Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bookmarks.map((bm) => {
          const color = SUBJECT_COLORS[bm.subject] || '#6366f1';
          return (
            <div
              key={bm.id}
              className="glass-card anim-fade-up"
              style={{ padding: '18px 20px', borderLeft: `3px solid ${color}`, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>
                  {bm.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {bm.subject}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>· {bm.chapter}</span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bm.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bm.savedAt}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => onLaunchAR(bm.pageType)}
                    className="glass-btn primary"
                    style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '999px' }}
                  >
                    <Sparkles size={11} />
                    Open AR
                  </button>
                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="glass-btn ghost"
                    style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '999px', color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.2)' }}
                  >
                    <BookmarkX size={11} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div className="glass-card-sm" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ChevronRight size={14} style={{ color: 'var(--indigo)', flexShrink: 0 }} />
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Tip: Bookmark any lesson from the <strong style={{ color: 'var(--text-primary)' }}>Library</strong> by tapping the bookmark icon on a lesson card.
        </p>
      </div>
    </div>
  );
};
