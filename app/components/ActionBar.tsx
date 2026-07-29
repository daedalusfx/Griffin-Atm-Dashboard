import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import type { CommandPayload } from '@/app/types';

interface ActionBarProps {
  sendCommand: (command: CommandPayload, loadingKey: string) => void;
}

export const ActionBar = ({ sendCommand }: ActionBarProps) => {
  const { t } = useTranslation();
  const totalPL = useDashboardStore((state) => state.totalPL);
  const trades = useDashboardStore((state) => state.trades);
  const loadingStates = useDashboardStore((state) => state.loadingStates);

  const hasTrades = trades.length > 0;
  const hasProfits = trades.some((tr) => tr.profit > 0);
  const hasLosses = trades.some((tr) => tr.profit < 0);

  const loading = {
    all: loadingStates['close_all'],
    profits: loadingStates['close_profits'],
    losses: loadingStates['close_losses'],
  };

  return (
    <footer className="flex items-center justify-between p-4 border-t border-border">
      <h3
        className={cn(
          'text-lg font-bold font-mono dir-ltr',
          totalPL >= 0 ? 'text-green-500' : 'text-red-500'
        )}
      >
        {t('total_pl')}: {totalPL.toFixed(2)} $
      </h3>

      <div className="flex gap-2">
        <Button
          onClick={() => sendCommand({ action: 'close_all' }, 'close_all')}
          disabled={!hasTrades || loading.all}
          variant="default"
        >
          {loading.all ? <Loader2 className="w-4 h-4 animate-spin" /> : t('close_all')}
        </Button>
        <Button
          onClick={() => sendCommand({ action: 'close_profits' }, 'close_profits')}
          disabled={!hasProfits || loading.profits}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading.profits ? <Loader2 className="w-4 h-4 animate-spin" /> : t('close_profits')}
        </Button>
        <Button
          onClick={() => sendCommand({ action: 'close_losses' }, 'close_losses')}
          disabled={!hasLosses || loading.losses}
          variant="destructive"
        >
          {loading.losses ? <Loader2 className="w-4 h-4 animate-spin" /> : t('close_losses')}
        </Button>
      </div>
    </footer>
  );
};