// app/lib/protoService.ts
import { Root, Type } from 'protobufjs';

// از آنجایی که در فرانت‌اند (Vite) خواندن مستقیم فایل با fs محدودیت دارد، 
// می‌توانید ساختار proto را مستقیماً به صورت رشته لود کنید یا از Vite raw loader استفاده کنید.
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
  private root: Root;
  private tradeSignalType: Type | null = null;

  constructor() {
    this.root = Root.fromJSON(require('protobufjs').parse(protoDefinition).root);
    this.tradeSignalType = this.root.lookupType('griffin.hft.TradeSignal');
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

  // تبدیل باینری به JSON (اگر از سرور Rust دیتایی برگشت)
  decodeSignal(buffer: Uint8Array): any {
    if (!this.tradeSignalType) throw new Error("Proto Type not loaded");
    const message = this.tradeSignalType.decode(buffer);
    return this.tradeSignalType.toObject(message, { enums: String, defaults: true });
  }
}

export const protoService = new ProtoService();