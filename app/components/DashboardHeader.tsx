// src/renderer/components/DashboardHeader.tsx (فایل جدید)

import React, { memo } from 'react';
import { AppBar, Toolbar, Typography, Tooltip, IconButton } from '@mui/material';
import { Brightness4, Brightness7, Settings as SettingsIcon } from '@mui/icons-material';

interface DashboardHeaderProps {
  symbol: string;
  connectionIcon: React.ReactNode;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const DashboardHeader = memo(({ symbol, connectionIcon, themeMode, onToggleTheme, onOpenSettings }: DashboardHeaderProps) => {
    console.log("Rendering Header..."); // برای دیباگ
    return (
        <AppBar position="static" elevation={0} color="transparent">
            <Toolbar>
                {connectionIcon}
                <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
                    داشبورد معاملاتی - نماد: <span style={{ fontWeight: 'bold' }}>{symbol}</span>
                </Typography>
                <Tooltip title="تغییر تم">
                    <IconButton onClick={onToggleTheme} color="inherit">
                        {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="تنظیمات">
                    <IconButton onClick={onOpenSettings} color="inherit">
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
});