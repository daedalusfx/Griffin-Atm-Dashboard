import { useRef, useState, useCallback } from 'react';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import { useLicenseStore } from '@/app/store/useLicenseStore';
import { protoService } from '@/app/lib/protoService';
import { toast } from 'sonner';

export const useCloudSync = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const hwid = useDashboardStore((state) => state.hwid);
  const relayToken = useLicenseStore((state) => state.relayToken); // توکنی که قراره روش سیگنال بفرستیم

  const connectCloud = useCallback(() => {
    if (!hwid) return toast.error('خطای سیستمی: HWID موجود نیست.');

    // از آنجایی که این پنل فقط برای Master است، برای اتصال به کلود فقط به توکن PRV نیاز داریم
    if (!relayToken || !relayToken.startsWith('PRV-')) {
      toast.error('جهت اتصال به سرور ابری، لطفاً توکن انتشار (PRV) معتبر وارد کنید.');
      return;
    }
         
    setCloudStatus('connecting');
    const ws = new WebSocket('ws://127.0.0.1:8080'); // آدرس روتر Rust
    ws.binaryType = 'arraybuffer';
    
    ws.onopen = () => {
      // 👈 همیشه با نقش Master متصل می‌شویم تا مجوز Broadcast بگیریم
      ws.send(JSON.stringify({ license_key: relayToken, hwid, role: 'master' }));
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const response = JSON.parse(event.data);
          if (response.status === 'success') {
            setCloudStatus('connected');
            toast.success('اتصال ابری موفق: آماده انتشار سیگنال با سرعت نور ⚡');
          } else {
            toast.error(`خطا از سرور کلود: ${response.message}`);
            ws.close();
          }
        } catch (e) {
          console.error('Invalid JSON from cloud router', e);
        }
      }
    };

    ws.onclose = () => setCloudStatus('disconnected');
    wsRef.current = ws;
  }, [hwid, relayToken]);

  const disconnectCloud = useCallback(() => {
      if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
      }
  }, []);

  const broadcastSignal = useCallback((signalData: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(protoService.encodeSignal(signalData));
      } catch (error) {
        console.error('Encode error:', error);
      }
    }
  }, []);

  return { cloudStatus, connectCloud, disconnectCloud, broadcastSignal };
};