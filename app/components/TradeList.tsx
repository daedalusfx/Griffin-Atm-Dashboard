// src/renderer/components/TradeList.tsx
import React, { memo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TradeRow } from './TradeRow';
import { useDashboardStore } from '../store/useDashboardStore';

const TradeListHeader = memo(() => (
  <Box sx={{ display: 'flex', width: '100%', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
    <Typography sx={{ flex: 1.5, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>تیکت</Typography>
    <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>نماد</Typography>
    <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>نوع</Typography>
    <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>حجم</Typography>
    <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>سود/زیان</Typography>
    <Typography sx={{ flex: 2, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>پیشرفت</Typography>
    <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>ATM</Typography>
    <Typography sx={{ flex: 2, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>عملیات</Typography>
  </Box>
));

export const TradeList = memo(() => {
  const trades = useDashboardStore((state) => state.trades);
  const hasTrades = trades.length > 0;
  
  // رفرنس برای کانتینری که اسکرول می‌خوره
  const parentRef = useRef<HTMLDivElement>(null);

  // تنظیمات مجازی‌ساز
  const rowVirtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // ارتفاع تقریبی هر TradeRow به پیکسل (اگه ردیف‌هات بلندترن اینو بیشتر کن)
    overscan: 5, // چند ردیف قبل و بعد از دید کاربر رندر بشن تا اسکرول نرم بمونه
  });

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TradeListHeader />
      
      {hasTrades ? (
        // این باکس باید overflow-y: auto داشته باشه و رفرنسی که ساختیم بهش وصل بشه
        <Box ref={parentRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
          <Box
            sx={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const trade = trades[virtualRow.index];
              return (
                <Box
                  key={trade.ticket}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TradeRow trade={trade} />
                </Box>
              );
            })}
          </Box>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
          <InfoOutlined sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6">هیچ پوزیشنی وجود ندارد</Typography>
        </Box>
      )}
    </Box>
  );
});