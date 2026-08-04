// app/hooks/useCloudSync.ts
import { useRef, useState, useCallback } from 'react';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import { protoService } from '@/app/lib/protoService'; // فایلی که در مرحله قبل ساختیم
import { toast } from 'sonner'; // فرض بر این است که از این کتابخانه برای اعلان‌ها استفاده می‌کنید

// 👈 اضافه کردن یک کالبک برای زمانی که سیگنال از ابری می‌آید
export const useCloudSync = (onSignalReceived?: (signal: any) => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // خواندن اطلاعات امنیتی از استور
  const { hwid, licenseKey, role } = useDashboardStore((state) => ({
    hwid: state.hwid,
    licenseKey: state.licenseKey,
    role: state.role
  }));

  const connectCloud = useCallback(() => {
    if (!hwid || !licenseKey || !role) {
      toast.error('اطلاعات لایسنس کامل نیست.');
      return;
    }

    setCloudStatus('connecting');
    const ws = new WebSocket('ws://127.0.0.1:8080');
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      // ارسال نقش واقعی بر اساس لایسنس
      ws.send(JSON.stringify({ license_key: licenseKey, hwid, role }));
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const response = JSON.parse(event.data);
          if (response.status === 'success') {
            setCloudStatus('connected');
            toast.success(`🚀 متصل به سرور ابری (حالت: ${role})`);
          } else {
            toast.error(response.message);
            ws.close();
          }
        } catch (e) {
          console.error('Invalid JSON from cloud', e);
        }
      } 
      // 👈 منطق فاز سوم: دریافت سیگنال باینری (فقط برای Slave)
      else if (event.data instanceof ArrayBuffer) {
        if (role === 'slave') {
          try {
            // ۱. تبدیل باینری به JSON
            const decodedSignal = protoService.decodeSignal(new Uint8Array(event.data));
            
            // ۲. بازگرداندن فرمت اصلی برای متاتریدر محلی
            const mql5Payload = {
              type: 'trade_signal',
              ...decodedSignal
            };
            
            // ۳. ارسال به هوک محلی جهت شلیک به متاتریدر
            if (onSignalReceived) {
              onSignalReceived(mql5Payload);
            }
          } catch (error) {
            console.error('Failed to decode cloud signal:', error);
          }
        }
      }
    };

    ws.onclose = () => setCloudStatus('disconnected');
    wsRef.current = ws;
  }, [hwid, licenseKey, role, onSignalReceived]);

  const disconnectCloud = useCallback(() => wsRef.current?.close(), []);

  const broadcastSignal = useCallback((signalData: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && role === 'master') {
      try {
        wsRef.current.send(protoService.encodeSignal(signalData));
      } catch (error) {
        console.error('Encode error:', error);
      }
    }
  }, [role]);

  return { cloudStatus, connectCloud, disconnectCloud, broadcastSignal };
};