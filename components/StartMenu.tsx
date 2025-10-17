
import React, { useRef, useEffect } from 'react';
import type { AppConfig } from '../types';

interface StartMenuProps {
  isOpen: boolean;
  apps: AppConfig[];
  openApp: (appId: string) => void;
  closeStartMenu: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ isOpen, apps, openApp, closeStartMenu }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeStartMenu();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeStartMenu]);
  
  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="absolute bottom-10 left-0 w-80 h-[500px] bg-gray-800/80 backdrop-blur-xl text-white flex flex-col shadow-2xl rounded-tr-lg">
      <div className="flex-grow p-4 overflow-y-auto">
        <h2 className="font-semibold mb-2">Applications</h2>
        <ul>
          {apps.map(app => (
            <li key={app.id}>
              <button
                onClick={() => openApp(app.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-white/10 rounded"
              >
                {app.icon('w-6 h-6')}
                <span>{app.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StartMenu;
