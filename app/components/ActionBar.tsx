// src/renderer/components/ActionBar.tsx (فایل جدید)

import { AppBar, Button, ButtonGroup, CircularProgress, Toolbar, Typography } from '@mui/material';
import { memo } from 'react';
import Reluecontroler from './RelayControler';

interface ActionBarProps {
    totalPL: number;
    hasTrades: boolean;
    hasProfits: boolean;
    hasLosses: boolean;
    onOpenConfirmation: (title: string, description: string, action: string, loadingKey: string) => void;
    loadingStates: { [key: string]: boolean };
}

export const ActionBar = memo(({ totalPL, hasTrades, hasProfits, hasLosses, onOpenConfirmation, loadingStates }: ActionBarProps) => {
    //console.log("Rendering ActionBar..."); // برای دیباگ
    return (
        <AppBar position="static" elevation={0} color="transparent" sx={{ top: 'auto', bottom: 0 }}>
            <Toolbar sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <Typography variant="h6" sx={{ color: totalPL >= 0 ? 'success.main' : 'error.main' }}>
                    سود/زیان کل: {totalPL.toFixed(2)} $
                </Typography>
                {/* <Box sx={{ flexGrow: 1 }} /> */}
                {/* FIX: استفاده از onOpenConfirmation و ارسال action به صورت string */}
                <Reluecontroler />

                <ButtonGroup>


                    <Button variant="contained" color="primary" sx={{ ml: 1 }} onClick={() => onOpenConfirmation('بستن همه', 'آیا از بستن تمام معاملات مطمئن هستید؟', 'close_all', 'close_all')} disabled={!hasTrades || loadingStates['close_all']}>
                        {loadingStates['close_all'] ? <CircularProgress size={24} /> : 'بستن همه'}
                    </Button>
                    <Button variant="contained" color="success" sx={{ ml: 1 }} onClick={() => onOpenConfirmation('بستن سودها', 'آیا از بستن تمام معاملات سودده مطمئن هستید؟', 'close_profits', 'close_profits')} disabled={!hasProfits || loadingStates['close_profits']}>
                        {loadingStates['close_profits'] ? <CircularProgress size={24} /> : 'بستن سودها'}
                    </Button>
                    <Button variant="contained" color="error" onClick={() => onOpenConfirmation('بستن ضررها', 'آیا از بستن تمام معاملات ضررده مطمئن هستید؟', 'close_losses', 'close_losses')} disabled={!hasLosses || loadingStates['close_losses']}>
                        {loadingStates['close_losses'] ? <CircularProgress size={24} /> : 'بستن ضررها'}
                    </Button>
                </ButtonGroup>
            </Toolbar>

        </AppBar>
    );
});