import WebSocket from 'ws';
import { protoService } from './protoService'; // ایمپورت از همان پوشه main

let ws: WebSocket | null = null;
let cloudStatus: 'disconnected' | 'connecting' | 'connected' | 'auth_failed' = 'disconnected';
let currentLicense = '';
let currentHwid = '';

export const getCloudStatus = () => cloudStatus;

export const connectToCloud = (licenseKey: string, hwid: string) => {
    if (!licenseKey || !hwid) return;
    
    currentLicense = licenseKey;
    currentHwid = hwid;
    cloudStatus = 'connecting';
    
    // اگر از قبل باز است ببند
    if (ws) {
        ws.removeAllListeners();
        ws.close();
    }

    console.log('[CloudManager] Connecting to Cloud (ws://127.0.0.1:8080)...');
    ws = new WebSocket('ws://127.0.0.1:8080');

    ws.on('open', () => {
        console.log('[CloudManager] WS Opened. Sending Auth Payload...');
        ws?.send(JSON.stringify({ license_key: currentLicense, hwid: currentHwid, role: 'master' }));
    });

    ws.on('message', (data: WebSocket.RawData) => {
        const msgStr = data.toString('utf8');
        try {
            const response = JSON.parse(msgStr);
            if (response.status === 'success') {
                console.log('[CloudManager] Cloud Connected Successfully!');
                cloudStatus = 'connected';
            } else {
                console.error(`[CloudManager] Auth Failed: ${response.message}`);
                cloudStatus = 'auth_failed';
                disconnectFromCloud();
            }
        } catch (e) {
            console.error('[CloudManager] Invalid message from cloud', e);
        }
    });

    ws.on('close', () => {
        console.log('[CloudManager] Connection closed.');
        // تلاش مجدد فقط اگر ارور لایسنس نگرفته باشیم (مکث ۵ ثانیه - بدون لوپ!)
        if (cloudStatus !== 'auth_failed') {
            cloudStatus = 'disconnected';
            setTimeout(() => {
                if (cloudStatus === 'disconnected') connectToCloud(currentLicense, currentHwid);
            }, 5000);
        }
    });

    ws.on('error', (err) => console.error('[CloudManager] WS Error:', err));
};

export const disconnectFromCloud = () => {
    if (ws) {
        ws.removeAllListeners();
        ws.close();
        ws = null;
    }
    // اگر عمداً قطع کردیم، وضعیت ریست شود
    if (cloudStatus !== 'auth_failed') cloudStatus = 'disconnected';
};

export const broadcastToCloud = (signalData: any) => {
    if (ws && ws.readyState === WebSocket.OPEN && cloudStatus === 'connected') {
        try {
            const encodedData = protoService.encodeSignal(signalData);
            ws.send(encodedData); // ارسال باینری به سرور Rust
            console.log('[CloudManager] Signal encoded and sent to Cloud.');
        } catch (error) {
            console.error('[CloudManager] Encode/Send error:', error);
        }
    }
};