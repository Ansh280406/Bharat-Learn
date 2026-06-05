import { useState } from 'react';
import type { PageType, Language, ScanResult } from './types';
import { useWebSpeech } from './hooks/useWebSpeech';
import { useAuth } from './context/AuthContext';
import { LanguageToggle } from './components/common/LanguageToggle';
import { CameraFeed } from './components/scanner/CameraFeed';
import { OfflineIndex } from './components/common/OfflineIndex';
import { ARContainer } from './components/ar/ARContainer';
import { Login } from './components/auth/Login';
import { Profile } from './components/auth/Profile';
import { ProgressTracker } from './components/common/ProgressTracker';
import { BookmarksPage } from './components/common/BookmarksPage';
import { StudyNotes } from './components/common/StudyNotes';
import { Sidebar, type AppTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Play, Pause, Square, Zap, ChevronRight } from 'lucide-react';

const ALL_PAGE_MOCK: Record<PageType, { title: string; details: string; mathEquation?: string; battleName?: string }> = {
  heart:       { title: 'Human Heart Anatomy',       details: 'Beating 3D heart biology overlay.' },
  water_cycle: { title: 'The Water Cycle',           details: 'Interactive evaporation & rain overlay.' },
  math:        { title: 'Algebra Equations',         details: 'Tactile equation balancer.', mathEquation: '2x + 4 = 10' },
  history:     { title: 'Battle of Panipat (1526)',  details: 'Mughal vs. Lodi historical map.', battleName: 'Battle of Panipat (1526)' },
  physics:     { title: 'Optics & Prisms',           details: 'Interactive light refraction lab.' },
  chemistry:   { title: 'Organic Chemistry',         details: '3D molecular bond visualization.' },
  math_3d:     { title: '3D Geometry',               details: 'Visualize planes and vectors in 3D space.' },
  unknown:     { title: 'Unknown Content',           details: 'AI-powered dynamic overlay.' },
};

function App() {
  const { user, isAuthenticated, updateXP, incrementLessons } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('scanner');

  const [language, setLanguage] = useState<Language>('en');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [sessionsToday, setSessionsToday] = useState(user?.scansUsed || 0);
  const [libraryStandardId, setLibraryStandardId] = useState<string | null>(null);
  const [librarySubjectId, setLibrarySubjectId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    speak, stop, pause, resume,
    isSpeaking, isPaused, voiceEnabled, setVoiceEnabled, activeSubtitle
  } = useWebSpeech();

  if (!isAuthenticated || !user) return <Login />;

  const handleScanComplete = (pageType: PageType, confidence: number, extractedInfo: any, aiExplanation?: string) => {
    setScanResult({
      pageType,
      confidence,
      title: extractedInfo?.title || 'Scanned Diagram',
      details: extractedInfo?.details || 'Educational overlay successfully aligned.',
      mathEquation: extractedInfo?.mathEquation,
      battleName: extractedInfo?.battleName,
      aiExplanation: aiExplanation || null,
      isLibrary: extractedInfo?.isLibrary,
      hologramImagePrompt: extractedInfo?.hologramImagePrompt || null,
      hologramLabels: extractedInfo?.hologramLabels || null,
      hologramHtml: extractedInfo?.hologramHtml || null,
      wikipediaQuery: extractedInfo?.wikipediaQuery || null,
    });
    updateXP(25);
    setSessionsToday(prev => prev + 1);
  };

  const handleSelectSubjectOffline = (mod: any) => {
    // If it's just a string, fallback to ALL_PAGE_MOCK
    const pageType = typeof mod === 'string' ? mod : mod.type;
    const data = ALL_PAGE_MOCK[pageType as PageType] || {
      title: mod.title || 'Interactive Lesson',
      details: mod.description || 'Educational AR Overlay'
    };

    setScanResult({
      pageType: pageType as PageType,
      confidence: 1.0,
      title: typeof mod !== 'string' && mod.title ? mod.title : data.title,
      details: typeof mod !== 'string' && mod.description ? mod.description : data.details,
      mathEquation: data.mathEquation,
      battleName: data.battleName,
      aiExplanation: null,
      isLibrary: true,
      wikipediaQuery: typeof mod !== 'string' ? mod.wikipediaQuery : undefined,
    });
    // Keep them on the 'index' tab so back button works correctly
    incrementLessons();
  };

  const handleTabChange = (tab: AppTab) => {
    if (tab !== activeTab) {
      setScanResult(null);
      stop();
      setActiveTab(tab);
    }
  };

  // Also usable from bookmarks
  const handleLaunchARFromBookmark = (subject: PageType) => {
    handleSelectSubjectOffline(subject);
    setActiveTab('scanner'); // Jump to scanner from bookmarks
  };

  const handleLanguageChange = (newLang: Language) => { setLanguage(newLang); stop(); };
  const handleResetScan = () => { setScanResult(null); stop(); };

  const xpToNextLevel = 500;
  const xpProgress = Math.min((user.xp / xpToNextLevel) * 100, 100);
  const level = Math.floor(user.xp / xpToNextLevel) + 1;

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="aurora-bg"><div className="aurora-orb-3" /></div>
      <div className="grid-overlay" />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        isCollapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="main-content-area">
        <Header
          user={user}
          level={level}
          xpProgress={xpProgress}
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
          stopVoice={stop}
          onMenuClick={() => setMobileMenuOpen(true)}
          setActiveTab={handleTabChange}
        />

        <div className="content-scroll">
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Language toggle (not on profile/progress/bookmarks/notes) */}
            {!['profile', 'progress', 'bookmarks', 'notes'].includes(activeTab) && (
              <div className="anim-fade-up delay-100" style={{ display: 'flex', justifyContent: 'center' }}>
                <LanguageToggle currentLanguage={language} onLanguageChange={handleLanguageChange} />
              </div>
            )}

            {/* Stats strip on scanner, no active result */}
            {!scanResult && activeTab === 'scanner' && (
              <div className="anim-fade-up delay-200" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { icon: '⚡', label: 'Credits', value: `${user.credits}`,        color: 'var(--gold)'   },
                  { icon: '⭐', label: 'Level',   value: `${level}`,               color: 'var(--indigo-light)' },
                  { icon: '📚', label: 'Scans',   value: `${sessionsToday} Today`, color: 'var(--saffron)' },
                ].map((s, i) => (
                  <div key={i} className="glass-card-sm" style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Main content */}
            <main className="anim-fade-up delay-300">
              {scanResult && (activeTab === 'scanner' || activeTab === 'index') ? (
                <ARContainer
                  pageType={scanResult.pageType}
                  
                  extractedInfo={scanResult}
                  language={language}
                  aiExplanation={scanResult.aiExplanation}
                  onSpeak={(txt) => speak(txt, language)}
                  onSpeakStop={stop}
                  onReset={handleResetScan}
                />
              ) : (
                <>
                  {activeTab === 'scanner' && (
                    <CameraFeed
                      onScanComplete={handleScanComplete}
                      isScanning={isScanning}
                      setIsScanning={setIsScanning}
                    />
                  )}
                  {activeTab === 'index' && (
                    <OfflineIndex 
                      onSelectSubject={handleSelectSubjectOffline} 
                      selectedStandardId={libraryStandardId}
                      setSelectedStandardId={setLibraryStandardId}
                      selectedSubjectId={librarySubjectId}
                      setSelectedSubjectId={setLibrarySubjectId}
                    />
                  )}
                  {activeTab === 'profile' && <Profile />}
                  {activeTab === 'progress' && <ProgressTracker />}
                  {activeTab === 'bookmarks' && <BookmarksPage onLaunchAR={handleLaunchARFromBookmark} />}
                  {activeTab === 'notes' && <StudyNotes />}
                </>
              )}
            </main>

            {/* How to use banner */}
            {!scanResult && activeTab === 'scanner' && (
              <div className="glass-card-sm anim-fade-up delay-400" style={{ padding: '14px 18px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--saffron-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--saffron)', flexShrink: 0 }}>
                    <Zap size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Point camera at a textbook page</strong> and tap <em>Scan</em> to unlock AR overlays, interactive quizzes & voice guides in 3 languages.
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating subtitle player */}
        {(isSpeaking || isPaused) && activeSubtitle && (
          <div className="subtitle-bar" style={{ position: 'absolute', bottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
              <div className="wave-bars" style={{ marginTop: '2px' }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="wave-bar" style={{ animationPlayState: isSpeaking && !isPaused && voiceEnabled ? 'running' : 'paused', opacity: voiceEnabled ? 1 : 0.4 }} />
                ))}
              </div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.5', flex: 1 }}>
                {activeSubtitle}
              </p>
            </div>
            <div className="divider" style={{ marginBottom: '10px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                {!voiceEnabled ? '👁️ Visual Mode' : isPaused ? '⏸ Paused' : '🔊 Speaking...'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {voiceEnabled && (
                  isPaused ? (
                    <button onClick={resume} className="glass-btn primary" style={{ padding: '5px 14px', fontSize: '12px', borderRadius: '999px' }}>
                      <Play size={11} fill="currentColor" /> Resume
                    </button>
                  ) : (
                    <button onClick={pause} className="glass-btn ghost" style={{ padding: '5px 14px', fontSize: '12px', borderRadius: '999px' }}>
                      <Pause size={11} fill="currentColor" /> Pause
                    </button>
                  )
                )}
                <button onClick={stop} className="glass-btn ghost btn-icon" style={{ borderColor: 'rgba(244,63,94,0.3)', width: '30px', height: '30px' }} title="Stop">
                  <Square size={11} fill="rgba(244,63,94,0.5)" style={{ color: 'var(--rose)' }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
