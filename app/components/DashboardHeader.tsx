// src/renderer/components/DashboardHeader.tsx (فایل جدید)

import { Brightness4, Brightness7 } from '@mui/icons-material';
import { AppBar, Button, ButtonGroup, Toolbar, Typography } from '@mui/material';
import React, { memo } from 'react';

interface DashboardHeaderProps {
    symbol: string;
    connectionIcon: React.ReactNode;
    themeMode: 'light' | 'dark';
    onToggleTheme: () => void;
    onOpenSettings: () => void;
    onOpenMainSettings: () => void;
}

export const DashboardHeader = memo(({ symbol, connectionIcon, themeMode, onToggleTheme, onOpenSettings, onOpenMainSettings }: DashboardHeaderProps) => {
    // console.log("Rendering Header..."); // برای دیباگ
    return (
        <AppBar position="static" elevation={0} color="transparent">
            <Toolbar>
                {connectionIcon}
                <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
                    داشبورد معاملاتی - نماد: <span style={{ fontWeight: 'bold' }}>{symbol}</span>
                </Typography>
                <ButtonGroup variant="contained" color='inherit' aria-label="Basic button group">
                    <Button onClick={onToggleTheme} color="inherit" variant='outlined' >
                    {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </Button>
                    <Button onClick={onOpenSettings} color="inherit" variant='outlined'>
                    ATM Settings
                    </Button>
                    <Button onClick={onOpenMainSettings} color="inherit" variant='outlined' >
                    Risk Settings
                    </Button>
                </ButtonGroup>
            </Toolbar>
        </AppBar>
    );
});