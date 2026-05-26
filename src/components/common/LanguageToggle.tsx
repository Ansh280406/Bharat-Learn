import React from 'react';
import type { Language } from '../../types';
import { Globe2 } from 'lucide-react';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',   native: 'हिन्दी',  flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati',native: 'ગુજરાતી', flag: '🇮🇳' },
];

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 8px',
      background: 'rgba(4,8,15,0.85)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '999px',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(255,107,43,0.12)',
        color: 'var(--saffron)',
        flexShrink: 0,
      }}>
        <Globe2 size={14} />
      </div>

      <div style={{ display: 'flex', gap: '3px' }}>
        {LANGUAGES.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-${lang.code}`}
              onClick={() => onLanguageChange(lang.code)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '999px',
                border: isActive ? '1px solid rgba(255,107,43,0.5)' : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(255,107,43,0.2) 0%, rgba(232,93,26,0.15) 100%)'
                  : 'transparent',
                boxShadow: isActive ? '0 0 12px rgba(255,107,43,0.2)' : 'none',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>{lang.flag}</span>
              <span style={{ fontFamily: lang.code !== 'en' ? 'system-ui, sans-serif' : 'var(--font-body)' }}>
                {lang.native.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
