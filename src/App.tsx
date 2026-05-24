import { useState } from 'react';
import type { PageType, Language, ScanResult } from './types';
import { useWebSpeech } from './hooks/useWebSpeech';
import { LanguageToggle } from './components/LanguageToggle';
import { CameraFeed } from './components/CameraFeed';
import { OfflineIndex } from './components/OfflineIndex';
import { ARContainer } from './components/ARContainer';
import { BookOpen, Camera, Wifi, Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'index'>('scanner');
  const [language, setLanguage] = useState<Language>('en');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Multilingual Speech Synthesis Player
  const {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    voiceEnabled,
    setVoiceEnabled,
    activeSubtitle
  } = useWebSpeech();

  const handleScanComplete = (pageType: PageType, confidence: number, extractedInfo: any) => {
    setScanResult({
      pageType,
      confidence,
      title: extractedInfo?.title || 'Scanned Diagram',
      details: extractedInfo?.details || 'Educational overlay successfully aligned.',
      mathEquation: extractedInfo?.mathEquation,
      battleName: extractedInfo?.battleName
    });

    // Speak initial success greeting in the selected language
    const greetings = {
      en: `Excellent! Identified ${extractedInfo?.title || pageType}. Point at parts to explore on Bharat-Learn!`,
      hi: `उत्कृष्ट! ${extractedInfo?.title || pageType} की पहचान की गई। भारत-लर्न पर तलाशने के लिए भागों पर बिंदु करें!`,
      gu: `અદ્ભુત! ${extractedInfo?.title || pageType} ઓળખી કાઢવામાં આવ્યું છે. ભારત-લર્ન પર અભ્યાસ કરવા માટે ભાગો પર ક્લિક કરો!`
    };
    speak(greetings[language], language);
  };

  const handleSelectSubjectOffline = (subject: PageType) => {
    const mockData: Record<PageType, any> = {
      heart: { title: 'Human Heart Anatomy', details: 'Beating 3D heart biology overlay.' },
      water_cycle: { title: 'The Water Cycle', details: 'Interactive evaporation & rain overlay.' },
      math: { title: 'Algebra Equations', details: 'Tactile equation balancer.', mathEquation: '2x + 4 = 10' },
      history: { title: 'Battle of Panipat (1526)', details: 'Mughal vs. Lodi historical map.', battleName: 'Battle of Panipat (1526)' },
      unknown: { title: 'Unknown Page', details: '' }
    };

    setScanResult({
      pageType: subject,
      confidence: 1.0,
      title: mockData[subject].title,
      details: mockData[subject].details,
      mathEquation: mockData[subject].mathEquation,
      battleName: mockData[subject].battleName
    });

    setActiveTab('scanner');

    const selectGreetings = {
      en: `Launching ${mockData[subject].title} in offline companion mode on Bharat-Learn.`,
      hi: `ऑफ़लाइन मोड में भारत-लर्न पर ${mockData[subject].title} शुरू किया जा रहा है।`,
      gu: `ઓફલાઇન કમ્પેનિયન મોડમાં ભારત-લર્ન પર ${mockData[subject].title} શરૂ થઈ રહ્યું છે.`
    };
    speak(selectGreetings[language], language);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    stop();
  };

  const handleResetScan = () => {
    setScanResult(null);
    stop();
  };

  return (
    <div style={{ minHeight: '100vh', padding: '16px', position: 'relative' }}>
      {/* Background Neon Blobs Mesh */}
      <div className="glow-mesh" />

      {/* Main Container */}
      <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* App Title & Header HUD */}
        <header className="glass-card" style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontFamily: 'var(--font-heading)',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #fff 0%, var(--text-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🚀 Bharat-Learn
            </h1>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.02em' }}>
              PageLife Textbook Companion
            </span>
          </div>

          {/* Header Controls (Voice & Network Status) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Voice Guide Toggle Button */}
            <button
              onClick={() => {
                const nextState = !voiceEnabled;
                setVoiceEnabled(nextState);
                if (!nextState) stop(); // Mute/stop active speech immediately when turning voice guide off
              }}
              className="glass-btn"
              style={{
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '11px',
                fontWeight: '700',
                border: '1px solid',
                borderColor: voiceEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                color: voiceEnabled ? '#fff' : 'var(--text-secondary)',
                background: voiceEnabled ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                boxShadow: voiceEnabled ? '0 0 10px var(--primary-glow)' : 'none'
              }}
              title={voiceEnabled ? "Mute explanations (visual guide only)" : "Unmute explanations"}
            >
              {voiceEnabled ? <Volume2 size={12} style={{ color: 'var(--primary)' }} /> : <VolumeX size={12} />}
              <span>{voiceEnabled ? 'Voice: On' : 'Voice: Off'}</span>
            </button>

            {/* Network status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '50px',
              fontSize: '11px',
              color: 'var(--success)',
              fontWeight: '700'
            }}>
              <Wifi size={12} />
              <span>Cached</span>
            </div>
          </div>
        </header>

        {/* Global Multilingual Control */}
        <div style={{ textAlign: 'center' }}>
          <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>

        {/* Dash Controls Tabs (Only show when not in an active AR Overlay) */}
        {!scanResult && (
          <div style={{
            display: 'flex',
            background: 'rgba(19, 21, 45, 0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '18px',
            padding: '4px',
            gap: '4px'
          }}>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`glass-btn ${activeTab === 'scanner' ? 'primary' : ''}`}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '14px',
                fontSize: '14px',
                border: 'none',
                background: activeTab === 'scanner' ? '' : 'transparent',
                boxShadow: activeTab === 'scanner' ? '' : 'none'
              }}
            >
              <Camera size={16} />
              AI Scanner
            </button>
            <button
              onClick={() => setActiveTab('index')}
              className={`glass-btn ${activeTab === 'index' ? 'secondary' : ''}`}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '14px',
                fontSize: '14px',
                border: 'none',
                background: activeTab === 'index' ? '' : 'transparent',
                boxShadow: activeTab === 'index' ? '' : 'none'
              }}
            >
              <BookOpen size={16} />
              Textbook Lessons
            </button>
          </div>
        )}

        {/* Main Display Context */}
        <main style={{ minHeight: '400px' }}>
          {scanResult ? (
            /* Active Interactive AR Scene */
            <ARContainer
              pageType={scanResult.pageType}
              confidence={scanResult.confidence}
              extractedInfo={scanResult}
              language={language}
              onSpeak={(txt) => speak(txt, language)}
              onSpeakStop={stop}
              onReset={handleResetScan}
            />
          ) : (
            /* Main Dashboard State */
            <>
              {activeTab === 'scanner' && (
                <CameraFeed
                  onScanComplete={handleScanComplete}
                  isScanning={isScanning}
                  setIsScanning={setIsScanning}
                />
              )}
              {activeTab === 'index' && (
                <OfflineIndex onSelectSubject={handleSelectSubjectOffline} />
              )}
            </>
          )}
        </main>

        {/* Floating Subtitle / Full Voice Playback Controller Panel */}
        {(isSpeaking || isPaused) && activeSubtitle && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '16px',
            right: '16px',
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div className="glass-card" style={{
              padding: '14px 20px',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'left',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.25)',
              background: 'rgba(10, 11, 22, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              pointerEvents: 'auto',
              animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              
              {/* Voice Caption text with audio wave visualizer */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  height: '14px',
                  width: '16px',
                  flexShrink: 0,
                  marginTop: '3px'
                }}>
                  <span className={isSpeaking && !isPaused && voiceEnabled ? "heart-pulse" : ""} style={{ width: '3px', height: '100%', background: 'var(--primary)', borderRadius: '2px', transition: 'all 0.3s ease' }} />
                  <span className={isSpeaking && !isPaused && voiceEnabled ? "heart-pulse" : ""} style={{ width: '3px', height: '60%', background: 'var(--primary)', borderRadius: '2px', animationDelay: '0.2s', transition: 'all 0.3s ease' }} />
                  <span className={isSpeaking && !isPaused && voiceEnabled ? "heart-pulse" : ""} style={{ width: '3px', height: '80%', background: 'var(--primary)', borderRadius: '2px', animationDelay: '0.4s', transition: 'all 0.3s ease' }} />
                </div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#fff',
                  lineHeight: '1.45',
                  flex: 1
                }}>
                  {activeSubtitle}
                </p>
              </div>

              {/* Interactive Player Controls pill */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '8px',
                marginTop: '4px'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  {!voiceEnabled ? '👁️ Reading Visual Subtitles' : isPaused ? '🔊 Voice Paused' : '🔊 Voice Explaining...'}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Play/Pause Button (only if voice is enabled) */}
                  {voiceEnabled && (
                    isPaused ? (
                      <button
                        onClick={resume}
                        className="glass-btn primary"
                        style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '12px', gap: '4px' }}
                        title="Resume Explanations"
                      >
                        <Play size={12} fill="currentColor" /> Play
                      </button>
                    ) : (
                      <button
                        onClick={pause}
                        className="glass-btn"
                        style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '12px', gap: '4px' }}
                        title="Pause Explanations"
                      >
                        <Pause size={12} fill="currentColor" /> Pause
                      </button>
                    )
                  )}

                  {/* Stop Button */}
                  <button
                    onClick={stop}
                    className="glass-btn"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      padding: 0,
                      borderColor: 'rgba(239, 68, 68, 0.3)'
                    }}
                    title="Stop & Dismiss captions"
                  >
                    <Square size={12} fill="rgba(239, 68, 68, 0.4)" style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
