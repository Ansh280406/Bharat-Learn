import React, { useEffect, useState } from 'react';
import { Clock, Trash2, RefreshCw, ChevronRight } from 'lucide-react';
import type { PageType } from '../../types';

interface ScanEntry {
  id: number;
  page_type: PageType;
  title: string;
  explanation: string;
  confidence: number;
  scanned_at: string;
}

interface RecentScansProps {
  onRelaunch: (pageType: PageType, title: string, explanation: string) => void;
  refreshSignal?: number; // bump this to force a reload from outside
}

const PAGE_TYPE_META: Record<string, { emoji: string; color: string }> = {
  heart:       { emoji: '❤️',  color: '#f43f5e' },
  water_cycle: { emoji: '💧',  color: '#0ea5e9' },
  math:        { emoji: '📐',  color: '#10b981' },
  math_3d:     { emoji: '🧊',  color: '#0ea5e9' },
  physics:     { emoji: '⚡',  color: '#8b5cf6' },
  chemistry:   { emoji: '🧪',  color: '#14b8a6' },
  history:     { emoji: '⚔️',  color: '#f59e0b' },
  unknown:     { emoji: '🤖',  color: '#6366f1' },
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const RecentScans: React.FC<RecentScansProps> = ({ onRelaunch, refreshSignal }) => {
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ar/history?limit=15');
      if (!res.ok) throw new Error('Server offline');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      setError('Could not load recent scans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [refreshSignal]);

  const deleteEntry = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ar/history/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch { /* silent */ }
  };

  if (loading) {
    return (
      <div className="glass-card-sm" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <RefreshCw size={14} style={{ color: 'var(--text-muted)', animation: 'spin-slow 1s linear infinite' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading recent scans…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card-sm" style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          {error} — start a scan to populate history.
        </p>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="glass-card-sm" style={{ padding: '16px', textAlign: 'center' }}>
        <Clock size={22} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No scans yet — point the camera at a textbook page and tap Scan!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {history.slice(0, 4).map(entry => {
        const meta = PAGE_TYPE_META[entry.page_type] || PAGE_TYPE_META.unknown;
        return (
          <button
            key={entry.id}
            onClick={() => onRelaunch(entry.page_type, entry.title, entry.explanation)}
            className="glass-btn ghost"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderColor: `${meta.color}25`,
              background: `${meta.color}08`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${meta.color}16`;
              e.currentTarget.style.borderColor = meta.color;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = `${meta.color}08`;
              e.currentTarget.style.borderColor = `${meta.color}25`;
            }}
          >
            {/* Emoji */}
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{meta.emoji}</span>

            {/* Text */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{
                fontSize: '13px', fontWeight: '700',
                color: 'var(--text-primary)', marginBottom: '2px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {entry.title}
              </p>
              <p style={{
                fontSize: '11px', color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {entry.explanation?.substring(0, 60)}{entry.explanation?.length > 60 ? '…' : ''}
              </p>
            </div>

            {/* Time */}
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0, fontWeight: '600' }}>
              {timeAgo(entry.scanned_at)}
            </span>

            {/* Delete */}
            <button
              onClick={(e) => deleteEntry(e, entry.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '4px', borderRadius: '6px', color: 'var(--text-muted)',
                flexShrink: 0,
              }}
              title="Remove"
            >
              <Trash2 size={12} />
            </button>

            <ChevronRight size={14} style={{ color: meta.color, flexShrink: 0 }} />
          </button>
        );
      })}
    </div>
  );
};
