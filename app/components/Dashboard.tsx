import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import { useTradeWebSocket } from '@/app/hooks/useTradeWebSocket';
import { DashboardHeader } from '@/app/components/DashboardHeader';
import { TradeList } from '@/app/components/TradeList';
import { ActionBar } from '@/app/components/ActionBar';
import { SettingsDialog } from '@/app/components/SettingsDialog';
import { MainSettingsDialog } from '@/app/components/MainSettingsDialog';
import type { AtmSettings, MainSettingsType } from '@/app/schemas';

export const Dashboard = () => {
  const [isDark, setIsDark] = useState(true);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isMainSettingsOpen, setMainSettingsOpen] = useState(false);

  const symbol = useDashboardStore((state) => state.symbol);
  const settings = useDashboardStore((state) => state.settings);
  const mainSettings = useDashboardStore((state) => state.mainSettings);

  const { sendCommand, connectionStatus } = useTradeWebSocket();
  const { i18n } = useTranslation();

  useEffect(() => {
    const root = document.documentElement;
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
    root.dir = i18n.language === 'fa' ? 'rtl' : 'ltr';
    root.lang = i18n.language;
  }, [isDark, i18n.language]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Toaster
        position="top-center"
        toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', duration: 3000 }}
      />

      <DashboardHeader
        symbol={symbol}
        connectionStatus={connectionStatus}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenMainSettings={() => setMainSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col p-4 overflow-hidden container mx-auto max-w-7xl">
        <TradeList sendCommand={sendCommand} />
      </main>

      <ActionBar sendCommand={sendCommand} />

      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={(s: AtmSettings) =>
          sendCommand({ action: 'update_settings', settings: s }, 'save_settings')
        }
      />

      <MainSettingsDialog
        open={isMainSettingsOpen}
        onClose={() => setMainSettingsOpen(false)}
        settings={mainSettings}
        onSave={(s: MainSettingsType) =>
          sendCommand(
            {
              action: 'update_main_settings',
              ...s,
              risk_market: s.riskValues.market,
              risk_pending: s.riskValues.pending,
              risk_stairway: s.riskValues.stairway,
            },
            'save_main_settings'
          )
        }
      />
    </div>
  );
};