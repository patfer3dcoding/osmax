
// Declare AudioContext type for older browsers
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import Window from './components/Window';
import { APPS } from './constants';
import type { WindowState } from './types';

const BACKGROUNDS = {
  default: `
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:#0078D7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#002050;stop-opacity:1" />
    </radialGradient>
    <g id="eyelash-top-left">
      <path d="M 80 80 Q 40 70, 10 50" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 80 80 Q 50 50, 30 20" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 80 80 Q 70 40, 50 10" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
    </g>
    <g id="eyelash-top-right">
      <path d="M 20 80 Q 60 70, 90 50" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 20 80 Q 50 50, 70 20" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 20 80 Q 30 40, 50 10" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
    </g>
    <g id="eyelash-bottom-left">
      <path d="M 80 20 Q 40 30, 10 50" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 80 20 Q 50 50, 30 80" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 80 20 Q 70 60, 50 90" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
    </g>
    <g id="eyelash-bottom-right">
      <path d="M 20 20 Q 60 30, 90 50" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 20 20 Q 50 50, 70 80" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M 20 20 Q 30 60, 50 90" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/>
    </g>
  </defs>
  <rect width="1920" height="1080" fill="url(#grad1)" />
  
  <g transform="translate(860, 380) scale(1.5)">
    <use href="#eyelash-top-left" x="0" y="0" />
    <use href="#eyelash-top-right" x="100" y="0" />
    <use href="#eyelash-bottom-left" x="0" y="100" />
    <use href="#eyelash-bottom-right" x="100" y="100" />
  </g>

  <text x="960" y="750" font-family="'Segoe UI', sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="300">
    Maxfra Academy OS
  </text>
  <text x="960" y="810" font-family="'Segoe UI', sans-serif" font-size="32" fill="white" text-anchor="middle" font-weight="500">
    1.0 Special Edition
  </text>
</svg>`,
  sunset: `
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#4a0e63;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#e13680;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffcc80;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sunsetGrad)" />
  <text x="960" y="750" font-family="'Segoe UI', sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="300" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
    Maxfra Academy OS
  </text>
  <text x="960" y="810" font-family="'Segoe UI', sans-serif" font-size="32" fill="white" text-anchor="middle" font-weight="500" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
    1.0 Special Edition
  </text>
</svg>`,
  matrix: `
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="matrixGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" />
      <stop offset="100%" stop-color="#0d2a0d" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#matrixGrad)" />
  <text x="960" y="750" font-family="'Segoe UI', sans-serif" font-size="48" fill="#34d399" text-anchor="middle" font-weight="300" style="text-shadow: 0 0 5px #34d399;">
    Maxfra Academy OS
  </text>
  <text x="960" y="810" font-family="'Segoe UI', sans-serif" font-size="32" fill="#34d399" text-anchor="middle" font-weight="500" style="text-shadow: 0 0 5px #34d399;">
    1.0 Special Edition
  </text>
</svg>`,
};

type SoundEvent = 'OPEN' | 'CLOSE' | 'MINIMIZE' | 'MAXIMIZE';
const SOUND_SCHEMES: Record<string, Record<SoundEvent, { freq: number, duration: number, type: OscillatorType }>> = {
    modern: {
        OPEN: { freq: 440, duration: 0.1, type: 'sine' },
        CLOSE: { freq: 220, duration: 0.1, type: 'sine' },
        MINIMIZE: { freq: 330, duration: 0.08, type: 'triangle' },
        MAXIMIZE: { freq: 550, duration: 0.08, type: 'triangle' },
    },
    xp: {
        OPEN: { freq: 523.25, duration: 0.15, type: 'square' },
        CLOSE: { freq: 261.63, duration: 0.15, type: 'square' },
        MINIMIZE: { freq: 392, duration: 0.1, type: 'sawtooth' },
        MAXIMIZE: { freq: 659.25, duration: 0.1, type: 'sawtooth' },
    },
    eleven: {
        OPEN: { freq: 600, duration: 0.05, type: 'sine' },
        CLOSE: { freq: 300, duration: 0.05, type: 'sine' },
        MINIMIZE: { freq: 450, duration: 0.04, type: 'sine' },
        MAXIMIZE: { freq: 750, duration: 0.04, type: 'sine' },
    }
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [isStartMenuOpen, setStartMenuOpen] = useState(false);
  const [backgroundId, setBackgroundId] = useState('default');
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [soundScheme, setSoundScheme] = useState('modern');
  const zIndexCounter = useRef(10);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevWindowsRef = useRef<WindowState[]>([]);
  
  // Declare AudioContext type for older browsers
  declare global {
    interface Window {
      webkitAudioContext: typeof AudioContext;
    }
  }

  useEffect(() => {
    try {
        const savedBg = localStorage.getItem('maxfra-os-background') as keyof typeof BACKGROUNDS | null;
        if (savedBg && BACKGROUNDS[savedBg]) {
            setBackgroundId(savedBg);
        }
        const savedSoundsEnabled = localStorage.getItem('maxfra-os-sounds-enabled');
        if (savedSoundsEnabled !== null) {
            setSoundsEnabled(savedSoundsEnabled === 'true');
        }
        const savedSoundScheme = localStorage.getItem('maxfra-os-sound-scheme');
        if (savedSoundScheme && SOUND_SCHEMES[savedSoundScheme]) {
            setSoundScheme(savedSoundScheme);
        }
    } catch (error) {
        console.error("Could not access localStorage. Using default settings.", error);
    }

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'maxfra-os-background' && e.newValue && BACKGROUNDS[e.newValue as keyof typeof BACKGROUNDS]) {
            setBackgroundId(e.newValue);
        }
        if (e.key === 'maxfra-os-sounds-enabled' && e.newValue !== null) {
            setSoundsEnabled(e.newValue === 'true');
        }
        if (e.key === 'maxfra-os-sound-scheme' && e.newValue && SOUND_SCHEMES[e.newValue]) {
            setSoundScheme(e.newValue);
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const playSound = useCallback((soundType: SoundEvent) => {
    if (!soundsEnabled) return;

    if (!audioCtxRef.current) {
        try {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
            return;
        }
    }
    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const scheme = SOUND_SCHEMES[soundScheme];
    if (!scheme || !scheme[soundType]) return;

    const { freq, duration, type } = scheme[soundType];
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  }, [soundsEnabled, soundScheme]);

  // Effect to play sound when a new window is opened
  useEffect(() => {
      if (windows.length > prevWindowsRef.current.length) {
          playSound('OPEN');
      }
      prevWindowsRef.current = windows;
  }, [windows, playSound]);

  const openApp = useCallback((appId: string) => {
    setWindows(prev => {
        const existingWindow = prev.find(w => w.appId === appId);
        if (existingWindow) {
            zIndexCounter.current += 1;
            return prev.map(w => w.id === existingWindow.id ? { ...w, isMinimized: false, zIndex: zIndexCounter.current } : w);
        }

        const appConfig = APPS.find(app => app.id === appId);
        if (!appConfig) return prev;

        const newWindowId = `${appId}-${Date.now()}`;
        zIndexCounter.current += 1;
        
        const newWindow: WindowState = {
            id: newWindowId,
            appId: appConfig.id,
            title: appConfig.title,
            icon: appConfig.icon,
            component: appConfig.component,
            position: { x: 50 + prev.length * 20, y: 50 + prev.length * 20 },
            size: appConfig.defaultSize || { width: 640, height: 480 },
            isMinimized: false,
            isMaximized: false,
            zIndex: zIndexCounter.current,
        };
        return [...prev, newWindow];
    });
    setStartMenuOpen(false);
  }, []);

  const closeWindow = useCallback((id: string) => {
    playSound('CLOSE');
    setWindows(prev => prev.filter(w => w.id !== id));
  }, [playSound]);

  const focusWindow = useCallback((id: string) => {
    zIndexCounter.current += 1;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter.current, isMinimized: false } : w));
  }, []);

  const minimizeWindow = useCallback((id:string) => {
      playSound('MINIMIZE');
      setWindows(prev => prev.map(w => w.id === id ? {...w, isMinimized: true } : w));
  }, [playSound]);

  const maximizeWindow = useCallback((id: string) => {
    playSound('MAXIMIZE');
    setWindows(prev => prev.map(w => {
        if (w.id === id) {
            zIndexCounter.current += 1;
            return { ...w, isMaximized: !w.isMaximized, zIndex: zIndexCounter.current };
        }
        return w;
    }));
  }, [playSound]);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position } : w));
  }, []);
  
  const updateWindowSize = useCallback((id: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position, size } : w));
  }, []);

  const backgroundSvg = BACKGROUNDS[backgroundId as keyof typeof BACKGROUNDS] || BACKGROUNDS.default;
  const backgroundImageUrl = `url("data:image/svg+xml,${encodeURIComponent(backgroundSvg)}")`;

  const topWindow = windows
      .filter(w => !w.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex)[0];
  const activeWindowId = topWindow?.id || null;

  return (
    <div className="h-screen w-screen bg-cover bg-center" style={{ backgroundImage: backgroundImageUrl }}>
      <Desktop apps={APPS} openApp={openApp} />
      
      {windows.map(ws => (
        <Window
          key={ws.id}
          windowState={ws}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onFocus={focusWindow}
          onDrag={updateWindowPosition}
          onResize={updateWindowSize}
          isActive={ws.id === activeWindowId}
        />
      ))}

      <StartMenu
        isOpen={isStartMenuOpen}
        apps={APPS}
        openApp={openApp}
        closeStartMenu={() => setStartMenuOpen(false)}
      />
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        toggleStartMenu={() => setStartMenuOpen(prev => !prev)}
        openApp={openApp}
        focusWindow={focusWindow}
        minimizeWindow={minimizeWindow}
      />
    </div>
  );
};

export default App;
