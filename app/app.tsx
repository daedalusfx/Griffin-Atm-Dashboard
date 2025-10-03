// =================================================================
// FILE: src/renderer/App.tsx
// توضیحات: نسخه نهایی با چرخه بازخورد واقعی و دکمه هوشمند ریسک-فری
// =================================================================
import {
  Wifi
} from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel, keyframes,
  Switch,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ActionBar } from './components/ActionBar';
import { DashboardHeader } from './components/DashboardHeader';
import { MainSettingsDialog } from './components/MainSettingsDialog';
import { TradeList } from './components/TradeList';
import { CommandPayload, MainSettingsTypeInterface, Settings, Trade } from './components/types';

// --- ENUMS & INTERFACES ---
enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Connecting = 'connecting',
}



// --- STYLES & ANIMATIONS ---
const blinkAnimation = keyframes`
  50% { opacity: 0.3; }
`;



// --- MAIN COMPONENT ---
export function Dashboard() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalPL, setTotalPL] = useState<number>(0);
  const [symbol, setSymbol] = useState<string>('N/A');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Connecting);
  const [settings, setSettings] = useState<Settings>({});
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; title: string; description: string; onConfirm: (() => void) | null; }>({ isOpen: false, title: '', description: '', onConfirm: null });
  const [ws, setWs] = useState<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [mainSettings, setMainSettings] = useState<MainSettingsTypeInterface>({});
  const [isMainSettingsOpen, setMainSettingsOpen] = useState<boolean>(false);



  const theme = useMemo(() => createTheme({
    direction: 'rtl',
    palette: {
      mode: themeMode,
      primary: { main: '#818cf8' },
      success: { main: '#4ade80' },
      error: { main: '#f87171' },
      info: { main: '#60a5fa' },
      warning: { main: '#facc15' },
      background: {
        paper: themeMode === 'dark' ? '#1e293b' : '#ffffff',
        default: themeMode === 'dark' ? '#0f172a' : '#f1f5f9',
      },
      text: {
        primary: themeMode === 'dark' ? '#e2e8f0' : '#1e293b',
        secondary: themeMode === 'dark' ? '#94a3b8' : '#64748b',
      }
    },
    typography: { fontFamily: 'Vazirmatn, Arial' },
    components: { MuiButton: { styleOverrides: { root: { borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' } } } }
  }), [themeMode]);

  useEffect(() => {
    function connect() {
      // جلوگیری از ایجاد اتصال‌های متعدد اگر یکی از قبل وجود دارد
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        // console.log("WebSocket is already connecting or open.");
        return;
      }
      
      // console.log("Attempting to connect to WebSocket...");
      setConnectionStatus(ConnectionStatus.Connecting);
      const socket = new WebSocket('ws://localhost:5000');
      
      socket.onopen = () => {
        // console.log('WebSocket connection established.');
        setConnectionStatus(ConnectionStatus.Connected);
        setWs(socket);
        // اگر تایمر اتصال مجددی در حال اجرا بود، آن را پاک کن
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };
      
      socket.onclose = () => {
        // console.log("WebSocket closed. Attempting to reconnect in 3 seconds...");
        setWs(null);
        setConnectionStatus(ConnectionStatus.Disconnected);
        // فقط در صورتی یک تایمر جدید بساز که از قبل وجود نداشته باشد
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null; // تایمر را قبل از تلاش مجدد پاک کن
            connect();
          }, 3000);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // onclose به صورت خودکار پس از خطا فراخوانی می‌شود و منطق اتصال مجدد را فعال می‌کند
        socket.close();
      };
  
socket.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case 'trade_data':
        setTrades(message.data.trades || []);
        setTotalPL(message.data.total_pl || 0);
        setSymbol(message.data.symbol || 'N/A');
        // settings دیگر همراه trade_data نمی‌آید
        if (message.data.settings) {
           setSettings(message.data.settings || {});
        }
        if (message.data.main_settings) {
          setMainSettings(message.data.main_settings || {});
       }
        break;

      case 'feedback':
        const feedback = message.data;
        if (feedback.status === 'success') toast.success(feedback.message);
        else if (feedback.status === 'error') toast.error(feedback.message);
        else toast(feedback.message, { icon: 'ℹ️' });
        break;

      // +++ بخش جدید برای دریافت سیگنال‌های کپی ترید +++
      case 'trade_signal':
        const signal = message.data;
        const ticket = signal.provider_ticket;
        let toastMessage = `Signal: ${signal.action} for ticket #${ticket}`;
        console.log(toastMessage);
        
        
        // می‌توانید پیام‌های بهتری بسازید
        switch(signal.action) {
            case 'OPEN_POSITION':
                toastMessage = `🟢 New position #${ticket} opened on ${signal.symbol}`;
        console.log(toastMessage);

                break;
            case 'CLOSE_POSITION':
                toastMessage = `🔴 Position #${ticket} closed.`;
                console.log(toastMessage);

                break;
            case 'MODIFY_POSITION':
                toastMessage = `🟠 Position #${ticket} modified.`;
                console.log(toastMessage);

                break;
            case 'PLACE_PENDING':
                toastMessage = `🔵 Pending order #${ticket} placed for ${signal.symbol}`;
                console.log(toastMessage);

                break;
            case 'MODIFY_PENDING':
                toastMessage = `🟡 Pending order #${ticket} modified.`;
                console.log(toastMessage);

                break;
            case 'CANCEL_PENDING':
                toastMessage = `⚪️ Pending order #${ticket} cancelled.`;
                console.log(toastMessage);
          
                break;
        }

        toast.custom((t) => (
          <div
            style={{
              padding: '12px 20px',
              background: '#2d3748', // gray-800
              color: '#e2e8f0',      // slate-200
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }}
          >
            {toastMessage}
          </div>
        ));
        break;

      // این کیس را برای دریافت تنظیمات جداگانه اضافه کنید (اگر قبلاً نبوده)
      case 'settings':
         setSettings(message.data || {});
         break;
    }
  } catch (e) { console.error("Error parsing message:", e); }
};


    }

    // اولین تلاش برای اتصال
    connect();
  
    // تابع پاک‌سازی (بسیار مهم)
    return () => {
      // هر تایمر اتصال مجدد در حال انتظاری را پاک کن
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      // اتصال فعلی را به درستی ببند
      if (ws) {
        ws.onclose = null; // از اجرای onclose در زمان بستن دستی جلوگیری کن
        ws.close();
      }
    };
  // فقط یک بار در زمان بالا آمدن کامپوننت اجرا شود
  }, []); 
  
  const hasProfits = useMemo(() => trades.some((t) => t.profit > 0), [trades]);
  const hasLosses = useMemo(() => trades.some((t) => t.profit < 0), [trades]);
  const hasTrades = useMemo(() => trades.length > 0, [trades]);

  const handleSendCommand = useCallback(async (command: CommandPayload, loadingKey: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error('اتصال با سرور برقرار نیست!');
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [loadingKey]: true }));
    try {
      ws.send(JSON.stringify(command));
    } catch (error) {
      console.error('Failed to send command via WebSocket:', error);
      toast.error('خطا در ارسال دستور به سرور');
    } finally {
      setTimeout(() => {
        setLoadingStates((prev) => ({ ...prev, [loadingKey]: false }));
      }, 500);
    }
  }, [ws]); // وابستگی به ws، تا در صورت تغییر اتصال، تابع جدید ساخته شود
  

  const openConfirmation = useCallback((title: string, description: string, action: string, loadingKey: string) => {
    setConfirmState({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        handleSendCommand({ action }, loadingKey);
        setConfirmState({ isOpen: false, title: '', description: '', onConfirm: null });
      }
    });
  }, [handleSendCommand]); // وابستگی به handleSendCommand


  const handleToggleTheme = useCallback(() => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);
  

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const getConnectionIcon = () => {
    let color: "success" | "error" | "warning" = "warning";
    let animation = {};
    if (connectionStatus === ConnectionStatus.Connected) color = "success";
    if (connectionStatus === ConnectionStatus.Disconnected) color = "error";
    if (connectionStatus === ConnectionStatus.Connecting) {
      color = "warning";
      animation = { animation: `${blinkAnimation} 2s infinite` };
    }
    return <Tooltip title={connectionStatus}><Wifi sx={{ color: `${color}.main`, ...animation }} /></Tooltip>;
  };

return (
  <ThemeProvider theme={theme}>
    <Toaster 
      position="top-center" 
      toastOptions={{ 
        style: { background: '#334155', color: '#e2e8f0' } 
      }} 
    />
    <CssBaseline />
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      
      {/* کامپوننت بهینه شده هدر */}
      <DashboardHeader
        symbol={symbol}
        connectionIcon={getConnectionIcon()}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={handleOpenSettings}
        onOpenMainSettings={() => setMainSettingsOpen(true)}
      />
      
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column' }}>
        {/* کامپوننت بهینه شده لیست معاملات */}
        <TradeList
          trades={trades}
          onSendCommand={handleSendCommand}
          loadingStates={loadingStates}
        />
      </Container>
      
      {/* کامپوننت بهینه شده نوار ابزار پایین */}
      <ActionBar
        totalPL={totalPL}
        hasTrades={hasTrades}
        hasProfits={hasProfits}
        hasLosses={hasLosses}
        onOpenConfirmation={openConfirmation}
        loadingStates={loadingStates}
      />

      {/* دیالوگ‌ها که فقط در صورت نیاز رندر می‌شوند */}
      <SettingsDialog 
          open={isSettingsOpen} 
          onClose={() => setSettingsOpen(false)} 
          settings={settings} 
          onSave={(newSettings) => handleSendCommand({ action: 'update_settings', settings: newSettings }, 'save_settings')} 
      />


<MainSettingsDialog
    open={isMainSettingsOpen}
    onClose={() => setMainSettingsOpen(false)}
    settings={mainSettings}
    onSave={(newSettings) => {
        const payload = {
            action: 'update_main_settings',
            riskMode: newSettings.riskMode,
            risk_market: newSettings.riskValues?.market,
            risk_pending: newSettings.riskValues?.pending,
            risk_stairway: newSettings.riskValues?.stairway,
            tpMode: newSettings.tpMode,
            tpRRValue: newSettings.tpRRValue
        };
        handleSendCommand(payload, 'save_main_settings');
    }}
/>
      <ConfirmationDialog 
          {...confirmState} 
          onClose={() => setConfirmState({ ...confirmState, isOpen: false })} 
      />
    </Box>
  </ThemeProvider>
);
}

// --- HELPER COMPONENTS ---
interface ConfirmationDialogProps { isOpen: boolean; title: string; description: string; onConfirm: (() => void) | null; onClose: () => void; }
function ConfirmationDialog({ isOpen, title, description, onConfirm, onClose }: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent><Typography>{description}</Typography></DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>انصراف</Button>
        <Button onClick={() => onConfirm && onConfirm()} variant="contained" color="primary" autoFocus>تایید</Button>
      </DialogActions>
    </Dialog>
  );
}

interface SettingsDialogProps { open: boolean; onClose: () => void; settings: Settings; onSave: (settings: Settings) => void; }
function SettingsDialog({ open, onClose, settings, onSave }: SettingsDialogProps) {
    const [localSettings, setLocalSettings] = useState<Settings>(settings);
    useEffect(() => {
      // اگر دیالوگ باز شد، state محلی را با آخرین تنظیمات دریافت شده از اکسپرت همگام کن
      if (open) {
        setLocalSettings(settings);
      }
    }, [open]); // <-- به `open` وابسته است، نه `settings`


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : parseFloat(value) || 0 }));
    };
    function SaveAndCloseModal() {
      onSave(localSettings)
      onClose()
    }
    if (!open) return null;
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle>تنظیمات مدیریت خودکار</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ mt: 2 }}>
                    <TextField name="triggerPercent" label="درصد سود برای فعال‌سازی" type="number" fullWidth margin="normal" value={localSettings.triggerPercent || ''} onChange={handleChange} />
                    <TextField name="closePercent" label="درصد بستن بخشی از حجم" type="number" fullWidth margin="normal" value={localSettings.closePercent || ''} onChange={handleChange} />
                    <FormControlLabel control={<Switch name="moveToBE" checked={localSettings.moveToBE || false} onChange={handleChange} />} label="ریسک-فری کردن معامله" />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>انصراف</Button>
                <Button onClick={() => SaveAndCloseModal()} variant="contained">ذخیره</Button>
            </DialogActions>
        </Dialog>
    );
}

// --- APP ROUTING ---
export default function App() {
  return (
<>
<Dashboard />
</>
  );
}
