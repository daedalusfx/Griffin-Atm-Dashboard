import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import { useLicenseStore } from '@/app/store/useLicenseStore';
import { useConveyor } from '@/app/hooks/use-conveyor';

export const useCloudSync = () => {
  const cloudApi = useConveyor('cloudapi');
  const hwid = useDashboardStore((state) => state.hwid);
  const licenseKey = useLicenseStore((state) => state.licenseKey);

  // نظرسنجی (Polling) از بک‌اند الکترون هر ۲ ثانیه برای گرفتن وضعیت کلود
  const { data: cloudStatus = 'disconnected' } = useQuery({
    queryKey: ['cloudStatus'],
    queryFn: async () => await cloudApi.getStatus(),
    refetchInterval: 2000,
  });

  const connectCloud = useCallback(() => {
    if (hwid && licenseKey) {
      cloudApi.connect(licenseKey, hwid);
    }
  }, [hwid, licenseKey, cloudApi]);

  const disconnectCloud = useCallback(() => {
    cloudApi.disconnect();
  }, [cloudApi]);

  const broadcastSignal = useCallback((signalData: any) => {
    cloudApi.broadcast(signalData);
  }, [cloudApi]);

  // فقط دستور اتصال اولیه رو میدیم، بقیش به عهده Main Process
  useEffect(() => {
    if (hwid && licenseKey && cloudStatus === 'disconnected') {
      connectCloud();
    }
  }, [hwid, licenseKey, cloudStatus, connectCloud]);

  return { cloudStatus, connectCloud, disconnectCloud, broadcastSignal };
};