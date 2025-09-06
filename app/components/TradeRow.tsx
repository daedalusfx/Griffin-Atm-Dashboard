// src/renderer/components/TradeRow.tsx (فایل جدید)

import React, { memo } from 'react';
import { Box, Typography, Chip, Button, LinearProgress, alpha, useTheme } from '@mui/material';
import { Trade, CommandPayload } from './types'; 


interface TradeRowProps {
  trade: Trade;
  onSendCommand: (command: CommandPayload, loadingKey: string) => void;
  loadingStates: { [key: string]: boolean };
}

// کامپوننت با React.memo بهینه شده است
export const TradeRow = memo(({ trade, onSendCommand, loadingStates }: TradeRowProps) => {
  const theme = useTheme();
  console.log(`Rendering TradeRow: ${trade.ticket}`); // این برای دیباگ است، بعدا حذف کنید

  const atmKey = `atm_${trade.ticket}`;
  const beKey = `be_${trade.ticket}`;
  const restoreBeKey = `restore_be_${trade.ticket}`;
  const closeKey = `close_${trade.ticket}`;
  const progressValue = trade.progress_percent || 0;

  // توابع handler برای خوانایی بیشتر جداگانه تعریف شده‌اند
  const handleToggleAtm = () => onSendCommand({ action: 'toggle_atm_trade', ticket: trade.ticket, atm_trade_state: !trade.atm_enabled }, atmKey);
  const handleRestoreBreakeven = () => onSendCommand({ action: 'restore_breakeven', ticket: trade.ticket }, restoreBeKey);
  const handleBreakeven = () => onSendCommand({ action: 'breakeven', ticket: trade.ticket }, beKey);
  const handleClose = () => onSendCommand({ action: 'close', ticket: trade.ticket }, closeKey);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2, py: 1, bgcolor: alpha(trade.profit > 0 ? theme.palette.success.main : trade.profit < 0 ? theme.palette.error.main : theme.palette.background.paper, 0.15), borderRadius: 2, mb: 1 }}>
        <Typography sx={{ flex: 1.5, textAlign: 'center' }}>{trade.ticket}</Typography>
        <Typography sx={{ flex: 1, textAlign: 'center' }}>{trade.symbol}</Typography>
        <Typography sx={{ flex: 1, textAlign: 'center' }}>{trade.type}</Typography>
        <Typography sx={{ flex: 1, textAlign: 'center' }}>{trade.volume.toFixed(2)}</Typography>
        <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: trade.profit >= 0 ? 'success.main' : 'error.main' }}>{trade.profit.toFixed(2)} $</Typography>
        <Box sx={{ flex: 2, textAlign: 'center', px: 1 }}>
            <LinearProgress variant="determinate" value={Math.abs(progressValue)} color={progressValue >= 0 ? "success" : "error"} sx={{ height: 8, borderRadius: 4, mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{`${progressValue.toFixed(1)}%`}</Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Chip label={trade.atm_enabled ? "فعال" : "غیرفعال"} color={trade.atm_enabled ? "success" : "default"} size="small" onClick={handleToggleAtm} disabled={loadingStates[atmKey]} />
        </Box>
        <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            {trade.is_breakeven ? (
                <Button variant="contained" size="small" sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#f97316' } }} onClick={handleRestoreBreakeven} disabled={loadingStates[restoreBeKey]}>لغو BE</Button>
            ) : (
                <Button variant="contained" size="small" color="info" onClick={handleBreakeven} disabled={trade.profit <= 0 || loadingStates[beKey]}>ریسک فری</Button>
            )}
            <Button variant="contained" size="small" color="error" onClick={handleClose} disabled={loadingStates[closeKey]}>بستن</Button>
        </Box>
    </Box>
  );
});