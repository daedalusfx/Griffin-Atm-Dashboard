import { create } from 'zustand';
import type { Trade } from '@/app/types';
import type { AtmSettings, MainSettingsType } from '@/app/schemas';

interface DashboardState {
  trades: Trade[];
  totalPL: number;
  symbol: string;
  settings: AtmSettings | null;
  mainSettings: MainSettingsType | null;
  loadingStates: Record<string, boolean>;
  hwid: string | null; 
  
  setTradeData: (data: any) => void;
  setSettings: (settings: AtmSettings) => void;
  setMainSettings: (mainSettings: MainSettingsType) => void;
  setLoading: (key: string, isLoading: boolean) => void;
  setHwid: (hwid: string) => void; 
}

export const useDashboardStore = create<DashboardState>((set) => ({
  trades: [],
  totalPL: 0,
  symbol: 'N/A',
  settings: null,
  mainSettings: null,
  loadingStates: {},
  hwid: null, 
  
  setTradeData: (data) =>
    set((state) => ({
      trades: data.trades || [],
      totalPL: data.total_pl || 0,
      symbol: data.symbol || 'N/A',
      settings: data.settings || state.settings,
      mainSettings: data.main_settings || state.mainSettings,
    })),
  setSettings: (settings) => set({ settings }),
  setMainSettings: (mainSettings) => set({ mainSettings }),
  setLoading: (key, isLoading) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: isLoading },
    })),
  setHwid: (hwid) => set({ hwid }),
}));