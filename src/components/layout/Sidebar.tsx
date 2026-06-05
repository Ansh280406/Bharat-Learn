import React from 'react';
import { Camera, BookOpen, User, Bookmark, TrendingUp, FileText, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';

export type AppTab = 'scanner' | 'index' | 'profile' | 'progress' | 'bookmarks' | 'notes';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const NAV_SECTIONS = [
  {
    label: 'Core Tools',
    items: [
      { id: 'scanner' as AppTab,   icon: Camera,      label: 'AR Scanner'       },
      { id: 'index'   as AppTab,   icon: BookOpen,    label: 'Lesson Library'   },
    ],
  },
  {
    label: 'My Learning',
    items: [
      { id: 'progress'   as AppTab, icon: TrendingUp,  label: 'Progress'        },
      { id: 'bookmarks'  as AppTab, icon: Bookmark,    label: 'Bookmarks'       },
      { id: 'notes'      as AppTab, icon: FileText,    label: 'Study Notes'     },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'profile'  as AppTab, icon: User,          label: 'Profile'         },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, mobileOpen, setMobileOpen, isCollapsed, setCollapsed
}) => {
  const handleNav = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        
        {/* Logo */}
        <div className="sidebar-logo">
          <img
            src="/logo.png"
            alt="Bharat-Learn"
            style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
          />
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <h1 className="logo-title">
                Bharat<span style={{ color: 'var(--text-primary)' }}>-Learn</span>
              </h1>
              <span className="logo-subtitle">Education AR</span>
            </div>
          )}
          {/* Collapse Toggle */}
          <button
            className="glass-btn ghost btn-icon"
            onClick={() => setCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              marginLeft: isCollapsed ? 'auto' : 'auto',
              width: '30px', height: '30px', borderRadius: '8px',
              flexShrink: 0, padding: 0,
            }}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: '4px' }}>
              {!isCollapsed && (
                <span className="nav-label">{section.label}</span>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNav(item.id)}
                    title={item.label}
                    style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer" style={{ justifyContent: isCollapsed ? 'center' : undefined }}>
          <ShieldCheck size={14} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
          {!isCollapsed && <span>NCERT Aligned · AI Powered</span>}
        </div>
      </aside>
    </>
  );
};
