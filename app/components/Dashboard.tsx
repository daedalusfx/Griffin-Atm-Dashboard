import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast, { Toaster, resolveValue, ToastIcon } from 'react-hot-toast';
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
  
  <Toaster position="top-center">
  {(t) => {
    // اگر توست از نوع custom بود (مثل سیگنال‌هایی که در هوک وب‌سوکت ساختیم)
    // دقیقاً همان ظاهر اختصاصی خودش را بدون تغییر رندر کن
    if (t.type === 'custom') {
      return (
        <div style={{ opacity: t.visible ? 1 : 0, transition: 'opacity 0.2s' }}>
          {resolveValue(t.message, t)}
        </div>
      );
    }

    // ظاهر کاملاً سفارشی و Tailwind برای toast.success و toast.error
    return (
      <div
        className={`${
          t.visible ? 'animate-in fade-in slide-in-from-top-2' : 'animate-out fade-out slide-out-to-top-2'
        } bg-card border border-border text-card-foreground text-sm px-4 py-3 rounded-md shadow-lg flex items-center gap-3 min-w-[250px]`}
      >
              {/* این کامپوننت آیکون تیک سبز یا ضربدر قرمز را به صورت خودکار رندر می‌کند */}
              <ToastIcon toast={t} />
              
              {/* متن پیام */}
              <p className="font-medium m-0 flex-1">{resolveValue(t.message, t)}</p>
              
              {/* دکمه بستن (اختیاری) */}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-muted-foreground hover:text-foreground transition-colors ml-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        }}
      </Toaster>

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