import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Info } from 'lucide-react';
import { useDashboardStore } from '@/app/store/useDashboardStore';
import { TradeRow } from '@/app/components/TradeRow';
import type { CommandPayload } from '@/app/types';

interface TradeListProps {
  sendCommand: (command: CommandPayload, loadingKey: string) => void;
}

export const TradeList = React.memo(({ sendCommand }: TradeListProps) => {
  const { t } = useTranslation();
  const trades = useDashboardStore((state) => state.trades);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  if (trades.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
        <Info className="w-8 h-8" />
        <p>{t('no_trades')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center w-full px-4 py-2 text-xs text-muted-foreground font-medium border-b">
        <span className="flex-1 text-center">{t('ticket')}</span>
        <span className="flex-1 text-center">{t('symbol')}</span>
        <span className="flex-1 text-center">{t('type')}</span>
        <span className="flex-1 text-center">{t('volume')}</span>
        <span className="flex-1 text-center">{t('pl')}</span>
        <span className="flex-[2] text-center">{t('progress')}</span>
        <span className="flex-1 text-center">ATM</span>
        <span className="flex-[2] text-center">{t('actions')}</span>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
            width: '100%',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={trades[virtualRow.index].ticket}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TradeRow trade={trades[virtualRow.index]} sendCommand={sendCommand} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

TradeList.displayName = 'TradeList';