import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { toast } from 'sonner';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import type { CommandPayload } from '@/app/types';

export const useTradeWebSocket = () => {
  const { setTradeData, setLoading, setSettings } = useDashboardStore();
  const { t } = useTranslation();

  const { sendJsonMessage, readyState } = useWebSocket('ws://localhost:5000', {
    shouldReconnect: () => true,
    reconnectAttempts: 9999,
    reconnectInterval: 3000,
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
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
              toast(message.data.message); // حالت معمولی
            }
            break;
            
          case 'trade_signal':
            // استفاده از امکانات Sonner برای نمایش تیتر و توضیحات جذاب
            toast.info(`${t('symbol')}: ${message.data.action}`, {
              description: `${t('ticket')}: #${message.data.provider_ticket}`,
            });
            break;
  break;
        }
      } catch (e) {
        console.error('WS Parse Error', e);
      }
    },
  });

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

  return { sendCommand, connectionStatus: readyState };
};