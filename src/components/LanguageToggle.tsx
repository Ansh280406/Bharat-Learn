import React from 'react';
import type { Language } from '../types';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  ];

  return (
    <div className="glass-card flex items-center gap-2 p-2 max-w-fit mx-auto relative overflow-hidden" style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      borderRadius: '50px',
      zIndex: 100
    }}>
      <Globe className="text-secondary" size={18} style={{ color: 'var(--secondary)' }} />
      <div style={{ display: 'flex', gap: '4px' }}>
        {languages.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className="glass-btn"
              style={{
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '13px',
                border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                background: isActive ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.1) 100%)' : 'transparent',
                boxShadow: isActive ? '0 0 10px var(--primary-glow)' : 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
              }}
            >
              <span style={{ marginRight: '6px' }}>{lang.flag}</span>
              {lang.label.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
