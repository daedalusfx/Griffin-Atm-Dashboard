// app/lib/protoService.ts
import { parse, Type } from 'protobufjs';

// تعریف ساختار باینری به صورت رشته (بدون نیاز به فایل‌سیستم)
const protoDefinition = `
syntax = "proto3";
package griffin.hft;

enum SignalAction {
  UNKNOWN_ACTION = 0;
  OPEN_POSITION = 1;
  PLACE_PENDING = 2;
  CLOSE_POSITION = 3;
  CANCEL_PENDING = 4;
}

message TradeSignal {
  SignalAction action = 1;
  uint64 provider_ticket = 2;
  string symbol = 3;
  int32 order_type = 4;
  double price = 5;
  double sl = 6;
  double tp = 7;
  uint64 timestamp = 8;
}
`;

class ProtoService {
  private tradeSignalType: Type | null = null;

  constructor() {
    try {
      // استفاده مستقیم از متد parse که به صورت ES Module ایمپورت شده است
      const parsed = parse(protoDefinition);
      this.tradeSignalType = parsed.root.lookupType('griffin.hft.TradeSignal');
    } catch (error) {
      console.error("ProtoBuf Initialization Error:", error);
    }
  }

  // تبدیل JSON متاتریدر به باینری (برای ارسال به Rust)
  encodeSignal(payload: any): Uint8Array {
    if (!this.tradeSignalType) throw new Error("Proto Type not loaded");

    // مپ کردن استرینگ‌های متاتریدر به Enumهای پروتوباف
    let actionEnum = 0;
    switch (payload.action) {
      case 'OPEN_POSITION': actionEnum = 1; break;
      case 'PLACE_PENDING': actionEnum = 2; break;
      case 'CLOSE_POSITION': actionEnum = 3; break;
      case 'CANCEL_PENDING': actionEnum = 4; break;
    }

    const message = this.tradeSignalType.create({
      action: actionEnum,
      provider_ticket: payload.provider_ticket,
      symbol: payload.symbol,
      order_type: payload.order_type,
      price: payload.price,
      sl: payload.sl,
      tp: payload.tp,
      timestamp: Date.now() // ثبت زمان دقیق شلیک سیگنال
    });

    return this.tradeSignalType.encode(message).finish();
  }

  // تبدیل باینری به JSON (زمانی که سرور Rust دیتایی برمی‌گرداند)
  decodeSignal(buffer: Uint8Array): any {
    if (!this.tradeSignalType) throw new Error("Proto Type not loaded");
    const message = this.tradeSignalType.decode(buffer);
    return this.tradeSignalType.toObject(message, { enums: String, defaults: true });
  }
}

export const protoService = new ProtoService();