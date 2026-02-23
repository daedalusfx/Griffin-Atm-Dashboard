import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const RELAY_PORT = 5151;             // پورتی که اکسپرت‌های اسلیو بهش وصل میشن
const MASTER_WS_URL = 'ws://127.0.0.1:5000'; // آدرس DLL اکسپرت مستر

let server: http.Server | null = null;
let slaveWss: WebSocketServer | null = null;
let masterWs: WebSocket | null = null;

// +++ پرچم وضعیت برای جلوگیری از لوپ اتصال مجدد +++
let isRouterActive = false; 

// =================================================================
// ### بخش ۱: اتصال به اکسپرت Master (کلاینت)
// =================================================================
function connectToMaster() {
    // اگر رله توسط کاربر خاموش شده، اصلاً تلاش برای اتصال نکن
    if (!isRouterActive) return;

    console.log(`🔌 [Router] Connecting to Master EA at ${MASTER_WS_URL}...`);
    masterWs = new WebSocket(MASTER_WS_URL);

    masterWs.on('open', () => console.log(`✅ [Router] Connected to Master EA!`));

    masterWs.on('message', (data: WebSocket.RawData) => {
        const msgStr = data.toString('utf8');
        try {
            const parsed = JSON.parse(msgStr);
            if (parsed.type === 'trade_signal' && parsed.data && parsed.data.action) {
                console.log(`📥 [Router] Signal Received: ${parsed.data.action} for ${parsed.data.symbol}`);
                broadcastToSlaves(msgStr); // مخابره آنی به تمام اسلیوها
            }
        } catch (e) {
            // نادیده گرفتن پیام‌های نامعتبر
        }
    });

    masterWs.on('close', () => {
        // +++ فقط در صورتی که رله روشن است تلاش مجدد کن +++
        if (isRouterActive) {
            console.log(`❌ [Router] Disconnected from Master. Reconnecting in 3s...`);
            setTimeout(connectToMaster, 3000);
        } else {
            console.log(`🛑 [Router] Relay is OFF. Master connection completely closed.`);
        }
    });

    masterWs.on('error', (error) => { 
        // ارورها لاگ میشن ولی باعث کرش سرور نمیشن
        // console.error(`[Router] WS Error: ${error.message}`);
    });
}

// =================================================================
// ### بخش ۲: راه‌اندازی سرور برای اکسپرت‌های Slave
// =================================================================
function setupSlaveServer(httpServer: http.Server) {
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

// =================================================================
// ### بخش ۳: API وضعیت سرور
// =================================================================
app.get('/api/status', (req, res) => {
    res.json({ 
        isRunning: isRouterActive, 
        port: RELAY_PORT, 
        connected_slaves: slaveWss ? slaveWss.clients.size : 0 
    });
});

// =================================================================
// ### بخش ۴: روشن و خاموش کردن سرور رله
// =================================================================
export function startServer(port = RELAY_PORT): Promise<{ success: boolean, port: number, error?: string }> {
    return new Promise((resolve) => {
        if (server) return resolve({ success: true, port });

        isRouterActive = true; // +++ فعال کردن پرچم +++
        server = http.createServer(app);
        setupSlaveServer(server);

        server.listen(port, () => {
            console.log(`✅ [Router] Relay Server listening on port ${port}`);
            connectToMaster(); // اتصال به مستر بعد از روشن شدن سرور
            resolve({ success: true, port });
        }).on('error', (err) => {
            server = null;
            isRouterActive = false;
            resolve({ success: false, port, error: err.message });
        });
    });
}

export function stopServer(): Promise<void> {
    return new Promise((resolve) => {
        isRouterActive = false; // +++ غیرفعال کردن پرچم برای جلوگیری از لوپ اتصال مجدد +++

        if (masterWs) {
            // حذف شنونده‌ها برای اطمینان بیشتر و سپس بستن اتصال
            masterWs.removeAllListeners();
            masterWs.close();
            masterWs = null;
            console.log(`🛑 [Router] Master connection cleared.`);
        }

        if (server) {
            if (slaveWss) {
                slaveWss.clients.forEach(c => c.close());
                slaveWss.close();
            }
            server.close(() => {
                server = null;
                slaveWss = null;
                console.log(`🛑 [Router] Relay server completely stopped.`);
                resolve();
            });
        } else {
            resolve();
        }
    });
}