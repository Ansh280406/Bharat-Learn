import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Award, Flame, Zap, BookOpen, Star, Sparkles, CreditCard, Radio, Users, Edit3, X, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout, addCredits, isBroadcasting, broadcastCode, toggleBroadcast, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    grade: user?.grade || '',
    school: user?.school || ''
  });

  if (!user) return null;

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '0 0 24px',
    }}>
      {/* ── HEADER CARD ── */}
      <div className="glass-card anim-scale-in" style={{
        padding: '32px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(99,102,241,0.05) 100%)',
        marginBottom: '20px',
        border: '1px solid rgba(99,102,241,0.15)',
        position: 'relative'
      }}>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="icon-btn" 
            style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px' }}
          >
            <Edit3 size={14} />
          </button>
        ) : (
          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsEditing(false)} className="icon-btn" style={{ borderColor: 'rgba(244,63,94,0.3)', color: 'var(--rose)', width: '32px', height: '32px' }}>
              <X size={14} />
            </button>
            <button onClick={handleSave} className="icon-btn" style={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--emerald)', width: '32px', height: '32px' }}>
              <Save size={14} />
            </button>
          </div>
        )}

        <div style={{
          width: '80px', height: '80px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--indigo) 0%, var(--sky) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)',
          margin: '0 auto 16px',
          boxShadow: '0 8px 30px var(--indigo-glow)',
        }}>
          {user.avatar || user.displayName.charAt(0)}
        </div>
        
        {!isEditing ? (
          <>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', fontWeight: '900', color: 'var(--text-primary)' }}>
              {user.displayName}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              {user.grade} • {user.school}
            </p>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxWidth: '260px', margin: '0 auto 16px' }}>
            <input 
              type="text" 
              className="search-bar"
              value={editForm.displayName} 
              onChange={e => setEditForm({...editForm, displayName: e.target.value})}
              placeholder="Full Name"
              style={{ width: '100%', textAlign: 'center', padding: '8px', background: 'var(--btn-bg)', border: '1px solid var(--glass-border-bright)', borderRadius: '8px', color: 'var(--text-primary)' }}
            />
            <select 
              className="search-bar"
              value={editForm.grade} 
              onChange={e => setEditForm({...editForm, grade: e.target.value})}
              style={{ width: '100%', textAlign: 'center', padding: '8px', background: 'var(--btn-bg)', border: '1px solid var(--glass-border-bright)', borderRadius: '8px', color: 'var(--text-primary)' }}
            >
              <option value="" disabled>Select Standard</option>
              <option value="Class XII">Class XII</option>
              <option value="Class XI">Class XI</option>
              <option value="Class X">Class X</option>
              <option value="Class IX">Class IX</option>
              <option value="Class VIII">Class VIII</option>
              <option value="Class VII">Class VII</option>
            </select>
            <input 
              type="text" 
              className="search-bar"
              value={editForm.school} 
              onChange={e => setEditForm({...editForm, school: e.target.value})}
              placeholder="School Name"
              style={{ width: '100%', textAlign: 'center', padding: '8px', background: 'var(--btn-bg)', border: '1px solid var(--glass-border-bright)', borderRadius: '8px', color: 'var(--text-primary)' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <div className="badge badge-saffron">
            <Flame size={14} /> {user.streak} Day Streak
          </div>
          <div className="badge badge-indigo">
            <Award size={14} /> Level {Math.floor(user.xp / 500) + 1}
          </div>
        </div>
      </div>

      {/* ── CREDITS CARD ── */}
      <div className="glass-card anim-fade-up delay-100" style={{
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid rgba(245,158,11,0.15)',
        background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(245,158,11,0.05) 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gold)'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>AI Credits</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Used for AI explanations</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'var(--font-heading)', color: 'var(--gold)', lineHeight: 1 }}>
              {user.credits}
            </div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Remaining
            </div>
          </div>
        </div>

        <button
          onClick={() => addCredits(50)}
          className="glass-btn primary"
          style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', background: 'linear-gradient(135deg, var(--gold) 0%, #d97706 100%)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
        >
          <CreditCard size={16} /> Buy 50 More Credits
        </button>
      </div>

      {/* ── TEACHER BROADCAST CARD ── */}
      {user.isTeacher && (
        <div className="glass-card anim-fade-up delay-150" style={{
          padding: '24px',
          marginBottom: '20px',
          border: isBroadcasting ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(99,102,241,0.15)',
          background: isBroadcasting 
            ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(34,197,94,0.08) 100%)' 
            : 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(99,102,241,0.05) 100%)',
          boxShadow: isBroadcasting ? '0 8px 32px rgba(34,197,94,0.15)' : 'none',
          transition: 'all 0.4s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: isBroadcasting ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                border: isBroadcasting ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isBroadcasting ? '#22c55e' : 'var(--indigo-light)'
              }}>
                <Radio size={20} className={isBroadcasting ? "pulse-anim" : ""} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>Classroom Broadcast</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Share AR views with students</p>
              </div>
            </div>
            {isBroadcasting && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px', borderRadius: '999px',
                background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                fontSize: '11px', fontWeight: '800'
              }}>
                <span className="dot" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} /> Live
              </div>
            )}
          </div>

          {isBroadcasting ? (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px dashed rgba(34,197,94,0.4)',
              borderRadius: '12px', padding: '16px', textAlign: 'center',
              marginBottom: '16px',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Join Code for Students
              </p>
              <div style={{ fontSize: '32px', fontFamily: 'monospace', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>
                {broadcastCode}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Users size={14} /> 24 Students Connected
              </div>
            </div>
          ) : (
             <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
               Start a broadcast to project your AR demonstrations directly to your students' devices in real-time. Ideal for large classrooms.
             </p>
          )}

          <button
            onClick={toggleBroadcast}
            className={`glass-btn ${isBroadcasting ? 'ghost' : 'primary'}`}
            style={{ 
              width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px',
              borderColor: isBroadcasting ? 'rgba(244,63,94,0.3)' : 'transparent',
              color: isBroadcasting ? 'var(--rose)' : '#fff',
            }}
          >
            {isBroadcasting ? 'Stop Broadcast' : 'Start Hosting Class'}
          </button>
        </div>
      )}

      {/* ── STATS GRID ── */}
      <div className="anim-fade-up delay-200" style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px'
      }}>
        <div className="glass-card-sm" style={{ padding: '20px', textAlign: 'center' }}>
          <BookOpen size={24} style={{ color: 'var(--sky)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{user.lessonsCompleted}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Lessons</div>
        </div>
        <div className="glass-card-sm" style={{ padding: '20px', textAlign: 'center' }}>
          <Star size={24} style={{ color: 'var(--emerald)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{user.quizzesPassed}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Quizzes Passed</div>
        </div>
        <div className="glass-card-sm" style={{ padding: '20px', textAlign: 'center' }}>
          <Zap size={24} style={{ color: 'var(--saffron)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{user.xp}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total XP</div>
        </div>
        <div className="glass-card-sm" style={{ padding: '20px', textAlign: 'center' }}>
          <Sparkles size={24} style={{ color: 'var(--indigo-light)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{user.scansUsed}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Scans</div>
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <button
        onClick={logout}
        className="glass-btn ghost"
        style={{ width: '100%', padding: '14px', borderRadius: '14px', color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.3)', backgroundColor: 'rgba(244,63,94,0.05)' }}
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
};
