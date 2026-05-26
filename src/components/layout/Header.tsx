import React, { useState } from 'react';
import { Search, Bell, Menu, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import type { UserProfile } from '../../context/AuthContext';

interface HeaderProps {
  user: UserProfile;
  level: number;
  xpProgress: number;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  stopVoice: () => void;
  onMenuClick: () => void;
  setActiveTab: (tab: 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, level, xpProgress, voiceEnabled, setVoiceEnabled, stopVoice, onMenuClick, setActiveTab 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        
        <div className="search-bar hide-mobile">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search NCERT topics, AR models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        {/* Streak Pill */}
        <div className="header-pill hide-mobile">
          <span style={{ fontSize: '14px' }}>🔥</span>
          <span style={{ color: 'var(--gold)' }}>{user.streak} Day Streak</span>
        </div>

        {/* Level XP Pill */}
        <div className="header-pill hide-mobile" style={{flexDirection: 'column', alignItems: 'flex-start', padding: '4px 12px', minWidth: '100px'}}>
          <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center', gap:'8px'}}>
            <span style={{fontSize:'10px', color:'var(--text-muted)'}}>LVL {level}</span>
            <span style={{fontSize:'11px', color:'var(--gold)', fontWeight:'700'}}>{user.xp} XP</span>
          </div>
          <div className="progress-track" style={{height:'3px', width:'100%', background: 'rgba(255,255,255,0.05)'}}>
            <div className="progress-fill" style={{width: `${xpProgress}%`}} />
          </div>
        </div>

        {/* Voice Toggle */}
        <button
          onClick={() => { const next = !voiceEnabled; setVoiceEnabled(next); if (!next) stopVoice(); }}
          className={`icon-btn ${voiceEnabled ? 'active-icon' : ''}`}
          title="Voice Guide Toggle"
        >
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Notification */}
        <button className="icon-btn hide-mobile">
          <Bell size={16} />
          <span className="notification-dot" />
        </button>

        {/* Theme Toggle */}
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Avatar */}
        <button className="avatar-btn" onClick={() => setActiveTab('profile')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--indigo) 0%, var(--sky) 100%)', color: '#fff', fontWeight: '800', fontSize: '16px' }}>
          {user.avatar && user.avatar.length <= 2 ? user.avatar : <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} alt="Avatar" />}
        </button>
      </div>
    </header>
  );
};
