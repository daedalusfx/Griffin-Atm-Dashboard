import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import type { Trade, CommandPayload } from '@/app/types';

interface TradeRowProps {
  trade: Trade;
  sendCommand: (command: CommandPayload, loadingKey: string) => void;
}

export const TradeRow = React.memo(({ trade, sendCommand }: TradeRowProps) => {
  const { t } = useTranslation();
  const loadingStates = useDashboardStore((state) => state.loadingStates);

  const isLoading = {
    atm: loadingStates[`atm_${trade.ticket}`],
    be: loadingStates[`be_${trade.ticket}`],
    reset: loadingStates[`reset_${trade.ticket}`],
    restore: loadingStates[`restore_be_${trade.ticket}`],
    close: loadingStates[`close_${trade.ticket}`],
  };

  const isProfit = trade.profit > 0;
  const isLoss = trade.profit < 0;

  return (
    <div
      className={cn(
        'flex items-center w-full px-4 py-2 mb-2 rounded-md border border-border/50',
        isProfit ? 'bg-green-500/10' : isLoss ? 'bg-red-500/10' : 'bg-card'
      )}
    >
      <span className="flex-1 text-center font-mono text-xs">{trade.ticket}</span>
      <span className="flex-1 text-center font-medium">{trade.symbol}</span>
      <span className="flex-1 text-center">{trade.type}</span>
      <span className="flex-1 text-center font-mono">{trade.volume.toFixed(2)}</span>

      <div
        className={cn(
          'flex-1 text-center font-bold font-mono dir-ltr',
          isProfit ? 'text-green-500' : isLoss ? 'text-red-500' : ''
        )}
      >
        {trade.profit.toFixed(2)} $
      </div>

      <div className="flex-[2] px-2 flex flex-col justify-center items-center gap-1">
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              trade.progress_percent >= 0 ? 'bg-green-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.abs(trade.progress_percent || 0)}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {trade.progress_percent?.toFixed(1)}%
        </span>
      </div>

      <div className="flex-1 flex justify-center items-center gap-2">
        {trade.was_rule_applied ? (
          <>
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
              {t('passed')}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={isLoading.reset}
              onClick={() =>
                sendCommand({ action: 'reset_atm', ticket: trade.ticket }, `reset_${trade.ticket}`)
              }
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <Badge
            variant={trade.atm_enabled ? 'default' : 'secondary'}
            className={cn('cursor-pointer', isLoading.atm && 'opacity-50')}
            onClick={() =>
              sendCommand(
                { action: 'toggle_atm_trade', ticket: trade.ticket, atm_trade_state: !trade.atm_enabled },
                `atm_${trade.ticket}`
              )
            }
          >
            {trade.atm_enabled ? t('active') : t('inactive')}
          </Badge>
        )}
      </div>

      <div className="flex-[2] flex justify-center gap-2">
        {trade.is_breakeven ? (
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 h-7 text-xs"
            disabled={isLoading.restore}
            onClick={() =>
              sendCommand({ action: 'restore_breakeven', ticket: trade.ticket }, `restore_be_${trade.ticket}`)
            }
          >
            {t('restore_be')}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs"
            disabled={!trade.is_breakeven_possible || isLoading.be}
            onClick={() =>
              sendCommand({ action: 'breakeven', ticket: trade.ticket }, `be_${trade.ticket}`)
            }
          >
            {t('breakeven')}
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="h-7 text-xs"
          disabled={isLoading.close}
          onClick={() =>
            sendCommand({ action: 'close', ticket: trade.ticket }, `close_${trade.ticket}`)
          }
        >
          {t('close')}
        </Button>
      </div>
    </div>
  );
});

TradeRow.displayName = 'TradeRow';