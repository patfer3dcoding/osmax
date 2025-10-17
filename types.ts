
// Fix: Import JSX type to resolve "Cannot find namespace 'JSX'" error.
import type { ComponentType, JSX } from 'react';

export interface AppConfig {
  id: string;
  title: string;
  icon: (className?: string) => JSX.Element;
  component: ComponentType;
  isPinned?: boolean;
  defaultSize?: { width: number; height: number };
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: (className?: string) => JSX.Element;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  component: ComponentType;
  zIndex: number;
}