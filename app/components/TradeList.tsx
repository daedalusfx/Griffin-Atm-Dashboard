// src/renderer/components/TradeList.tsx (فایل جدید)

import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { TradeRow } from './TradeRow';
import { CommandPayload,Trade } from './types';



interface TradeListProps {
  trades: Trade[];
  onSendCommand: (command: CommandPayload, loadingKey: string) => void;
  loadingStates: { [key: string]: boolean };
}

const TradeListHeader = memo(() => (
    <Box sx={{ display: 'flex', width: '100%', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Typography sx={{ flex: 1.5, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>تیکت</Typography>
      <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>نماد</Typography>
      <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>نوع</Typography>
      <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>حجم</Typography>
      <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>سود</Typography>
      <Typography sx={{ flex: 2, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>پیشرفت</Typography>
      <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>ATM</Typography>
      <Typography sx={{ flex: 2, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>اقدامات</Typography>
    </Box>
));

export const TradeList = memo(({ trades, onSendCommand, loadingStates }: TradeListProps) => {
    // console.log("Rendering TradeList..."); // برای دیباگ
    const hasTrades = trades.length > 0;

    return (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <TradeListHeader />
            {hasTrades ? (
                <Box sx={{ overflowY: 'auto', p: 1 }}>
                    {trades.map((trade) => (
                        <TradeRow
                            key={trade.ticket}
                            trade={trade}
                            onSendCommand={onSendCommand}
                            loadingStates={loadingStates}
                        />
                    ))}
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                    <InfoOutlined sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6">هیچ معامله‌ی بازی وجود ندارد</Typography>
                </Box>
            )}
        </Box>
    );
});