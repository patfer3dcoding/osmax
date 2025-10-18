This repository is a small single-page desktop-like React app ("Maxfra Academy OS") built with Vite + TypeScript.

Quick context (big picture)
- Entry: `index.tsx` mounts `<App />` (see `App.tsx`). App manages global window state and provides the desktop/taskbar/start menu.
- App registry: `APPS` in `constants.tsx` is the single source of truth for available applications (id, title, icon, component, pin/size).
- Individual apps live in `apps/index.tsx` (exported named components). Each app is a React component (functional) and often persists data to localStorage.
- Window UI: `components/Window.tsx` is the controlled window implementation (drag, resize, z-index, minimize/maximize). `App.tsx` owns WindowState objects (see `types.ts`).

How state & data flows work (important patterns)
- Windows: App creates windows via openApp(appId) — window ids follow `${appId}-${Date.now()}`. App keeps zIndexCounter to manage stacking.
- Persistence: Many apps store JSON in localStorage using these keys (search for them):
  - `maxfra-students`
  - `maxfra-filesystem`
  - `maxfra-appointments`
  - `maxfra-os-background`
  - `maxfra-os-sounds-enabled`
  - `maxfra-os-sound-scheme`
- Cross-window sync: Settings use window.dispatchEvent(new StorageEvent(...)) and App listens for `storage` events to sync across open windows.
- Audio: system sounds use the Web Audio API (AudioContext) created lazily in `App.tsx`. Toggle/changes are saved to localStorage.
- Browser app: `MaxfraAiBrowserApp` uses an `<iframe>` with sandbox attributes; modifying iframe behavior can break cross-origin logic — be careful when changing permissions.

How to run / build
- Install deps: `npm install`
- Dev server: `npm run dev` (runs Vite)
- Build: `npm run build`
- Preview build: `npm run preview`
- Environment: README mentions setting `GEMINI_API_KEY` in `.env.local` if you use the genAI integration (see `apps/index.tsx` import `@google/genai`). If you are not using genAI features you can still run the app without it.

Project conventions & patterns to follow
- Type signatures: public shape for apps and windows are in `types.ts` (AppConfig, WindowState). New apps should conform to `AppConfig.component: React.ComponentType`.
- Icons: `components/icons.tsx` exports named icon components that accept an optional `className` string (e.g. `NotepadIcon('w-6 h-6')`). Reuse these instead of inline SVG where possible.
- Registering an app: export the component from `apps/index.tsx`, then add an entry to `APPS` in `constants.tsx` with fields: `id`, `title`, `icon`, `component`, optional `isPinned`, `defaultSize`.
  Example (add to `constants.tsx`):
  { id: 'studentIntake', title: 'Student Intake', icon: (c) => <Icons.StudentIntakeIcon className={c} />, component: StudentIntakeApp, defaultSize: { width: 900, height: 700 } }
- LocalStorage & serialization: code uses JSON.stringify/parse without schema migration. When changing shapes, include defensive try/catch and fallbacks.
- Window lifecycle: `App.tsx` opens/closes windows and passes callback props to `Window` for drag/resize/focus. Treat `Window` as a controlled component (do not mutate WindowState inside the child).

Important files to inspect when working here
- `App.tsx` — global app/window state, audio, backgrounds
- `constants.tsx` — `APPS` registry
- `types.ts` — TypeScript shapes used across components
- `apps/index.tsx` — all app implementations (Notepad, Browser, FileExplorer, Settings, Calculator, Calendar, StudentIntake)
- `components/Window.tsx`, `Desktop.tsx`, `Taskbar.tsx`, `StartMenu.tsx`, `icons.tsx`
- `README.md` and `package.json` — run/build instructions and dependencies

Gotchas & safety notes
- Tailwind-like class names are used throughout, but Tailwind is not present in package.json. UI classes are present and safe to change, but verify styling locally.
- The browser-like app uses an iframe and attempts to read `iframe.contentWindow.location.href` inside a try/catch — cross-origin access will fail silently; keep the try/catch if you refactor.
- `eval` is used in the calculator for quick evaluation (see `CalculatorApp`) — avoid enabling untrusted input or replace with a safe expression parser if exposing to end users.

Small tasks examples (how to implement common requests)
- Add a new app:
  1. Create a component in `apps/index.tsx` (export it).
  2. Import and add it to `APPS` in `constants.tsx` (use an existing icon or add one to `components/icons.tsx`).
  3. Choose defaultSize/isPinned as needed.
- Make an app persist new state safely:
  - Read with try/catch, validate shape, and fall back to defaults. Write with JSON.stringify inside useEffect.
- Change system sounds:
  - Sound schemes are defined in `App.tsx` (SOUND_SCHEMES). Update frequencies/durations there and ensure UI (Settings) persists the chosen scheme to localStorage.

If anything is unclear or you want me to expand examples (e.g., concrete patch for adding an app or a new localStorage migration helper), tell me which area and I will iterate.
