import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../../types';
import { Sun, BookOpen } from 'lucide-react';
import { HologramViewer } from '../three/HologramViewer';

interface PhysicsOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

export const PhysicsOverlay: React.FC<PhysicsOverlayProps> = ({ language, onSpeak }) => {
  const [angle, setAngle] = useState(30);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw Prism (Triangle)
      ctx.beginPath();
      ctx.moveTo(cx, cy - 80);
      ctx.lineTo(cx - 90, cy + 80);
      ctx.lineTo(cx + 90, cy + 80);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(cx - 90, cy - 80, cx + 90, cy + 80);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(14, 165, 233, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw incoming white light
      const rad = (angle * Math.PI) / 180;
      const startX = cx - 150 * Math.cos(rad);
      const startY = cy - 150 * Math.sin(rad);
      
      const hitX = cx - 40;
      const hitY = cy;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(hitX, hitY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dispersion (Spectrum)
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
      colors.forEach((color, idx) => {
        const spread = (idx - 2.5) * 5;
        const outRad = rad - Math.PI / 4 + spread * (Math.PI / 180);
        
        ctx.beginPath();
        ctx.moveTo(hitX + 80, hitY + 20 + idx * 5); // Exit point on right side
        ctx.lineTo(cx + 200 * Math.cos(outRad), cy + 200 * Math.sin(outRad));
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
      });
      
      // Inside prism rays
      ctx.beginPath();
      ctx.moveTo(hitX, hitY);
      ctx.lineTo(hitX + 80, hitY + 20); // Top of spectrum
      ctx.moveTo(hitX, hitY);
      ctx.lineTo(hitX + 80, hitY + 45); // Bottom of spectrum
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [angle]);

  const handleAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAngle(Number(e.target.value));
  };

  const playExplanation = () => {
    const text = {
      en: "This is a prism. White light enters and refracts, separating into the visible color spectrum due to different wavelengths bending at different angles.",
      hi: "यह एक प्रिज्म है। सफेद प्रकाश प्रवेश करता है और अपवर्तित होता है, अलग-अलग तरंग दैर्ध्य के कारण दृश्य रंग स्पेक्ट्रम में अलग हो जाता है।",
      gu: "આ પ્રિઝમ છે. સફેદ પ્રકાશ પ્રવેશે છે અને વક્રીભવન પામે છે, જુદી જુદી તરંગલંબાઇને કારણે દૃશ્યમાન રંગ સ્પેક્ટ્રમમાં અલગ પડે છે."
    };
    onSpeak(text[language]);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* 3D Hologram Background — Prism model */}
      <HologramViewer
        modelUrl="/models/primary_ion_drive.glb"
        scale={0.75}
        hologramColor="#8b5cf6"
        autoRotate={true}
        rotateSpeed={0.4}
        enableOrbitControls={false}
        loadingLabel="Loading Prism Hologram..."
        style={{ opacity: 0.6 }}
      />

      {/* 2D Canvas overlay for light simulation */}
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400} 
        style={{ 
          width: '100%', height: '100%', objectFit: 'contain',
          position: 'absolute', inset: 0, zIndex: 5,
          background: 'rgba(0,0,0,0.3)',
        }} 
      />
      
      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(7,14,28,0.85)', padding: '16px 24px', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
        width: '90%', maxWidth: '340px', zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} style={{ color: 'var(--saffron)' }} />
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>Light Angle: {angle}°</span>
          </div>
          <button onClick={playExplanation} className="glass-btn ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>
            <BookOpen size={14} /> Explain
          </button>
        </div>
        
        <input 
          type="range" 
          min="10" max="80" 
          value={angle} 
          onChange={handleAngleChange}
          style={{ width: '100%', accentColor: 'var(--saffron)' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
           <span>Shallow</span>
           <span>Steep</span>
        </div>
      </div>
    </div>
  );
};
