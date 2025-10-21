import type { AppConfig } from './types';
import * as Icons from './components/icons';
import { NotepadApp, BrowserApp, FileExplorerApp, SettingsApp, CalculatorApp, MaxfraAiBrowserApp, CalendarApp, StudentIntakeApp, WordProcessorApp, SpreadsheetApp, PresentationApp, EmailClientApp } from './apps';

export const APPS: AppConfig[] = [
  {
    id: 'notepad',
    title: 'Notepad',
    icon: (className) => <Icons.NotepadIcon className={className} />,
    component: NotepadApp,
    defaultSize: { width: 400, height: 300 },
  },
  {
    id: 'browser',
    title: 'Browser',
    icon: (className) => <Icons.BrowserIcon className={className} />,
    component: BrowserApp,
    isPinned: true,
    defaultSize: { width: 800, height: 600 },
  },
  {
    id: 'fileExplorer',
    title: 'File Explorer',
    icon: (className) => <Icons.FileExplorerIcon className={className} />,
    component: FileExplorerApp,
    isPinned: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: (className) => <Icons.SettingsIcon className={className} />,
    component: SettingsApp,
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: (className) => <Icons.CalculatorIcon className={className} />,
    component: CalculatorApp,
    defaultSize: { width: 320, height: 480 },
  },
  {
    id: 'maxfraAiBrowser',
    title: 'MAXFRA AI Browser',
    icon: (className) => <Icons.MaxfraAIBrowserIcon className={className} />,
    component: MaxfraAiBrowserApp,
    defaultSize: { width: 800, height: 600 },
  },
  {
    id: 'calendar',
    title: 'Maxfra Appointment Book',
    icon: (className) => <Icons.CalendarIcon className={className} />,
    component: CalendarApp,
    defaultSize: { width: 900, height: 700 },
  },
  {
    id: 'wordProcessor',
    title: 'Maxfra Word',
    icon: (className) => <Icons.WordProcessorIcon className={className} />,
    component: WordProcessorApp,
    isPinned: true,
    defaultSize: { width: 800, height: 600 },
  },
  {
    id: 'spreadsheet',
    title: 'Maxfra Sheets',
    icon: (className) => <Icons.SpreadsheetIcon className={className} />,
    component: SpreadsheetApp,
    isPinned: true,
    defaultSize: { width: 900, height: 650 },
  },
  {
    id: 'presentation',
    title: 'Maxfra Slides',
    icon: (className) => <Icons.PresentationIcon className={className} />,
    component: PresentationApp,
    defaultSize: { width: 900, height: 650 },
  },
  {
    id: 'email',
    title: 'Maxfra Mail',
    icon: (className) => <Icons.EmailIcon className={className} />,
    component: EmailClientApp,
    defaultSize: { width: 800, height: 600 },
  },
];