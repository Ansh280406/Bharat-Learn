import { create } from 'zustand';
import type { Language, PageType, ScanResult } from '../types';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: 'scanner' | 'index';
  setActiveTab: (tab: 'scanner' | 'index') => void;
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
  scanResult: ScanResult | null;
  setScanResult: (result: ScanResult | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  activeTab: 'scanner',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isScanning: false,
  setIsScanning: (isScanning) => set({ isScanning }),
  scanResult: null,
  setScanResult: (result) => set({ scanResult: result }),
}));
