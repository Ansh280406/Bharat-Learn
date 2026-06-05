import React, { } from 'react';

interface Label {
  id: string;
  name: string;
  x: string;
  y: string;
  description: string;
}

interface SceneConfig {
  svgContent: (activeId: string | null) => React.ReactNode;
  labels: Label[];
  bgColor: string;
  accentColor: string;
}

/* ─── Helper: glowing dot ─── */
const Dot = ({ x, y, active, color }: { x: string; y: string; active: boolean; color: string }) => (
  <circle
    cx={x} cy={y} r={active ? 8 : 5}
    fill={active ? color : `${color}cc`}
    style={{
      filter: `drop-shadow(0 0 ${active ? '8px' : '4px'} ${color})`,
      transition: 'all 0.3s ease',
    }}
  />
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SEMICONDUCTOR / P-N JUNCTION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const SemiconductorScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1"/>
      </linearGradient>
      <linearGradient id="nGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* P-type region */}
    <rect x="40" y="80" width="170" height="160" rx="8" fill="url(#pGrad)" stroke="#f43f5e" strokeWidth="1.5" strokeOpacity="0.6"/>
    <text x="125" y="220" textAnchor="middle" fill="#f43f5e" fontSize="12" fontWeight="700" opacity="0.8">P-Type</text>
    {/* Holes (circles) */}
    {[[80,110],[120,110],[160,110],[80,150],[120,150],[160,150],[80,190],[120,190],[160,190]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="10" fill="none" stroke="#f43f5e" strokeWidth="2" opacity={active === 'p-type' ? 1 : 0.5}/>
    ))}
    {/* + signs */}
    {[[80,110],[120,110],[160,110],[80,150],[120,150],[160,150],[80,190],[120,190],[160,190]].map(([cx,cy],i) => (
      <text key={i} x={cx} y={cy+4} textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="700" opacity={active === 'p-type' ? 1 : 0.5}>+</text>
    ))}

    {/* N-type region */}
    <rect x="290" y="80" width="170" height="160" rx="8" fill="url(#nGrad)" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.6"/>
    <text x="375" y="220" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="700" opacity="0.8">N-Type</text>
    {/* Electrons */}
    {[[330,110],[370,110],[410,110],[330,150],[370,150],[410,150],[330,190],[370,190],[410,190]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="8" fill="#3b82f6" opacity={active === 'n-type' ? 0.9 : 0.45}/>
    ))}
    {[[330,110],[370,110],[410,110],[330,150],[370,150],[410,150],[330,190],[370,190],[410,190]].map(([cx,cy],i) => (
      <text key={i} x={cx} y={cy+4} textAnchor="middle" fill="white" fontSize="10" fontWeight="700" opacity={active === 'n-type' ? 1 : 0.6}>-</text>
    ))}

    {/* Depletion zone */}
    <rect x="210" y="80" width="80" height="160" rx="0"
      fill={active === 'depletion' ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.1)'}
      stroke="#8b5cf6" strokeWidth={active === 'depletion' ? 2 : 1} strokeDasharray="4 3"/>
    <text x="250" y="165" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="600" opacity="0.9">DEPLETION</text>
    <text x="250" y="178" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="600" opacity="0.9">ZONE</text>

    {/* Electric field arrow */}
    <line x1="250" y1="60" x2="250" y2="75" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowPurple)" opacity="0.7"/>

    {/* Junction line */}
    <line x1="250" y1="80" x2="250" y2="240" stroke="rgba(139,92,246,0.6)" strokeWidth="2" strokeDasharray="4 2"/>

    {/* Forward bias arrows */}
    {active === 'forward-bias' && <>
      <path d="M 30 160 L 55 160" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrowGreen)" fill="none"/>
      <text x="18" y="148" fill="#10b981" fontSize="10" fontWeight="700">+V</text>
      <path d="M 470 160 L 445 160" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrowGreen2)" fill="none"/>
      <text x="472" y="148" fill="#10b981" fontSize="10" fontWeight="700">-V</text>
      {/* Current flow arrows */}
      {[90,140,190,240,290,340,390].map((x, i) => (
        <path key={i} d={`M ${x} 160 L ${x+35} 160`} stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" markerEnd="url(#arrowGreen)" fill="none"/>
      ))}
    </>}

    {/* Voltage label */}
    {active === 'forward-bias' && (
      <text x="250" y="268" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">Current flows freely âŸ¶</text>
    )}

    {/* P-N Junction label */}
    <text x="250" y="50" textAnchor="middle" fill="rgba(139,92,246,0.9)" fontSize="11" fontWeight="600">P-N Junction</text>

    {/* Dots for label connection */}
    <Dot x="125" y="150" active={active === 'p-type'} color="#f43f5e"/>
    <Dot x="375" y="150" active={active === 'n-type'} color="#3b82f6"/>
    <Dot x="250" y="150" active={active === 'depletion'} color="#8b5cf6"/>
    <Dot x="250" y="260" active={active === 'junction'} color="#10b981"/>
    <Dot x="125" y="260" active={active === 'forward-bias'} color="#10b981"/>

    {/* Arrowhead defs */}
    <defs>
      <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#10b981"/>
      </marker>
      <marker id="arrowGreen2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
        <path d="M0,0 L0,6 L6,3 z" fill="#10b981"/>
      </marker>
    </defs>

    {/* Diode symbol at bottom */}
    <g transform="translate(200, 275)" opacity="0.6">
      <line x1="0" y1="10" x2="100" y2="10" stroke="#8b5cf6" strokeWidth="1.5"/>
      <polygon points="30,2 30,18 50,10" fill="#8b5cf6" opacity="0.7"/>
      <line x1="50" y1="2" x2="50" y2="18" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="50" y="30" textAnchor="middle" fill="#8b5cf6" fontSize="9">Diode Symbol</text>
    </g>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ATOM / BOHR'S MODEL
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const AtomScene = (active: string | null) => (
  <svg viewBox="0 0 500 340" style={{ width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="nucleusGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#dc2626"/>
      </radialGradient>
      <filter id="atomGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Electron shells */}
    {[60,110,155].map((r, i) => (
      <ellipse key={i} cx="250" cy="170"
        rx={r} ry={r * 0.35}
        fill="none"
        stroke={active === 'shell' ? `rgba(99,102,241,0.9)` : `rgba(99,102,241,${0.3 + i * 0.1})`}
        strokeWidth={active === 'shell' ? 2 : 1.5}
        strokeDasharray={i === 0 ? "none" : "none"}
        style={{ transition: 'stroke 0.3s ease' }}
        transform={`rotate(${i * 25}, 250, 170)`}
      />
    ))}
    {/* 3D shell effect - second ellipse per shell */}
    {[60,110,155].map((r, i) => (
      <ellipse key={`v${i}`} cx="250" cy="170"
        rx={r * 0.35} ry={r}
        fill="none"
        stroke={active === 'shell' ? `rgba(99,102,241,0.6)` : `rgba(99,102,241,${0.15 + i * 0.05})`}
        strokeWidth={active === 'shell' ? 1.5 : 1}
        strokeDasharray="3 2"
      />
    ))}

    {/* Nucleus */}
    <circle cx="250" cy="170" r={active === 'nucleus' ? 28 : 24}
      fill="url(#nucleusGrad)"
      filter="url(#atomGlow)"
      style={{ transition: 'r 0.3s ease', cursor: 'pointer' }}
    />
    <text x="250" y="174" textAnchor="middle" fill="white" fontSize="9" fontWeight="800">pâº nâ°</text>

    {/* Electrons on shells */}
    {/* Shell 1 - 2 electrons */}
    <circle cx="310" cy="170" r={active === 'electron' ? 9 : 7} fill="#6366f1" filter="url(#atomGlow)" style={{ transition: 'all 0.3s ease' }}/>
    <text x="310" y="174" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">eâ»</text>
    <circle cx="190" cy="170" r={active === 'electron' ? 9 : 7} fill="#6366f1" filter="url(#atomGlow)" style={{ transition: 'all 0.3s ease' }}/>
    <text x="190" y="174" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">eâ»</text>

    {/* Shell 2 - 8 electrons */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const ex = 250 + 110 * Math.cos(rad);
      const ey = 170 + 38 * Math.sin(rad);
      return (
        <React.Fragment key={i}>
          <circle cx={ex} cy={ey} r={active === 'electron' ? 7 : 5} fill="#8b5cf6"
            opacity={active === 'electron' ? 1 : 0.7}
            filter="url(#atomGlow)" style={{ transition: 'all 0.3s ease' }}/>
          <text x={ex} y={ey+3} textAnchor="middle" fill="white" fontSize="7" fontWeight="700">eâ»</text>
        </React.Fragment>
      );
    })}

    {/* Shell 3 - valence electrons */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const ex = 250 + 155 * Math.cos(rad);
      const ey = 170 + 54 * Math.sin(rad);
      return (
        <React.Fragment key={i}>
          <circle cx={ex} cy={ey} r={active === 'orbital' ? 8 : 5} fill="#0ea5e9"
            opacity={active === 'orbital' ? 1 : 0.6}
            filter="url(#atomGlow)" style={{ transition: 'all 0.3s ease' }}/>
          <text x={ex} y={ey+3} textAnchor="middle" fill="white" fontSize="7" fontWeight="700">eâ»</text>
        </React.Fragment>
      );
    })}

    {/* Labels: proton & neutron in nucleus */}
    {active === 'proton' && <>
      <circle cx="240" cy="165" r="6" fill="#ef4444"/>
      <text x="240" y="169" textAnchor="middle" fill="white" fontSize="7" fontWeight="800">pâº</text>
      <circle cx="260" cy="175" r="6" fill="#ef4444"/>
      <text x="260" y="179" textAnchor="middle" fill="white" fontSize="7" fontWeight="800">pâº</text>
    </>}
    {active === 'neutron' && <>
      <circle cx="258" cy="162" r="6" fill="#9ca3af"/>
      <text x="258" y="166" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">nâ°</text>
      <circle cx="242" cy="178" r="6" fill="#9ca3af"/>
      <text x="242" y="182" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">nâ°</text>
    </>}

    {/* Orbital shape label */}
    {active === 'orbital' && (
      <text x="250" y="310" textAnchor="middle" fill="#0ea5e9" fontSize="11" fontWeight="600">Valence Shell — Determines chemical bonding</text>
    )}

    {/* Quantum number labels */}
    <text x="250" y="22" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">Bohr Atomic Model</text>
    <text x="330" y="100" fill="rgba(99,102,241,0.7)" fontSize="10">n=1</text>
    <text x="372" y="78" fill="rgba(139,92,246,0.7)" fontSize="10">n=2</text>
    <text x="415" y="58" fill="rgba(14,165,233,0.7)" fontSize="10">n=3</text>

    <Dot x="250" y="170" active={active === 'nucleus'} color="#f59e0b"/>
    <Dot x="310" y="170" active={active === 'electron'} color="#6366f1"/>
    <Dot x="360" y="170" active={active === 'shell'} color="#8b5cf6"/>
    <Dot x="405" y="170" active={active === 'orbital'} color="#0ea5e9"/>
    <Dot x="250" y="248" active={active === 'proton'} color="#ef4444"/>
    <Dot x="250" y="268" active={active === 'neutron'} color="#9ca3af"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   GRAVITATION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const GravitationScene = (active: string | null) => (
  <svg viewBox="0 0 500 340" style={{ width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="earthGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22c55e"/>
        <stop offset="60%" stopColor="#16a34a"/>
        <stop offset="100%" stopColor="#1e3a8a"/>
      </radialGradient>
      <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fde047"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </radialGradient>
      <filter id="gravGlow">
        <feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Space background dots */}
    {[[30,20],[80,50],[140,10],[450,30],[470,80],[420,15],[60,300],[480,290],[100,320]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.4"/>
    ))}

    {/* Orbital paths */}
    <ellipse cx="250" cy="200" rx="200" ry="130" fill="none"
      stroke={active === 'orbit' ? 'rgba(14,165,233,0.8)' : 'rgba(14,165,233,0.25)'}
      strokeWidth={active === 'orbit' ? 2 : 1.5} strokeDasharray="8 5"/>
    <ellipse cx="250" cy="200" rx="130" ry="85" fill="none"
      stroke="rgba(14,165,233,0.15)" strokeWidth="1" strokeDasharray="4 4"/>

    {/* Sun at focus */}
    <circle cx="140" cy="200" r={active === 'earth' ? 32 : 28} fill="url(#sunGrad)" filter="url(#gravGlow)"/>
    <text x="140" y="204" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="800">Mâ˜‰</text>

    {/* Earth orbiting */}
    <circle cx="430" cy="150" r={active === 'satellite' ? 16 : 14} fill="url(#earthGrad)" filter="url(#gravGlow)"/>
    <text x="430" y="154" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">m</text>

    {/* Satellite */}
    <rect x="318" y="55" width="14" height="10" fill="#94a3b8" rx="2"
      stroke={active === 'satellite' ? '#10b981' : 'rgba(148,163,184,0.5)'} strokeWidth="1.5"/>
    {/* Satellite panels */}
    <rect x="306" y="57" width="12" height="6" fill="#0ea5e9" rx="1" opacity="0.8"/>
    <rect x="332" y="57" width="12" height="6" fill="#0ea5e9" rx="1" opacity="0.8"/>

    {/* Gravity force arrow */}
    {active === 'escape-v' && (
      <>
        <path d="M 430 136 L 430 50 L 470 10" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arrowYellow)"/>
        <text x="458" y="28" fill="#f59e0b" fontSize="10" fontWeight="600">v = 11.2 km/s</text>
        <text x="440" y="100" fill="#f59e0b" fontSize="9">↑ escape</text>
      </>
    )}

    {/* Gravitational field lines */}
    {active === 'center' && [0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      return (
        <line key={i}
          x1={140 + 35 * Math.cos(rad)} y1={200 + 35 * Math.sin(rad)}
          x2={140 + 95 * Math.cos(rad)} y2={200 + 95 * Math.sin(rad)}
          stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5"
          markerEnd="url(#arrowYellow)"/>
      );
    })}

    {/* F = GMm/r² formula */}
    <g transform="translate(170, 290)">
      <rect x="-2" y="-16" width="165" height="24" rx="8" fill="rgba(0,0,0,0.4)" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>
      <text x="80" y="2" textAnchor="middle" fill="#fde047" fontSize="12" fontWeight="700">F = GMm/r²</text>
    </g>

    {/* Kepler label */}
    {active === 'orbit' && (
      <text x="250" y="30" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontWeight="600">Kepler's 1st Law: Elliptical Orbit, Sun at Focus</text>
    )}

    {/* Velocity vector */}
    <path d="M 430 150 L 430 110" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowGreenG)" fill="none" opacity="0.7"/>
    <text x="440" y="130" fill="#10b981" fontSize="9">v_orbital</text>

    <defs>
      <marker id="arrowYellow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/>
      </marker>
      <marker id="arrowGreenG" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#10b981"/>
      </marker>
    </defs>

    <Dot x="140" y="200" active={active === 'earth'} color="#f59e0b"/>
    <Dot x="430" y="150" active={active === 'satellite'} color="#10b981"/>
    <Dot x="330" y="60" active={active === 'orbit'} color="#0ea5e9"/>
    <Dot x="430" y="100" active={active === 'escape-v'} color="#f59e0b"/>
    <Dot x="140" y="260" active={active === 'center'} color="#f59e0b"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ALDEHYDE / ORGANIC CHEMISTRY
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const AldehydeScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <filter id="chemGlow">
        <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Molecule: CH₃-CH₂-CHO (Propanal) */}
    {/* Carbon chain */}
    {/* C1 - CH₃ */}
    <circle cx="100" cy="160" r={active === 'r-group' ? 26 : 22} fill="rgba(20,184,166,0.2)" stroke="#14b8a6" strokeWidth={active === 'r-group' ? 2.5 : 1.5}/>
    <text x="100" y="158" textAnchor="middle" fill="#14b8a6" fontSize="14" fontWeight="800">C</text>
    <text x="100" y="172" textAnchor="middle" fill="#14b8a6" fontSize="9">H₃</text>
    <text x="55" y="155" fill="rgba(14,165,233,0.6)" fontSize="11">CH₃</text>
    <text x="55" y="170" fill="rgba(14,165,233,0.4)" fontSize="9">methyl</text>

    {/* Bond C1-C2 */}
    <line x1="122" y1="160" x2="168" y2="160" stroke="#94a3b8" strokeWidth="2.5"/>

    {/* C2 - CH₂ */}
    <circle cx="190" cy="160" r={active === 'r-group' ? 26 : 22} fill="rgba(20,184,166,0.2)" stroke="#14b8a6" strokeWidth={active === 'r-group' ? 2.5 : 1.5}/>
    <text x="190" y="158" textAnchor="middle" fill="#14b8a6" fontSize="14" fontWeight="800">C</text>
    <text x="190" y="172" textAnchor="middle" fill="#14b8a6" fontSize="9">H₂</text>

    {/* H atoms on C2 */}
    <circle cx="190" cy="118" r="10" fill="rgba(226,232,240,0.2)" stroke="#e2e8f0" strokeWidth="1"/>
    <text x="190" y="122" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600">H</text>
    <line x1="190" y1="138" x2="190" y2="128" stroke="#94a3b8" strokeWidth="1.5"/>
    <circle cx="190" cy="202" r="10" fill="rgba(226,232,240,0.2)" stroke="#e2e8f0" strokeWidth="1"/>
    <text x="190" y="206" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600">H</text>
    <line x1="190" y1="182" x2="190" y2="192" stroke="#94a3b8" strokeWidth="1.5"/>

    {/* Bond C2-C3 */}
    <line x1="212" y1="160" x2="258" y2="160" stroke="#94a3b8" strokeWidth="2.5"/>

    {/* C3 - CHO (the aldehyde carbon) */}
    <circle cx="280" cy="160" r={active === 'aldehyde-h' ? 30 : 26} fill="rgba(245,158,11,0.25)" stroke="#f59e0b" strokeWidth={active === 'aldehyde-h' ? 3 : 2}
      filter={active === 'aldehyde-h' ? 'url(#chemGlow)' : 'none'}/>
    <text x="280" y="157" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="800">C</text>
    <text x="280" y="171" textAnchor="middle" fill="#f59e0b" fontSize="9">aldehyde</text>

    {/* H on aldehyde carbon */}
    <line x1="280" y1="134" x2="280" y2="120" stroke="#94a3b8" strokeWidth="1.5"/>
    <circle cx="280" cy="110" r="12" fill="rgba(226,232,240,0.2)" stroke={active === 'aldehyde-h' ? '#e2e8f0' : '#e2e8f080'} strokeWidth="1.5"/>
    <text x="280" y="114" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="700">H</text>

    {/* C=O double bond (carbonyl) */}
    <line x1="306" y1="155" x2="360" y2="145" stroke={active === 'carbonyl' ? '#ef4444' : '#ef444480'} strokeWidth="3"/>
    <line x1="306" y1="165" x2="360" y2="155" stroke={active === 'carbonyl' ? '#ef4444' : '#ef444480'} strokeWidth="3"/>

    {/* Oxygen */}
    <circle cx="380" cy="150" r={active === 'carbonyl' ? 26 : 22} fill="rgba(239,68,68,0.25)" stroke="#ef4444"
      strokeWidth={active === 'carbonyl' ? 3 : 2} filter={active === 'carbonyl' ? 'url(#chemGlow)' : 'none'}/>
    <text x="380" y="148" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="800">O</text>
    <text x="380" y="162" textAnchor="middle" fill="#ef4444" fontSize="9">δ⁻</text>

    {/* Lone pairs on O */}
    <circle cx="405" cy="138" r="3" fill="#ef4444" opacity="0.6"/>
    <circle cx="412" cy="138" r="3" fill="#ef4444" opacity="0.6"/>
    <circle cx="405" cy="162" r="3" fill="#ef4444" opacity="0.6"/>
    <circle cx="412" cy="162" r="3" fill="#ef4444" opacity="0.6"/>

    {/* δ⁺ on carbonyl carbon */}
    {active === 'nucleophile' && (
      <>
        <text x="280" y="195" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="700">δ⁺</text>
        <path d="M 460 200 C 420 180 380 160 310 160" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5 5" className="ar-flow" markerEnd="url(#arrowNuc)"/>
        <text x="462" y="200" fill="#10b981" fontSize="10" fontWeight="600">Nuâ»</text>
        <text x="462" y="215" fill="#10b981" fontSize="9">attacks here</text>
      </>
    )}

    {/* Tollens' silver mirror */}
    {active === 'tollens' && (
      <>
        <rect x="340" y="250" width="100" height="40" rx="6" fill="rgba(192,192,192,0.3)" stroke="#c0c0c0" strokeWidth="1.5"/>
        <text x="390" y="268" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600">Agâº → Ag</text>
        <text x="390" y="282" textAnchor="middle" fill="#c0c0c0" fontSize="9">Silver Mirror ✨</text>
        <path d="M 280 186 L 340 250" stroke="#c0c0c0" strokeWidth="1" strokeDasharray="3 2"/>
      </>
    )}

    {/* =O label */}
    <text x="345" y="135" fill={active === 'carbonyl' ? '#ef4444' : '#ef444480'} fontSize="11" fontWeight="600">C=O</text>
    <text x="345" y="148" fill={active === 'carbonyl' ? '#ef4444' : '#ef444488'} fontSize="9">carbonyl</text>

    {/* CHO group bracket */}
    <rect x="255" y="92" width="150" height="110" rx="8" fill="none"
      stroke={active === 'carbonyl' || active === 'aldehyde-h' ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.15)'}
      strokeWidth="1.5" strokeDasharray="6 3"/>
    <text x="400" y="105" fill="rgba(245,158,11,0.7)" fontSize="10">─CHO</text>

    <defs>
      <marker id="arrowNuc" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#10b981"/>
      </marker>
    </defs>

    <Dot x="280" y="160" active={active === 'carbonyl'} color="#ef4444"/>
    <Dot x="280" y="110" active={active === 'aldehyde-h'} color="#e2e8f0"/>
    <Dot x="150" y="160" active={active === 'r-group'} color="#14b8a6"/>
    <Dot x="460" y="200" active={active === 'nucleophile'} color="#10b981"/>
    <Dot x="390" y="270" active={active === 'tollens'} color="#c0c0c0"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   WATER CYCLE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const WaterCycleScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02"/>
      </linearGradient>
      <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#16a34a" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#92400e" stopOpacity="0.3"/>
      </linearGradient>
      <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#1e40af" stopOpacity="0.5"/>
      </linearGradient>
    </defs>

    {/* Sky gradient */}
    <rect x="0" y="0" width="500" height="220" fill="url(#skyGrad)"/>

    {/* Sun */}
    <circle cx="60" cy="50" r={active === 'evaporation' ? 32 : 26} fill="#fde04780" stroke="#f59e0b" strokeWidth="2"/>
    <text x="60" y="54" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="800">â˜€</text>
    {active === 'evaporation' && [0,45,90,135,180,225,270,315].map((deg, i) => {
      const rad = deg * Math.PI / 180;
      return <line key={i} x1={60 + 34*Math.cos(rad)} y1={50 + 34*Math.sin(rad)} x2={60 + 46*Math.cos(rad)} y2={50 + 46*Math.sin(rad)} stroke="#f59e0b" strokeWidth="2" opacity="0.7"/>;
    })}

    {/* Cloud */}
    <g opacity={active === 'condensation' ? 1 : 0.8}>
      <ellipse cx="260" cy="70" rx="70" ry="35" fill="white" fillOpacity="0.9" stroke={active === 'condensation' ? '#6366f1' : 'rgba(99,102,241,0.3)'} strokeWidth="1.5"/>
      <ellipse cx="230" cy="80" rx="50" ry="28" fill="white" fillOpacity="0.9"/>
      <ellipse cx="295" cy="80" rx="50" ry="28" fill="white" fillOpacity="0.9"/>
      <text x="260" y="74" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="700">â˜ Cloud</text>
    </g>

    {/* Rain drops */}
    {active === 'precipitation' && [245,255,265,275,285,295,305,250,270,290].map((x, i) => (
      <ellipse key={i} cx={x} cy={100 + (i % 3) * 25} rx="3" ry="6" fill="#0ea5e9" opacity="0.8"
        style={{ animation: `fall ${0.5 + i * 0.1}s linear infinite` }}/>
    ))}

    {/* Mountain / terrain */}
    <polygon points="350,220 410,120 470,220" fill="rgba(148,163,184,0.4)" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5"/>
    <polygon points="300,220 350,140 400,220" fill="rgba(120,113,108,0.3)" stroke="rgba(120,113,108,0.4)" strokeWidth="1.5"/>
    {/* Snow cap */}
    <polygon points="350,120 410,120 390,140 370,140" fill="rgba(255,255,255,0.6)"/>

    {/* Ground */}
    <rect x="0" y="220" width="500" height="50" fill="url(#groundGrad)"/>

    {/* Ocean */}
    <rect x="0" y="230" width="150" height="40" rx="0" fill="url(#oceanGrad)"/>
    <text x="75" y="256" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" opacity="0.8">Ocean</text>

    {/* River */}
    <path d="M 380 210 Q 350 215 320 218 Q 290 220 260 222 Q 230 224 200 225 Q 170 226 150 230"
      stroke="#0ea5e9" strokeWidth="5" fill="none" strokeOpacity="0.7"/>

    {/* Evaporation arrows */}
    {active === 'evaporation' && [40,60,80,100,120].map((x, i) => (
      <path key={i} d={`M ${x} 228 Q ${x + 20} ${190 - i*10} ${x + 10} ${150 - i*10}`}
        stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="4 2" opacity="0.7"/>
    ))}

    {/* Groundwater */}
    {active === 'groundwater' && (
      <>
        <rect x="50" y="245" width="350" height="20" rx="4" fill="rgba(14,165,233,0.2)" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 2"/>
        <text x="225" y="258" textAnchor="middle" fill="#0ea5e9" fontSize="9" fontWeight="600">Groundwater Aquifer</text>
        {[80,130,180,230,280,330].map((x,i) => (
          <circle key={i} cx={x} cy={252} r="3" fill="#0ea5e9" opacity="0.6"/>
        ))}
      </>
    )}

    {/* Runoff arrow */}
    {active === 'runoff' && (
      <path d="M 450 210 Q 400 215 350 218 Q 300 220 250 222 Q 200 224 150 228"
        stroke="#0ea5e9" strokeWidth="3" fill="none" markerEnd="url(#arrowBlue)" strokeOpacity="0.9"/>
    )}

    {/* Cycle arrows */}
    {/* Evap to cloud */}
    <path d="M 100 220 Q 100 100 200 80" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5" fill="none" strokeDasharray="5 3"/>
    {/* Cloud to rain */}
    <path d="M 280 95 L 350 160 L 370 200" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5" fill="none" strokeDasharray="5 3"/>

    <defs>
      <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#0ea5e9"/>
      </marker>
    </defs>

    <Dot x="100" y="225" active={active === 'evaporation'} color="#f59e0b"/>
    <Dot x="260" y="70" active={active === 'condensation'} color="#6366f1"/>
    <Dot x="260" y="100" active={active === 'precipitation'} color="#0ea5e9"/>
    <Dot x="300" y="222" active={active === 'runoff'} color="#0ea5e9"/>
    <Dot x="225" y="255" active={active === 'groundwater'} color="#0ea5e9"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   HEART ANATOMY
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const HeartScene = (active: string | null) => (
  <svg viewBox="0 0 500 340" style={{ width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="heartGrad" cx="50%" cy="60%" r="50%">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#dc2626" stopOpacity="0.2"/>
      </radialGradient>
      <filter id="heartGlow">
        <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Heart outline */}
    <path d="M 250 290 C 100 200 50 140 100 90 C 130 55 185 60 250 110 C 315 60 370 55 400 90 C 450 140 400 200 250 290 Z"
      fill="url(#heartGrad)" stroke="#f43f5e" strokeWidth="2.5"/>

    {/* Septum */}
    <line x1="250" y1="110" x2="250" y2="280" stroke="rgba(244,63,94,0.5)" strokeWidth="3" strokeDasharray="6 3"/>

    {/* Right Atrium */}
    <ellipse cx="305" cy="130" rx="50" ry="35" fill="rgba(248,113,113,0.3)" stroke="#f87171" strokeWidth={active === 'atria' ? 2.5 : 1.5}/>
    <text x="305" y="127" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="700">Right</text>
    <text x="305" y="140" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="700">Atrium</text>

    {/* Left Atrium */}
    <ellipse cx="195" cy="130" rx="50" ry="35" fill="rgba(239,68,68,0.35)" stroke="#ef4444" strokeWidth={active === 'atria' ? 2.5 : 1.5}/>
    <text x="195" y="127" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">Left</text>
    <text x="195" y="140" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">Atrium</text>

    {/* Right Ventricle */}
    <path className="ar-heart-beat" d="M 255 165 Q 320 165 340 200 Q 350 240 290 265 Q 260 278 255 165 Z"
      fill="rgba(252,165,165,0.3)" stroke="#fca5a5" strokeWidth={active === 'right-ventricle' ? 2.5 : 1.5}/>
    <text x="305" y="220" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="700">Right</text>
    <text x="305" y="232" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="700">Ventricle</text>

    {/* Left Ventricle (thicker walls) */}
    <path className="ar-heart-beat" d="M 245 165 Q 180 165 160 200 Q 150 240 210 265 Q 240 278 245 165 Z"
      fill="rgba(220,38,38,0.35)" stroke="#dc2626" strokeWidth={active === 'left-ventricle' ? 3 : 2}/>
    <text x="198" y="220" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="700">Left</text>
    <text x="198" y="232" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="700">Ventricle</text>

    {/* Aorta */}
    <path d="M 215 105 Q 200 60 160 40 Q 120 20 100 50" className="ar-flow"
      stroke={active === 'aorta' ? '#f59e0b' : 'rgba(245,158,11,0.5)'}
      strokeWidth={active === 'aorta' ? 8 : 5} fill="none" strokeLinecap="round"/>
    <text x="130" y="30" fill={active === 'aorta' ? '#f59e0b' : 'rgba(245,158,11,0.7)'} fontSize="10" fontWeight="700">Aorta</text>
    {active === 'aorta' && (
      <path d="M 215 115 Q 200 70 162 48" stroke="#fde047" strokeWidth="2" fill="none" strokeDasharray="3 2"/>
    )}

    {/* Pulmonary Artery */}
    <path d="M 285 105 Q 300 60 340 40 Q 380 20 400 50" className="ar-flow"
      stroke="rgba(147,51,234,0.5)" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <text x="370" y="30" fill="rgba(147,51,234,0.7)" fontSize="9" fontWeight="600">Pulm. Artery</text>

    {/* Vena Cava */}
    <line x1="330" y1="120" x2="380" y2="100" stroke="rgba(59,130,246,0.5)" strokeWidth="5" strokeLinecap="round"/>
    <text x="382" y="98" fill="rgba(59,130,246,0.7)" fontSize="9">Vena Cava</text>

    {/* Valves */}
    {active === 'valves' && (
      <>
        <ellipse cx="250" cy="162" rx="8" ry="5" fill="#10b981" stroke="#10b981" strokeWidth="1.5" opacity="0.8"/>
        <text x="250" y="158" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">AV</text>
        <text x="250" y="148" textAnchor="middle" fill="#10b981" fontSize="9">Valves ✓</text>
      </>
    )}

    {/* Coronary arteries */}
    {active === 'coronary' && (
      <>
        <path d="M 230 115 Q 215 140 220 180 Q 225 220 215 250"
          stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="4 2"/>
        <path d="M 270 115 Q 285 140 280 180 Q 275 220 285 250"
          stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="4 2"/>
        <text x="250" y="310" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="600">Coronary Arteries — feed heart muscle</text>
      </>
    )}

    {/* Blood flow arrows */}
    <path d="M 250 285 L 250 295" stroke="rgba(244,63,94,0.4)" strokeWidth="2"/>
    <text x="250" y="315" textAnchor="middle" fill="rgba(244,63,94,0.6)" fontSize="9">~72 beats / minute</text>

    <Dot x="195" y="130" active={active === 'left-ventricle'} color="#dc2626"/>
    <Dot x="305" y="190" active={active === 'right-ventricle'} color="#fca5a5"/>
    <Dot x="130" y="35" active={active === 'aorta'} color="#f59e0b"/>
    <Dot x="250" y="130" active={active === 'atria'} color="#f87171"/>
    <Dot x="250" y="162" active={active === 'valves'} color="#10b981"/>
    <Dot x="250" y="250" active={active === 'coronary'} color="#f97316"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PRISM / RAY OPTICS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const PrismScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <filter id="prismGlow">
        <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Prism shape */}
    <polygon points="200,60 340,260 60,260"
      fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5"/>
    {/* Glass shimmer */}
    <polygon points="200,60 340,260 60,260"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
    <text x="180" y="200" fill="rgba(99,102,241,0.5)" fontSize="11" fontWeight="600">Glass</text>
    <text x="173" y="215" fill="rgba(99,102,241,0.3)" fontSize="10">μ = 1.5</text>

    {/* Incident white ray */}
    <line x1="20" y1="160" x2="130" y2="160"
      stroke={active === 'incident-ray' ? 'white' : 'rgba(255,255,255,0.7)'}
      strokeWidth={active === 'incident-ray' ? 4 : 2.5}
      filter={active === 'incident-ray' ? 'url(#prismGlow)' : 'none'}/>
    <text x="10" y="148" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="600">White</text>
    <text x="10" y="162" fill="rgba(255,255,255,0.5)" fontSize="9">light</text>

    {/* Normal line at incidence */}
    <line x1="130" y1="120" x2="130" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3"/>

    {/* Angle of incidence arc */}
    <path d="M 150 160 A 20 20 0 0 1 130 140" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
    <text x="152" y="150" fill="rgba(255,255,255,0.5)" fontSize="9">Î¸â‚</text>

    {/* VIBGYOR dispersed rays */}
    {[
      { color: '#8b5cf6', label: 'V', endX: 460, endY: 90,  startX: 270, startY: 185, bend: 52 },
      { color: '#6366f1', label: 'I', endX: 460, endY: 110, startX: 270, startY: 188, bend: 46 },
      { color: '#3b82f6', label: 'B', endX: 460, endY: 135, startX: 270, startY: 193, bend: 40 },
      { color: '#10b981', label: 'G', endX: 460, endY: 160, startX: 270, startY: 198, bend: 34 },
      { color: '#fde047', label: 'Y', endX: 460, endY: 188, startX: 270, startY: 203, bend: 28 },
      { color: '#f97316', label: 'O', endX: 460, endY: 216, startX: 270, startY: 208, bend: 22 },
      { color: '#ef4444', label: 'R', endX: 460, endY: 244, startX: 270, startY: 215, bend: 14 },
    ].map((ray, i) => (
      <React.Fragment key={i}>
        <line x1={ray.startX} y1={ray.startY} x2={ray.endX} y2={ray.endY}
          stroke={ray.color}
          strokeWidth={active === 'dispersion' || (active === 'violet-ray' && i === 0) || (active === 'red-ray' && i === 6) ? 3.5 : 2}
          opacity={active === 'dispersion' || active === `${ray.label.toLowerCase()}-ray` || (!active) ? 1 : 0.3}
          filter={active === 'dispersion' ? 'url(#prismGlow)' : 'none'}/>
        <text x={ray.endX + 5} y={ray.endY + 4} fill={ray.color} fontSize="11" fontWeight="700"
          opacity={active === 'dispersion' || !active ? 1 : 0.3}>{ray.label}</text>
      </React.Fragment>
    ))}

    {/* Refracted ray inside prism */}
    <line x1="130" y1="160" x2="270" y2="200" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="5 2"/>

    {/* Normal at exit face */}
    <line x1="285" y1="155" x2="255" y2="245" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3"/>

    {/* Labels */}
    {active === 'violet-ray' && (
      <text x="250" y="30" textAnchor="middle" fill="#8b5cf6" fontSize="11" fontWeight="600">Violet: λ ≈ 400nm — Highest refraction (bends most)</text>
    )}
    {active === 'red-ray' && (
      <text x="250" y="30" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="600">Red: λ ≈ 700nm — Lowest refraction (bends least)</text>
    )}
    {active === 'incident-ray' && (
      <text x="250" y="290" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Snell's Law: nâ‚ sin Î¸â‚ = n₂ sin θ₂</text>
    )}

    {/* VIBGYOR label */}
    <text x="465" y="168" fill="rgba(255,255,255,0.5)" fontSize="9">VIBGYOR</text>

    <Dot x="70" y="160" active={active === 'incident-ray'} color="white"/>
    <Dot x="200" y="185" active={active === 'dispersion'} color="#fde047"/>
    <Dot x="460" y="90" active={active === 'violet-ray'} color="#8b5cf6"/>
    <Dot x="460" y="244" active={active === 'red-ray'} color="#ef4444"/>
    <Dot x="285" y="160" active={active === 'refracted-ray'} color="#6366f1"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CRYSTAL STRUCTURE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const CrystalScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <filter id="crystalGlow">
        <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* FCC structure - 3D cube isometric */}
    {/* Back face */}
    <polygon points="130,80 230,80 280,130 180,130" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"/>
    {/* Left face */}
    <polygon points="130,80 130,200 180,250 180,130" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5"/>
    {/* Top face */}
    <polygon points="130,80 230,80 280,130 180,130" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"/>
    {/* Front face */}
    <polygon points="130,200 230,200 280,250 180,250" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.45)" strokeWidth="1.5"/>
    {/* Right face */}
    <polygon points="230,80 230,200 280,250 280,130" fill="rgba(99,102,241,0.07)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"/>

    {/* Lattice lines */}
    {/* Horizontal edges */}
    <line x1="130" y1="80" x2="230" y2="80" stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>
    <line x1="180" y1="130" x2="280" y2="130" stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>
    <line x1="130" y1="200" x2="230" y2="200" stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>
    <line x1="180" y1="250" x2="280" y2="250" stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>

    {/* Corner atoms - BCC/FCC */}
    {[
      [130,80],[230,80],[130,200],[230,200], // front corners
      [180,130],[280,130],[180,250],[280,250], // back corners
    ].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r={active === 'lattice-point' ? 12 : 9}
        fill="rgba(99,102,241,0.4)" stroke="#6366f1" strokeWidth="2"
        filter={active === 'lattice-point' ? 'url(#crystalGlow)' : 'none'}/>
    ))}

    {/* Face-center atoms (FCC) */}
    {[
      [180,80],[205,115],[130,140],[230,140],[205,165],[180,200],
      [230,130],[280,190],[205,250]
    ].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r={active === 'fcc' ? 11 : 8}
        fill="rgba(14,165,233,0.5)" stroke="#0ea5e9" strokeWidth="1.5"
        filter={active === 'fcc' ? 'url(#crystalGlow)' : 'none'}/>
    ))}

    {/* Body-center atom (BCC) */}
    <circle cx="205" cy="165" r={active === 'bcc' ? 14 : 10}
      fill="rgba(20,184,166,0.6)" stroke="#14b8a6" strokeWidth="2"
      filter={active === 'bcc' ? 'url(#crystalGlow)' : 'none'}/>

    {/* Unit cell bracket */}
    {active === 'unit-cell' && (
      <>
        <rect x="115" y="65" width="175" height="200" rx="4" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3"/>
        <text x="204" y="55" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">Unit Cell</text>
      </>
    )}

    {/* Schottky defect */}
    {active === 'vacancy' && (
      <>
        <circle cx="230" cy="200" r="12" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2"/>
        <text x="230" y="215" textAnchor="middle" fill="#f43f5e" fontSize="9">vacancy!</text>
        <line x1="224" y1="194" x2="236" y2="206" stroke="#f43f5e" strokeWidth="1.5"/>
        <line x1="236" y1="194" x2="224" y2="206" stroke="#f43f5e" strokeWidth="1.5"/>
      </>
    )}

    {/* Second BCC structure on right */}
    <g transform="translate(170,0)" opacity="0.5">
      <polygon points="130,80 230,80 280,130 180,130" fill="none" stroke="rgba(20,184,166,0.3)" strokeWidth="1" strokeDasharray="3 2"/>
      <polygon points="130,200 230,200 280,250 180,250" fill="none" stroke="rgba(20,184,166,0.3)" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="200" y="165" textAnchor="middle" fill="rgba(20,184,166,0.5)" fontSize="9">BCC</text>
    </g>

    {/* Labels */}
    <text x="100" y="160" fill="rgba(99,102,241,0.7)" fontSize="11" fontWeight="700">FCC</text>
    <text x="100" y="175" fill="rgba(99,102,241,0.5)" fontSize="9">74% packing</text>

    <g transform="translate(20,260)">
      <circle cx="10" cy="8" r="6" fill="rgba(99,102,241,0.5)" stroke="#6366f1" strokeWidth="1.5"/>
      <text x="20" y="12" fill="rgba(99,102,241,0.8)" fontSize="9">Corner atom</text>
      <circle cx="90" cy="8" r="6" fill="rgba(14,165,233,0.5)" stroke="#0ea5e9" strokeWidth="1.5"/>
      <text x="100" y="12" fill="rgba(14,165,233,0.8)" fontSize="9">Face center</text>
      <circle cx="185" cy="8" r="6" fill="rgba(20,184,166,0.6)" stroke="#14b8a6" strokeWidth="1.5"/>
      <text x="195" y="12" fill="rgba(20,184,166,0.8)" fontSize="9">Body center</text>
    </g>

    <Dot x="180" y="165" active={active === 'unit-cell'} color="#f59e0b"/>
    <Dot x="205" y="130" active={active === 'fcc'} color="#0ea5e9"/>
    <Dot x="205" y="165" active={active === 'bcc'} color="#14b8a6"/>
    <Dot x="130" y="80" active={active === 'lattice-point'} color="#6366f1"/>
    <Dot x="230" y="200" active={active === 'vacancy'} color="#f43f5e"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SHM - SIMPLE HARMONIC MOTION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const SHMScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    {/* Spring-mass system */}
    {/* Ceiling */}
    <rect x="30" y="30" width="180" height="8" rx="2" fill="rgba(148,163,184,0.5)" stroke="#94a3b8" strokeWidth="1"/>

    {/* Spring coils */}
    <path d="M 120 38 Q 100 50 140 60 Q 100 70 140 80 Q 100 90 140 100 Q 100 110 140 120 Q 100 130 140 140 Q 100 150 140 160 Q 120 165 120 170"
      stroke={active === 'spring' ? '#8b5cf6' : 'rgba(139,92,246,0.6)'}
      strokeWidth={active === 'spring' ? 2.5 : 2} fill="none"
      filter={active === 'spring' ? 'url(#crystalGlow)' : 'none'}/>

    {/* Mass block */}
    <rect x="90" y="170" width="60" height="50" rx="6"
      fill={active === 'equilibrium' ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.2)'}
      stroke="#10b981" strokeWidth={active === 'equilibrium' ? 2.5 : 1.5}/>
    <text x="120" y="200" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="700">m</text>
    <text x="120" y="212" textAnchor="middle" fill="#10b981" fontSize="9">mass</text>

    {/* Equilibrium line */}
    <line x1="30" y1="195" x2="230" y2="195" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" strokeDasharray="6 3"/>
    <text x="238" y="199" fill="rgba(16,185,129,0.6)" fontSize="9">equilibrium</text>

    {/* Amplitude arrows */}
    {active === 'amplitude' && (
      <>
        <line x1="160" y1="120" x2="160" y2="270" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2"/>
        <line x1="155" y1="120" x2="165" y2="120" stroke="#f59e0b" strokeWidth="2"/>
        <line x1="155" y1="270" x2="165" y2="270" stroke="#f59e0b" strokeWidth="2"/>
        <line x1="160" y1="195" x2="160" y2="120" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowY)"/>
        <text x="170" y="160" fill="#f59e0b" fontSize="10" fontWeight="600">A</text>
        <text x="168" y="155" fill="#f59e0b" fontSize="9">amplitude</text>
      </>
    )}

    {/* Sine wave (displacement graph) */}
    <line x1="250" y1="80" x2="250" y2="280" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <line x1="240" y1="180" x2="490" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <text x="488" y="175" fill="rgba(255,255,255,0.4)" fontSize="9">t</text>
    <text x="243" y="90" fill="rgba(255,255,255,0.4)" fontSize="9">x</text>
    <text x="255" y="115" fill="rgba(255,255,255,0.3)" fontSize="8">A</text>
    <text x="255" y="250" fill="rgba(255,255,255,0.3)" fontSize="8">-A</text>

    <path d="M 260 180 Q 285 110 310 180 Q 335 250 360 180 Q 385 110 410 180 Q 435 250 460 180 Q 475 135 485 180"
      stroke={active === 'phase' ? '#6366f1' : active === 'amplitude' ? '#f59e0b' : '#6366f1'}
      strokeWidth="2.5" fill="none" opacity={active === 'phase' ? 1 : 0.7}/>

    {/* Period label */}
    {active === 'pendulum-bob' && (
      <>
        <path d="M 260 150 L 310 150" stroke="#0ea5e9" strokeWidth="1.5" markerEnd="url(#arrowB)"/>
        <path d="M 360 150 L 310 150" stroke="#0ea5e9" strokeWidth="1.5" markerEnd="url(#arrowB2)"/>
        <text x="310" y="145" textAnchor="middle" fill="#0ea5e9" fontSize="9">T = 2Ï€âˆš(L/g)</text>
      </>
    )}

    {/* Pendulum */}
    <circle cx="410" cy="38" r="5" fill="rgba(148,163,184,0.5)" stroke="#94a3b8" strokeWidth="1"/>
    <line x1="410" y1="38" x2={active === 'amplitude' ? '375' : '410'} y2="150"
      stroke="rgba(148,163,184,0.5)" strokeWidth="1.5"/>
    <circle cx={active === 'amplitude' ? '375' : '410'} cy="155" r="16"
      fill={active === 'pendulum-bob' ? 'rgba(14,165,233,0.5)' : 'rgba(14,165,233,0.25)'}
      stroke="#0ea5e9" strokeWidth={active === 'pendulum-bob' ? 2 : 1.5}/>
    <text x={active === 'amplitude' ? '375' : '410'} y="159" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontWeight="700">m</text>

    {/* F = -kx */}
    {active === 'spring' && (
      <text x="120" y="270" textAnchor="middle" fill="#8b5cf6" fontSize="12" fontWeight="700">F = -kx</text>
    )}
    {active === 'equilibrium' && (
      <text x="120" y="270" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="600">F = 0, v = max</text>
    )}

    <defs>
      <marker id="arrowY" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/>
      </marker>
      <marker id="arrowB" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#0ea5e9"/>
      </marker>
      <marker id="arrowB2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
        <path d="M0,0 L0,6 L6,3 z" fill="#0ea5e9"/>
      </marker>
    </defs>

    <Dot x="120" y="195" active={active === 'equilibrium'} color="#10b981"/>
    <Dot x="120" y="120" active={active === 'amplitude'} color="#f59e0b"/>
    <Dot x="120" y="100" active={active === 'spring'} color="#8b5cf6"/>
    <Dot x="410" y="155" active={active === 'pendulum-bob'} color="#0ea5e9"/>
    <Dot x="310" y="140" active={active === 'phase'} color="#6366f1"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MITOSIS / CELL DIVISION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const MitosisScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="cellGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#10b981" stopOpacity="0.04"/>
      </radialGradient>
      <filter id="cellGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>

    {/* Phase labels */}
    {['Prophase','Metaphase','Anaphase','Telophase'].map((p,i) => (
      <text key={i} x={62 + i * 112} y="20" textAnchor="middle"
        fill={active === p.toLowerCase() ? '#10b981' : 'rgba(16,185,129,0.5)'}
        fontSize="10" fontWeight="700">{p}</text>
    ))}

    {/* PROPHASE */}
    <g opacity={active === 'prophase' || !active ? 1 : 0.4}>
      <ellipse cx="62" cy="160" rx="48" ry="55" fill="url(#cellGrad)" stroke={active === 'prophase' ? '#10b981' : 'rgba(16,185,129,0.4)'} strokeWidth={active === 'prophase' ? 2 : 1.5}/>
      {/* Condensing chromosomes */}
      {[[52,145],[72,145],[52,165],[72,165],[52,185],[72,185]].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="3" fill="#10b981" opacity="0.7" transform={`rotate(${i*30},${x},${y})`}/>
      ))}
      <text x="62" y="230" textAnchor="middle" fill="rgba(16,185,129,0.5)" fontSize="8">Chromosomes condense</text>
    </g>

    {/* METAPHASE */}
    <g opacity={active === 'metaphase' || !active ? 1 : 0.4}>
      <ellipse cx="174" cy="160" rx="48" ry="55" fill="url(#cellGrad)" stroke={active === 'metaphase' ? '#10b981' : 'rgba(16,185,129,0.4)'} strokeWidth={active === 'metaphase' ? 2 : 1.5}/>
      {/* Spindle fibers */}
      {[[-1,1],[-1,-1],[1,1],[1,-1]].map(([sx,sy],i) => (
        <line key={i} x1={174 + sx * 2} y1={sy > 0 ? 215 : 105} x2={174} y2={160} stroke="rgba(14,165,233,0.4)" strokeWidth="1" strokeDasharray="3 2"/>
      ))}
      {/* Chromosomes at plate */}
      {[155,165,175,185,195].map((x,i) => (
        <ellipse key={i} cx={x} cy="160" rx="5" ry="8" fill="#10b981" opacity="0.8"/>
      ))}
      <text x="174" y="230" textAnchor="middle" fill="rgba(16,185,129,0.5)" fontSize="8">Align at equator</text>
    </g>

    {/* ANAPHASE */}
    <g opacity={active === 'anaphase' || !active ? 1 : 0.4}>
      <ellipse cx="286" cy="160" rx="48" ry="55" fill="url(#cellGrad)" stroke={active === 'anaphase' ? '#10b981' : 'rgba(16,185,129,0.4)'} strokeWidth={active === 'anaphase' ? 2 : 1.5}/>
      {/* Chromosomes moving to poles */}
      {[270,280,290,300].map((x,i) => (
        <React.Fragment key={i}>
          <ellipse cx={x} cy="125" rx="5" ry="7" fill="#10b981" opacity="0.8"/>
          <ellipse cx={x} cy="195" rx="5" ry="7" fill="#10b981" opacity="0.8"/>
        </React.Fragment>
      ))}
      {/* Spindle arrows */}
      <path d="M 286 148 L 286 120" stroke="#0ea5e9" strokeWidth="1.5" markerEnd="url(#arrowC)" fill="none" opacity="0.5"/>
      <path d="M 286 172 L 286 200" stroke="#0ea5e9" strokeWidth="1.5" markerEnd="url(#arrowC2)" fill="none" opacity="0.5"/>
      <text x="286" y="230" textAnchor="middle" fill="rgba(16,185,129,0.5)" fontSize="8">Pull apart to poles</text>
    </g>

    {/* TELOPHASE — 2 daughter cells */}
    <g opacity={active === 'telophase' || !active ? 1 : 0.4}>
      <ellipse cx="398" cy="130" rx="42" ry="38" fill="url(#cellGrad)" stroke={active === 'telophase' ? '#10b981' : 'rgba(16,185,129,0.4)'} strokeWidth={active === 'telophase' ? 2 : 1.5}/>
      {[385,395,405,415].map((x,i) => (
        <ellipse key={i} cx={x} cy="130" rx="4" ry="6" fill="#10b981" opacity="0.7"/>
      ))}
      <ellipse cx="398" cy="200" rx="42" ry="38" fill="url(#cellGrad)" stroke={active === 'telophase' ? '#10b981' : 'rgba(16,185,129,0.4)'} strokeWidth={active === 'telophase' ? 2 : 1.5}/>
      {[385,395,405,415].map((x,i) => (
        <ellipse key={i} cx={x} cy="200" rx="4" ry="6" fill="#10b981" opacity="0.7"/>
      ))}
      <text x="398" y="255" textAnchor="middle" fill="rgba(16,185,129,0.5)" fontSize="8">2 daughter cells (2n)</text>
    </g>

    {/* Arrows between phases */}
    {[110,222,334].map((x,i) => (
      <path key={i} d={`M ${x} 160 L ${x+12} 160`} stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" markerEnd="url(#arrowC)" fill="none"/>
    ))}

    <defs>
      <marker id="arrowC" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#10b981" opacity="0.7"/>
      </marker>
      <marker id="arrowC2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#0ea5e9" opacity="0.7"/>
      </marker>
    </defs>

    <Dot x="62" y="160" active={active === 'prophase'} color="#10b981"/>
    <Dot x="174" y="160" active={active === 'metaphase'} color="#10b981"/>
    <Dot x="286" y="160" active={active === 'anaphase'} color="#0ea5e9"/>
    <Dot x="398" y="160" active={active === 'telophase'} color="#10b981"/>
    <Dot x="174" y="115" active={active === 'spindle'} color="#0ea5e9"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CHEMICAL BOND / VSEPR
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const ChemBondScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <filter id="bondGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>

    {/* Covalent: H₂O water molecule */}
    <text x="125" y="22" textAnchor="middle" fill="rgba(14,165,233,0.8)" fontSize="11" fontWeight="700">Covalent: H₂O</text>
    {/* O atom */}
    <circle cx="125" cy="120" r={active === 'covalent' ? 30 : 25} fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="2" filter={active === 'covalent' ? 'url(#bondGlow)' : 'none'}/>
    <text x="125" y="124" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="800">O</text>
    {/* H atoms */}
    <circle cx="70" cy="175" r="18" fill="rgba(226,232,240,0.2)" stroke="#e2e8f0" strokeWidth="1.5"/>
    <text x="70" y="180" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700">H</text>
    <circle cx="180" cy="175" r="18" fill="rgba(226,232,240,0.2)" stroke="#e2e8f0" strokeWidth="1.5"/>
    <text x="180" y="180" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700">H</text>
    {/* Bonds */}
    <line x1="107" y1="136" x2="85" y2="160" stroke="#e2e8f0" strokeWidth="3"/>
    <line x1="143" y1="136" x2="165" y2="160" stroke="#e2e8f0" strokeWidth="3"/>
    {/* Lone pairs */}
    <ellipse cx="110" cy="97" rx="10" ry="5" fill="rgba(239,68,68,0.5)" transform="rotate(-30, 110, 97)"/>
    <ellipse cx="140" cy="97" rx="10" ry="5" fill="rgba(239,68,68,0.5)" transform="rotate(30, 140, 97)"/>
    {/* Angle */}
    <path d="M 90 170 A 50 50 0 0 1 160 170" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 3"/>
    <text x="125" y="215" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">104.5Â° bond angle</text>
    {/* Dipole */}
    {active === 'polar' && (
      <>
        <path d="M 125 88 L 125 60" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowPol)" fill="none"/>
        <text x="125" y="55" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="600">δ⁻ (net dipole)</text>
        <text x="125" y="245" textAnchor="middle" fill="#f59e0b" fontSize="9">Polar molecule — forms H-bonds!</text>
      </>
    )}

    {/* Ionic: NaCl */}
    <text x="350" y="22" textAnchor="middle" fill="rgba(245,158,11,0.8)" fontSize="11" fontWeight="700">Ionic: NaCl</text>
    {/* Na+ */}
    <circle cx="310" cy="120" r={active === 'ionic' ? 30 : 25} fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="2" filter={active === 'ionic' ? 'url(#bondGlow)' : 'none'}/>
    <text x="310" y="117" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="800">Na</text>
    <text x="310" y="131" textAnchor="middle" fill="#f59e0b" fontSize="10">âº</text>
    {/* Cl- */}
    <circle cx="390" cy="120" r={active === 'ionic' ? 36 : 30} fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth="2" filter={active === 'ionic' ? 'url(#bondGlow)' : 'none'}/>
    <text x="390" y="117" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="800">Cl</text>
    <text x="390" y="131" textAnchor="middle" fill="#10b981" fontSize="10">â»</text>
    {/* Electron transfer arrow */}
    <path d="M 328 108 Q 350 85 372 108" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arrowRed)" strokeDasharray="4 2"/>
    <text x="350" y="83" textAnchor="middle" fill="#ef4444" fontSize="9">eâ» transfer</text>
    {/* Electrostatic attraction */}
    <text x="350" y="175" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Electrostatic attraction</text>
    <text x="350" y="188" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">F = kqâ‚qâ‚‚/r²</text>

    {/* Metallic bond bottom */}
    {active === 'metallic' && (
      <g>
        <text x="250" y="255" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="600">Metallic: Sea of Free Electrons</text>
        {[60,100,140,180,220,260,300,340,380,420,460].map((x,i) => (
          <React.Fragment key={i}>
            <circle cx={x} cy="295" r="8" fill="rgba(245,158,11,0.4)" stroke="#f59e0b" strokeWidth="1.5"/>
            {i % 2 === 0 && <circle cx={x + 15} cy="283" r="4" fill="#f59e0b" opacity="0.7"/>}
          </React.Fragment>
        ))}
      </g>
    )}

    <defs>
      <marker id="arrowPol" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/>
      </marker>
      <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#ef4444"/>
      </marker>
    </defs>

    <Dot x="125" y="120" active={active === 'covalent'} color="#0ea5e9"/>
    <Dot x="310" y="120" active={active === 'ionic'} color="#f59e0b"/>
    <Dot x="125" y="90" active={active === 'polar'} color="#f59e0b"/>
    <Dot x="125" y="170" active={active === 'lone-pair'} color="#ef4444"/>
    <Dot x="250" y="270" active={active === 'metallic'} color="#f59e0b"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   QUADRATIC EQUATION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const QuadraticScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    {/* Axes */}
    <line x1="50" y1="280" x2="460" y2="280" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <line x1="250" y1="20" x2="250" y2="290" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <text x="465" y="283" fill="rgba(255,255,255,0.4)" fontSize="10">x</text>
    <text x="245" y="16" fill="rgba(255,255,255,0.4)" fontSize="10">y</text>

    {/* Grid */}
    {[100,150,200,300,350,400].map(x => (
      <line key={x} x1={x} y1="25" x2={x} y2="285" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
    ))}
    {[50,100,150,200,230,260].map(y => (
      <line key={y} x1="45" y1={y} x2="460" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
    ))}

    {/* Parabola: y = xÂ² - 4x + 3  (roots: x=1,3; vertex: x=2, y=-1) */}
    {/* Scale: x=0 maps to px=250 (center), y=0 maps to py=280, scale=40px per unit */}
    <path
      d={Array.from({length: 81}, (_,i) => {
        const x = -4 + i * 0.1;
        const y = x*x - 4*x + 3;
        const px = 250 + x * 42;
        const py = 280 - y * 42;
        return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
      }).join(' ')}
      stroke={active === 'parabola' ? '#10b981' : 'rgba(16,185,129,0.8)'}
      strokeWidth={active === 'parabola' ? 3 : 2} fill="none"
      style={{ filter: active === 'parabola' ? 'drop-shadow(0 0 6px #10b981)' : 'none' }}
    />

    {/* Shaded area under parabola */}
    <path
      d="M 124 280 L 124 185 Q 170 240 208 238 Q 220 237 250 322 Q 280 237 292 238 Q 330 240 376 185 L 376 280 Z"
      fill="rgba(16,185,129,0.06)" opacity={active === 'roots' ? 0.8 : 0.3}/>

    {/* Root markers x=1, x=3 */}
    <circle cx={250 + 1*42} cy="280" r={active === 'roots' ? 9 : 6} fill="#f43f5e" stroke="#f43f5e" strokeWidth="1"/>
    <circle cx={250 + 3*42} cy="280" r={active === 'roots' ? 9 : 6} fill="#f43f5e" stroke="#f43f5e" strokeWidth="1"/>
    <text x={250 + 1*42} y="298" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="700">x=1</text>
    <text x={250 + 3*42} y="298" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="700">x=3</text>

    {/* Vertex at (2, -1) — in screen: (250+2*42, 280-(-1)*42) = (334, 322) — clipped to (334, 280) */}
    {/* Actually vertex at (2,-1) is below x-axis, let's show it */}
    <circle cx={250 + 2*42} cy={280 + 1*42 > 305 ? 305 : 280 + 1*42}
      r={active === 'vertex' ? 10 : 7}
      fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5"
      style={{ filter: active === 'vertex' ? 'drop-shadow(0 0 8px #f59e0b)' : 'none' }}/>
    <line x1={250 + 2*42} y1="280" x2={250 + 2*42} y2="25" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="5 3"/>
    <text x={250 + 2*42 + 8} y="300" fill="#f59e0b" fontSize="9" fontWeight="600">vertex (2,-1)</text>

    {/* Axis of symmetry */}
    {active === 'axis' && (
      <>
        <line x1={250 + 2*42} y1="20" x2={250 + 2*42} y2="285" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4"/>
        <text x={250 + 2*42 + 6} y="35" fill="#f59e0b" fontSize="10" fontWeight="600">x = 2</text>
        <text x={250 + 2*42 + 6} y="48" fill="#f59e0b" fontSize="9">axis of symmetry</text>
      </>
    )}

    {/* Discriminant formula */}
    <g transform="translate(30, 30)">
      <rect x="-4" y="-16" width="170" height="24" rx="8" fill="rgba(0,0,0,0.5)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
      <text x="80" y="2" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">y = xÂ² - 4x + 3</text>
    </g>
    {/* Discriminant */}
    <g transform="translate(30, 58)">
      <rect x="-4" y="-14" width="175" height="22" rx="6" fill="rgba(0,0,0,0.4)" stroke="rgba(244,63,94,0.3)" strokeWidth="1"/>
      <text x="83" y="2" textAnchor="middle" fill="#f43f5e" fontSize="10">Î” = bÂ²-4ac = 16-12 = 4 &gt; 0</text>
    </g>
    <text x="50" y="100" fill="rgba(244,63,94,0.7)" fontSize="9">→ 2 real roots ✓</text>

    {/* Quadratic formula */}
    {active === 'formula' && (
      <g transform="translate(25, 110)">
        <rect x="-4" y="-16" width="205" height="24" rx="8" fill="rgba(0,0,0,0.6)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
        <text x="97" y="2" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="700">x = (-b Â± âˆšÎ”) / 2a</text>
      </g>
    )}

    <Dot x="50" y="50" active={active === 'parabola'} color="#10b981"/>
    <Dot x="50" y="67" active={active === 'roots'} color="#f43f5e"/>
    <Dot x={`${(250 + 2*42) / 5}`} y="60" active={active === 'vertex'} color="#f59e0b"/>
    <Dot x={`${(250 + 2*42) / 5}`} y="37" active={active === 'axis'} color="#f59e0b"/>
    <Dot x="50" y="80" active={active === 'formula'} color="#f59e0b"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COORDINATE GEOMETRY
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const CoordGeomScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    {/* Axes */}
    <line x1="50" y1="160" x2="460" y2="160" stroke="rgba(255,255,255,0.4)" strokeWidth="2" markerEnd="url(#arrowW)"/>
    <line x1="250" y1="15" x2="250" y2="305" stroke="rgba(255,255,255,0.4)" strokeWidth="2" markerEnd="url(#arrowW2)"/>
    <text x="465" y="164" fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="600">X</text>
    <text x="244" y="12" fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="600">Y</text>
    {/* Origin */}
    <text x="255" y="174" fill="rgba(255,255,255,0.5)" fontSize="10">O</text>

    {/* Grid lines */}
    {[-4,-3,-2,-1,1,2,3,4].map(n => (
      <React.Fragment key={n}>
        <line x1={250+n*50} y1="25" x2={250+n*50} y2="305" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <line x1="50" y1={160-n*50} x2="460" y2={160-n*50} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <text x={250+n*50} y="174" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">{n}</text>
        <text x="240" y={160-n*50+4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">{n}</text>
      </React.Fragment>
    ))}

    {/* Points A(1,3) B(4,1) C(1,-2) */}
    {/* A */}
    <circle cx={250+1*50} cy={160-3*50} r={active === 'distance' ? 9 : 7} fill="#10b981" style={{ filter: 'drop-shadow(0 0 5px #10b981)' }}/>
    <text x={250+1*50+8} y={160-3*50-5} fill="#10b981" fontSize="11" fontWeight="700">A(1,3)</text>
    {/* B */}
    <circle cx={250+4*50} cy={160-1*50} r={active === 'distance' ? 9 : 7} fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 5px #f59e0b)' }}/>
    <text x={250+4*50+8} y={160-1*50-5} fill="#f59e0b" fontSize="11" fontWeight="700">B(4,1)</text>
    {/* C */}
    <circle cx={250+1*50} cy={160+2*50} r={active === 'area' ? 9 : 7} fill="#ef4444" style={{ filter: 'drop-shadow(0 0 5px #ef4444)' }}/>
    <text x={250+1*50+8} y={160+2*50+14} fill="#ef4444" fontSize="11" fontWeight="700">C(1,-2)</text>

    {/* Triangle ABC */}
    <polygon
      points={`${250+1*50},${160-3*50} ${250+4*50},${160-1*50} ${250+1*50},${160+2*50}`}
      fill="rgba(16,185,129,0.08)" stroke={active === 'area' ? '#10b981' : 'rgba(16,185,129,0.3)'} strokeWidth={active === 'area' ? 2 : 1.5} strokeDasharray={active === 'area' ? 'none' : '5 3'}/>

    {/* Distance line AB */}
    {active === 'distance' && (
      <>
        <line x1={250+1*50} y1={160-3*50} x2={250+4*50} y2={160-1*50} stroke="#f59e0b" strokeWidth="2.5"/>
        <text x={250+2.5*50} y={160-2.5*50-10} textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">
          d = âˆš((4-1)Â²+(1-3)Â²) = âˆš13
        </text>
      </>
    )}

    {/* Section formula midpoint */}
    {active === 'midpoint' && (
      <>
        <circle cx={250+2.5*50} cy={160-2*50} r="7" fill="#8b5cf6" stroke="#8b5cf6"/>
        <text x={250+2.5*50+8} y={160-2*50+4} fill="#8b5cf6" fontSize="10" fontWeight="700">M(2.5, 2)</text>
        <text x={250+2.5*50+8} y={160-2*50+16} fill="#8b5cf6" fontSize="9">midpoint of AB</text>
        <line x1={250+1*50} y1={160-3*50} x2={250+2.5*50} y2={160-2*50} stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 2"/>
        <line x1={250+2.5*50} y1={160-2*50} x2={250+4*50} y2={160-1*50} stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 2"/>
      </>
    )}

    {/* Area formula */}
    {active === 'area' && (
      <g transform="translate(30, 30)">
        <rect x="-4" y="-16" width="240" height="24" rx="8" fill="rgba(0,0,0,0.6)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"/>
        <text x="116" y="2" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">Area = Â½|xâ‚(yâ‚‚-yâ‚ƒ)+xâ‚‚(yâ‚ƒ-yâ‚)+xâ‚ƒ(yâ‚-yâ‚‚)|</text>
      </g>
    )}

    <defs>
      <marker id="arrowW" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,0 L0,8 L8,4 z" fill="rgba(255,255,255,0.6)"/>
      </marker>
      <marker id="arrowW2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,0 L0,8 L8,4 z" fill="rgba(255,255,255,0.6)"/>
      </marker>
    </defs>

    <Dot x="60" y="35" active={active === 'distance'} color="#f59e0b"/>
    <Dot x="60" y="50" active={active === 'midpoint'} color="#8b5cf6"/>
    <Dot x="60" y="65" active={active === 'area'} color="#10b981"/>
    <Dot x="60" y="80" active={active === 'quadrant'} color="#0ea5e9"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DERIVATIVE / CALCULUS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const DerivativeScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    {/* Axes */}
    <line x1="40" y1="260" x2="470" y2="260" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <line x1="60" y1="20" x2="60" y2="270" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <text x="475" y="263" fill="rgba(255,255,255,0.4)" fontSize="10">x</text>
    <text x="55" y="16" fill="rgba(255,255,255,0.4)" fontSize="10">f(x)</text>

    {/* Curve: f(x) = -0.5(x-5)Â² + 8, scaled */}
    {/* Domain x: 0..10 → px: 60..460, range y: 0..10 → py: 260..60 */}
    <path
      d={Array.from({length: 101}, (_,i) => {
        const x = i * 0.1;
        const y = -0.5*(x-5)*(x-5) + 8;
        const px = 60 + x * 40;
        const py = 260 - y * 24;
        return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
      }).join(' ')}
      stroke="#10b981" strokeWidth="2.5" fill="none"
      style={{ filter: active === 'curve' ? 'drop-shadow(0 0 6px #10b981)' : 'none' }}
    />

    {/* Tangent line at x=3: f(3)=-0.5(4)+8=6, f'(3)=-(3-5)=2 → tangent: y-6=2(x-3) */}
    {active === 'tangent' && (() => {
      const tx = 3, ty = -0.5*(tx-5)*(tx-5)+8;
      const slope = -(tx - 5); // derivative
      const px1 = 60 + 1 * 40, py1 = 260 - (ty + slope * (1 - tx)) * 24;
      const px2 = 60 + 5.5 * 40, py2 = 260 - (ty + slope * (5.5 - tx)) * 24;
      const ptx = 60 + tx * 40, pty = 260 - ty * 24;
      return <>
        <line x1={px1} y1={py1} x2={px2} y2={py2} stroke="#f59e0b" strokeWidth="2.5"/>
        <circle cx={ptx} cy={pty} r="8" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}/>
        <text x={ptx + 10} y={pty - 8} fill="#f59e0b" fontSize="10" fontWeight="700">f'(3) = 2</text>
        <text x={ptx + 10} y={pty + 6} fill="#f59e0b" fontSize="9">slope at x=3</text>
      </>;
    })()}

    {/* Maxima at x=5 */}
    {active === 'maxima' && (() => {
      const mx = 5, my = 8;
      const pmx = 60 + mx * 40, pmy = 260 - my * 24;
      return <>
        <circle cx={pmx} cy={pmy} r="10" fill="#f43f5e" style={{ filter: 'drop-shadow(0 0 8px #f43f5e)' }}/>
        <text x={pmx} y={pmy - 14} textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="700">MAXIMUM</text>
        <text x={pmx} y={pmy - 2} textAnchor="middle" fill="white" fontSize="9">f'(5)=0</text>
        <line x1={pmx - 60} y1={pmy} x2={pmx + 60} y2={pmy} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="5 3"/>
        <text x={pmx + 68} y={pmy + 4} fill="#f43f5e" fontSize="9">f'=0 here</text>
      </>;
    })()}

    {/* Rate of change */}
    {active === 'rate' && (
      <>
        <rect x="70" y="30" width="200" height="60" rx="8" fill="rgba(0,0,0,0.5)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"/>
        <text x="170" y="50" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">f'(x) = lim Î”y/Î”x</text>
        <text x="170" y="64" textAnchor="middle" fill="rgba(16,185,129,0.7)" fontSize="10">       Î”x → 0</text>
        <text x="170" y="82" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">Instantaneous rate of change</text>
      </>
    )}

    {/* Chain rule note */}
    {active === 'chain-rule' && (
      <>
        <rect x="250" y="25" width="220" height="55" rx="8" fill="rgba(0,0,0,0.5)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
        <text x="360" y="44" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="700">Chain Rule:</text>
        <text x="360" y="58" textAnchor="middle" fill="#f59e0b" fontSize="10">d/dx[f(g(x))] = f'(g(x))Â·g'(x)</text>
        <text x="360" y="72" textAnchor="middle" fill="rgba(245,158,11,0.6)" fontSize="9">e.g. d/dx[sin(xÂ²)] = cos(xÂ²)Â·2x</text>
      </>
    )}

    {/* Increasing/decreasing regions */}
    <text x="100" y="50" fill="rgba(16,185,129,0.5)" fontSize="9">↑ increasing</text>
    <text x="100" y="62" fill="rgba(16,185,129,0.4)" fontSize="9">f'(x) &gt; 0</text>
    <text x="340" y="50" fill="rgba(244,63,94,0.5)" fontSize="9">â†“ decreasing</text>
    <text x="340" y="62" fill="rgba(244,63,94,0.4)" fontSize="9">f'(x) &lt; 0</text>

    <Dot x="12" y="68" active={active === 'tangent'} color="#f59e0b"/>
    <Dot x="60" y="50" active={active === 'maxima'} color="#f43f5e"/>
    <Dot x="12" y="82" active={active === 'rate'} color="#10b981"/>
    <Dot x="60" y="65" active={active === 'chain-rule'} color="#f59e0b"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BATTLE OF PANIPAT (1526)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const PanipatScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="battleGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15"/>
        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02"/>
      </radialGradient>
    </defs>

    {/* Map background */}
    <rect x="30" y="30" width="440" height="240" rx="10" fill="url(#battleGrad)" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5"/>

    {/* River Yamuna */}
    <path d="M 420 30 Q 410 80 415 130 Q 420 180 410 240" stroke="#3b82f6" strokeWidth="8" fill="none" strokeOpacity="0.5"/>
    <text x="425" y="135" fill="rgba(59,130,246,0.7)" fontSize="9" fontWeight="600">Yamuna</text>

    {/* Panipat town */}
    <circle cx="250" cy="160" r="10" fill="rgba(245,158,11,0.6)" stroke="#f59e0b" strokeWidth="2"/>
    <text x="250" y="148" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">Panipat</text>

    {/* Babur's forces (left/west) */}
    <g opacity={active === 'babur' ? 1 : 0.7}>
      {/* Main army */}
      <rect x="60" y="130" width="100" height="60" rx="6" fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth={active === 'babur' ? 2.5 : 1.5}/>
      <text x="110" y="155" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">BABUR</text>
      <text x="110" y="168" textAnchor="middle" fill="#10b981" fontSize="9">12,000 troops</text>
      <text x="110" y="180" textAnchor="middle" fill="#10b981" fontSize="9">+Artillery</text>
      {/* Artillery pieces */}
      {[80,100,120,140].map((x,i) => (
        <rect key={i} x={x} y="195" width="12" height="8" rx="2" fill="#10b981" opacity="0.7"/>
      ))}
      <text x="110" y="215" textAnchor="middle" fill="rgba(16,185,129,0.7)" fontSize="9">ðŸ”« Cannons (Tulughma)</text>
    </g>

    {/* Ibrahim Lodi forces (right) */}
    <g opacity={active === 'lodi' ? 1 : 0.7}>
      <rect x="290" y="100" width="120" height="100" rx="6" fill="rgba(244,63,94,0.3)" stroke="#f43f5e" strokeWidth={active === 'lodi' ? 2.5 : 1.5}/>
      <text x="350" y="140" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="700">IBRAHIM LODI</text>
      <text x="350" y="155" textAnchor="middle" fill="#f43f5e" fontSize="9">~100,000 troops</text>
      <text x="350" y="170" textAnchor="middle" fill="#f43f5e" fontSize="9">+500 war elephants</text>
      {/* Elephant symbols */}
      {[305,325,345,365,385].map((x,i) => (
        <text key={i} x={x} y="192" fontSize="14">ðŸ˜</text>
      ))}
    </g>

    {/* Battle arrows — Babur's flanking (Tulughma) */}
    {active === 'tulughma' && (
      <>
        <path d="M 160 145 Q 200 120 235 155" stroke="#f59e0b" strokeWidth="2.5" fill="none" markerEnd="url(#arrowBatt)" strokeDasharray="none"/>
        <path d="M 160 175 Q 200 200 235 170" stroke="#f59e0b" strokeWidth="2.5" fill="none" markerEnd="url(#arrowBatt)"/>
        <text x="195" y="115" fill="#f59e0b" fontSize="10" fontWeight="700">TULUGHMA</text>
        <text x="195" y="127" fill="#f59e0b" fontSize="9">flanking maneuver</text>
      </>
    )}

    {/* Casualties / outcome */}
    {active === 'outcome' && (
      <>
        <rect x="100" y="245" width="300" height="35" rx="8" fill="rgba(0,0,0,0.7)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"/>
        <text x="250" y="258" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">✓ Babur WINS — Founds Mughal Empire (1526)</text>
        <text x="250" y="272" textAnchor="middle" fill="rgba(244,63,94,0.8)" fontSize="9">Ibrahim Lodi killed — Delhi Sultanate ends</text>
      </>
    )}

    {/* Compass */}
    <text x="62" y="52" fill="rgba(245,158,11,0.6)" fontSize="14">↑</text>
    <text x="60" y="64" fill="rgba(245,158,11,0.5)" fontSize="9">N</text>

    {/* Date badge */}
    <rect x="32" y="255" width="120" height="20" rx="6" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>
    <text x="92" y="268" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">April 21, 1526</text>

    <defs>
      <marker id="arrowBatt" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/>
      </marker>
    </defs>

    <Dot x="22" y="47" active={active === 'babur'} color="#10b981"/>
    <Dot x="58" y="47" active={active === 'lodi'} color="#f43f5e"/>
    <Dot x="50" y="162" active={active === 'tulughma'} color="#f59e0b"/>
    <Dot x="50" y="262" active={active === 'outcome'} color="#10b981"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FRENCH REVOLUTION TIMELINE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const FrenchRevScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    {/* Timeline spine */}
    <line x1="250" y1="30" x2="250" y2="290" stroke="rgba(99,102,241,0.4)" strokeWidth="3"/>

    {/* Events */}
    {[
      { y: 55, year: '1789', event: 'Estates-General & Tennis Court Oath', side: 'left', key: 'estates', color: '#8b5cf6' },
      { y: 100, year: '1789', event: 'Storming of Bastille (July 14)', side: 'right', key: 'bastille', color: '#ef4444' },
      { y: 145, year: '1791', event: 'Constitutional Monarchy', side: 'left', key: 'constitution', color: '#3b82f6' },
      { y: 190, year: '1793', event: 'Reign of Terror — Robespierre', side: 'right', key: 'terror', color: '#dc2626' },
      { y: 235, year: '1799', event: 'Napoleon\'s coup — 18 Brumaire', side: 'left', key: 'napoleon', color: '#f59e0b' },
    ].map(({ y, year, event, side, key, color }) => {
      const isActive = active === key;
      return (
        <React.Fragment key={key}>
          {/* Timeline dot */}
          <circle cx="250" cy={y} r={isActive ? 10 : 7}
            fill={isActive ? color : `${color}80`}
            stroke={color} strokeWidth="1.5"
            style={{ filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none' }}/>
          {/* Connector line */}
          <line x1="250" y1={y} x2={side === 'left' ? 210 : 290} y2={y}
            stroke={isActive ? color : `${color}60`} strokeWidth={isActive ? 2 : 1.5}/>
          {/* Event box */}
          <rect
            x={side === 'left' ? 40 : 295} y={y - 20}
            width="165" height="40" rx="8"
            fill={isActive ? `${color}25` : 'rgba(0,0,0,0.4)'}
            stroke={isActive ? color : `${color}40`}
            strokeWidth={isActive ? 2 : 1}/>
          <text x={side === 'left' ? 122 : 377} y={y - 5} textAnchor="middle"
            fill={isActive ? color : `${color}90`} fontSize="9" fontWeight="700">{year}</text>
          <text x={side === 'left' ? 122 : 377} y={y + 10} textAnchor="middle"
            fill={isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)'}
            fontSize={isActive ? 9.5 : 8.5} fontWeight={isActive ? 600 : 400}>{event}</text>
        </React.Fragment>
      );
    })}

    {/* Detail panels */}
    {active === 'bastille' && (
      <rect x="100" y="265" width="300" height="35" rx="8" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5">
      </rect>
    )}
    {active === 'bastille' && (
      <text x="250" y="278" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">Symbol of royal tyranny falls!</text>
    )}
    {active === 'bastille' && (
      <text x="250" y="292" textAnchor="middle" fill="rgba(239,68,68,0.7)" fontSize="9">800 citizens, only 7 prisoners inside</text>
    )}
    {active === 'napoleon' && (
      <text x="250" y="278" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">End of Revolution → Start of Empire</text>
    )}
    {active === 'napoleon' && (
      <text x="250" y="292" textAnchor="middle" fill="rgba(245,158,11,0.7)" fontSize="9">Ideas: Liberty, Equality, Fraternity spread globally</text>
    )}

    {/* Liberty/Equality/Fraternity ribbon */}
    <g transform="translate(165, 295)">
      <rect x="0" y="0" width="170" height="18" rx="6" fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.4)" strokeWidth="1"/>
      <text x="85" y="13" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="700">Liberté • Égalité • Fraternité</text>
    </g>

    <Dot x="24" y="55" active={active === 'estates'} color="#8b5cf6"/>
    <Dot x="24" y="100" active={active === 'bastille'} color="#ef4444"/>
    <Dot x="24" y="145" active={active === 'constitution'} color="#3b82f6"/>
    <Dot x="24" y="190" active={active === 'terror'} color="#dc2626"/>
    <Dot x="24" y="235" active={active === 'napoleon'} color="#f59e0b"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CHEMICAL REACTION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const ChemReactionScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <filter id="reactGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>

    {/* Title */}
    <text x="250" y="20" textAnchor="middle" fill="rgba(99,102,241,0.8)" fontSize="12" fontWeight="700">Combustion: CHâ‚„ + 2O₂ → CO₂ + 2H₂O</text>

    {/* Reactants side */}
    <text x="110" y="48" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">REACTANTS</text>

    {/* CHâ‚„ molecule */}
    <circle cx="80" cy="130" r={active === 'reactants' ? 22 : 18} fill="rgba(20,184,166,0.3)" stroke="#14b8a6" strokeWidth="2" filter={active === 'reactants' ? 'url(#reactGlow)' : 'none'}/>
    <text x="80" y="127" textAnchor="middle" fill="#14b8a6" fontSize="13" fontWeight="800">C</text>
    <text x="80" y="140" textAnchor="middle" fill="#14b8a6" fontSize="9">+4</text>
    {/* H atoms around C */}
    {[[80,95],[110,130],[80,165],[50,130]].map(([hx,hy],i) => (
      <React.Fragment key={i}>
        <circle cx={hx} cy={hy} r="10" fill="rgba(226,232,240,0.2)" stroke="#e2e8f080" strokeWidth="1.5"/>
        <text x={hx} y={hy+4} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">H</text>
        <line x1={80 + (hx-80)*0.6} y1={130 + (hy-130)*0.6} x2={hx + (80-hx)*0.5} y2={hy + (130-hy)*0.5} stroke="#94a3b850" strokeWidth="1.5"/>
      </React.Fragment>
    ))}
    <text x="80" y="185" textAnchor="middle" fill="rgba(20,184,166,0.6)" fontSize="9">Methane CHâ‚„</text>

    {/* + sign */}
    <text x="140" y="134" fill="rgba(255,255,255,0.4)" fontSize="20" fontWeight="700">+</text>

    {/* O₂ */}
    <circle cx="175" cy="115" r="15" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="1.5"/>
    <text x="175" y="119" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">O</text>
    <line x1="190" y1="115" x2="210" y2="115" stroke="#ef4444" strokeWidth="3"/>
    <line x1="190" y1="120" x2="210" y2="120" stroke="#ef4444" strokeWidth="3"/>
    <circle cx="225" cy="115" r="15" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="1.5"/>
    <text x="225" y="119" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">O</text>
    <text x="200" y="145" textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="9">O₂ (×2)</text>

    {/* Arrow */}
    <path d="M 248 130 L 270 130" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrowChm)" fill="none"/>
    <text x="259" y="122" textAnchor="middle" fill="#f59e0b" fontSize="9">energy</text>
    <text x="259" y="148" textAnchor="middle" fill="#f59e0b" fontSize="9">(exo)</text>
    {/* Energy flames */}
    {active === 'energy' && (
      <text x="259" y="115" textAnchor="middle" fontSize="18">ðŸ”¥</text>
    )}

    {/* Products side */}
    <text x="390" y="48" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">PRODUCTS</text>

    {/* CO₂ */}
    <g transform="translate(280, 95)">
      <circle cx="0" cy="25" r="13" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="0" y="29" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">O</text>
      <line x1="13" y1="25" x2="32" y2="25" stroke="#ef4444" strokeWidth="3"/>
      <line x1="13" y1="30" x2="32" y2="30" stroke="#ef4444" strokeWidth="3"/>
      <circle cx="45" cy="25" r="16" fill="rgba(20,184,166,0.3)" stroke="#14b8a6" strokeWidth="2"/>
      <text x="45" y="29" textAnchor="middle" fill="#14b8a6" fontSize="11" fontWeight="700">C</text>
      <line x1="61" y1="25" x2="80" y2="25" stroke="#ef4444" strokeWidth="3"/>
      <line x1="61" y1="30" x2="80" y2="30" stroke="#ef4444" strokeWidth="3"/>
      <circle cx="93" cy="25" r="13" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="93" y="29" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">O</text>
      <text x="46" y="52" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Carbon Dioxide CO₂</text>
    </g>

    {/* H₂O */}
    <g transform="translate(298, 170)">
      <circle cx="40" cy="25" r="16" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="2"/>
      <text x="40" y="29" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="800">O</text>
      <line x1="27" y1="36" x2="15" y2="48" stroke="#94a3b8" strokeWidth="2"/>
      <circle cx="8" cy="55" r="10" fill="rgba(226,232,240,0.2)" stroke="#e2e8f080" strokeWidth="1.5"/>
      <text x="8" y="59" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">H</text>
      <line x1="53" y1="36" x2="65" y2="48" stroke="#94a3b8" strokeWidth="2"/>
      <circle cx="72" cy="55" r="10" fill="rgba(226,232,240,0.2)" stroke="#e2e8f080" strokeWidth="1.5"/>
      <text x="72" y="59" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">H</text>
      <text x="40" y="78" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Water H₂O (×2)</text>
    </g>

    {/* Conservation note */}
    {active === 'conservation' && (
      <g>
        <rect x="30" y="255" width="440" height="35" rx="8" fill="rgba(0,0,0,0.6)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"/>
        <text x="250" y="268" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">Law of Conservation: Atoms neither created nor destroyed!</text>
        <text x="250" y="282" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">C:1=1 | H:4=4 | O:4=4 ✓ (both sides equal)</text>
      </g>
    )}

    <defs>
      <marker id="arrowChm" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,0 L0,8 L8,4 z" fill="#f59e0b"/>
      </marker>
    </defs>

    <Dot x="22" y="70" active={active === 'reactants'} color="#14b8a6"/>
    <Dot x="52" y="70" active={active === 'energy'} color="#f59e0b"/>
    <Dot x="56" y="70" active={active === 'products'} color="#ef4444"/>
    <Dot x="22" y="85" active={active === 'conservation'} color="#10b981"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAGNETIC FIELD
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const MagneticFieldScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <filter id="magGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>

    {/* Current wire (straight) */}
    <rect x="237" y="20" width="26" height="280" rx="6" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="2"/>
    <text x="250" y="160" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="700">I</text>
    <path d="M 250 40 L 250 25" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowMag)" fill="none"/>
    <text x="258" y="32" fill="#f59e0b" fontSize="9">current ↑</text>

    {/* Circular B-field rings */}
    {[40,80,120,160].map((r, i) => (
      <React.Fragment key={i}>
        <circle cx="250" cy="160" r={r}
          fill="none"
          stroke={active === 'field-lines' ? '#3b82f6' : 'rgba(59,130,246,0.3)'}
          strokeWidth={active === 'field-lines' ? 2 : 1.5}
          strokeDasharray="none"
          opacity={1 - i * 0.15}/>
        {/* Arrows on circles */}
        {active === 'field-lines' && (
          <path d={`M ${250 + r} ${160} A ${r} ${r} 0 0 1 ${250} ${160 - r}`}
            fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="1.5"
            markerEnd="url(#arrowBlu)"/>
        )}
      </React.Fragment>
    ))}

    {/* Right-hand rule hand */}
    {active === 'right-hand' && (
      <>
        <text x="420" y="120" fontSize="40" textAnchor="middle">ðŸ‘</text>
        <path d="M 400 130 Q 360 140 340 160" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="4 2" markerEnd="url(#arrowGrn)"/>
        <text x="380" y="108" fill="#10b981" fontSize="10" fontWeight="700">Right-Hand Rule</text>
        <text x="380" y="120" fill="rgba(16,185,129,0.7)" fontSize="9">Thumb → current</text>
        <text x="380" y="132" fill="rgba(16,185,129,0.7)" fontSize="9">Fingers → B direction</text>
      </>
    )}

    {/* Ampere's law */}
    {active === 'ampere' && (
      <g>
        <rect x="30" y="255" width="200" height="40" rx="8" fill="rgba(0,0,0,0.6)" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5"/>
        <text x="130" y="270" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="700">âˆ®BÂ·dl = μ₀I</text>
        <text x="130" y="285" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Ampere's Circuital Law</text>
      </g>
    )}

    {/* B magnitude labels */}
    <text x="80" y="105" fill="rgba(59,130,246,0.6)" fontSize="9">B = μ₀I/2Ï€r</text>
    <text x="80" y="118" fill="rgba(59,130,246,0.4)" fontSize="9">decreases with r</text>

    {/* Solenoid at bottom */}
    {active === 'solenoid' && (
      <>
        <rect x="80" y="240" width="340" height="50" rx="8" fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="1.5"/>
        {[100,130,160,190,220,250,280,310,340,370,400].map((x,i) => (
          <ellipse key={i} cx={x} cy="265" rx="8" ry="12" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.7"/>
        ))}
        <text x="250" y="298" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="600">Solenoid: B = μ₀nI (uniform inside)</text>
      </>
    )}

    <defs>
      <marker id="arrowMag" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/>
      </marker>
      <marker id="arrowBlu" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6"/>
      </marker>
      <marker id="arrowGrn" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#10b981"/>
      </marker>
    </defs>

    <Dot x="22" y="70" active={active === 'field-lines'} color="#3b82f6"/>
    <Dot x="22" y="85" active={active === 'ampere'} color="#3b82f6"/>
    <Dot x="22" y="100" active={active === 'right-hand'} color="#10b981"/>
    <Dot x="22" y="115" active={active === 'solenoid'} color="#6366f1"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LINEAR EQUATION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const LinearEqScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    {/* Axes */}
    <line x1="50" y1="160" x2="460" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <line x1="250" y1="20" x2="250" y2="300" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <text x="465" y="163" fill="rgba(255,255,255,0.4)" fontSize="10">x</text>
    <text x="245" y="16" fill="rgba(255,255,255,0.4)" fontSize="10">y</text>

    {/* Grid */}
    {[-4,-3,-2,-1,1,2,3,4].map(n => (
      <React.Fragment key={n}>
        <line x1={250+n*45} y1="25" x2={250+n*45} y2="295" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <line x1="55" y1={160-n*45} x2="455" y2={160-n*45} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <text x={250+n*45} y="174" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">{n}</text>
        <text x="242" y={160-n*45+4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">{n}</text>
      </React.Fragment>
    ))}

    {/* Line 1: y = 2x + 1, color blue */}
    <line
      x1={50} y1={160 - (2*(50-250)/45 + 1)*45}
      x2={460} y2={160 - (2*(460-250)/45 + 1)*45}
      stroke={active === 'line1' ? '#3b82f6' : 'rgba(59,130,246,0.7)'}
      strokeWidth={active === 'line1' ? 3 : 2}
      style={{ filter: active === 'line1' ? 'drop-shadow(0 0 5px #3b82f6)' : 'none' }}
    />
    <text x="430" y={160 - (2*(430-250)/45 + 1)*45 - 8} fill="#3b82f6" fontSize="10" fontWeight="700">y=2x+1</text>

    {/* Line 2: y = -x + 4, color red */}
    <line
      x1={50} y1={160 - ((-1)*(50-250)/45 + 4)*45}
      x2={460} y2={160 - ((-1)*(460-250)/45 + 4)*45}
      stroke={active === 'line2' ? '#ef4444' : 'rgba(239,68,68,0.7)'}
      strokeWidth={active === 'line2' ? 3 : 2}
      style={{ filter: active === 'line2' ? 'drop-shadow(0 0 5px #ef4444)' : 'none' }}
    />
    <text x="65" y={160 - ((-1)*(65-250)/45 + 4)*45 - 8} fill="#ef4444" fontSize="10" fontWeight="700">y=-x+4</text>

    {/* Intersection point: x=1, y=3 */}
    <circle cx={250 + 1*45} cy={160 - 3*45}
      r={active === 'intersection' ? 12 : 8}
      fill="#10b981"
      style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}/>
    <text x={250 + 1*45 + 14} y={160 - 3*45} fill="#10b981" fontSize="11" fontWeight="700">Solution: (1,3)</text>
    <text x={250 + 1*45 + 14} y={160 - 3*45 + 13} fill="rgba(16,185,129,0.6)" fontSize="9">x=1, y=3</text>

    {/* Slope demonstration */}
    {active === 'slope' && (
      <>
        <line x1={250} y1={160-1*45} x2={250+1*45} y2={160-1*45} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2"/>
        <line x1={250+1*45} y1={160-1*45} x2={250+1*45} y2={160-3*45} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2"/>
        <text x={250+1*45+5} y={160-2*45} fill="#f59e0b" fontSize="10" fontWeight="700">rise=2</text>
        <text x={250+0.5*45} y={160-1*45+14} fill="#f59e0b" fontSize="10" fontWeight="700">run=1</text>
        <text x="50" y="290" fill="#f59e0b" fontSize="10" fontWeight="700">slope m = rise/run = 2</text>
      </>
    )}

    {/* Equations panel */}
    <g transform="translate(22, 22)">
      <rect x="0" y="0" width="130" height="42" rx="6" fill="rgba(0,0,0,0.5)" stroke="rgba(59,130,246,0.3)" strokeWidth="1"/>
      <text x="65" y="14" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="700">Eq 1: y = 2x + 1</text>
      <text x="65" y="28" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">Eq 2: y = -x + 4</text>
      <text x="65" y="38" textAnchor="middle" fill="rgba(16,185,129,0.7)" fontSize="9">→ x=1, y=3</text>
    </g>

    <Dot x="34" y="35" active={active === 'line1'} color="#3b82f6"/>
    <Dot x="34" y="48" active={active === 'line2'} color="#ef4444"/>
    <Dot x="66" y="35" active={active === 'intersection'} color="#10b981"/>
    <Dot x="34" y="62" active={active === 'slope'} color="#f59e0b"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   3D GEOMETRY
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const GeomScene = (active: string | null) => (
  <svg viewBox="0 0 500 320" style={{ width: '100%', height: '100%' }}>
    <defs>
      <filter id="geomGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>

    {/* 3D Axes from origin */}
    {/* X-axis (right) */}
    <line x1="180" y1="200" x2="380" y2="200" stroke={active === 'x-axis' ? '#ef4444' : 'rgba(239,68,68,0.6)'} strokeWidth={active === 'x-axis' ? 3 : 2} markerEnd="url(#arrowX)"/>
    <text x="390" y="204" fill="#ef4444" fontSize="12" fontWeight="700">X</text>

    {/* Y-axis (up) */}
    <line x1="180" y1="200" x2="180" y2="40" stroke={active === 'y-axis' ? '#10b981' : 'rgba(16,185,129,0.6)'} strokeWidth={active === 'y-axis' ? 3 : 2} markerEnd="url(#arrowG)"/>
    <text x="174" y="32" fill="#10b981" fontSize="12" fontWeight="700">Y</text>

    {/* Z-axis (into screen, shown diagonally) */}
    <line x1="180" y1="200" x2="60" y2="290" stroke={active === 'z-axis' ? '#3b82f6' : 'rgba(59,130,246,0.6)'} strokeWidth={active === 'z-axis' ? 3 : 2} markerEnd="url(#arrowZ)"/>
    <text x="48" y="305" fill="#3b82f6" fontSize="12" fontWeight="700">Z</text>

    {/* Origin */}
    <circle cx="180" cy="200" r="6" fill="rgba(255,255,255,0.7)" stroke="white" strokeWidth="1.5"/>
    <text x="190" y="215" fill="rgba(255,255,255,0.5)" fontSize="10">O(0,0,0)</text>

    {/* Point P(3,4,2) */}
    {(() => {
      // 3D to 2D: x right, y up, z diag
      const p = { x: 3, y: 4, z: 2 };
      const scale = 38;
      const ox = 180, oy = 200;
      const px = ox + p.x*scale - p.z*15;
      const py = oy - p.y*scale + p.z*9;
      return (
        <>
          <circle cx={px} cy={py} r={active === 'point' ? 12 : 9}
            fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"
            style={{ filter: active === 'point' ? 'url(#geomGlow)' : 'none' }}/>
          <text x={px + 14} y={py} fill="#f59e0b" fontSize="11" fontWeight="700">P(3,4,2)</text>
          {/* Projection lines */}
          <line x1={ox} y1={oy} x2={px} y2={oy} stroke="rgba(239,68,68,0.4)" strokeWidth="1" strokeDasharray="5 3"/>
          <line x1={px} y1={oy} x2={px} y2={py} stroke="rgba(16,185,129,0.4)" strokeWidth="1" strokeDasharray="5 3"/>
          <line x1={ox} y1={oy} x2={px} y2={py} stroke="rgba(245,158,11,0.6)" strokeWidth="1.5" strokeDasharray="none"/>
        </>
      );
    })()}

    {/* Direction cosines */}
    {active === 'direction' && (
      <>
        <rect x="220" y="50" width="250" height="65" rx="8" fill="rgba(0,0,0,0.6)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
        <text x="345" y="70" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">Direction Cosines</text>
        <text x="345" y="85" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">l = cos Î±, m = cos Î², n = cos Î³</text>
        <text x="345" y="99" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">lÂ² + mÂ² + nÂ² = 1</text>
        <text x="345" y="112" textAnchor="middle" fill="rgba(245,158,11,0.6)" fontSize="9">For P: lÂ²+mÂ²+nÂ² = 9+16+4 / |OP|Â²</text>
      </>
    )}

    {/* Distance formula 3D */}
    {active === 'distance3d' && (
      <g transform="translate(220, 130)">
        <rect x="0" y="0" width="250" height="55" rx="8" fill="rgba(0,0,0,0.6)" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5"/>
        <text x="125" y="18" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="700">3D Distance Formula</text>
        <text x="125" y="35" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="11">d = âˆš(xÂ²+yÂ²+zÂ²)</text>
        <text x="125" y="50" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">|OP| = âˆš(9+16+4) = âˆš29 ≈ 5.39</text>
      </g>
    )}

    {/* Plane equation */}
    {active === 'plane' && (
      <>
        <polygon points="250,80 420,150 350,270 180,200" fill="rgba(99,102,241,0.12)" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 3"/>
        <text x="320" y="195" fill="#6366f1" fontSize="10" fontWeight="700">Plane: ax+by+cz=d</text>
        <text x="320" y="210" fill="rgba(99,102,241,0.6)" fontSize="9">Normal vector: (a,b,c)</text>
      </>
    )}

    <defs>
      <marker id="arrowX" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
        <path d="M0,0 L0,7 L7,3.5 z" fill="#ef4444"/>
      </marker>
      <marker id="arrowG" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
        <path d="M0,0 L0,7 L7,3.5 z" fill="#10b981"/>
      </marker>
      <marker id="arrowZ" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
        <path d="M0,0 L0,7 L7,3.5 z" fill="#3b82f6"/>
      </marker>
    </defs>

    <Dot x="76" y="50" active={active === 'point'} color="#f59e0b"/>
    <Dot x="36" y="50" active={active === 'x-axis'} color="#ef4444"/>
    <Dot x="36" y="65" active={active === 'y-axis'} color="#10b981"/>
    <Dot x="36" y="80" active={active === 'z-axis'} color="#3b82f6"/>
    <Dot x="76" y="65" active={active === 'direction'} color="#f59e0b"/>
    <Dot x="76" y="80" active={active === 'distance3d'} color="#3b82f6"/>
    <Dot x="36" y="95" active={active === 'plane'} color="#6366f1"/>
  </svg>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SCENE REGISTRY
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const CUSTOM_AR_SCENES: Record<string, SceneConfig> = {
  'Semiconductor': {
    svgContent: SemiconductorScene,
    bgColor: 'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.12) 0%, #020509 70%)',
    accentColor: '#8b5cf6',
    labels: [
      { id: 'p-type', name: 'P-Type Region', x: '25', y: '47', description: 'Doped with boron atoms creating "holes" — positive charge carriers. The red circles show holes where electrons are missing.' },
      { id: 'n-type', name: 'N-Type Region', x: '75', y: '47', description: 'Doped with phosphorus, which donates free electrons (shown as filled blue circles). These electrons carry current.' },
      { id: 'depletion', name: 'Depletion Zone', x: '50', y: '47', description: 'Thin neutral barrier at the junction where electrons fill holes, creating an electric field that opposes current flow.' },
      { id: 'junction', name: 'P-N Junction', x: '50', y: '80', description: 'Where P and N type meet. The built-in electric field (pointing N→P) creates a potential barrier of ~0.7V in silicon.' },
      { id: 'forward-bias', name: 'Forward Bias', x: '25', y: '80', description: 'Apply + voltage to P-side: shrinks depletion zone, current flows. Threshold is ~0.3V (Ge) or ~0.7V (Si) diodes.' },
    ]
  },
  'Atom': {
    svgContent: AtomScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, #020509 70%)',
    accentColor: '#6366f1',
    labels: [
      { id: 'nucleus', name: 'Nucleus', x: '50', y: '50', description: 'Contains protons (positive) and neutrons (neutral). Incredibly dense — if the atom were the size of a stadium, the nucleus would be a marble.' },
      { id: 'proton', name: 'Protons', x: '50', y: '65', description: 'Positively charged. Atomic number Z = number of protons = defines the element. Hydrogen has 1, Carbon has 6, Gold has 79.' },
      { id: 'neutron', name: 'Neutrons', x: '50', y: '80', description: 'No charge. Different neutron counts give isotopes. Carbon-12 has 6, Carbon-14 has 8 neutrons (radioactive!).' },
      { id: 'electron', name: 'Electrons', x: '62', y: '50', description: 'Orbit in shells at fixed energy levels (n=1,2,3...). Only 2 electrons in shell 1, 8 in shell 2, 18 in shell 3.' },
      { id: 'shell', name: 'Energy Shell', x: '72', y: '43', description: 'Discrete energy levels per Bohr model. Electrons jump shells by absorbing/emitting photons — this creates atomic spectra!' },
      { id: 'orbital', name: 'Valence Shell', x: '82', y: '37', description: 'Outermost shell — determines chemical behavior. Atoms bond to fill this shell to 8 electrons (octet rule).' },
    ]
  },
  'Gravity': {
    svgContent: GravitationScene,
    bgColor: 'radial-gradient(ellipse at 30% 60%, rgba(245,158,11,0.1) 0%, #020509 70%)',
    accentColor: '#f59e0b',
    labels: [
      { id: 'earth', name: 'Central Mass (Sun/Earth)', x: '28', y: '59', description: 'F = GMm/r². The gravitational force depends on the product of both masses and inversely on the square of distance.' },
      { id: 'satellite', name: 'Orbiting Body', x: '86', y: '44', description: 'At orbital velocity v = âˆš(GM/r), gravity provides exactly the centripetal force needed. The body is in perpetual free fall!' },
      { id: 'orbit', name: "Kepler's Ellipse", x: '62', y: '20', description: "Kepler's 1st Law: Planets orbit in ellipses with Sun at one focus. TÂ² âˆ aÂ³ (3rd Law) — closer planets orbit faster." },
      { id: 'escape-v', name: 'Escape Velocity', x: '86', y: '30', description: 'v = âˆš(2GM/R). For Earth = 11.2 km/s. At this speed, kinetic energy equals gravitational potential energy — you escape forever!' },
      { id: 'center', name: 'Gravitational Field', x: '28', y: '76', description: 'Field lines point toward center of mass. g = GM/r². On Earth\'s surface: g = 9.8 m/sÂ². Decreases as r increases.' },
    ]
  },
  'Aldehyde': {
    svgContent: AldehydeScene,
    bgColor: 'radial-gradient(ellipse at 60% 50%, rgba(245,158,11,0.1) 0%, #020509 70%)',
    accentColor: '#f59e0b',
    labels: [
      { id: 'carbonyl', name: 'Carbonyl Group (C=O)', x: '62', y: '47', description: 'Carbon double-bonded to oxygen. The C is electrophilic (δ⁺) due to O\'s high electronegativity pulling electron density.' },
      { id: 'aldehyde-h', name: 'Aldehyde Hydrogen', x: '56', y: '34', description: 'H directly on carbonyl C — this makes it an aldehyde! If two R groups attached instead, it\'s a ketone (less reactive).' },
      { id: 'r-group', name: 'R Group (Carbon Chain)', x: '30', y: '50', description: 'The alkyl chain attached to carbonyl. Formaldehyde (H-CHO), Acetaldehyde (CH₃-CHO), Propanal (C₂H₅-CHO)...' },
      { id: 'nucleophile', name: 'Nucleophile Attack', x: '90', y: '63', description: 'Nu⁻ attacks the δ⁺ carbonyl carbon — nucleophilic addition reaction. HCN, NaBH₄, Grignard reagents all react this way.' },
      { id: 'tollens', name: "Tollens' Silver Test", x: '90', y: '84', description: 'Aldehydes reduce [Ag(NH₃)₂]⁺ to silver metal forming a mirror — distinguishes aldehydes from ketones (ketones fail this test!).' },
    ]
  },
  'Water cycle': {
    svgContent: WaterCycleScene,
    bgColor: 'radial-gradient(ellipse at 50% 60%, rgba(14,165,233,0.12) 0%, #020509 70%)',
    accentColor: '#0ea5e9',
    labels: [
      { id: 'evaporation', name: 'Evaporation', x: '20', y: '70', description: 'Solar energy converts surface water → water vapor. Oceans supply 86% of atmospheric moisture. Transpiration from plants adds more.' },
      { id: 'condensation', name: 'Condensation', x: '52', y: '22', description: 'Rising vapor cools → forms tiny droplets on dust particles → clouds. 1 cloud can hold millions of liters of water!' },
      { id: 'precipitation', name: 'Precipitation', x: '52', y: '31', description: 'When droplets merge and get heavy enough → rain, snow, hail, sleet. India gets 75% of rainfall from June-September monsoon.' },
      { id: 'runoff', name: 'Surface Runoff', x: '60', y: '69', description: 'Water flows downhill across land → streams → rivers → ocean. Too much too fast = flooding. Forests slow runoff significantly.' },
      { id: 'groundwater', name: 'Groundwater', x: '45', y: '79', description: 'Water infiltrates soil and rock → aquifers. Takes years to centuries to recharge. 97% of Earth\'s liquid freshwater is groundwater!' },
    ]
  },
  'Heart': {
    svgContent: HeartScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(244,63,94,0.12) 0%, #020509 70%)',
    accentColor: '#f43f5e',
    labels: [
      { id: 'left-ventricle', name: 'Left Ventricle', x: '40', y: '38', description: 'Strongest chamber — thick muscular walls pump oxygenated blood to entire body via aorta at high pressure (120mmHg systolic).' },
      { id: 'right-ventricle', name: 'Right Ventricle', x: '61', y: '56', description: 'Pumps deoxygenated blood to lungs via pulmonary artery. Thinner walls — lungs are nearby so less force needed.' },
      { id: 'aorta', name: 'Aorta', x: '26', y: '10', description: 'Largest artery: 2.5cm diameter. Carries oxygen-rich blood from left ventricle to body. Branches into subclavian, carotid, renal arteries.' },
      { id: 'atria', name: 'Atria (Upper Chambers)', x: '50', y: '38', description: 'Right atrium receives deoxygenated blood from vena cava. Left atrium receives oxygenated blood from pulmonary veins. Contract first.' },
      { id: 'valves', name: 'Heart Valves', x: '50', y: '47', description: 'Four valves ensure one-way flow: Tricuspid (right AV), Pulmonary, Mitral/Bicuspid (left AV), Aortic. "Lub-dub" = valves snapping shut.' },
      { id: 'coronary', name: 'Coronary Arteries', x: '50', y: '73', description: 'Heart\'s own blood supply. Right and left coronary arteries branch off aorta. Blockage → heart attack (myocardial infarction).' },
    ]
  },
  'Prism': {
    svgContent: PrismScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.1) 0%, #020509 70%)',
    accentColor: '#6366f1',
    labels: [
      { id: 'incident-ray', name: 'Incident White Ray', x: '4', y: '50', description: 'White light = all wavelengths combined. Snell\'s Law: nâ‚sinÎ¸â‚ = n₂sinθ₂. Light slows down entering glass (refractive index = 1.5).' },
      { id: 'dispersion', name: 'Dispersion', x: '54', y: '58', description: 'Different wavelengths travel at different speeds in glass → different refraction angles → colors separate. This is why rainbows form!' },
      { id: 'violet-ray', name: 'Violet Ray (MOST bent)', x: '92', y: '28', description: 'λ ≈ 380-450nm, highest frequency, highest refractive index. Bends most because it interacts most with glass molecules.' },
      { id: 'red-ray', name: 'Red Ray (LEAST bent)', x: '92', y: '76', description: 'λ ≈ 620-750nm, lowest frequency, lowest refractive index. Bends least. In rainbows, red is always on the outside arc.' },
      { id: 'refracted-ray', name: 'Refraction Inside', x: '57', y: '50', description: 'Light bends toward normal entering glass (denser medium). Bends away from normal exiting. Critical angle → total internal reflection.' },
    ]
  },
  'Crystal structure': {
    svgContent: CrystalScene,
    bgColor: 'radial-gradient(ellipse at 50% 45%, rgba(99,102,241,0.1) 0%, #020509 70%)',
    accentColor: '#6366f1',
    labels: [
      { id: 'unit-cell', name: 'Unit Cell', x: '36', y: '51', description: 'The smallest 3D repeating unit of a crystal. Identified by edge lengths a,b,c and angles Î±,Î²,Î³. All crystals built by stacking unit cells.' },
      { id: 'fcc', name: 'Face-Centered Cubic (FCC)', x: '41', y: '40', description: 'Atoms at corners + center of each face. 4 atoms per unit cell. 74% packing efficiency. Gold, Silver, Copper, Aluminium — all FCC!' },
      { id: 'bcc', name: 'Body-Centered Cubic (BCC)', x: '41', y: '51', description: '2 atoms per unit cell: 8 corner atoms (×1/8 each) + 1 body center. 68% packing. Iron at room temp, Chromium, Tungsten are BCC.' },
      { id: 'lattice-point', name: 'Lattice Points', x: '26', y: '25', description: 'Positions where atoms/ions sit in the crystal. Each lattice point has identical surroundings. 14 Bravais lattices describe all crystal systems.' },
      { id: 'vacancy', name: 'Schottky Defect', x: '46', y: '62', description: 'Missing atom from lattice position — a vacancy. Common in ionic crystals. Decreases density. Na and Cl vacancies always equal to maintain charge balance.' },
    ]
  },
  'Simple harmonic motion': {
    svgContent: SHMScene,
    bgColor: 'radial-gradient(ellipse at 30% 55%, rgba(139,92,246,0.1) 0%, #020509 70%)',
    accentColor: '#8b5cf6',
    labels: [
      { id: 'equilibrium', name: 'Equilibrium Position', x: '24', y: '61', description: 'Mean position where net force = 0. Velocity is MAXIMUM here. Object passes through fastest. The center of oscillation.' },
      { id: 'amplitude', name: 'Amplitude (A)', x: '24', y: '37', description: 'Maximum displacement from equilibrium. At this point velocity = 0, potential energy = maximum. Determined by initial conditions.' },
      { id: 'spring', name: 'Spring (Restoring Force)', x: '24', y: '31', description: 'F = -kx (Hooke\'s Law). Always directed toward equilibrium — the "-" sign is crucial! Ï‰ = âˆš(k/m), Period T = 2Ï€âˆš(m/k).' },
      { id: 'pendulum-bob', name: 'Pendulum', x: '82', y: '48', description: 'T = 2Ï€âˆš(L/g). Period depends ONLY on length and gravity — NOT on mass or amplitude (for small angles < 15Â°). Galileo discovered this!' },
      { id: 'phase', name: 'Phase & Wave Equation', x: '72', y: '44', description: 'x = A sin(Ï‰t + Ï†). Phase Ï† determines initial position. Two SHMs can be in phase (same motion) or out of phase (opposite).' },
    ]
  },
  'Mitosis': {
    svgContent: MitosisScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.12) 0%, #020509 70%)',
    accentColor: '#10b981',
    labels: [
      { id: 'prophase', name: 'Prophase', x: '12', y: '50', description: 'Chromatin condenses into visible chromosomes. Nuclear envelope breaks down. Spindle fibers begin forming from centrioles. Longest phase!' },
      { id: 'metaphase', name: 'Metaphase', x: '35', y: '50', description: 'Chromosomes align at the cell\'s equator (metaphase plate). Spindle fibers attach to centromeres. Easiest phase to count chromosomes!' },
      { id: 'anaphase', name: 'Anaphase', x: '57', y: '50', description: 'Centromeres split! Sister chromatids pulled to opposite poles. Cell begins elongating. Fastest phase of mitosis.' },
      { id: 'telophase', name: 'Telophase', x: '80', y: '40', description: 'Two new nuclei form at each pole. Chromosomes decondense. Nuclear envelope reforms. Followed by cytokinesis (cell splitting).' },
      { id: 'spindle', name: 'Spindle Fibers', x: '35', y: '36', description: 'Made of tubulin protein microtubules. Attach to kinetochore region of centromere. Pull chromatids apart during anaphase with motor proteins.' },
    ]
  },
  'Chemical bond': {
    svgContent: ChemBondScene,
    bgColor: 'radial-gradient(ellipse at 50% 45%, rgba(14,165,233,0.1) 0%, #020509 70%)',
    accentColor: '#0ea5e9',
    labels: [
      { id: 'covalent', name: 'Covalent Bond (H₂O)', x: '25', y: '37', description: 'Atoms SHARE electrons. O shares 2 pairs with 2 H atoms. Bond angle 104.5Â° due to 2 lone pairs compressing. Polar covalent — unequal sharing.' },
      { id: 'ionic', name: 'Ionic Bond (NaCl)', x: '62', y: '37', description: 'Na TRANSFERS its outer electron to Cl. Na becomes Naâº (10 electrons), Cl becomes Clâ» (18 electrons). Strong electrostatic attraction = ionic bond.' },
      { id: 'polar', name: 'Polarity & Dipole', x: '25', y: '28', description: 'O is highly electronegative → pulls electrons → Î´- on O, δ⁺ on H. Net dipole moment = 1.85 D. This is why water is such a great solvent!' },
      { id: 'lone-pair', name: 'Lone Pairs (VSEPR)', x: '25', y: '53', description: 'O has 2 lone pairs. VSEPR: lone pairs repel more than bonding pairs → compress H-O-H angle from 109.5Â° to 104.5Â°. Shape = bent/angular.' },
      { id: 'metallic', name: 'Metallic Bond', x: '50', y: '84', description: 'Metal atoms release outer electrons into a "sea" of delocalized electrons. Explains conductivity, malleability, and metallic luster.' },
    ]
  },
  'Quadratic equation': {
    svgContent: QuadraticScene,
    bgColor: 'radial-gradient(ellipse at 50% 55%, rgba(16,185,129,0.1) 0%, #020509 70%)',
    accentColor: '#10b981',
    labels: [
      { id: 'parabola', name: 'Parabola (y = axÂ²+bx+c)', x: '10', y: '16', description: 'Graph of any quadratic is a U-shaped parabola. a > 0 opens up, a < 0 opens down. The curve is symmetric about the axis of symmetry.' },
      { id: 'roots', name: 'Roots / Zeros', x: '10', y: '21', description: 'Where parabola cuts x-axis (y=0). Solutions to axÂ²+bx+c = 0. Discriminant Î”=bÂ²-4ac: >0 two real roots, =0 one root, <0 no real roots.' },
      { id: 'vertex', name: 'Vertex', x: '67', y: '66', description: 'The minimum (or maximum if a<0) point. x-coord = -b/2a. y-coord = substitute back. For y=xÂ²-4x+3: vertex = (2, -1).' },
      { id: 'axis', name: 'Axis of Symmetry', x: '67', y: '11', description: 'Vertical line x = -b/2a through vertex. Parabola is a mirror image across this line. Here: x = 4/2 = 2.' },
      { id: 'formula', name: 'Quadratic Formula', x: '10', y: '34', description: 'x = (-b Â± âˆš(bÂ²-4ac)) / 2a. Works for ANY quadratic! The Â± gives both roots. Derived by completing the square.' },
    ]
  },
  'Cartesian coordinate system': {
    svgContent: CoordGeomScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.1) 0%, #020509 70%)',
    accentColor: '#10b981',
    labels: [
      { id: 'distance', name: 'Distance Formula', x: '12', y: '11', description: 'd = âˆš((xâ‚‚-xâ‚)Â²+(yâ‚‚-yâ‚)Â²). For A(1,3) to B(4,1): d=âˆš(9+4)=âˆš13≈3.6. Derived from Pythagoras theorem in 2D.' },
      { id: 'midpoint', name: 'Midpoint Formula', x: '12', y: '16', description: 'M = ((xâ‚+xâ‚‚)/2, (yâ‚+yâ‚‚)/2). Midpoint of AB = (2.5, 2). Section formula: P divides AB in ratio m:n, x=(mxâ‚‚+nxâ‚)/(m+n).' },
      { id: 'area', name: 'Area of Triangle', x: '12', y: '20', description: 'Area = Â½|xâ‚(yâ‚‚-yâ‚ƒ)+xâ‚‚(yâ‚ƒ-yâ‚)+xâ‚ƒ(yâ‚-yâ‚‚)|. For A(1,3),B(4,1),C(1,-2): Area = Â½|1(3)+4(-5)+1(2)| = Â½|3-20+2| = 7.5 sq units.' },
      { id: 'quadrant', name: 'Quadrants', x: '12', y: '25', description: '4 quadrants divided by X and Y axes. Q1: (+,+), Q2: (-,+), Q3: (-,-), Q4: (+,-). Key for understanding coordinate geometry problems.' },
    ]
  },
  'Derivative': {
    svgContent: DerivativeScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.1) 0%, #020509 70%)',
    accentColor: '#10b981',
    labels: [
      { id: 'tangent', name: 'Tangent Line (Derivative)', x: '12', y: '21', description: 'f\'(x) = slope of tangent at any point. At x=3 for f(x)=-0.5(x-5)Â²+8: f\'(3) = -(3-5) = 2. Positive = increasing function.' },
      { id: 'maxima', name: 'Maximum/Minimum', x: '12', y: '16', description: 'At turning points f\'(x) = 0. Second derivative test: f\'\'(x) < 0 → maximum, f\'\'(x) > 0 → minimum. Here x=5 is max.' },
      { id: 'rate', name: 'Rate of Change', x: '12', y: '31', description: 'Derivative = instantaneous rate of change. Limit of (f(x+h)-f(x))/h as h→0. Applied in velocity, growth rates, optimization!' },
      { id: 'chain-rule', name: 'Chain Rule', x: '50', y: '8', description: 'd/dx[f(g(x))] = f\'(g(x))Â·g\'(x). Essential for composite functions. e.g. d/dx[sin(xÂ²)] = cos(xÂ²)Â·2x. Most important differentiation rule!' },
    ]
  },
  'First Battle of Panipat': {
    svgContent: PanipatScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.1) 0%, #020509 70%)',
    accentColor: '#f59e0b',
    labels: [
      { id: 'babur', name: "Babur's Army", x: '22', y: '47', description: 'Only 12,000 troops but had GUNPOWDER — first large-scale use of firearms in Indian subcontinent. Cannons placed in front-center (Ottoman method).' },
      { id: 'lodi', name: 'Ibrahim Lodi', x: '70', y: '37', description: '~100,000 soldiers + 500 war elephants — 8x larger! But rigid formation with no artillery response. Last Sultan of Delhi Sultanate.' },
      { id: 'tulughma', name: 'Tulughma Tactic', x: '50', y: '50', description: 'Babur\'s flanking strategy: divide force, attack from both sides simultaneously. Combined with artillery in center = devastating pincer movement.' },
      { id: 'outcome', name: 'Historical Outcome', x: '50', y: '82', description: 'April 21, 1526: Babur wins. Ibrahim Lodi killed. Delhi Sultanate (1206-1526) ends. Mughal Empire begins — lasts until 1857!' },
    ]
  },
  'French Revolution': {
    svgContent: FrenchRevScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.1) 0%, #020509 70%)',
    accentColor: '#6366f1',
    labels: [
      { id: 'estates', name: 'Estates-General (1789)', x: '24', y: '17', description: 'France bankrupt after helping American Revolution. King Louis XVI calls estates. Third Estate (97% of people, 0 power) forms National Assembly.' },
      { id: 'bastille', name: 'Bastille Storming', x: '74', y: '31', description: 'July 14, 1789 — Parisians storm the Bastille prison, symbol of royal tyranny. Only 7 prisoners inside! Became symbol of revolution worldwide.' },
      { id: 'constitution', name: 'Constitutional Monarchy', x: '24', y: '45', description: 'King forced to accept constitutional limits. Declaration of Rights of Man — "Liberty, Equality, Fraternity." New idea: sovereignty belongs to PEOPLE.' },
      { id: 'terror', name: 'Reign of Terror', x: '74', y: '60', description: 'Robespierre\'s Committee of Public Safety executes ~17,000 "enemies." Including King Louis XVI (Jan 1793) and Marie Antoinette. Guillotine era.' },
      { id: 'napoleon', name: "Napoleon's Rise", x: '24', y: '74', description: 'November 1799: Napoleon\'s coup ends Revolution. Revolutionary ideals spread across Europe through Napoleonic Wars, reshaping modern world.' },
    ]
  },
  'Chemical reaction': {
    svgContent: ChemReactionScene,
    bgColor: 'radial-gradient(ellipse at 50% 45%, rgba(99,102,241,0.1) 0%, #020509 70%)',
    accentColor: '#6366f1',
    labels: [
      { id: 'reactants', name: 'Reactants (CHâ‚„ + O₂)', x: '22', y: '22', description: 'Starting materials: methane (natural gas) and oxygen. Combustion requires activation energy (spark/flame) to start the reaction chain.' },
      { id: 'energy', name: 'Energy Released', x: '52', y: '22', description: 'Combustion is exothermic: Î”H = -890 kJ/mol. Bonds broken (CHâ‚„ + O₂) require energy; bonds formed (CO₂ + H₂O) RELEASE more energy.' },
      { id: 'products', name: 'Products (CO₂ + H₂O)', x: '74', y: '22', description: 'Carbon dioxide + water vapor. Complete combustion with excess O₂. Incomplete combustion (less O₂) makes CO (poisonous) + soot.' },
      { id: 'conservation', name: 'Conservation of Mass', x: '22', y: '28', description: 'Lavoisier\'s Law: mass of reactants = mass of products. Atoms only rearrange, never created or destroyed. CHâ‚„+2O₂ → CO₂+2H₂O: C=1,H=4,O=4 each side.' },
    ]
  },
  'Magnetic field': {
    svgContent: MagneticFieldScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.1) 0%, #020509 70%)',
    accentColor: '#3b82f6',
    labels: [
      { id: 'field-lines', name: 'Magnetic Field Lines', x: '22', y: '22', description: 'Concentric circles around wire. B = μ₀I/2Ï€r — inversely proportional to distance r. Direction given by right-hand rule.' },
      { id: 'ampere', name: "Ampere's Law ∮B·dl=μ₀I", x: '22', y: '27', description: 'Line integral of B around any closed loop = μ₀ × current enclosed. Fundamental law relating magnetic field to current.' },
      { id: 'right-hand', name: 'Right-Hand Rule', x: '22', y: '31', description: 'Point thumb in current direction, fingers curl in B-field direction. For wire: thumb up → B circles counterclockwise when viewed from above.' },
      { id: 'solenoid', name: 'Solenoid', x: '22', y: '36', description: 'Multiple wire loops = solenoid. B = μ₀nI inside (n = loops per meter). Uniform field inside, like a bar magnet. Used in electromagnets, MRI machines.' },
    ]
  },
  'Linear equation': {
    svgContent: LinearEqScene,
    bgColor: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.1) 0%, #020509 70%)',
    accentColor: '#10b981',
    labels: [
      { id: 'line1', name: 'Line 1: y = 2x + 1', x: '24', y: '11', description: 'Slope m=2, y-intercept=1. For every 1 unit right, rise 2 units up. Positive slope → line rises left to right.' },
      { id: 'line2', name: 'Line 2: y = -x + 4', x: '24', y: '15', description: 'Slope m=-1, y-intercept=4. Negative slope → line falls left to right. Perpendicular to a line with slope 1.' },
      { id: 'intersection', name: 'Solution Point (1, 3)', x: '66', y: '11', description: 'Where both equations are satisfied simultaneously. Found by substitution: 2x+1=-x+4 → 3x=3 → x=1, y=3. This is the UNIQUE solution.' },
      { id: 'slope', name: 'Slope = rise/run', x: '24', y: '19', description: 'm = (yâ‚‚-yâ‚)/(xâ‚‚-xâ‚). For y=2x+1: take (0,1) and (1,3) → slope = 2/1 = 2. Slope tells you: how steep, and which direction.' },
    ]
  },
  'Solid geometry': {
    svgContent: GeomScene,
    bgColor: 'radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.12) 0%, #020509 70%)',
    accentColor: '#6366f1',
    labels: [
      { id: 'point', name: 'Point in 3D: P(3,4,2)', x: '63', y: '15', description: 'Every point needs 3 coordinates (x,y,z). Distance from origin = âˆš(xÂ²+yÂ²+zÂ²) = âˆš(9+16+4) = âˆš29 ≈ 5.39 units.' },
      { id: 'x-axis', name: 'X-Axis', x: '7', y: '15', description: 'Right direction. Positive x goes right, negative x goes left. The XY plane (z=0) is horizontal. XZ plane (y=0) is vertical.' },
      { id: 'y-axis', name: 'Y-Axis', x: '7', y: '20', description: 'Upward direction. Positive y goes up. In 3D: X, Y, Z form a right-handed coordinate system following the right-hand screw rule.' },
      { id: 'z-axis', name: 'Z-Axis', x: '7', y: '25', description: 'Depth direction (into/out of screen). Shown diagonally in 2D projections. Z separates 3D space into front (z>0) and back (z<0) half-spaces.' },
      { id: 'direction', name: 'Direction Cosines', x: '63', y: '20', description: 'l=cosÎ±, m=cosÎ², n=cosÎ³ — angles a line makes with x, y, z axes. KEY property: lÂ²+mÂ²+nÂ²=1 always! Direction ratios are proportional to l:m:n.' },
      { id: 'distance3d', name: '3D Distance Formula', x: '63', y: '41', description: 'd = âˆš((xâ‚‚-xâ‚)Â²+(yâ‚‚-yâ‚)Â²+(zâ‚‚-zâ‚)Â²). Extension of 2D Pythagoras. Used to find distance between any two points in 3D space.' },
      { id: 'plane', name: 'Equation of Plane', x: '7', y: '30', description: 'ax+by+cz=d. Normal vector to plane is (a,b,c). Distance from point (xâ‚,yâ‚,zâ‚) to plane: |axâ‚+byâ‚+czâ‚-d|/âˆš(aÂ²+bÂ²+cÂ²).' },
    ]
  },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
interface CustomARSceneProps {
  topic: string;
  onLabelClick: (label: Label) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export const CustomARScene: React.FC<CustomARSceneProps> = ({ topic, onLabelClick, activeId, setActiveId }) => {
  const scene = CUSTOM_AR_SCENES[topic];
  if (!scene) return null;

  const handleLabelClick = (label: Label) => {
    const newId = activeId === label.id ? null : label.id;
    setActiveId(newId);
    if (newId) onLabelClick(label);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* SVG Diagram */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '90%', height: '90%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {scene.svgContent(activeId)}

        {/* Floating label buttons — positioned absolutely over SVG */}
        {scene.labels.map(label => {
          const isActive = activeId === label.id;
          return (
            <button
              key={label.id}
              onClick={() => handleLabelClick(label)}
              style={{
                position: 'absolute',
                left: `${label.x}%`,
                top: `${label.y}%`,
                transform: 'translate(-50%, -50%)',
                background: isActive
                  ? `linear-gradient(135deg, ${scene.accentColor} 0%, ${scene.accentColor}cc 100%)`
                  : 'rgba(4,10,20,0.88)',
                border: `1.5px solid ${isActive ? scene.accentColor : `${scene.accentColor}55`}`,
                color: '#fff',
                padding: isActive ? '7px 14px' : '5px 11px',
                borderRadius: 999,
                fontSize: isActive ? 12 : 11,
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: isActive
                  ? `0 0 20px ${scene.accentColor}80, 0 4px 16px rgba(0,0,0,0.6)`
                  : '0 2px 10px rgba(0,0,0,0.6)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                whiteSpace: 'nowrap',
                zIndex: isActive ? 30 : 20,
                display: 'flex', alignItems: 'center', gap: 6,
                pointerEvents: 'auto',
                letterSpacing: '0.02em',
              }}
            >
              <span style={{
                width: isActive ? 8 : 6, height: isActive ? 8 : 6,
                borderRadius: '50%',
                background: isActive ? 'rgba(255,255,255,0.9)' : scene.accentColor,
                flexShrink: 0,
                boxShadow: isActive ? `0 0 6px rgba(255,255,255,0.8)` : `0 0 4px ${scene.accentColor}`,
                transition: 'all 0.3s ease',
              }} />
              {label.name}
              {isActive && <span style={{ opacity: 0.7, fontSize: 10 }}>âœ•</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const hasCustomARScene = (topic: string): boolean => {
  return topic in CUSTOM_AR_SCENES;
};
