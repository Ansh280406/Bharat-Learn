import React, { useState } from 'react';
import { FileText, Download, Trash2, Plus, BrainCircuit } from 'lucide-react';

interface StudyNote {
  id: string;
  subject: string;
  title: string;
  content: string;
  emoji: string;
  createdAt: string;
  color: string;
}

const DEMO_NOTES: StudyNote[] = [
  {
    id: '1',
    subject: 'Biology',
    title: 'Human Heart – Key Facts',
    emoji: '❤️',
    color: '#f43f5e',
    createdAt: '2 hours ago',
    content: 'The human heart has 4 chambers: right atrium, right ventricle, left atrium, left ventricle. The aorta is the main artery that carries oxygenated blood from the left ventricle to the body. The pulmonary artery carries deoxygenated blood to the lungs. Heart beats approx. 72 times per minute.',
  },
  {
    id: '2',
    subject: 'Physics',
    title: 'Optics – Prism Refraction',
    emoji: '🌈',
    color: '#8b5cf6',
    createdAt: 'Yesterday',
    content: 'When white light passes through a prism, it disperses into VIBGYOR (violet, indigo, blue, green, yellow, orange, red). Snell\'s Law: n₁ sin θ₁ = n₂ sin θ₂. Refractive index n = c/v. A concave lens diverges light; a convex lens converges it.',
  },
];

export const StudyNotes: React.FC = () => {
  const [notes, setNotes] = useState<StudyNote[]>(DEMO_NOTES);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)',
          }}>
            <BrainCircuit size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
              AI Study Notes
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Auto-generated from your AR scans
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '999px',
            background: 'rgba(16,185,129,0.12)', color: 'var(--emerald)', border: '1px solid rgba(16,185,129,0.25)',
          }}>
            🤖 Gemini AI
          </span>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>📝</div>
          <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Notes Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Scan a textbook page and the AI will automatically generate study notes for you.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {notes.map((note) => (
            <div
              key={note.id}
              className="glass-card anim-fade-up"
              style={{
                padding: '20px',
                borderLeft: `3px solid ${note.color}`,
                cursor: 'pointer',
                ...(selectedNote?.id === note.id ? { border: `1px solid ${note.color}50`, background: `${note.color}08` } : {}),
              }}
              onClick={() => setSelectedNote(selectedNote?.id === note.id ? null : note)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '24px' }}>{note.emoji}</span>
                  <div style={{ minWidth: 0 }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', color: note.color,
                      textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '3px',
                    }}>{note.subject}</span>
                    <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                      {note.title}
                    </h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {note.createdAt}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="glass-btn ghost"
                    style={{ padding: '6px', borderRadius: '8px', color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.2)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              
              {/* Expanded Note Content */}
              {selectedNote?.id === note.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.75', whiteSpace: 'pre-line' }}>
                    {note.content}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button className="glass-btn secondary" style={{ padding: '7px 16px', fontSize: '12px', borderRadius: '999px' }}>
                      <Download size={12} />
                      Save as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="glass-card-sm" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Plus size={16} style={{ color: 'var(--indigo)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>How Study Notes Work</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              When you scan a textbook page, Gemini AI generates a structured study note automatically and saves it here. Notes include key concepts, formulas, and facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
