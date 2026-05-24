import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import type { PageType } from '../types';

interface CameraFeedProps {
  onScanComplete: (pageType: PageType, confidence: number, extractedInfo: any) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  onScanComplete,
  isScanning,
  setIsScanning,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [scanMessage, setScanMessage] = useState<string>('Ready to scan textbook page...');

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unavailable. You can use the Sandbox Simulator below to test all AR features instantly!");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Flip Camera
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Perform Vision Classification Call
  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setScanMessage('Analyzing textbook layout with AI...');

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw active video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get base64 string
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    try {
      // Call Express proxy endpoint
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error('API server request failed');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setScanMessage(`Detected: ${data.pageType.toUpperCase()}`);
        setTimeout(() => {
          onScanComplete(data.pageType, data.confidence, data.extractedInfo);
          setIsScanning(false);
        }, 800);
      } else {
        throw new Error(data.error || 'Failed to classify');
      }
    } catch (err) {
      console.error("Scan classification failed, falling back to simulated analysis:", err);
      setScanMessage('Server offline. Simulating local analysis...');
      
      // Fallback: local simulated classification based on a random delay
      setTimeout(() => {
        // Run a simulated detection of heart (or select random page type)
        const mockPageTypes: PageType[] = ['heart', 'water_cycle', 'math', 'history'];
        const randomType = mockPageTypes[Math.floor(Math.random() * mockPageTypes.length)];
        simulateMockScan(randomType);
      }, 1500);
    }
  };

  // Simulate scanning of a specific page type directly (for testing/sandbox)
  const simulateMockScan = (type: PageType) => {
    setIsScanning(true);
    setScanMessage(`Analyzing simulated ${type} scan...`);

    const mockData: Record<PageType, { confidence: number; info: any }> = {
      heart: {
        confidence: 0.98,
        info: { title: 'Human Heart Biology', details: 'Interactive 3D model of the aorta, ventricles, and blood vessels.' }
      },
      water_cycle: {
        confidence: 0.95,
        info: { title: 'Water Cycle Geography', details: 'Animated cloud formation, rain cycle, and river system flowchart.' }
      },
      math: {
        confidence: 0.92,
        info: { title: 'Math Equation', details: 'Solve the equation step-by-step.', mathEquation: '2x + 4 = 10' }
      },
      history: {
        confidence: 0.89,
        info: { title: 'Historical Map', details: 'Troop maneuvers during the first Battle of Panipat.', battleName: 'Battle of Panipat (1526)' }
      },
      unknown: {
        confidence: 1.0,
        info: { title: 'Unrecognized Page', details: 'Please point at a valid textbook diagram.' }
      }
    };

    setTimeout(() => {
      const result = mockData[type];
      onScanComplete(type, result.confidence, result.info);
      setIsScanning(false);
      setScanMessage('Scan Successful!');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Interactive Live Viewport */}
      <div className="interactive-container" style={{ position: 'relative' }}>
        {cameraError ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0a0b16 0%, #13152d 100%)',
            color: 'var(--text-secondary)'
          }}>
            <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
              Webcam Feed Offline
            </h3>
            <p style={{ fontSize: '13px', maxWidth: '380px', marginBottom: '24px', lineHeight: '1.5' }}>
              {cameraError}
            </p>
            <button onClick={startCamera} className="glass-btn primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
              <RefreshCw size={14} /> Retry Camera
            </button>
          </div>
        ) : (
          <>
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Scanning Viewfinder */}
            <div className="viewfinder-box" style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              right: '15%',
              bottom: '15%',
            }}>
              <div className="viewfinder-corners" />
              <div className="viewfinder-corners-bottom" />
              {isScanning && <div className="laser-line" />}
            </div>

            {/* Camera Floating HUD Controls */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10
            }}>
              <button onClick={toggleCamera} className="glass-btn" style={{ width: '40px', height: '40px', padding: 0 }}>
                <RefreshCw size={16} />
              </button>

              <button
                onClick={handleScan}
                disabled={isScanning}
                className="glass-btn primary"
                style={{
                  padding: '10px 24px',
                  borderRadius: '50px',
                  boxShadow: '0 0 15px var(--primary-glow)',
                  fontWeight: '700',
                  fontSize: '15px'
                }}
              >
                <Camera size={18} />
                {isScanning ? 'Scanning...' : 'Scan Textbook'}
              </button>

              <div style={{ width: '40px' }} /> {/* Spacing spacer */}
            </div>

            {/* Scanning Status Pill */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 16px',
              borderRadius: '50px',
              fontSize: '12px',
              fontWeight: '700',
              zIndex: 10,
              background: 'rgba(10, 11, 22, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: isScanning ? 'var(--secondary)' : '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isScanning ? 'var(--secondary)' : 'var(--success)',
                display: 'inline-block',
                boxShadow: isScanning ? '0 0 8px var(--secondary)' : '0 0 8px var(--success)',
                animation: isScanning ? 'pulse 1s infinite' : 'none'
              }} />
              {scanMessage}
            </div>
          </>
        )}
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Premium Sandbox Simulator Panel */}
      <div className="glass-card" style={{ padding: '20px 24px', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Eye size={20} style={{ color: 'var(--secondary)' }} />
          <h4 style={{ fontSize: '16px', fontFamily: 'var(--font-heading)', color: '#fff' }}>
            Bharat-Learn Sandbox Simulator
          </h4>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
          Don't have printed textbook pages at hand? Tap any quick-sandbox trigger below to simulate scanning textbook layouts directly into the AR viewport!
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px'
        }}>
          <button
            onClick={() => simulateMockScan('heart')}
            className="glass-btn"
            style={{ fontSize: '12px', padding: '10px 6px', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            ❤️ Heart Biology
          </button>
          <button
            onClick={() => simulateMockScan('water_cycle')}
            className="glass-btn"
            style={{ fontSize: '12px', padding: '10px 6px', borderColor: 'rgba(6, 182, 212, 0.2)' }}
          >
            💧 Water Cycle
          </button>
          <button
            onClick={() => simulateMockScan('math')}
            className="glass-btn"
            style={{ fontSize: '12px', padding: '10px 6px', borderColor: 'rgba(16, 185, 129, 0.2)' }}
          >
            📐 Math Solver
          </button>
          <button
            onClick={() => simulateMockScan('history')}
            className="glass-btn"
            style={{ fontSize: '12px', padding: '10px 6px', borderColor: 'rgba(245, 158, 11, 0.2)' }}
          >
            ⚔️ Troop Battle Map
          </button>
        </div>
      </div>
    </div>
  );
};
