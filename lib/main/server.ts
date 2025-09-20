import express from 'express';
import type { Server } from 'http';
import WebSocket from 'ws';

const app = express();
let server: Server | null = null;



// =================================================================
// ### بخش ۱: تعریف تایپ‌ها و Enum ها (تقویت‌شده)
// =================================================================

/**
 * انواع Action های معتبر برای سیگنال‌های معاملاتی.
 * استفاده از Enum جلوی خطاهای ناشی از اشتباهات تایپی را می‌گیرد.
 */
enum TradeAction {
    PlacePending = 'PLACE_PENDING',
    OpenPosition = 'OPEN_POSITION',
    ClosePosition = 'CLOSE_POSITION',
    ModifyPosition = 'MODIFY_POSITION',
    CancelPending = 'CANCEL_PENDING',
}

/**
 * ساختار دقیق داده‌های یک سیگنال معاملاتی.
 * تمام فیلدهای احتمالی با تایپ مشخص تعریف شده‌اند.
 */
interface TradeSignalData {
    action: TradeAction;
    provider_ticket: number;
    symbol: string;
    order_type?: number;
    volume?: number;
    price?: number;
    sl?: number;
    tp?: number;
    magic_number?: number;
}

/**
 * تعریف ساختار کلی پیام دریافتی از WebSocket.
 * این یک discriminated union است که به ما اجازه می‌دهد نوع پیام را با اطمینان بررسی کنیم.
 */
type WebSocketMessage = {
    type: 'trade_signal';
    data: TradeSignalData;
} | {
    type: string; // برای سایر پیام‌های احتمالی
    data: unknown;
};

// صف سیگنال‌ها اکنون فقط می‌تواند حاوی داده‌های معتبر سیگنال باشد
let signalQueue: TradeSignalData[] = [];

// =================================================================
// ### بخش ۲: کلاینت WebSocket (با فیلتر و تایپ‌های دقیق)
// =================================================================

const MASTER_EA_URL = 'ws://localhost:5000';

function connectToMasterEA() {
    console.log(`🔌 Attempting to connect to Master EA at ${MASTER_EA_URL}...`);
    const wsClient = new WebSocket(MASTER_EA_URL);

    wsClient.on('open', () => console.log(`✅ Successfully connected to Master EA.`));

    wsClient.on('message', (data: WebSocket.RawData) => {
        const messageString = data.toString('utf8');
        
        try {
            const message = JSON.parse(messageString) as WebSocketMessage;

            // فیلتر اصلی: فقط پیام‌های از نوع 'trade_signal' را پردازش کن
            // Type Guard: تایپ‌اسکریپت می‌فهمد که در این بلوک، message.data از نوع TradeSignalData است
            // if (message.type === 'trade_signal' && isValidTradeSignal(message.data)) {
            //     console.log(`📥 Valid trade signal received and queued: ${message.data.action}`);
            //     signalQueue.push(message.data);
            // } else {
            //      console.log(`- Ignoring non-trade-signal message: ${messageString}`);
            // }

            if (message.type === 'trade_signal' && isValidTradeSignal(message.data)) {
                logSignalDetails(message.data);

                signalQueue.push(message.data);
            }

        } catch (error) {
            // این خطا فقط در صورتی رخ می‌دهد که JSON کاملاً نامعتبر باشد
            console.error('Invalid JSON received from Master EA:', messageString);
        }
    });

    wsClient.on('close', () => {
        console.log('❌ Disconnected from Master EA. Retrying in 5 seconds...');
        setTimeout(connectToMasterEA, 5000);
    });

    wsClient.on('error', (error) => console.error(`❗️ Error connecting to Master EA: ${error.message}.`));
}

/**
 * یک تابع کمکی برای اعتبارسنجی داده‌های سیگنال.
 * @param data داده‌های سیگنال برای بررسی.
 * @returns {boolean} اگر داده معتبر باشد true برمی‌گرداند.
 */
function isValidTradeSignal(data: any): data is TradeSignalData {
    return data &&
           typeof data.action === 'string' &&
           Object.values(TradeAction).includes(data.action as TradeAction) &&
           typeof data.provider_ticket === 'number';
}



/**
 * یک تابع زیبا برای لاگ کردن جزئیات سیگنال در کنسول.
 * از رنگ‌ها برای نمایش نوع دستور و از console.table برای نمایش تمام جزئیات استفاده می‌کند.
 * @param data داده‌های سیگنال معاملاتی.
 */
function logSignalDetails(data: TradeSignalData): void {
    // کدهای ANSI برای رنگ‌ها
    const colors = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      dim: "\x1b[2m",
      fg: {
          red: "\x1b[31m",
          green: "\x1b[32m",
          yellow: "\x1b[33m",
          cyan: "\x1b[36m"
      }
    };
  
    let color = colors.fg.yellow; // رنگ پیش‌فرض برای دستورات دیگر
    let actionText = data.action.toString();
  
    // تعیین رنگ بر اساس نوع دستور
    if (actionText.includes('BUY') || (data.order_type === 0 || data.order_type === 2 || data.order_type === 4)) {
        color = colors.fg.green;
    } else if (actionText.includes('SELL') || (data.order_type === 1 || data.order_type === 3 || data.order_type === 5)) {
        color = colors.fg.red;
    }
  
    // ایجاد یک خلاصه رنگی و خوانا
    const summary = `📥 ${colors.bright}${color}${actionText}${colors.reset} signal queued for ${colors.fg.cyan}${data.symbol}${colors.reset}`;
    
    console.log(summary);
  
    // نمایش تمام جزئیات سیگنال در یک جدول زیبا
    // ما فقط فیلدهایی که مقدار دارند را نمایش می‌دهیم تا جدول تمیزتر باشد
    const detailsToShow: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null && value !== 0) {
            detailsToShow[key] = value;
        }
    }
    console.table(detailsToShow);
  }

// =================================================================
// ### بخش ۳: سرور HTTP (بدون تغییر، اما اکنون امن‌تر است)
// =================================================================

const SLAVE_HTTP_PORT = 5002;


app.get('/api/status', (req, res) => {
    res.json({ status: 'Journal API is running!' });
});



// +++ شروع کد جدید برای لاگ کردن +++
app.use((req, res, next) => {
    // آدرس IP کلاینت را استخراج می‌کنیم
    const clientIp = req.socket.remoteAddress;

    // ثبت لاگ اتصال
    console.log(`🔌 Client connected from IP: ${clientIp}`);

    // ثبت لاگ پس از پایان پاسخ
    res.on('finish', () => {
        console.log(`👋 Client from IP ${clientIp} disconnected (request finished).`);
    });

    // ادامه روند پردازش درخواست
    next();
});
// +++ پایان کد جدید +++

app.get('/get-signals', (req, res) => {
    if (signalQueue.length > 0) {
        console.log(`📤 Sending ${signalQueue.length} signals to Slave EA.`);
        res.json(signalQueue);
        signalQueue = [];
    } else {
        res.json([]);
    }
});


// =================================================================
// ### بخش ۴: شروع به کار برنامه
// =================================================================




// تابعی برای شروع سرور
export function startServer(port = SLAVE_HTTP_PORT): Promise<{ success: boolean, port: number, error?: string }> {
    connectToMasterEA();
    return new Promise((resolve) => {
        if (server) {
            resolve({ success: true, port });
            console.log('tesr run');
            

            return;
        }
        server = app.listen(SLAVE_HTTP_PORT, () => {
           console.log(`🚀 HTTP server for Slave EA is listening on http://localhost:${SLAVE_HTTP_PORT}`);
            resolve({ success: true, port });
        }).on('error', (err) => {
            console.error('[Express] Server start error:', err.message);
            server = null;
            resolve({ success: false, port, error: err.message });
        });
    });
}

// تابعی برای توقف سرور
export function stopServer(): Promise<void> {
    return new Promise((resolve) => {
        if (server) {
            server.close(() => {
                console.log('[Express] Server stopped.');
                server = null;
                resolve();
            });
        } else {
            resolve();
        }
    });
}