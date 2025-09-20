import { PowerSettingsNew } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useConveyor } from '../hooks/use-conveyor';

export default function RelayControler() {

    const serverApi = useConveyor('server');
    const [serverStatus, setServerStatus] = useState({ isRunning: false, port: null });

    useEffect(() => {
        const getStatus = async () => {
            if (window.conveyor) {
                const status = await serverApi.getStatus();
                setServerStatus(status);
            }
        };
        getStatus();
    }, [serverApi]);

    const handleToggleServer = async () => {
        if (serverStatus.isRunning) {
            await serverApi.stop();
        } else {
            await serverApi.start();
        }
        // به‌روزرسانی وضعیت بعد از تغییر
        const status = await serverApi.getStatus();
        setServerStatus(status);
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #444', p: 1, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ width: 'max-content', margin: '4px' }}>
                        {serverStatus.isRunning ? `رله فعال در پورت: ${serverStatus.port}` : 'رله غیرفعال'}
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        color={serverStatus.isRunning ? 'error' : 'success'}
                        onClick={handleToggleServer}
                        startIcon={<PowerSettingsNew />}
                    >
                        {serverStatus.isRunning ? 'خاموش' : 'روشن'}
                    </Button>
                </Box>
            </Box>


        </>
    )
}
