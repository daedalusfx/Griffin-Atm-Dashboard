// src/renderer/components/ActionBar.tsx
import { AppBar, Button, ButtonGroup, CircularProgress, Toolbar, Typography } from '@mui/material';
import { memo } from 'react';
import Reluecontroler from './RelayControler';
import { useDashboardStore } from '../store/useDashboardStore';

interface ActionBarProps {
  onOpenConfirmation: (title: string, description: string, action: string, loadingKey: string) => void;
}

export const ActionBar = memo(({ onOpenConfirmation }: ActionBarProps) => {
  const totalPL = useDashboardStore((state) => state.totalPL);
  const trades = useDashboardStore((state) => state.trades);
  
  const hasTrades = trades.length > 0;
  const hasProfits = trades.some((t) => t.profit > 0);
  const hasLosses = trades.some((t) => t.profit < 0);

  const isCloseAllLoading = useDashboardStore((state) => state.loadingStates['close_all']);
  const isCloseProfitsLoading = useDashboardStore((state) => state.loadingStates['close_profits']);
  const isCloseLossesLoading = useDashboardStore((state) => state.loadingStates['close_losses']);

  return (
    <AppBar position="static" elevation={0} color="transparent" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: totalPL >= 0 ? 'success.main' : 'error.main' }}>
          سود/زیان کل: {totalPL.toFixed(2)} $
        </Typography>
        
        <Reluecontroler />
        
        <ButtonGroup>
          <Button variant="contained" color="primary" sx={{ ml: 1 }} onClick={() => onOpenConfirmation('بستن همه', 'آیا مطمئن هستید؟', 'close_all', 'close_all')} disabled={!hasTrades || isCloseAllLoading}>
            {isCloseAllLoading ? <CircularProgress size={24} /> : 'بستن همه'}
          </Button>
          <Button variant="contained" color="success" sx={{ ml: 1 }} onClick={() => onOpenConfirmation('بستن سودده‌ها', 'آیا مطمئن هستید؟', 'close_profits', 'close_profits')} disabled={!hasProfits || isCloseProfitsLoading}>
            {isCloseProfitsLoading ? <CircularProgress size={24} /> : 'بستن سودده‌ها'}
          </Button>
          <Button variant="contained" color="error" onClick={() => onOpenConfirmation('بستن ضررده‌ها', 'آیا مطمئن هستید؟', 'close_losses', 'close_losses')} disabled={!hasLosses || isCloseLossesLoading}>
            {isCloseLossesLoading ? <CircularProgress size={24} /> : 'بستن ضررده‌ها'}
          </Button>
        </ButtonGroup>
      </Toolbar>
    </AppBar>
  );
});