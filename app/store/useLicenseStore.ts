// app/store/useLicenseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CopyTradeMode = 'DISABLED' | 'LOCAL' | 'CLOUD' | 'BOTH';

interface LicenseState {
  licenseKey: string;
  licenseMode: CopyTradeMode;
  enableLocal: boolean;
  enableCloud: boolean;
  setLicenseData: (key: string, mode: CopyTradeMode) => void;
  setEnableLocal: (enable: boolean) => void;
  setEnableCloud: (enable: boolean) => void;
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set) => ({
      licenseKey: '',
      licenseMode: 'DISABLED',
      enableLocal: false,
      enableCloud: false,
      setLicenseData: (key, mode) => set({ licenseKey: key, licenseMode: mode }),
      setEnableLocal: (enable) => set({ enableLocal: enable }),
      setEnableCloud: (enable) => set({ enableCloud: enable }),
    }),
    { 
      name: 'griffin-license-storage', // ذخیره خودکار در LocalStorage الکترون
    }
  )
);