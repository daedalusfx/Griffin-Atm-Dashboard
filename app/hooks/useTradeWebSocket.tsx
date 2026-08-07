import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { toast } from 'sonner';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import type { CommandPayload } from '@/app/types';
import { useCloudSync } from './useCloudSync';

export const useTradeWebSocket = () => {
  const { setTradeData, setLoading, setSettings, setHwid } = useDashboardStore();
  const { t } = useTranslation();

  // یک رفرنس برای نگهداری تابع ارسال به کلود (برای جلوگیری از تداخل لود شدن هوک‌ها)
  const broadcastSignalRef = useRef<((data: any) => void) | null>(null);

  // ۱. ارتباط با متاتریدر محلی (از طریق کتابخانه react-use-websocket)
  const { sendJsonMessage, readyState } = useWebSocket('ws://localhost:5000', {
    shouldReconnect: () => true,
    reconnectAttempts: 9999,
    reconnectInterval: 3000,
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'system_info':
            if (message.data?.hwid) {
              setHwid(message.data.hwid);
            }
            break;
            
          case 'trade_data':
            setTradeData(message.data);
            break;
            
          case 'settings':
            setSettings(message.data);
            break;
            
          case 'feedback':
            if (message.data.status === 'success') {
              toast.success(message.data.message);
            } else if (message.data.status === 'error') {
              toast.error(message.data.message);
            } else {
              toast(message.data.message);
            }
            break;
            
          case 'trade_signal':
            // نمایش نوتیفیکیشن
            toast.info(`${t('symbol')}: ${message.data.action}`, {
              description: `${t('ticket')}: #${message.data.provider_ticket}`,
            });
            
            // 🚀 شلیک سیگنال متاتریدر به سرور ابری (اگر کاربر ارائه‌دهنده باشد)
            if (broadcastSignalRef.current) {
              broadcastSignalRef.current(message.data);
            }
            break;
        }
      } catch (e) {
        console.error('WS Parse Error', e);
      }
    },
  });

  // ۲. ساخت تابع "پستچی محلی"
  // این تابع دیتای دی‌کد شده کلود را می‌گیرد و با sendJsonMessage به متاتریدر خودت می‌فرستد
  const sendToLocalMT5 = useCallback((mql5Payload: any) => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage(mql5Payload);
      console.log('✅ سیگنال از کلود دریافت و به متاتریدر محلی شلیک شد:', mql5Payload);
    }
  }, [readyState, sendJsonMessage]);

  // ۳. راه‌اندازی ارتباط ابری و پاس دادن پستچی محلی به آن برای حالت Slave
  const { broadcastSignal, cloudStatus } = useCloudSync();

  // ۴. آپدیت کردن رفرنس ارسال ابری (تا همیشه جدیدترین نسخه تابع در دسترس متاتریدر باشد)
  useEffect(() => {
    broadcastSignalRef.current = broadcastSignal;
  }, [broadcastSignal]);

  // تابع ارسال دستورات دستی (مثل تغییر تنظیمات از UI داشبورد)
  const sendCommand = useCallback(
    (command: CommandPayload, loadingKey: string) => {
      if (readyState !== ReadyState.OPEN) {
        toast.error(t('connection_lost'));
        return;
      }
      setLoading(loadingKey, true);
      sendJsonMessage(command);
      setTimeout(() => setLoading(loadingKey, false), 500);
    },
    [readyState, sendJsonMessage, setLoading, t]
  );

  return { sendCommand, connectionStatus: readyState, cloudStatus };
};