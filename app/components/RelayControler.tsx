import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Power } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useConveyor } from '@/app/hooks/use-conveyor';
import { useLicenseStore } from '@/app/store/useLicenseStore';

export const RelayController = () => {
  const { t } = useTranslation();
  const serverApi = useConveyor('server');
  const queryClient = useQueryClient();
  
  // 👈 خواندن دسترسی‌ها از استور
  const { licenseMode, enableLocal } = useLicenseStore(); 

  const { data: status, isLoading: isFetching } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: async () =>
      serverApi ? await serverApi.getStatus() : { isRunning: false, port: null },
    refetchInterval: 3000,
  });

  const toggleMutation = useMutation({
    mutationFn: async (isRunning: boolean) =>
      isRunning ? serverApi.stop() : serverApi.start(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serverStatus'] }),
  });

  const isRunning = status?.isRunning ?? false;
  
  // 👈 بررسی اینکه آیا کاربر اصلاً حق روشن کردن رله رو داره یا نه
  const isLocalAllowedByLicense = licenseMode === 'LOCAL' || licenseMode === 'BOTH';
  const canStartServer = isLocalAllowedByLicense && enableLocal;
  const isLoading = isFetching || toggleMutation.isPending;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {!isLocalAllowedByLicense 
          ? 'رله قفل است' 
          : !enableLocal 
          ? 'رله غیرفعال در تنظیمات' 
          : isRunning 
          ? `${t('port')}: ${status?.port}` 
          : t('server_off')}
      </span>
      <Button
        size="sm"
        variant={isRunning ? 'destructive' : 'outline'}
        onClick={() => toggleMutation.mutate(isRunning)}
        disabled={isLoading || !canStartServer} 
        className="h-7 text-xs px-2"
        title={!canStartServer ? "رله در تنظیمات لایسنس فعال نیست" : ""}
      >
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
        {isRunning ? t('stop') : t('start')}
      </Button>
    </div>
  );
};