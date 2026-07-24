import { PowerSettingsNew } from '@mui/icons-material';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useConveyor } from '../hooks/use-conveyor';

export default function RelayControler() {
    const serverApi = useConveyor('server');
    const [serverStatus, setServerStatus] = useState({ isRunning: false, port: null as number | null });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            if (window.conveyor) {
                const status = await serverApi.getStatus();
                setServerStatus({
                    isRunning: status.isRunning,
                    port: status.port !== undefined ? status.port : null
                });
            }
        };

        // واکشی اولیه
        fetchStatus();

        // واکشی دوره‌ای هر ۳ ثانیه برای زنده نگه‌داشتن استاتوس
        const intervalId = setInterval(fetchStatus, 3000);

        // پاکسازی موقع از بین رفتن کامپوننت
        return () => clearInterval(intervalId);
    }, [serverApi]);

    const handleToggleServer = async () => {
        setIsLoading(true);
        try {
            if (serverStatus.isRunning) {
                await serverApi.stop();
            } else {
                await serverApi.start();
            }
            // واکشی وضعیت جدید بعد از ارسال فرمان
            const status = await serverApi.getStatus();
            setServerStatus({
                isRunning: status.isRunning,
                port: status.port !== undefined ? status.port : null
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #444', p: 1, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ width: 'max-content', margin: '4px' }}>
                        {serverStatus.isRunning ? `روشن : ${serverStatus.port}` : 'خاموش'}
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        color={serverStatus.isRunning ? 'error' : 'success'}
                        onClick={handleToggleServer}
                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <PowerSettingsNew />}
                        disabled={isLoading}
                    >
                        {serverStatus.isRunning ? 'خاموش کردن' : 'روشن کردن'}
                    </Button>
                </Box>
            </Box>
        </>
    );
}