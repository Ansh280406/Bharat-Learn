import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Eye, Zap, RotateCcw } from 'lucide-react';
import type { PageType } from '../../types';

interface CameraFeedProps {
  onScanComplete: (pageType: PageType, confidence: number, extractedInfo: any, aiExplanation?: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

const SANDBOX_ITEMS: { type: PageType; emoji: string; label: string; color: string; border: string }[] = [
  { type: 'physics',     emoji: '🌈',  label: 'Physics Lab',    color: '#8b5cf6', border: 'rgba(139,92,246,0.25)'  },
  { type: 'chemistry',   emoji: '🧪',  label: 'Chemistry Lab',  color: '#14b8a6', border: 'rgba(20,184,166,0.25)'  },
  { type: 'heart',       emoji: '❤️',  label: 'Heart Biology',  color: '#f43f5e', border: 'rgba(244,63,94,0.25)'   },
  { type: 'math_3d',     emoji: '🧊',  label: '3D Geometry',    color: '#0ea5e9', border: 'rgba(14,165,233,0.25)'  },
  { type: 'math',        emoji: '📐',  label: 'Math Solver',    color: '#10b981', border: 'rgba(16,185,129,0.25)'  },
  { type: 'history',     emoji: '⚔️',  label: 'Battle Map',     color: '#f59e0b', border: 'rgba(245,158,11,0.25)'  },
  { type: 'water_cycle', emoji: '💧',  label: 'Water Cycle',    color: '#0ea5e9', border: 'rgba(14,165,233,0.25)'  },
  { type: 'unknown',     emoji: '🤖',  label: 'Unknown AI Scan',color: '#6366f1', border: 'rgba(99,102,241,0.25)'  },
];

export const CameraFeed: React.FC<CameraFeedProps> = ({
  onScanComplete, isScanning, setIsScanning,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [scanMessage, setScanMessage] = useState('Point camera at a textbook page...');
  const [scanProgress, setScanProgress] = useState(0);

  const startCamera = async () => {
    setCameraError(null);
    if (stream) stream.getTracks().forEach(t => t.stop());
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      setCameraError('Camera access denied or unavailable. Use the Sandbox Simulator below to test all AR features!');
    }
  };

  useEffect(() => {
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [facingMode]);

  const toggleCamera = () => setFacingMode(prev => prev === 'user' ? 'environment' : 'user');

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setScanMessage('Capturing frame...');
    setScanProgress(10);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    setScanMessage('Analyzing with Gemini AI...');
    setScanProgress(40);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      if (data.status === 'success') {
        setScanProgress(100);
        setScanMessage(`✓ Detected: ${data.pageType.toUpperCase()}`);
        setTimeout(() => {
          onScanComplete(data.pageType, data.confidence, data.extractedInfo, data.aiExplanation);
          setIsScanning(false);
          setScanProgress(0);
        }, 700);
      } else throw new Error(data.error || 'Classification failed');
    } catch {
      setScanMessage('Server offline — running local simulation...');
      setScanProgress(60);
      setTimeout(() => {
        const types: PageType[] = ['heart', 'water_cycle', 'math', 'history', 'physics', 'chemistry', 'math_3d'];
        simulateMockScan(types[Math.floor(Math.random() * types.length)]);
      }, 1200);
    }
  };

  const simulateMockScan = (type: PageType) => {
    setIsScanning(true);
    setScanProgress(70);
    setScanMessage(`Simulating ${type} scan...`);

    const mockData: Record<PageType, { confidence: number; info: any }> = {
      heart:       { confidence: 0.98, info: { title: 'Human Heart Biology', details: 'Interactive 3D model of the aorta, ventricles and blood vessels.' } },
      water_cycle: { confidence: 0.95, info: { title: 'Water Cycle Geography', details: 'Animated cloud formation, rain cycle and river flowchart.' } },
      math:        { confidence: 0.92, info: { title: 'Math Equation', details: 'Solve the equation step-by-step.', mathEquation: '2x + 4 = 10' } },
      math_3d:     { confidence: 0.94, info: { title: '3D Geometry', details: 'Visualize planes and vectors in 3D space.' } },
      history:     { confidence: 0.96, info: { title: 'Battle of Panipat (1526)', details: 'Babur vs Ibrahim Lodi historical map.', battleName: 'Battle of Panipat (1526)' } },
      physics:     { confidence: 0.94, info: { title: 'Optics & Prisms', details: 'Practical interactive light refraction lab.' } },
      chemistry:   { confidence: 0.97, info: { title: 'Organic Mechanisms', details: 'Visualize nucleophilic attacks in 3D.' } },
      unknown:     { confidence: 0.50, info: { title: 'Unknown Page', details: 'Please point at a valid textbook diagram.' } },
    };

    setTimeout(() => {
      setScanProgress(100);
      const result = mockData[type];
      const explanation = `Sandbox simulation of the "${result.info.title}" module. Experience the interactive AR layer above.`;
      onScanComplete(type, result.confidence, result.info, explanation);
      setIsScanning(false);
      setScanProgress(0);
      setScanMessage('Scan successful! 🎉');
    }, 1400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── CAMERA VIEWPORT ── */}
      <div className="interactive-container" style={{ position: 'relative' }}>

        {cameraError ? (
          /* Error State */
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '32px', textAlign: 'center',
            background: 'linear-gradient(135deg, #020509 0%, #07101f 100%)',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '24px',
              background: 'rgba(244,63,94,0.10)',
              border: '1px solid rgba(244,63,94,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <AlertCircle size={32} style={{ color: 'var(--rose)' }} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: '800', marginBottom: '8px' }}>
              Camera Offline
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '340px', marginBottom: '24px', lineHeight: '1.6' }}>
              {cameraError}
            </p>
            <button onClick={startCamera} className="glass-btn primary" style={{ padding: '10px 24px' }}>
              <RefreshCw size={14} /> Retry Camera
            </button>
          </div>
        ) : (
          <>
            {/* Live Video */}
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Scanline overlay during active scan */}
            {isScanning && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(255,107,43,0.04) 0%, rgba(99,102,241,0.04) 100%)',
                animation: 'fadeIn 0.3s ease',
              }} />
            )}

            {/* Viewfinder */}
            <div style={{
              position: 'absolute', top: '12%', left: '10%', right: '10%', bottom: '20%',
            }}>
              <div className="corner corner-tl" style={{ borderColor: isScanning ? 'var(--saffron)' : 'rgba(255,255,255,0.5)' }} />
              <div className="corner corner-tr" style={{ borderColor: isScanning ? 'var(--saffron)' : 'rgba(255,255,255,0.5)' }} />
              <div className="corner corner-bl" style={{ borderColor: isScanning ? 'var(--saffron)' : 'rgba(255,255,255,0.5)' }} />
              <div className="corner corner-br" style={{ borderColor: isScanning ? 'var(--saffron)' : 'rgba(255,255,255,0.5)' }} />
              {isScanning && <div className="laser-line" />}
            </div>

            {/* Top status pill */}
            <div style={{
              position: 'absolute', top: '14px', left: '50%',
              transform: 'translateX(-50%)',
              padding: '5px 16px', borderRadius: '999px',
              background: 'rgba(2,5,9,0.88)',
              border: `1px solid ${isScanning ? 'rgba(255,107,43,0.4)' : 'rgba(255,255,255,0.12)'}`,
              backdropFilter: 'blur(12px)',
              fontSize: '11px', fontWeight: '700',
              color: isScanning ? 'var(--saffron)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '6px',
              zIndex: 10, whiteSpace: 'nowrap',
              transition: 'all 0.3s ease',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: isScanning ? 'var(--saffron)' : '#22c55e',
                boxShadow: isScanning ? '0 0 8px var(--saffron)' : '0 0 6px #22c55e',
                animation: isScanning ? 'pulse-ring 1.2s ease-out infinite' : 'none',
              }} />
              {scanMessage}
            </div>

            {/* Progress bar under status pill */}
            {isScanning && scanProgress > 0 && (
              <div style={{
                position: 'absolute', top: '46px', left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                zIndex: 10,
              }}>
                <div className="progress-track" style={{ height: '3px' }}>
                  <div className="progress-fill" style={{ width: `${scanProgress}%`, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}

            {/* Camera flip (top-right) */}
            <button
              onClick={toggleCamera}
              className="glass-btn ghost"
              style={{
                position: 'absolute', top: '14px', right: '14px',
                width: '36px', height: '36px', borderRadius: '50%',
                padding: 0, zIndex: 10,
                background: 'rgba(2,5,9,0.7)', backdropFilter: 'blur(10px)',
              }}
              title="Flip camera"
            >
              <RotateCcw size={14} />
            </button>

            {/* Scan CTA bottom bar */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
              padding: '16px 20px',
              background: 'linear-gradient(to top, rgba(2,5,9,0.9) 0%, transparent 100%)',
              display: 'flex', justifyContent: 'center',
            }}>
              <button
                id="btn-scan"
                onClick={handleScan}
                disabled={isScanning}
                className="glass-btn primary"
                style={{
                  padding: '12px 36px', borderRadius: '999px',
                  fontSize: '15px', fontWeight: '800',
                  boxShadow: isScanning ? 'none' : '0 0 24px var(--saffron-glow), 0 4px 16px rgba(0,0,0,0.4)',
                  opacity: isScanning ? 0.7 : 1,
                  letterSpacing: '0.01em',
                  transition: 'all 0.3s ease',
                }}
              >
                {isScanning ? (
                  <><span style={{ animation: 'spin-slow 1s linear infinite', display: 'inline-block' }}>⟳</span> Scanning...</>
                ) : (
                  <><Camera size={17} /> Scan Textbook</>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── SANDBOX SIMULATOR ── */}
      <div className="glass-card" style={{
        padding: '20px 22px',
        border: '1px solid rgba(99,102,241,0.15)',
        background: 'rgba(7,14,28,0.75)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--indigo-light)',
          }}>
            <Eye size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--text-primary)' }}>
              Sandbox Simulator
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
              No textbook? Simulate any AR module instantly
            </p>
          </div>
        </div>

        <div className="divider" style={{ margin: '14px 0' }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}>
          {SANDBOX_ITEMS.map(item => (
            <button
              key={item.type}
              id={`sandbox-${item.type}`}
              onClick={() => simulateMockScan(item.type)}
              className="glass-btn ghost"
              style={{
                padding: '11px 14px',
                borderColor: item.border,
                borderRadius: '12px',
                fontSize: '13px',
                gap: '8px',
                justifyContent: 'flex-start',
                background: `${item.color}08`,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${item.color}18`;
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `${item.color}08`;
                e.currentTarget.style.borderColor = item.border;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.emoji}</span>
              <span style={{ color: item.color, fontWeight: '700' }}>{item.label}</span>
            </button>
          ))}
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
          <Zap size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: 'var(--gold)' }} />
          All features work in sandbox mode — quizzes, voice & AR
        </p>
      </div>
    </div>
  );
};
