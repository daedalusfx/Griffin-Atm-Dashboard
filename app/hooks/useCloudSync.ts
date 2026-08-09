import { useRef, useState, useCallback, useEffect } from 'react';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import { useLicenseStore } from '@/app/store/useLicenseStore';
import { protoService } from '@/app/lib/protoService';
import { toast } from 'sonner';

export const useCloudSync = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const hwid = useDashboardStore((state) => state.hwid);
  // تغییر ۱: گرفتن licenseKey به جای relayToken
  const licenseKey = useLicenseStore((state) => state.licenseKey); 

  const connectCloud = useCallback(() => {
    if (!hwid) {
      console.error('[CloudSync] Connection failed: HWID is missing.');
      return toast.error('خطا: HWID یافت نشد.');
    }
    
    // تغییر ۲: حذف شرط PRV- و چک کردن فقط خود لایسنس
    if (!licenseKey) {
      console.error('[CloudSync] Connection failed: Invalid License Key.');
      toast.error('لایسنس برای اتصال به کلود معتبر نیست.');
      return;
    }

    console.log(`[CloudSync] Attempting to connect to Cloud Server at ws://127.0.0.1:8080...`);
    setCloudStatus('connecting');
    const ws = new WebSocket('ws://127.0.0.1:8080'); // آدرس سرور کلود
    ws.binaryType = 'arraybuffer';
    
    ws.onopen = () => {
      console.log('[CloudSync] WS Opened. Sending Auth Payload as MASTER...');
      // تغییر ۳: استفاده از licenseKey در Payload
      const authPayload = { license_key: licenseKey, hwid, role: 'master' };
      ws.send(JSON.stringify(authPayload));
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const response = JSON.parse(event.data);
          console.log('[CloudSync] Message from server:', response);
          
          if (response.status === 'success') {
            setCloudStatus('connected');
            toast.success('اتصال به سرور ابری (Master) برقرار شد!');
          } else {
            toast.error(`خطای سرور ابری: ${response.message}`);
            ws.close();
          }
        } catch (e) {
          console.error('[CloudSync] Invalid JSON from cloud router', e);
        }
      }
    };

    ws.onclose = (e) => {
      console.warn(`[CloudSync] Connection closed. Code: ${e.code}, Reason: ${e.reason}`);
      setCloudStatus('disconnected');
      toast.info('اتصال ابری قطع شد.');
    };

    ws.onerror = (error) => {
      console.error('[CloudSync] WebSocket Error:', error);
    };

    wsRef.current = ws;
  }, [hwid, licenseKey]); // وابستگی‌ها آپدیت شد

  const disconnectCloud = useCallback(() => {
      if (wsRef.current) {
          console.log('[CloudSync] Manually disconnecting...');
          wsRef.current.close();
          wsRef.current = null;
      }
  }, []);

  const broadcastSignal = useCallback((signalData: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        console.log('[CloudSync] Encoding and sending signal to Cloud:', signalData);
        const encodedData = protoService.encodeSignal(signalData);
        wsRef.current.send(encodedData);
        console.log('[CloudSync] Signal successfully sent to Cloud!');
      } catch (error) {
        console.error('[CloudSync] Encode/Send error:', error);
      }
    } else {
      console.warn('[CloudSync] Ignored signal send: WebSocket is not open.');
    }
  }, []);

  // تغییر ۴: اصلاح شرط وصل شدن اتوماتیک
  useEffect(() => {
    if (
      hwid && 
      licenseKey && 
      cloudStatus === 'disconnected'
    ) {
      console.log('[CloudSync] Credentials found. Auto-connecting to cloud...');
      connectCloud();
    }
  }, [hwid, licenseKey, cloudStatus, connectCloud]); // وابستگی‌ها آپدیت شد

  return { cloudStatus, connectCloud, disconnectCloud, broadcastSignal };
};