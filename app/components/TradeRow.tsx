// src/renderer/components/TradeRow.tsx
import React, { memo } from 'react';
import { Replay as ReplayIcon } from '@mui/icons-material';
import { Box, Typography, Chip, Button, LinearProgress, alpha, useTheme, Tooltip, IconButton } from '@mui/material';
import { Trade } from './types';
import { useDashboardStore } from '../store/useDashboardStore';

interface TradeRowProps {
  trade: Trade;
}

export const TradeRow = memo(({ trade }: TradeRowProps) => {
  const theme = useTheme();
  
  const atmKey = `atm_${trade.ticket}`;
  const beKey = `be_${trade.ticket}`;
  const resetKey = `reset_${trade.ticket}`;
  const restoreBeKey = `restore_be_${trade.ticket}`;
  const closeKey = `close_${trade.ticket}`;
  const progressValue = trade.progress_percent || 0;

  const sendCommand = useDashboardStore((state) => state.sendCommand);
  
  // برای جلوگیری از رندر مجدد، از یک سلکتور ترکیبی استفاده می‌کنیم
  const isAtmLoading = useDashboardStore((state) => state.loadingStates[atmKey]);
  const isBeLoading = useDashboardStore((state) => state.loadingStates[beKey]);
  const isResetLoading = useDashboardStore((state) => state.loadingStates[resetKey]);
  const isRestoreBeLoading = useDashboardStore((state) => state.loadingStates[restoreBeKey]);
  const isCloseLoading = useDashboardStore((state) => state.loadingStates[closeKey]);

  const handleToggleAtm = () => sendCommand({ action: 'toggle_atm_trade', ticket: trade.ticket, atm_trade_state: !trade.atm_enabled }, atmKey);
  const handleRestoreBreakeven = () => sendCommand({ action: 'restore_breakeven', ticket: trade.ticket }, restoreBeKey);
  const handleBreakeven = () => sendCommand({ action: 'breakeven', ticket: trade.ticket }, beKey);
  const handleClose = () => sendCommand({ action: 'close', ticket: trade.ticket }, closeKey);
  const handleResetAtm = () => sendCommand({ action: 'reset_atm', ticket: trade.ticket }, resetKey);

  const renderAtmSection = () => {
    if (trade.was_rule_applied) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Chip label="Passed" color="warning" size="small" />
          <Tooltip title="Re-arm ATM">
            <span>
              <IconButton
                size="small"
                onClick={handleResetAtm}
                disabled={isResetLoading}
                sx={{ ml: 0.5 }}
              >
                <ReplayIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      );
    }
    
    return (
      <Chip
        label={trade.atm_enabled ? "Active" : "Inactive"}
        color={trade.atm_enabled ? "success" : "default"}
        size="small"
        onClick={handleToggleAtm}
        disabled={isAtmLoading}
      />
    );
  };

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
        {renderAtmSection()}
      </Box>
      <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
        {trade.is_breakeven ? (
          <Button variant="contained" size="small" sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#f97316' } }} onClick={handleRestoreBreakeven} disabled={isRestoreBeLoading}>BE</Button>
        ) : (
          <Button variant="contained" size="small" color="info" onClick={handleBreakeven} disabled={!trade.is_breakeven_possible || isBeLoading}>Breakeven</Button>
        )}
        <Button variant="contained" size="small" color="error" onClick={handleClose} disabled={isCloseLoading}>Close</Button>
      </Box>
    </Box>
  );
});