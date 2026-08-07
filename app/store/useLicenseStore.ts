import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CopyTradeMode = 'DISABLED' | 'LOCAL' | 'CLOUD' | 'BOTH';

interface LicenseState {
  licenseKey: string;
  relayToken: string; 
  licenseMode: CopyTradeMode;
  enableLocal: boolean;
  enableCloud: boolean;
  setLicenseData: (key: string, mode: CopyTradeMode) => void;
  setRelayToken: (token: string) => void; 
  setEnableLocal: (enable: boolean) => void;
  setEnableCloud: (enable: boolean) => void;
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set) => ({
      licenseKey: '',
      relayToken: '', 
      licenseMode: 'DISABLED',
      enableLocal: false,
      enableCloud: false,
      setLicenseData: (key, mode) => set({ licenseKey: key, licenseMode: mode }),
      setRelayToken: (token) => set({ relayToken: token }),
      setEnableLocal: (enable) => set({ enableLocal: enable }),
      setEnableCloud: (enable) => set({ enableCloud: enable }),
    }),
    { name: 'griffin-license-storage' }
  )
);