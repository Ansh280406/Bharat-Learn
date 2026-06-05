import React, { useState } from 'react';
import type { PageType } from '../../types';
import {
  Heart, Hash, Sword, ArrowRight, Sparkles, BookOpen, Sun,
  ChevronLeft, FlaskConical, Cuboid, GraduationCap, Beaker, Globe, Calculator
} from 'lucide-react';

interface OfflineIndexProps {
  onSelectSubject: (module: Module) => void;
  selectedStandardId?: string | null;
  setSelectedStandardId?: (id: string | null) => void;
  selectedSubjectId?: string | null;
  setSelectedSubjectId?: (id: string | null) => void;
}

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Module {
  type: PageType;
  chapter: string;
  title: string;
  description: string;
  emoji: string;
  tags: string[];
  difficulty: Difficulty;
  duration: string;
  ncertRef: string;
  wikipediaQuery?: string;
}

interface Subject {
  id: string;
  title: string;
  icon: any;
  color: string;
  modules: Module[];
}

interface Standard {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  subjects: Subject[];
}

const CURRICULUM: Standard[] = [
  {
    id: 'xii', title: 'Class XII', icon: GraduationCap, color: '#8b5cf6',
    description: 'Physics, Chemistry & Mathematics — NCERT Board Syllabus',
    subjects: [
      {
        id: 'xii-physics', title: 'Physics', icon: Sun, color: '#8b5cf6',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 9', title: 'Ray Optics & Optical Instruments',
            description: 'Refraction through a glass prism, dispersion of light, rainbow formation, scattering. Interactive prism experiment.',
            emoji: '🌈', tags: ['NCERT', 'Ray Optics', 'Lab Practical'],
            difficulty: 'Advanced', duration: '20 min', ncertRef: 'Class XII Physics, Ch. 9',
            wikipediaQuery: 'Prism'
          },
          {
            type: 'unknown', chapter: 'Chapter 14', title: 'Semiconductor Electronics',
            description: 'Explore p-n junction diode, transistor action, logic gates AND/OR/NOT in animated 3D circuit diagrams.',
            emoji: '🔌', tags: ['NCERT', 'Circuits', 'Digital Logic'],
            difficulty: 'Advanced', duration: '25 min', ncertRef: 'Class XII Physics, Ch. 14',
            wikipediaQuery: 'Semiconductor'
          },
          {
            type: 'unknown', chapter: 'Chapter 4', title: 'Moving Charges & Magnetism',
            description: 'Visualise magnetic field lines around a current-carrying conductor using 3D vector field animations.',
            emoji: '🧲', tags: ['NCERT', 'Electromagnetism'],
            difficulty: 'Advanced', duration: '18 min', ncertRef: 'Class XII Physics, Ch. 4',
            wikipediaQuery: 'Magnetic field'
          },
        ],
      },
      {
        id: 'xii-chemistry', title: 'Chemistry', icon: Beaker, color: '#14b8a6',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 12', title: 'Aldehydes, Ketones & Carboxylic Acids',
            description: 'Visualise nucleophilic addition reaction mechanisms step-by-step in 3D molecular models with electron cloud rendering.',
            emoji: '🧪', tags: ['NCERT', 'Organic', '3D Mechanism'],
            difficulty: 'Advanced', duration: '15 min', ncertRef: 'Class XII Chemistry, Ch. 12',
            wikipediaQuery: 'Aldehyde'
          },
          {
            type: 'unknown', chapter: 'Chapter 2', title: 'Structure of Atom',
            description: 'Dive into Bohr\'s model, quantum numbers, orbital shapes (s, p, d, f) and electron configuration in 3D.',
            emoji: '⚛️', tags: ['NCERT', 'Atomic Structure', 'Quantum'],
            difficulty: 'Intermediate', duration: '18 min', ncertRef: 'Class XII Chemistry, Ch. 2',
            wikipediaQuery: 'Atom'
          },
          {
            type: 'unknown', chapter: 'Chapter 1', title: 'The Solid State',
            description: 'Explore crystal lattice structures — cubic, BCC, FCC — and defects in solids as interactive 3D unit cells.',
            emoji: '💎', tags: ['NCERT', 'Solid State', '3D Crystal'],
            difficulty: 'Advanced', duration: '20 min', ncertRef: 'Class XII Chemistry, Ch. 1',
            wikipediaQuery: 'Crystal structure'
          },
        ],
      },
      {
        id: 'xii-maths', title: 'Mathematics', icon: Cuboid, color: '#0ea5e9',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 11', title: '3D Geometry',
            description: 'Visualize planes, direction cosines, skew lines, and the angle between planes as interactive 3D vector graphics.',
            emoji: '🧊', tags: ['NCERT', '3D Geometry', 'Vectors'],
            difficulty: 'Advanced', duration: '22 min', ncertRef: 'Class XII Maths, Ch. 11',
            wikipediaQuery: 'Solid geometry'
          },
          {
            type: 'unknown', chapter: 'Chapter 6', title: 'Application of Derivatives',
            description: 'See rate-of-change problems visualized — tangent lines, maxima-minima, increasing/decreasing functions animated in real time.',
            emoji: '📈', tags: ['NCERT', 'Calculus', 'Graphs'],
            difficulty: 'Advanced', duration: '20 min', ncertRef: 'Class XII Maths, Ch. 6',
            wikipediaQuery: 'Derivative'
          },
        ],
      },
    ],
  },
  {
    id: 'xi', title: 'Class XI', icon: GraduationCap, color: '#f59e0b',
    description: 'Physics, Chemistry, Biology & History — NCERT',
    subjects: [
      {
        id: 'xi-physics', title: 'Physics', icon: Sun, color: '#8b5cf6',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 8', title: 'Gravitation',
            description: 'See orbital paths of planets, understand gravitational potential, escape velocity & weightlessness through animated simulations.',
            emoji: '🪐', tags: ['NCERT', 'Gravitation', 'Orbits'],
            difficulty: 'Intermediate', duration: '15 min', ncertRef: 'Class XI Physics, Ch. 8',
            wikipediaQuery: 'Gravity'
          },
          {
            type: 'unknown', chapter: 'Chapter 14', title: 'Oscillations & Waves',
            description: 'Watch simple harmonic motion animate in 3D — spring-mass system, pendulum, and wave superposition.',
            emoji: '〰️', tags: ['NCERT', 'SHM', 'Waves'],
            difficulty: 'Intermediate', duration: '18 min', ncertRef: 'Class XI Physics, Ch. 14',
            wikipediaQuery: 'Simple harmonic motion'
          },
        ],
      },
      {
        id: 'xi-chemistry', title: 'Chemistry', icon: FlaskConical, color: '#14b8a6',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 4', title: 'Chemical Bonding & Molecular Structure',
            description: 'See how ionic, covalent, and metallic bonds form. Visualize VSEPR theory and molecular geometries in 3D.',
            emoji: '🔗', tags: ['NCERT', 'Bonding', 'VSEPR'],
            difficulty: 'Intermediate', duration: '16 min', ncertRef: 'Class XI Chemistry, Ch. 4',
            wikipediaQuery: 'Chemical bond'
          },
        ],
      },
      {
        id: 'xi-history', title: 'History', icon: Sword, color: '#f59e0b',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 4', title: 'Battle of Panipat (1526)',
            description: 'Interactive battle map showing Babur vs Ibrahim Lodi troop movements. Scrub the timeline to watch the battle unfold.',
            emoji: '⚔️', tags: ['NCERT', 'Medieval', 'Battle Map'],
            difficulty: 'Intermediate', duration: '12 min', ncertRef: 'Class XI History, Ch. 4',
            wikipediaQuery: 'Battle of Panipat'
          },
          {
            type: 'unknown', chapter: 'Chapter 11', title: 'The French Revolution',
            description: 'Trace the spread of revolutionary ideas across Europe — animated map shows the fall of the Bastille and political transformation.',
            emoji: '🇫🇷', tags: ['NCERT', 'Modern History', 'Map View'],
            difficulty: 'Intermediate', duration: '14 min', ncertRef: 'Class XI History, Ch. 11',
            wikipediaQuery: 'French revolution'
          },
        ],
      },
    ],
  },
  {
    id: 'x', title: 'Class X', icon: GraduationCap, color: '#f43f5e',
    description: 'Biology, Maths, Geography & Chemistry — NCERT',
    subjects: [
      {
        id: 'x-biology', title: 'Biology', icon: Heart, color: '#f43f5e',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 6', title: 'Life Processes — Human Heart',
            description: 'Explore 3D beating chambers, aorta, pulmonary artery, valves, and blood flow pathways. Tap parts to hear detailed explanations.',
            emoji: '❤️', tags: ['NCERT', 'Anatomy', 'Voice Guide'],
            difficulty: 'Beginner', duration: '10 min', ncertRef: 'Class X Biology, Ch. 6',
            wikipediaQuery: 'Heart'
          },
          {
            type: 'unknown', chapter: 'Chapter 8', title: 'How do Organisms Reproduce?',
            description: 'Visualize cell division — mitosis and meiosis — step by step in an animated 3D cell model.',
            emoji: '🧬', tags: ['NCERT', 'Cell Division', '3D Model'],
            difficulty: 'Intermediate', duration: '14 min', ncertRef: 'Class X Biology, Ch. 8',
            wikipediaQuery: 'Mitosis'
          },
        ],
      },
      {
        id: 'x-maths', title: 'Mathematics', icon: Calculator, color: '#10b981',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 4', title: 'Quadratic Equations',
            description: 'Solve quadratic equations using the discriminant method, factoring & completing the square — balance-beam visual solver.',
            emoji: '📐', tags: ['NCERT', 'Algebra', 'Solver'],
            difficulty: 'Intermediate', duration: '12 min', ncertRef: 'Class X Maths, Ch. 4',
            wikipediaQuery: 'Quadratic equation'
          },
          {
            type: 'unknown', chapter: 'Chapter 7', title: 'Coordinate Geometry',
            description: 'Plot points, distance formula, section formula and area of triangle — all visualized live on an animated XY grid.',
            emoji: '📊', tags: ['NCERT', 'Geometry', 'Graphs'],
            difficulty: 'Intermediate', duration: '14 min', ncertRef: 'Class X Maths, Ch. 7',
            wikipediaQuery: 'Coordinate geometry'
          },
        ],
      },
      {
        id: 'x-geography', title: 'Geography', icon: Globe, color: '#0ea5e9',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 3', title: 'Water Resources',
            description: 'Watch clouds form, rain fall, and rivers flow in real-time animated water cycle. Explore dams, watersheds, and conservation.',
            emoji: '💧', tags: ['NCERT', 'Water Cycle', 'Animation'],
            difficulty: 'Beginner', duration: '8 min', ncertRef: 'Class X Geography, Ch. 3',
            wikipediaQuery: 'Water cycle'
          },
        ],
      },
      {
        id: 'x-chemistry', title: 'Chemistry', icon: FlaskConical, color: '#6366f1',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 1', title: 'Chemical Reactions & Equations',
            description: 'See atoms rearrange in 3D during combustion, decomposition, and displacement reactions. Balancing equations made visual.',
            emoji: '🔬', tags: ['NCERT', 'Reactions', '3D Atoms'],
            difficulty: 'Beginner', duration: '10 min', ncertRef: 'Class X Chemistry, Ch. 1',
            wikipediaQuery: 'Chemical reaction'
          },
        ],
      },
    ],
  },
  {
    id: 'viii-ix', title: 'Class VIII–IX', icon: GraduationCap, color: '#10b981',
    description: 'Science & Geography — NCERT Foundation',
    subjects: [
      {
        id: 'viii-geo', title: 'Geography', icon: Globe, color: '#0ea5e9',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 5', title: 'Natural Vegetation & Water',
            description: 'Interactive animated water cycle explaining evaporation, condensation, precipitation, and collection over a landscape.',
            emoji: '🌲', tags: ['NCERT', 'Ecology', 'Water Cycle'],
            difficulty: 'Beginner', duration: '12 min', ncertRef: 'Class VIII Geography, Ch. 5',
            wikipediaQuery: 'Water cycle'
          },
        ],
      },
      {
        id: 'ix-maths', title: 'Mathematics', icon: Hash, color: '#10b981',
        modules: [
          {
            type: 'unknown', chapter: 'Chapter 4', title: 'Linear Equations in Two Variables',
            description: 'Solve linear equations graphically — watch lines intersect on an animated coordinate plane as you adjust variables.',
            emoji: '📉', tags: ['NCERT', 'Linear Equations', 'Graphs'],
            difficulty: 'Beginner', duration: '10 min', ncertRef: 'Class IX Maths, Ch. 4',
            wikipediaQuery: 'Linear equation'
          },
        ],
      },
    ],
  },
];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner:     '#10b981',
  Intermediate: '#f59e0b',
  Advanced:     '#f43f5e',
};

export const OfflineIndex: React.FC<OfflineIndexProps> = ({ 
  onSelectSubject, 
  selectedStandardId: propStd, setSelectedStandardId: setPropStd,
  selectedSubjectId: propSubj, setSelectedSubjectId: setPropSubj
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Use props if provided, else use local state (for fallback)
  const [localStd, setLocalStd] = useState<string | null>(null);
  const [localSubj, setLocalSubj] = useState<string | null>(null);

  const selectedStandardId = propStd !== undefined ? propStd : localStd;
  const selectedSubjectId = propSubj !== undefined ? propSubj : localSubj;

  const setSelectedStandardId = setPropStd || setLocalStd;
  const setSelectedSubjectId = setPropSubj || setLocalSubj;

  const activeStandard = CURRICULUM.find(s => s.id === selectedStandardId);
  const activeSubject  = activeStandard?.subjects.find(s => s.id === selectedSubjectId);

  const handleBack = () => {
    if (selectedSubjectId) setSelectedSubjectId(null);
    else setSelectedStandardId(null);
  };

  const breadcrumb = activeSubject
    ? `${activeStandard?.title} › ${activeSubject.title}`
    : activeStandard
    ? activeStandard.title
    : null;

  return (
    <div style={{ paddingBottom: '8px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 16px',
          background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '999px', marginBottom: '12px',
        }}>
          <BookOpen size={12} style={{ color: 'var(--indigo)' }} />
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            NCERT Curriculum Library
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {selectedStandardId && (
            <button className="glass-btn ghost" onClick={handleBack} style={{ padding: '8px', borderRadius: '50%' }}>
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-heading)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
              {activeSubject ? activeSubject.title + ' Lessons' : activeStandard ? 'Select Subject' : 'Choose Your Standard'}
            </h2>
            {breadcrumb && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{breadcrumb}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tier 1: Standards */}
      {!selectedStandardId && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {CURRICULUM.map((std) => {
            const Icon = std.icon;
            const isHov = hoveredId === std.id;
            return (
              <div key={std.id}
                className="glass-card anim-fade-up"
                onClick={() => setSelectedStandardId(std.id)}
                onMouseEnter={() => setHoveredId(std.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: '22px', cursor: 'pointer',
                  borderColor: isHov ? std.color + '60' : undefined,
                  boxShadow: isHov ? `0 12px 35px ${std.color}30` : undefined,
                  transform: isHov ? 'translateY(-4px)' : undefined,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: `${std.color}18`, border: `1px solid ${std.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: std.color }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 2px' }}>{std.title}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {std.subjects.length} subjects · {std.subjects.reduce((a,s)=>a+s.modules.length,0)} AR lessons
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{std.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tier 2: Subjects */}
      {selectedStandardId && !selectedSubjectId && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {activeStandard?.subjects.map((subj) => {
            const Icon = subj.icon;
            const isHov = hoveredId === subj.id;
            return (
              <div key={subj.id}
                className="glass-card anim-fade-up"
                onClick={() => setSelectedSubjectId(subj.id)}
                onMouseEnter={() => setHoveredId(subj.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: '20px', cursor: 'pointer',
                  borderColor: isHov ? subj.color + '60' : undefined,
                  transform: isHov ? 'translateY(-4px)' : undefined,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${subj.color}18`, border: `1px solid ${subj.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subj.color }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 3px' }}>{subj.title}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{subj.modules.length} AR module{subj.modules.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tier 3: Modules */}
      {selectedSubjectId && activeSubject && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
          {activeSubject.modules.map((mod) => {
            const isHov = hoveredId === `${mod.type}-${mod.chapter}`;
            const color = activeSubject.color;
            return (
              <div
                key={`${mod.type}-${mod.chapter}`}
                className="glass-card anim-fade-up"
                onClick={() => onSelectSubject(mod)}
                onMouseEnter={() => setHoveredId(`${mod.type}-${mod.chapter}`)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: '20px', cursor: 'pointer',
                  borderColor: isHov ? color + '60' : undefined,
                  boxShadow: isHov ? `0 16px 40px ${color}28` : undefined,
                  transform: isHov ? 'translateY(-6px) scale(1.01)' : undefined,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {mod.chapter}
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '2px 9px', borderRadius: '999px',
                    background: `${DIFFICULTY_COLORS[mod.difficulty]}18`,
                    color: DIFFICULTY_COLORS[mod.difficulty],
                    border: `1px solid ${DIFFICULTY_COLORS[mod.difficulty]}30`,
                  }}>
                    {mod.difficulty}
                  </span>
                </div>

                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                    {mod.emoji}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '5px', lineHeight: 1.3 }}>{mod.title}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{mod.description}</p>
                  </div>
                </div>

                {/* NCERT ref */}
                <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px', fontStyle: 'italic' }}>
                  📖 {mod.ncertRef}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {mod.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '10px', fontWeight: '600', padding: '3px 9px', borderRadius: '999px', background: 'var(--btn-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>⏱ {mod.duration}</span>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '999px',
                    background: isHov ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'var(--btn-bg)',
                    border: `1px solid ${isHov ? 'transparent' : 'var(--glass-border)'}`,
                    color: isHov ? '#fff' : 'var(--text-secondary)', fontSize: '12px', fontWeight: '700',
                    transition: 'all 0.3s ease',
                  }}>
                    <Sparkles size={11} />
                    Launch AR
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)', marginTop: '24px', fontWeight: '500' }}>
        ✨ All lessons work offline · 3 languages · AI-powered explanations
      </p>
    </div>
  );
};
