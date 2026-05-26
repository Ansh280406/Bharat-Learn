import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, User, Lock, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for premium feel
    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      {/* Background Orbs */}
      <div className="aurora-bg">
        <div className="aurora-orb-3" />
      </div>
      <div className="grid-overlay" />

      <div className="glass-card anim-scale-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="logo-badge" style={{ margin: '0 auto 16px', width: '56px', height: '56px', fontSize: '28px' }}>
            🚀
          </div>
          <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-heading)', fontWeight: '900', marginBottom: '8px' }}>
            <span className="gradient-text-saffron">Bharat</span>-Learn
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Enter your credentials to continue your learning journey.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'var(--rose)',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'wiggle 0.3s ease',
          }}>
            <ShieldCheck size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Username Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}>
              <User size={18} />
            </div>
            <input
              type="text"
              placeholder="Username (demo)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                background: 'rgba(7,14,28,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                color: '#fff',
                fontSize: '15px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--saffron)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}>
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Password (0)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                background: 'rgba(7,14,28,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                color: '#fff',
                fontSize: '15px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--saffron)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="glass-btn primary"
            style={{
              padding: '16px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '800',
              marginTop: '8px',
              opacity: (isLoading || !username || !password) ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <span style={{ animation: 'pulse-ring 1s infinite' }}>Authenticating...</span>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <Zap size={12} style={{ display: 'inline', color: 'var(--saffron)', marginRight: '4px' }} />
            Demo credentials: <strong>ID: demo | Pass: 0</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
