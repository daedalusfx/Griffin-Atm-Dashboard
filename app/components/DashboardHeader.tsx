import { useTranslation } from 'react-i18next';
import { ReadyState } from 'react-use-websocket';
import { Sun, Moon, Settings2, ShieldAlert, Wifi, WifiOff, Loader2, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { RelayController } from '@/app/components/RelayControler';

interface DashboardHeaderProps {
  symbol: string;
  connectionStatus: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenMainSettings: () => void;
  onOpenLicenseSettings: () => void;
}

export const DashboardHeader = ({
  symbol,
  connectionStatus,
  isDark,
  onToggleTheme,
  onOpenSettings,
  onOpenMainSettings,
  onOpenLicenseSettings
}: DashboardHeaderProps) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const ConnectionIcon = () => {
    switch (connectionStatus) {
      case ReadyState.OPEN:
        return <Wifi className="w-4 h-4 text-green-500" />;
      case ReadyState.CLOSED:
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case ReadyState.CONNECTING:
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-4">
        <ConnectionIcon />
        <RelayController />
        <span className="text-sm font-medium">
          {t('active_symbol')}: {symbol}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={toggleLanguage} variant="ghost" size="icon" title="Toggle Language">
          <Globe className="w-5 h-5" />
        </Button>
        <Button onClick={onToggleTheme} variant="ghost" size="icon">
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
        <Button onClick={onOpenSettings} variant="outline" size="sm" className="hidden sm:flex">
          <Settings2 className="w-4 h-4 mx-2" /> {t('atm_settings')}
        </Button>
            <Button onClick={onOpenLicenseSettings} variant="outline" size="sm" className="hidden sm:flex border-primary/50 text-primary">
           <ShieldCheck className="w-4 h-4 mx-2" /> مجوز کپی‌ترید
        </Button> 
        <Button onClick={onOpenMainSettings} variant="outline" size="sm" className="hidden sm:flex">
          <ShieldAlert className="w-4 h-4 mx-2" /> {t('risk_settings')}
        </Button>
      </div>
    </header>
  );
};