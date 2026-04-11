import React from 'react';
import { LayoutDashboard, Search, BarChart3, TrendingUp, X, Home } from 'lucide-react';

export function Sidebar({ isOpen, setIsOpen, theme, currentView, setCurrentView }) {
  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-[var(--panel-bg)] border-r border-[var(--panel-border)] transition-all duration-300 z-50 
        ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'} 
        ${!isOpen && 'lg:w-20'}`}>
        
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg text-black">
              <TrendingUp size={20}/>
            </div>
            {(isOpen || window.innerWidth < 1024) && (
              <span className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase">VibeTrack</span>
            )}
          </div>
          {/* Close button for mobile */}
          <button className="lg:hidden text-[var(--text-primary)]" onClick={() => setIsOpen(false)}>
            <X size={24}/>
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          <NavItem icon={<Home size={22}/>} label="Home" active={currentView === 'landing'} showLabel={isOpen} onClick={() => setCurrentView('landing')} />
          <NavItem icon={<LayoutDashboard size={22}/>} label="Dashboard" active={currentView === 'dashboard'} showLabel={isOpen} onClick={() => setCurrentView('dashboard')} />
          <NavItem icon={<Search size={22}/>} label="Explore" active={currentView === 'explore'} showLabel={isOpen} onClick={() => setCurrentView('explore')} />
          <NavItem icon={<BarChart3 size={22}/>} label="Analytics" active={currentView === 'analytics'} showLabel={isOpen} onClick={() => setCurrentView('analytics')} />
        </nav>
      </aside>
    </>
  );
}

function NavItem({ icon, label, active, showLabel, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all
      ${active ? 'bg-white text-black font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]'}`}>
      {icon}
      {showLabel && <span className="text-sm tracking-wide uppercase">{label}</span>}
    </div>
  );
}