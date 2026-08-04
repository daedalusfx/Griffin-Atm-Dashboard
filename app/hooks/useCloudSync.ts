import { useRef, useState, useCallback } from 'react';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import { protoService } from '@/app/lib/protoService'; // فایلی که در مرحله قبل ساختیم
import { toast } from 'sonner'; // فرض بر این است که از این کتابخانه برای اعلان‌ها استفاده می‌کنید

export const useCloudSync = () => {
  const wsRef = useRef<WebSocket | null>(null);
  
  // استیت‌های اتصال به سرور ابری
  const [cloudStatus, setCloudStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // خواندن مشخصات لاگین از استور اصلی
  const hwid = useDashboardStore((state) => state.hwid);
  // فرض می‌کنیم licenseKey بعد از تایید موفقیت‌آمیز در استور ذخیره می‌شود
  const licenseKey = useDashboardStore((state) => (state as any).licenseKey); 

  const connectCloud = useCallback(() => {
    if (!hwid || !licenseKey) {
      toast.error('برای اتصال ابری، ابتدا لایسنس را تایید کنید.');
      return;
    }

    setCloudStatus('connecting');
    
    // آدرس روتر Rust (فعلاً روی لوکال)
    const ws = new WebSocket('ws://127.0.0.1:8080');
    
    // 👈 تنظیم نوع دریافت پیام روی باینری (برای فاز Slave بسیار مهم است)
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      // ۱. ارسال پیام احراز هویت به صورت JSON (طبق فایل handler.rs شما)
      const authPayload = {
        license_key: licenseKey,
        hwid: hwid,
        role: 'master' // در این فاز، کلاینت فعلی صادرکننده سیگنال است
      };
      ws.send(JSON.stringify(authPayload));
    };

    ws.onmessage = (event) => {
      // ۲. پردازش پیام‌های سرور ابری
      if (typeof event.data === 'string') {
        try {
          const response = JSON.parse(event.data);
          if (response.status === 'success') {
            setCloudStatus('connected');
            toast.success('🚀 ارتباط با سرور ابری HFT برقرار شد');
          } else if (response.status === 'error') {
            toast.error(response.message || 'خطا در احراز هویت ابری');
            ws.close();
          }
        } catch (e) {
          console.error('Invalid JSON from cloud router', e);
        }
      } else {
        // پیام‌های باینری (Protobuf): در فاز Master کاری با این بخش نداریم
        // در فاز Slave، اینجا پیام را دی‌کد می‌کنیم
      }
    };

    ws.onclose = () => {
      setCloudStatus('disconnected');
      toast.error('ارتباط با سرور ابری قطع شد');
      // نکته: منطق Reconnect خودکار را می‌توانیم در آینده اینجا اضافه کنیم
    };

    ws.onerror = (error) => {
      console.error('Cloud WebSocket error:', error);
      ws.close();
    };

    wsRef.current = ws;
  }, [hwid, licenseKey]);

  const disconnectCloud = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  // ۳. متدی برای شلیک سیگنال به سمت Rust
  const broadcastSignal = useCallback((signalData: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && cloudStatus === 'connected') {
      try {
        // تبدیل دیتای خام متاتریدر به بایت‌های Protobuf
        const binaryPayload = protoService.encodeSignal(signalData);
        
        // شلیک بایت‌ها به روتر
        wsRef.current.send(binaryPayload);
      } catch (error) {
        console.error('Failed to encode and send signal:', error);
      }
    }
  }, [cloudStatus]);

  return {
    cloudStatus,
    connectCloud,
    disconnectCloud,
    broadcastSignal
  };
};