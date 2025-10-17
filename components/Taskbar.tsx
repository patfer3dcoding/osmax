import React, { useState, useEffect } from 'react';
import type { WindowState, AppConfig } from '../types';
import { APPS } from '../constants';
import * as Icons from './icons';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  toggleStartMenu: () => void;
  openApp: (appId: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, activeWindowId, toggleStartMenu, openApp, focusWindow, minimizeWindow }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fix: Explicitly type the Map to ensure correct type inference for `window` objects.
  const openWindowsByAppId = new Map<string, WindowState>(windows.map(w => [w.appId, w]));

  const handleTaskbarIconClick = (appId: string) => {
    const window = openWindowsByAppId.get(appId);
    if (window) {
      if (window.id === activeWindowId && !window.isMinimized) {
        minimizeWindow(window.id);
      } else {
        focusWindow(window.id);
      }
    } else {
      openApp(appId);
    }
  };
  
  const pinnedApps = APPS.filter(app => app.isPinned);
  const openAppIcons = APPS.filter(app => openWindowsByAppId.has(app.id) && !app.isPinned);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-900/80 backdrop-blur-xl flex items-center justify-between text-white z-50">
      <div className="flex items-center h-full">
        <button onClick={toggleStartMenu} className="px-3 h-full hover:bg-white/10 transition-colors">
          <Icons.StartIcon />
        </button>
        <div className="w-px h-6 bg-white/20"></div>
        
        {pinnedApps.concat(openAppIcons).map(app => {
          const window = openWindowsByAppId.get(app.id);
          const isActive = window?.id === activeWindowId && !window?.isMinimized;
          const isOpen = !!window;
          
          return (
            <button
              key={app.id}
              onClick={() => handleTaskbarIconClick(app.id)}
              className={`px-3 h-full flex items-center justify-center relative hover:bg-white/10 transition-colors ${isActive ? 'bg-white/20' : ''}`}
            >
              {app.icon('w-6 h-6')}
              {isOpen && <div className={`absolute bottom-0 h-0.5 w-4 rounded-full ${isActive ? 'bg-blue-400' : 'bg-gray-400'}`}></div>}
            </button>
          );
        })}
      </div>
      
      <div className="px-3 text-xs text-center">
        <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div>{time.toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default Taskbar;