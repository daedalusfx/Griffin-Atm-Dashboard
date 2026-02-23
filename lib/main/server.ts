import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const RELAY_PORT = 5151;             // پورتی که اکسپرت‌های اسلیو بهش وصل میشن
const MASTER_WS_URL = 'ws://127.0.0.1:5000'; // آدرس DLL اکسپرت مستر

let server: http.Server | null = null;
let slaveWss: WebSocketServer | null = null;
let masterWs: WebSocket | null = null;

// =================================================================
function connectToMaster() {
    console.log(`🔌 [Router] Connecting to Master EA at ${MASTER_WS_URL}...`);
    masterWs = new WebSocket(MASTER_WS_URL);

    masterWs.on('open', () => console.log(`✅ [Router] Connected to Master EA!`));

    masterWs.on('message', (data: WebSocket.RawData) => {
        const msgStr = data.toString('utf8');
        try {
            const parsed = JSON.parse(msgStr);
            // فقط اگر پیام از نوع سیگنال معاملاتی بود
            if (parsed.type === 'trade_signal' && parsed.data && parsed.data.action) {
                console.log(`📥 [Router] Signal Received: ${parsed.data.action} for ${parsed.data.symbol}`);
                broadcastToSlaves(msgStr); // مخابره آنی به تمام اسلیوها
            }
        } catch (e) {
            // نادیده گرفتن پیام‌های نامعتبر
        }
    });

    masterWs.on('close', () => {
        console.log(`❌ [Router] Disconnected from Master. Reconnecting in 3s...`);
        setTimeout(connectToMaster, 3000);
    });

    masterWs.on('error', () => { /* جلوگیری از کرش کردن */ });
}

function setupSlaveServer(httpServer: http.Server) {
    // سرور برای اسلیوها (بدون نیاز به path خاص)
    slaveWss = new WebSocketServer({ server: httpServer });
    
    slaveWss.on('connection', (ws, req) => {
        console.log(`🔌 [Router] New Slave EA connected from ${req.socket.remoteAddress}`);
        ws.on('close', () => console.log(`👋 [Router] Slave EA disconnected.`));
        ws.on('error', () => {});
    });
}

function broadcastToSlaves(message: string) {
    if (!slaveWss) return;
    let count = 0;
    slaveWss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
            count++;
        }
    });
    if(count > 0) console.log(`🚀 [Router] Broadcasted to ${count} Slaves!`);
}

app.get('/api/status', (req, res) => {
    res.json({ 
        isRunning: true, 
        port: RELAY_PORT, 
        connected_slaves: slaveWss ? slaveWss.clients.size : 0 
    });
});

export function startServer(port = RELAY_PORT): Promise<{ success: boolean, port: number, error?: string }> {
    return new Promise((resolve) => {
        if (server) return resolve({ success: true, port });

        server = http.createServer(app);
        setupSlaveServer(server);

        server.listen(port, () => {
            console.log(`✅ [Router] Relay Server listening on port ${port}`);
            connectToMaster(); // اتصال به مستر بعد از روشن شدن سرور
            resolve({ success: true, port });
        }).on('error', (err) => {
            server = null;
            resolve({ success: false, port, error: err.message });
        });
    });
}

export function stopServer(): Promise<void> {
    return new Promise((resolve) => {
        if (masterWs) masterWs.close();
        if (server) {
            if (slaveWss) {
                slaveWss.clients.forEach(c => c.close());
                slaveWss.close();
            }
            server.close(() => {
                server = null;
                slaveWss = null;
                resolve();
            });
        } else {
            resolve();
        }
    });
}