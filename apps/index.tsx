

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FolderIcon, FileIcon, MaxfraAIBrowserIcon, ArrowLeft, ArrowRight, ReloadIcon } from '../components/icons';

// A simple placeholder for app content
const AppPlaceholder: React.FC<{ appName: string; children?: React.ReactNode }> = ({ appName, children }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-600 p-4">
    <p className="text-lg font-semibold mb-4">{appName}</p>
    {children || <p>This application is a placeholder.</p>}
  </div>
);

export const NotepadApp = () => {
    const [content, setContent] = useState('');
    return (
        <textarea 
            className="w-full h-full p-2 border-none resize-none focus:outline-none bg-white text-black"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
        />
    );
};

export const BrowserApp = () => {
    const [url, setUrl] = useState('https://example.com');
    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="p-1 bg-gray-300 flex items-center gap-2">
                <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="flex-grow p-1 rounded-sm border border-gray-400"
                />
            </div>
            <div className="flex-grow border-t border-gray-400 p-4 text-center">
                <p>This is a fake browser.</p>
                <p>Navigating to: <strong>{url}</strong></p>
                <p className="mt-4 text-sm text-gray-500">Functionality is simulated.</p>
            </div>
        </div>
    );
};

export const MaxfraAiBrowserApp = () => {
    const [inputValue, setInputValue] = useState('https://www.google.com');
    const [history, setHistory] = useState<string[]>(['https://www.google.com']);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
    const [error, setError] = useState<string | null>(null);

    const isValidUrl = (urlString: string): boolean => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    const formatUrl = (input: string): string => {
        if (!input) return '';
        if (isValidUrl(input)) return input;
        if (input.startsWith('http://') || input.startsWith('https://')) return input;
        if (input.includes('.') && !input.includes(' ')) return `https://${input}`;
        return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
    };

    const navigate = (url: string) => {
        try {
            setError(null);
            const formattedUrl = formatUrl(url);
            setCurrentUrl(formattedUrl);
            setInputValue(url);
            
            if (currentHistoryIndex < history.length - 1) {
                // If we're not at the end of the history, remove forward history
                setHistory(prev => [...prev.slice(0, currentHistoryIndex + 1), formattedUrl]);
            } else {
                setHistory(prev => [...prev, formattedUrl]);
            }
            setCurrentHistoryIndex(prev => prev + 1);
            setIsLoading(true);
        } catch (err) {
            setError('Invalid URL or navigation failed');
            console.error('Navigation error:', err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(inputValue);
    };

    const goBack = () => {
        if (currentHistoryIndex > 0) {
            setCurrentHistoryIndex(prev => prev - 1);
            const previousUrl = history[currentHistoryIndex - 1];
            setCurrentUrl(previousUrl);
            setInputValue(previousUrl);
        }
    };

    const goForward = () => {
        if (currentHistoryIndex < history.length - 1) {
            setCurrentHistoryIndex(prev => prev + 1);
            const nextUrl = history[currentHistoryIndex + 1];
            setCurrentUrl(nextUrl);
            setInputValue(nextUrl);
        }
    };

    const reload = () => {
        if (iframeRef.current) {
            setIsLoading(true);
            iframeRef.current.src = currentUrl;
        }
    };

    const goHome = () => {
        navigate('https://www.google.com');
    };

    useEffect(() => {
        const handleLoad = () => {
            setIsLoading(false);
            if (iframeRef.current?.contentWindow?.location.href) {
                try {
                    const actualUrl = iframeRef.current.contentWindow.location.href;
                    setInputValue(actualUrl);
                    setCurrentUrl(actualUrl);
                    setError(null);
                } catch (err) {
                    console.error('Error accessing iframe location:', err);
                    // Don't set error here as some sites legitimately block access to their location
                }
            }
        };

        const handleError = () => {
            setIsLoading(false);
            setError('Failed to load the webpage. The site might be unavailable or blocked.');
        };

        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', handleLoad);
            iframe.addEventListener('error', handleError);
        }

        return () => {
            if (iframe) {
                iframe.removeEventListener('load', handleLoad);
                iframe.removeEventListener('error', handleError);
            }
        };
    }, []);

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="flex items-center p-2 bg-gray-100 border-b gap-2">
                <button 
                    onClick={goBack} 
                    disabled={currentHistoryIndex <= 0}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                    onClick={goForward}
                    disabled={currentHistoryIndex >= history.length - 1}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={reload} className="p-2 rounded-full hover:bg-gray-200">
                    <ReloadIcon className="w-5 h-5" />
                </button>
                <button onClick={goHome} className="p-2 rounded-full hover:bg-gray-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                </button>
                <form onSubmit={handleSubmit} className="flex-grow">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Search Google or enter a URL"
                        className="w-full p-2 rounded bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </form>
            </div>
            <div className="flex-grow bg-white relative overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                )}
                {error ? (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center p-8">
                            <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
                            <button 
                                onClick={() => {
                                    setError(null);
                                    navigate('https://www.google.com');
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Return to Google
                            </button>
                        </div>
                    </div>
                ) : (
                    <iframe
                        ref={iframeRef}
                        src={currentUrl}
                        className="w-full h-full border-none"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals allow-presentation allow-top-navigation"
                        allow="fullscreen; clipboard-read; clipboard-write"
                        title="Browser Content"
                        onError={() => setError('Failed to load the webpage. The site might be unavailable or blocked.')}
                    />
                )}
            </div>
        </div>
    );
};

// --- File Explorer App ---

type FSNode = FileNode | DirectoryNode;

interface FileNode {
    type: 'file';
    name: string;
}

interface DirectoryNode {
    type: 'directory';
    name: string;
    children: FSNode[];
}

const initialFileSystem: DirectoryNode = {
    type: 'directory',
    name: 'root',
    children: [
        { type: 'directory', name: 'Documents', children: [
            { type: 'file', name: 'resume.txt' },
        ]},
        { type: 'directory', name: 'Pictures', children: [] },
        { type: 'file', name: 'system.config' },
    ]
};

const findNodeByPath = (root: DirectoryNode, path: string[]): DirectoryNode | null => {
    let currentNode: DirectoryNode = root;
    for (const part of path) {
        const nextNode = currentNode.children.find(child => child.name === part && child.type === 'directory') as DirectoryNode | undefined;
        if (!nextNode) return null;
        currentNode = nextNode;
    }
    return currentNode;
};

const addNodeToPath = (root: DirectoryNode, path: string[], newNode: FSNode): DirectoryNode => {
    const newRoot = JSON.parse(JSON.stringify(root)); // Deep copy
    const parentNode = findNodeByPath(newRoot, path);
    if (parentNode && !parentNode.children.some(child => child.name === newNode.name)) {
        parentNode.children.push(newNode);
    }
    return newRoot;
};

export const FileExplorerApp = () => {
    const [fs, setFs] = useState<DirectoryNode>(initialFileSystem);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    
    useEffect(() => {
        try {
            const savedFs = localStorage.getItem('maxfra-filesystem');
            if (savedFs) {
                setFs(JSON.parse(savedFs));
            } else {
                setFs(initialFileSystem);
            }
        } catch (error) {
            console.error("Failed to load filesystem from localStorage", error);
            setFs(initialFileSystem);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('maxfra-filesystem', JSON.stringify(fs));
        } catch (error) {
            console.error("Failed to save filesystem to localStorage", error);
        }
    }, [fs]);

    const handleNavigate = (folderName: string) => {
        setCurrentPath(prev => [...prev, folderName]);
    };

    const handleBack = () => {
        setCurrentPath(prev => prev.slice(0, -1));
    };

    const handleCreate = (type: 'file' | 'directory') => {
        const name = window.prompt(`Enter name for new ${type}:`);
        if (name) {
            const newNode = type === 'file' ? { type, name } : { type, name, children: [] };
            setFs(prevFs => addNodeToPath(prevFs, currentPath, newNode as FSNode));
        }
    };
    
    const currentDirectory = findNodeByPath(fs, currentPath) || fs;

    return (
        <div className="w-full h-full flex flex-col bg-white text-black">
            <div className="flex items-center p-2 bg-gray-100 border-b gap-2">
                <button onClick={handleBack} disabled={currentPath.length === 0} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                    &larr; Back
                </button>
                <div className="flex-grow p-2 bg-white border rounded-sm text-sm">
                    C:\{currentPath.join('\\')}
                </div>
                <button onClick={() => handleCreate('file')} className="px-4 py-2 bg-blue-500 text-white rounded">
                    New File
                </button>
                <button onClick={() => handleCreate('directory')} className="px-4 py-2 bg-green-500 text-white rounded">
                    New Folder
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="grid grid-cols-5 gap-6">
                    {currentDirectory.children.map(node => (
                        <div
                            key={node.name}
                            className="flex flex-col items-center p-2 rounded hover:bg-blue-100 cursor-pointer"
                            onDoubleClick={() => node.type === 'directory' && handleNavigate(node.name)}
                        >
                            {node.type === 'directory' ? <FolderIcon className="w-10 h-10" /> : <FileIcon className="w-10 h-10" />}
                            <span className="text-sm mt-2 text-center break-all">{node.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SettingsApp = () => {
    const [currentBg, setCurrentBg] = useState('default');
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [soundScheme, setSoundScheme] = useState('modern');

    useEffect(() => {
        try {
            const savedBg = localStorage.getItem('maxfra-os-background');
            if (savedBg) setCurrentBg(savedBg);

            const savedSoundsEnabled = localStorage.getItem('maxfra-os-sounds-enabled');
            if (savedSoundsEnabled !== null) setSoundsEnabled(savedSoundsEnabled === 'true');

            const savedSoundScheme = localStorage.getItem('maxfra-os-sound-scheme');
            if (savedSoundScheme) setSoundScheme(savedSoundScheme);
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
        }
    }, []);

    const handleBgChange = (bgId: string) => {
        localStorage.setItem('maxfra-os-background', bgId);
        setCurrentBg(bgId);
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'maxfra-os-background',
            newValue: bgId,
            oldValue: currentBg,
            storageArea: localStorage,
        }));
    };

    const handleSoundsEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isEnabled = e.target.checked;
        setSoundsEnabled(isEnabled);
        localStorage.setItem('maxfra-os-sounds-enabled', String(isEnabled));
        window.dispatchEvent(new StorageEvent('storage', { key: 'maxfra-os-sounds-enabled', newValue: String(isEnabled) }));
    };

    const handleSoundSchemeChange = (scheme: string) => {
        setSoundScheme(scheme);
        localStorage.setItem('maxfra-os-sound-scheme', scheme);
        window.dispatchEvent(new StorageEvent('storage', { key: 'maxfra-os-sound-scheme', newValue: scheme }));
        // Play a sample sound on change
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    };

    const backgrounds = {
        default: { name: 'Default Blue', style: { background: 'radial-gradient(#0078D7, #002050)' } },
        sunset: { name: 'Sunset', style: { background: 'linear-gradient(#4a0e63, #e13680, #ffcc80)' } },
        matrix: { name: 'Matrix', style: { background: 'linear-gradient(#000, #0d2a0d)' } },
    };

    const soundSchemes = [
        { id: 'modern', name: 'Modern' },
        { id: 'xp', name: 'Windows XP' },
        { id: 'eleven', name: 'Windows 11' },
    ];

    return (
        <div className="w-full h-full flex bg-gray-200 text-black overflow-y-auto">
            <div className="w-56 bg-gray-300 p-2 border-r border-gray-400">
                <h2 className="text-lg font-bold p-2">Settings</h2>
                <ul>
                    <li>
                        <button className="w-full text-left p-2 rounded bg-blue-200 border border-blue-400 font-semibold">
                            Personalization
                        </button>
                    </li>
                </ul>
            </div>
            <div className="flex-grow p-6">
                <h3 className="text-2xl font-bold mb-4">Background</h3>
                <p className="mb-6 text-gray-600">Select a desktop background to personalize your OS.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(backgrounds).map(([id, { name, style }]) => (
                        <div key={id}>
                            <button
                                onClick={() => handleBgChange(id)}
                                className={`w-full h-24 rounded-md border-4 transition-all ${currentBg === id ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}`}
                                style={style}
                            />
                            <p className="text-center mt-2 text-sm font-medium">{name}</p>
                        </div>
                    ))}
                </div>

                <h3 className="text-2xl font-bold mb-4 mt-12">System Sounds</h3>
                <p className="mb-6 text-gray-600">Configure audio feedback for OS interactions.</p>
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <label htmlFor="sound-toggle" className="font-medium text-gray-800">Enable System Sounds</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="sound-toggle" className="sr-only peer" checked={soundsEnabled} onChange={handleSoundsEnabledChange} />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className={`mt-6 transition-opacity ${!soundsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h4 className="font-medium text-gray-800 mb-3">Sound Scheme</h4>
                    <div className="flex flex-col space-y-2">
                        {soundSchemes.map(({ id, name }) => (
                            <label key={id} className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                                <input
                                    type="radio"
                                    name="sound-scheme"
                                    value={id}
                                    checked={soundScheme === id}
                                    onChange={() => handleSoundSchemeChange(id)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-900">{name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                 <div className="mt-12 p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-bold">About</h4>
                    <p className="text-sm text-gray-700">Maxfra Academy OS - Version 1.0 Special Edition</p>
                </div>
            </div>
        </div>
    );
};

export const CalculatorApp = () => {
    const [display, setDisplay] = useState('0');
    
    const handleButtonClick = (value: string) => {
        if (value === 'C') {
            setDisplay('0');
        } else if (value === '=') {
            try {
                // eslint-disable-next-line no-eval
                const result = eval(display.replace(/[^0-9.*/+-]/g, ''));
                setDisplay(String(result));
            } catch (error) {
                setDisplay('Error');
            }
        } else {
            if (display === '0' || display === 'Error') {
                setDisplay(value);
            } else {
                setDisplay(display + value);
            }
        }
    };

    const buttons = [
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        'C', '0', '=', '+'
    ];

    return (
        <div className="w-full h-full flex flex-col bg-gray-800 p-2">
            <div className="bg-gray-900 text-white text-right text-4xl p-4 rounded-t-md mb-2 break-all overflow-hidden">
                {display}
            </div>
            <div className="grid grid-cols-4 gap-2 flex-grow">
                {buttons.map(btn => (
                    <button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className={`
                            ${'/*-+='.includes(btn) ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600 hover:bg-gray-700'}
                            ${btn === 'C' ? 'bg-red-500 hover:bg-red-600' : ''}
                            text-white font-bold py-2 px-4 rounded text-2xl focus:outline-none focus:ring-2 focus:ring-opacity-50
                            ${'/*-+=C'.includes(btn) ? 'focus:ring-white' : 'focus:ring-gray-500' }
                        `}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Calendar App Implementation ---

const LOCATIONS = ['Polanco', 'Perisur', 'Ciudad Brisas'];
const COURSES = ['Microblading', 'Eyelash Extensions', 'Lash Lifting', 'Henna'];
const SERVICES = ['Pickup Diploma', 'Information'];
const TEACHERS = ['Maggi', 'Fernando', 'Rossi'];
const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${10 + i}:00`); // 10am to 8pm

interface Appointment {
    id: string;
    date: Date;
    time: string;
    studentName: string;
    location: string;
    service: string;
    teacher: string;
}

const initialAppointments: Appointment[] = [
    { id: '1', date: new Date(), time: '11:00', studentName: 'Jane Doe', location: 'Polanco', service: 'Microblading', teacher: 'Maggi' },
    { id: '2', date: new Date(), time: '14:00', studentName: 'John Smith', location: 'Perisur', service: 'Eyelash Extensions', teacher: 'Fernando' },
];

const emptyAppointment = { 
    time: '10:00', 
    location: LOCATIONS[0], 
    service: COURSES[0], 
    teacher: TEACHERS[0], 
    studentName: '', 
    customTeacher: '' 
};


export const CalendarApp = () => {
    const [view, setView] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAppointmentDetails, setNewAppointmentDetails] = useState(emptyAppointment);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
    const [showImageReview, setShowImageReview] = useState(false);
    const [confirmationImageUrl, setConfirmationImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        try {
            const savedAppointments = localStorage.getItem('maxfra-appointments');
            if (savedAppointments) {
                const parsed = JSON.parse(savedAppointments).map((appt: any) => ({
                    ...appt,
                    date: new Date(appt.date)
                }));
                setAppointments(parsed);
            } else {
                setAppointments(initialAppointments);
            }
        } catch (error) {
            console.error("Failed to load appointments from localStorage", error);
            setAppointments(initialAppointments);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('maxfra-appointments', JSON.stringify(appointments));
        } catch (error) {
            console.error("Failed to save appointments to localStorage", error);
        }
    }, [appointments]);

    const handleDateChange = (days: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + days);
            return newDate;
        });
    };

    const handleMonthChange = (months: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + months);
            return newDate;
        });
    };

    const handlePrev = () => {
        if (view === 'daily') handleDateChange(-1);
        else if (view === 'weekly') handleDateChange(-7);
        else if (view === 'monthly') handleMonthChange(-1);
    };

    const handleNext = () => {
        if (view === 'daily') handleDateChange(1);
        else if (view === 'weekly') handleDateChange(7);
        else if (view === 'monthly') handleMonthChange(1);
    };

    const handleToday = () => setSelectedDate(new Date());
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAppointmentDetails(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'teacher' && value !== 'Other') {
                newState.customTeacher = '';
            }
            return newState;
        });
    };
    
    const closeForms = () => {
        setShowAddForm(false);
        setEditingAppointment(null);
        setNewAppointmentDetails(emptyAppointment);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalTeacher = newAppointmentDetails.teacher === 'Other' ? newAppointmentDetails.customTeacher : newAppointmentDetails.teacher;

        if (!finalTeacher || !finalTeacher.trim()) {
            alert("Please specify a teacher.");
            return;
        }

        const appointmentData = {
            studentName: newAppointmentDetails.studentName,
            time: newAppointmentDetails.time,
            location: newAppointmentDetails.location,
            service: newAppointmentDetails.service,
            teacher: finalTeacher,
        };

        if (editingAppointment) {
            const updatedAppt: Appointment = {
                ...editingAppointment,
                ...appointmentData,
            };
            setAppointments(prev => prev.map(appt => appt.id === editingAppointment.id ? updatedAppt : appt));
            setConfirmedAppointment(updatedAppt);
        } else {
            const newAppt: Appointment = {
                id: Date.now().toString(),
                date: selectedDate,
                ...appointmentData,
            };
            setAppointments(prev => [...prev, newAppt]);
            setConfirmedAppointment(newAppt);
        }

        closeForms();
        setShowConfirmation(true);
    };

    const escapeXML = (str: string) => {
        return str.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    const generateConfirmationImage = (appointment: Appointment): string => {
        const svgContent = `
            <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
                <g font-family="sans-serif" font-size="14" fill="#1f2937">
                    <text x="20" y="40" font-weight="bold" font-size="18" fill="#10b981">Appointment Confirmed</text>
                    <text x="20" y="80">Student: <tspan font-weight="bold">${escapeXML(appointment.studentName)}</tspan></text>
                    <text x="20" y="105">Date: <tspan font-weight="bold">${appointment.date.toLocaleDateString()}</tspan></text>
                    <text x="20" y="130">Time: <tspan font-weight="bold">${appointment.time}</tspan></text>
                    <text x="20" y="155">Location: <tspan font-weight="bold">${escapeXML(appointment.location)}</tspan></text>
                    <text x="20" y="180">Service: <tspan font-weight="bold">${escapeXML(appointment.service)}</tspan></text>
                    <text x="20" y="205">Teacher: <tspan font-weight="bold">${escapeXML(appointment.teacher)}</tspan></text>
                </g>
                <text x="380" y="235" font-size="12" fill="#9ca3af" text-anchor="end">Maxfra Academy OS</text>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svgContent)}`;
    };

    const handleConfirmAndSave = () => {
        if (!confirmedAppointment) return;
        
        console.log('Confirmed and saved:', confirmedAppointment);
        const imageUrl = generateConfirmationImage(confirmedAppointment);
        setConfirmationImageUrl(imageUrl);
        setShowImageReview(true);
        setShowConfirmation(false);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            setAppointments(prev => prev.filter(appt => appt.id !== id));
            setViewingAppointment(null);
        }
    };
    
    const handleEdit = (appt: Appointment) => {
        setViewingAppointment(null);
        setEditingAppointment(appt);
        
        const isPredefinedTeacher = TEACHERS.includes(appt.teacher);
        
        setNewAppointmentDetails({
            studentName: appt.studentName,
            time: appt.time,
            location: appt.location,
            service: appt.service,
            teacher: isPredefinedTeacher ? appt.teacher : 'Other',
            customTeacher: isPredefinedTeacher ? '' : appt.teacher,
        });
        setShowAddForm(true);
    };

    const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', options).format(date);
    
    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };
    
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = new Date(year, month, 1);
        const days = [];
        while (day.getMonth() === month) {
            days.push(new Date(day));
            day.setDate(day.getDate() + 1);
        }
        return days;
    };
    
    const renderHeader = () => {
        let title = '';
        if (view === 'daily') title = formatDate(selectedDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        else if (view === 'weekly') {
            const start = getStartOfWeek(selectedDate);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            title = `${formatDate(start, { month: 'short', day: 'numeric' })} - ${formatDate(end, { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        else if (view === 'monthly') title = formatDate(selectedDate, { month: 'long', year: 'numeric' });

        return (
            <div className="flex justify-between items-center p-4 bg-gray-100 border-b text-black">
                <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="px-4 py-3 bg-gray-200 rounded font-bold text-lg">&lt;</button>
                    <button onClick={handleNext} className="px-4 py-3 bg-gray-200 rounded font-bold text-lg">&gt;</button>
                    <button onClick={handleToday} className="px-5 py-3 text-sm bg-gray-200 rounded">Today</button>
                    <h2 className="text-xl font-semibold ml-4">{title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setView('daily')} className={`px-5 py-3 text-sm rounded ${view === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Day</button>
                    <button onClick={() => setView('weekly')} className={`px-5 py-3 text-sm rounded ${view === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Week</button>
                    <button onClick={() => setView('monthly')} className={`px-5 py-3 text-sm rounded ${view === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Month</button>
                    <button onClick={() => { setEditingAppointment(null); setNewAppointmentDetails(emptyAppointment); setShowAddForm(true); }} className="ml-4 px-5 py-3 bg-green-500 text-white rounded font-semibold text-sm">+ Add Appointment</button>
                </div>
            </div>
        );
    };

    const renderDailyView = () => (
        <div className="flex-grow grid grid-cols-4 overflow-auto text-black">
            <div className="col-span-1 border-r">
                {TIME_SLOTS.map(time => <div key={time} className="h-20 flex items-center justify-center border-b text-sm font-medium text-gray-500">{time}</div>)}
            </div>
            <div className="col-span-3 grid grid-cols-3">
                {LOCATIONS.map(location => (
                    <div key={location} className="border-r relative">
                        <div className="text-center font-bold py-1 border-b bg-gray-50">{location}</div>
                        <div className="relative h-full">
                            {TIME_SLOTS.slice(0, -1).map((_, i) => <div key={i} className="h-20 border-b"></div>)}
                            {appointments
                                .filter(a => a.location === location && a.date.toDateString() === selectedDate.toDateString())
                                .map(a => {
                                    const top = TIME_SLOTS.indexOf(a.time) * 80; // 80px per hour
                                    return (
                                        <div 
                                            key={a.id} 
                                            style={{ top: `${top}px` }} 
                                            className="absolute left-1 right-1 bg-blue-200 p-1 rounded-lg border border-blue-400 text-xs overflow-hidden h-20 flex flex-col justify-center cursor-pointer hover:bg-blue-300"
                                            onClick={() => setViewingAppointment(a)}
                                        >
                                            <p className="font-bold">{a.studentName}</p>
                                            <p>{a.service}</p>
                                            <p className="text-gray-600">{a.teacher}</p>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderWeeklyView = () => {
        const startOfWeek = getStartOfWeek(selectedDate);
        const days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });

        return (
            <div className="flex-grow grid grid-cols-7 overflow-auto text-black">
                {days.map(day => (
                    <div key={day.toISOString()} className="border-r">
                        <div className="text-center font-bold py-1 border-b bg-gray-50">
                            {formatDate(day, { weekday: 'short', day: 'numeric' })}
                        </div>
                        <div className="p-1 h-full overflow-y-auto">
                            {appointments
                                .filter(a => a.date.toDateString() === day.toDateString())
                                .sort((a,b) => a.time.localeCompare(b.time))
                                .map(a => (
                                <div 
                                    key={a.id} 
                                    className="bg-blue-100 p-1 rounded border border-blue-300 text-xs mb-1 cursor-pointer hover:bg-blue-200"
                                    onClick={() => setViewingAppointment(a)}
                                >
                                    <p className="font-bold">{a.time}</p>
                                    <p>{a.studentName}</p>
                                    <p className="text-gray-500">{a.location}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderMonthlyView = () => {
        const days = getDaysInMonth(selectedDate);
        const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
        const startOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth -1); // Monday start
        
        return (
            <div className="flex-grow grid grid-cols-7 grid-rows-6 text-black">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="text-center font-bold py-2 border-b border-r bg-gray-50">{day}</div>)}
                {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} className="border-b border-r"></div>)}
                {days.map(day => {
                    const dailyAppointments = appointments.filter(a => a.date.toDateString() === day.toDateString());
                    return (
                        <div 
                            key={day.toISOString()} 
                            className="border-b border-r p-1 cursor-pointer hover:bg-gray-100"
                            onClick={() => { setSelectedDate(day); setView('daily'); }}
                        >
                            <div className="font-semibold">{day.getDate()}</div>
                            {dailyAppointments.length > 0 && 
                                <div className="mt-1 bg-green-200 text-green-800 text-xs rounded-full px-2 py-0.5 text-center">
                                    {dailyAppointments.length} appt(s)
                                </div>
                            }
                        </div>
                    );
                })}
            </div>
        );
    };
    
    const renderAddForm = () => (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-black">
                <h3 className="text-xl font-bold mb-4">{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</h3>
                <form onSubmit={handleFormSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Student Name</label>
                            <input type="text" name="studentName" value={newAppointmentDetails.studentName} onChange={handleFormChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <select name="time" value={newAppointmentDetails.time} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <select name="location" value={newAppointmentDetails.location} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teacher</label>
                            <select name="teacher" value={newAppointmentDetails.teacher} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
                                <option value="Other">Other...</option>
                            </select>
                        </div>
                        {newAppointmentDetails.teacher === 'Other' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Custom Teacher Name</label>
                                <input type="text" name="customTeacher" value={newAppointmentDetails.customTeacher} onChange={handleFormChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Enter teacher's name"/>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Service / Course</label>
                            <select name="service" value={newAppointmentDetails.service} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <optgroup label="Courses">
                                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </optgroup>
                                 <optgroup label="Services">
                                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                                </optgroup>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeForms} className="px-5 py-3 text-sm bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-5 py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{editingAppointment ? 'Save Changes' : 'Create Appointment'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
    
    const renderConfirmationModal = () => {
        if (!confirmedAppointment) return null;
        return (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-black text-center">
                    <h3 className="text-xl font-bold mb-4 text-green-600">Appointment Confirmed!</h3>
                    <div className="text-left space-y-2 mb-6">
                        <p><strong>Student:</strong> {confirmedAppointment.studentName}</p>
                        <p><strong>Date:</strong> {confirmedAppointment.date.toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {confirmedAppointment.time}</p>
                        <p><strong>Location:</strong> {confirmedAppointment.location}</p>
                        <p><strong>Service:</strong> {confirmedAppointment.service}</p>
                        <p><strong>Teacher:</strong> {confirmedAppointment.teacher}</p>
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setShowConfirmation(false)} className="px-5 py-3 text-sm bg-gray-200 rounded-md">Close</button>
                        <button onClick={handleConfirmAndSave} className="px-5 py-3 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Confirm & Save</button>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderImageReviewModal = () => {
        if (!confirmationImageUrl || !confirmedAppointment) return null;
        return (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                <div className="bg-white p-6 rounded-lg shadow-xl text-black text-center">
                    <h3 className="text-xl font-bold mb-4">Confirmation Image</h3>
                    <p className="text-sm text-gray-600 mb-4">Right-click or long-press to copy. Or save the image.</p>
                    <img src={confirmationImageUrl} alt="Appointment Confirmation" className="border rounded-md" />
                    <div className="mt-4">
                         <a href={confirmationImageUrl} download={`appointment-${confirmedAppointment.id}.png`} className="inline-block mt-4 px-5 py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Save Image
                        </a>
                        <button onClick={() => setShowImageReview(false)} className="mt-4 ml-3 px-5 py-3 text-sm bg-gray-200 rounded-md">Close</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderViewingModal = () => {
        if (!viewingAppointment) return null;
        return (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-black">
                    <h3 className="text-xl font-bold mb-4">Appointment Details</h3>
                    <div className="text-left space-y-2 mb-6">
                        <p><strong>Student:</strong> {viewingAppointment.studentName}</p>
                        <p><strong>Date:</strong> {viewingAppointment.date.toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {viewingAppointment.time}</p>
                        <p><strong>Location:</strong> {viewingAppointment.location}</p>
                        <p><strong>Service:</strong> {viewingAppointment.service}</p>
                        <p><strong>Teacher:</strong> {viewingAppointment.teacher}</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setViewingAppointment(null)} className="px-5 py-3 text-sm bg-gray-200 rounded-md">Close</button>
                        <button onClick={() => handleDelete(viewingAppointment.id)} className="px-5 py-3 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                        <button onClick={() => handleEdit(viewingAppointment)} className="px-5 py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Edit</button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                <svg className="w-20 h-20 animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h1 className="text-3xl font-bold mt-4">Maxfra Appointment Book</h1>
                <p className="mt-2 text-gray-400">Loading your schedule...</p>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col bg-white relative">
            {renderHeader()}
            {view === 'daily' && renderDailyView()}
            {view === 'weekly' && renderWeeklyView()}
            {view === 'monthly' && renderMonthlyView()}
            
            {showAddForm && renderAddForm()}
            {showConfirmation && renderConfirmationModal()}
            {showImageReview && renderImageReviewModal()}
            {viewingAppointment && renderViewingModal()}
        </div>
    );
};

// --- Office Suite Apps ---

// Word Processor App
export const WordProcessorApp = () => {
    const [content, setContent] = useState('');
    const [fontSize, setFontSize] = useState('16');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [textAlign, setTextAlign] = useState('left');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('maxfra-word-doc');
            if (saved) setContent(saved);
        } catch (error) {
            console.error("Failed to load document", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('maxfra-word-doc', content);
        } catch (error) {
            console.error("Failed to save document", error);
        }
    }, [content]);

    const handleFormat = (format: string) => {
        if (format === 'bold') setIsBold(!isBold);
        else if (format === 'italic') setIsItalic(!isItalic);
        else if (format === 'underline') setIsUnderline(!isUnderline);
    };

    const getTextStyle = () => {
        return {
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
            fontSize: `${fontSize}px`,
            textAlign: textAlign as any,
        };
    };

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="flex items-center gap-2 p-2 bg-gray-100 border-b">
                <button onClick={() => handleFormat('bold')} className={`px-3 py-1 rounded ${isBold ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} title="Bold">
                    <strong>B</strong>
                </button>
                <button onClick={() => handleFormat('italic')} className={`px-3 py-1 rounded ${isItalic ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} title="Italic">
                    <em>I</em>
                </button>
                <button onClick={() => handleFormat('underline')} className={`px-3 py-1 rounded ${isUnderline ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} title="Underline">
                    <u>U</u>
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <select value={fontSize} onChange={e => setFontSize(e.target.value)} className="px-2 py-1 border rounded bg-white">
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="24">24</option>
                    <option value="32">32</option>
                </select>
                <div className="w-px h-6 bg-gray-300"></div>
                <button onClick={() => setTextAlign('left')} className={`px-3 py-1 rounded ${textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} title="Align Left">
                    ≡
                </button>
                <button onClick={() => setTextAlign('center')} className={`px-3 py-1 rounded ${textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} title="Align Center">
                    ≣
                </button>
                <button onClick={() => setTextAlign('right')} className={`px-3 py-1 rounded ${textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} title="Align Right">
                    ≡
                </button>
                <button onClick={() => setContent('')} className="ml-auto px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600" title="Clear">
                    Clear
                </button>
            </div>
            <textarea
                className="flex-grow p-4 border-none resize-none focus:outline-none text-black"
                value={content}
                onChange={e => setContent(e.target.value)}
                style={getTextStyle()}
                placeholder="Start typing your document..."
            />
        </div>
    );
};

// Spreadsheet App
interface Cell {
    value: string;
    computed?: string;
}

export const SpreadsheetApp = () => {
    const [cells, setCells] = useState<{ [key: string]: Cell }>({});
    const [selectedCell, setSelectedCell] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');

    const rows = 20;
    const cols = 10;
    const colLabels = 'ABCDEFGHIJ'.split('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('maxfra-spreadsheet');
            if (saved) setCells(JSON.parse(saved));
        } catch (error) {
            console.error("Failed to load spreadsheet", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('maxfra-spreadsheet', JSON.stringify(cells));
        } catch (error) {
            console.error("Failed to save spreadsheet", error);
        }
    }, [cells]);

    const getCellId = (row: number, col: number) => `${colLabels[col]}${row + 1}`;

    const evaluateFormula = (formula: string): string => {
        try {
            if (!formula.startsWith('=')) return formula;
            const expr = formula.substring(1).replace(/([A-J]\d+)/g, (match) => {
                const cellValue = cells[match]?.computed || cells[match]?.value || '0';
                return cellValue || '0';
            });
            // eslint-disable-next-line no-eval
            const result = eval(expr);
            return String(result);
        } catch {
            return '#ERROR';
        }
    };

    const handleCellClick = (row: number, col: number) => {
        const cellId = getCellId(row, col);
        setSelectedCell(cellId);
        setInputValue(cells[cellId]?.value || '');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && selectedCell) {
            const newCells = { ...cells };
            newCells[selectedCell] = {
                value: inputValue,
                computed: evaluateFormula(inputValue)
            };
            setCells(newCells);
            setSelectedCell(null);
            setInputValue('');
        } else if (e.key === 'Escape') {
            setSelectedCell(null);
            setInputValue('');
        }
    };

    const getCellDisplay = (row: number, col: number): string => {
        const cellId = getCellId(row, col);
        const cell = cells[cellId];
        if (!cell) return '';
        return cell.computed !== undefined ? cell.computed : cell.value;
    };

    return (
        <div className="w-full h-full flex flex-col bg-white text-black">
            <div className="flex items-center gap-2 p-2 bg-gray-100 border-b">
                <span className="font-semibold">{selectedCell || 'Select a cell'}</span>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Enter value or formula (=A1+B1)"
                    className="flex-grow px-3 py-1 border rounded bg-white"
                    disabled={!selectedCell}
                />
                <button onClick={() => setCells({})} className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600">Clear All</button>
            </div>
            <div className="flex-grow overflow-auto">
                <table className="border-collapse w-full">
                    <thead>
                        <tr>
                            <th className="border border-gray-400 bg-gray-200 w-12 sticky left-0 z-10"></th>
                            {colLabels.map(col => (
                                <th key={col} className="border border-gray-400 bg-gray-200 px-4 py-1 min-w-[100px]">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="border border-gray-400 bg-gray-200 text-center font-semibold sticky left-0 z-10">{rowIdx + 1}</td>
                                {Array.from({ length: cols }).map((_, colIdx) => {
                                    const cellId = getCellId(rowIdx, colIdx);
                                    const isSelected = selectedCell === cellId;
                                    return (
                                        <td
                                            key={cellId}
                                            className={`border border-gray-400 px-2 py-1 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}
                                            onClick={() => handleCellClick(rowIdx, colIdx)}
                                        >
                                            {getCellDisplay(rowIdx, colIdx)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Presentation App
interface Slide {
    id: string;
    title: string;
    content: string;
}

export const PresentationApp = () => {
    const [slides, setSlides] = useState<Slide[]>([{ id: '1', title: 'Slide 1', content: 'Click to edit content' }]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isPresenting, setIsPresenting] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('maxfra-presentation');
            if (saved) setSlides(JSON.parse(saved));
        } catch (error) {
            console.error("Failed to load presentation", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('maxfra-presentation', JSON.stringify(slides));
        } catch (error) {
            console.error("Failed to save presentation", error);
        }
    }, [slides]);

    const addSlide = () => {
        const newSlide: Slide = {
            id: Date.now().toString(),
            title: `Slide ${slides.length + 1}`,
            content: 'Click to edit content'
        };
        setSlides([...slides, newSlide]);
        setCurrentSlideIndex(slides.length);
    };

    const deleteSlide = (index: number) => {
        if (slides.length > 1) {
            const newSlides = slides.filter((_, i) => i !== index);
            setSlides(newSlides);
            if (currentSlideIndex >= newSlides.length) {
                setCurrentSlideIndex(newSlides.length - 1);
            }
        }
    };

    const updateSlide = (field: 'title' | 'content', value: string) => {
        const newSlides = [...slides];
        newSlides[currentSlideIndex][field] = value;
        setSlides(newSlides);
    };

    const currentSlide = slides[currentSlideIndex];

    if (isPresenting) {
        return (
            <div className="w-full h-full flex flex-col bg-gray-900 text-white">
                <div className="flex-grow flex items-center justify-center p-8">
                    <div className="text-center max-w-4xl">
                        <h1 className="text-5xl font-bold mb-8">{currentSlide.title}</h1>
                        <p className="text-2xl whitespace-pre-wrap">{currentSlide.content}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800">
                    <button
                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-lg">{currentSlideIndex + 1} / {slides.length}</span>
                    <button
                        onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                        disabled={currentSlideIndex === slides.length - 1}
                        className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                    <button onClick={() => setIsPresenting(false)} className="px-6 py-2 bg-red-600 rounded hover:bg-red-700">
                        Exit Presentation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex bg-white text-black">
            <div className="w-48 bg-gray-100 border-r overflow-y-auto p-2">
                <button onClick={addSlide} className="w-full px-3 py-2 mb-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                    + New Slide
                </button>
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`p-2 mb-2 rounded cursor-pointer border ${index === currentSlideIndex ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => setCurrentSlideIndex(index)}
                    >
                        <div className="text-xs font-semibold mb-1">{index + 1}. {slide.title}</div>
                        <div className="text-xs text-gray-600 truncate">{slide.content}</div>
                        {slides.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
                                className="mt-1 text-xs text-red-600 hover:text-red-800"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex-grow flex flex-col p-4">
                <div className="mb-4">
                    <button onClick={() => setIsPresenting(true)} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">
                        ▶ Start Presentation
                    </button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        value={currentSlide.title}
                        onChange={e => updateSlide('title', e.target.value)}
                        className="w-full text-3xl font-bold border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2"
                        placeholder="Slide Title"
                    />
                </div>
                <textarea
                    value={currentSlide.content}
                    onChange={e => updateSlide('content', e.target.value)}
                    className="flex-grow p-4 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none text-lg"
                    placeholder="Slide content..."
                />
            </div>
        </div>
    );
};

// Email Client App
interface Email {
    id: string;
    from: string;
    subject: string;
    body: string;
    date: Date;
    isRead: boolean;
}

export const EmailClientApp = () => {
    const [emails, setEmails] = useState<Email[]>([
        {
            id: '1',
            from: 'admin@maxfra.academy',
            subject: 'Welcome to Maxfra OS',
            body: 'Thank you for using Maxfra Academy OS. This is your email client.',
            date: new Date(),
            isRead: false
        }
    ]);
    const [view, setView] = useState<'inbox' | 'compose' | 'read'>('inbox');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '' });

    useEffect(() => {
        try {
            const saved = localStorage.getItem('maxfra-emails');
            if (saved) {
                const parsed = JSON.parse(saved).map((email: any) => ({
                    ...email,
                    date: new Date(email.date)
                }));
                setEmails(parsed);
            }
        } catch (error) {
            console.error("Failed to load emails", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('maxfra-emails', JSON.stringify(emails));
        } catch (error) {
            console.error("Failed to save emails", error);
        }
    }, [emails]);

    const handleEmailClick = (email: Email) => {
        setSelectedEmail(email);
        setView('read');
        const newEmails = emails.map(e => e.id === email.id ? { ...e, isRead: true } : e);
        setEmails(newEmails);
    };

    const handleSendEmail = () => {
        if (!composeForm.to || !composeForm.subject) {
            alert('Please fill in recipient and subject');
            return;
        }
        const newEmail: Email = {
            id: Date.now().toString(),
            from: 'me@maxfra.academy',
            subject: composeForm.subject,
            body: composeForm.body,
            date: new Date(),
            isRead: true
        };
        setEmails([newEmail, ...emails]);
        setComposeForm({ to: '', subject: '', body: '' });
        setView('inbox');
    };

    const handleDeleteEmail = (id: string) => {
        setEmails(emails.filter(e => e.id !== id));
        setView('inbox');
        setSelectedEmail(null);
    };

    return (
        <div className="w-full h-full flex bg-white text-black">
            <div className="w-48 bg-gray-100 border-r p-2">
                <button
                    onClick={() => setView('inbox')}
                    className={`w-full text-left px-4 py-2 mb-2 rounded ${view === 'inbox' || view === 'read' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
                >
                    📥 Inbox ({emails.filter(e => !e.isRead).length})
                </button>
                <button
                    onClick={() => { setView('compose'); setComposeForm({ to: '', subject: '', body: '' }); }}
                    className={`w-full text-left px-4 py-2 rounded ${view === 'compose' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
                >
                    ✏️ Compose
                </button>
            </div>
            <div className="flex-grow flex flex-col">
                {view === 'inbox' && (
                    <div className="flex-grow overflow-y-auto">
                        <div className="p-4 bg-gray-50 border-b font-semibold">Inbox</div>
                        {emails.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No emails</div>
                        ) : (
                            emails.map(email => (
                                <div
                                    key={email.id}
                                    onClick={() => handleEmailClick(email)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${!email.isRead ? 'bg-blue-50 font-semibold' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium">{email.from}</span>
                                        <span className="text-xs text-gray-500">{email.date.toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-sm font-semibold mb-1">{email.subject}</div>
                                    <div className="text-xs text-gray-600 truncate">{email.body}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {view === 'compose' && (
                    <div className="flex-grow flex flex-col p-4">
                        <h2 className="text-xl font-bold mb-4">New Email</h2>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">To:</label>
                            <input
                                type="email"
                                value={composeForm.to}
                                onChange={e => setComposeForm({ ...composeForm, to: e.target.value })}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="recipient@example.com"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Subject:</label>
                            <input
                                type="text"
                                value={composeForm.subject}
                                onChange={e => setComposeForm({ ...composeForm, subject: e.target.value })}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Email subject"
                            />
                        </div>
                        <div className="flex-grow flex flex-col mb-3">
                            <label className="block text-sm font-medium mb-1">Message:</label>
                            <textarea
                                value={composeForm.body}
                                onChange={e => setComposeForm({ ...composeForm, body: e.target.value })}
                                className="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Type your message..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSendEmail} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Send
                            </button>
                            <button onClick={() => setView('inbox')} className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {view === 'read' && selectedEmail && (
                    <div className="flex-grow flex flex-col p-4">
                        <div className="mb-4 pb-4 border-b">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-bold">{selectedEmail.subject}</h2>
                                <button onClick={() => handleDeleteEmail(selectedEmail.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                                    Delete
                                </button>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">From:</span> {selectedEmail.from}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Date:</span> {selectedEmail.date.toLocaleString()}
                            </div>
                        </div>
                        <div className="flex-grow whitespace-pre-wrap">{selectedEmail.body}</div>
                        <div className="mt-4">
                            <button onClick={() => setView('inbox')} className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                Back to Inbox
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};