import { Root } from 'protobufjs/light'; // استفاده از نسخه سبک مرورگر

// ساختار از پیش کامپایل شده پروتوباف به صورت JSON
const protoJson = {
  nested: {
    griffin: {
      nested: {
        hft: {
          nested: {
            SignalAction: {
              values: {
                UNKNOWN_ACTION: 0,
                OPEN_POSITION: 1,
                PLACE_PENDING: 2,
                CLOSE_POSITION: 3,
                CANCEL_PENDING: 4
              }
            },
            TradeSignal: {
              fields: {
                action: { type: "SignalAction", id: 1 },
                provider_ticket: { type: "uint64", id: 2 },
                symbol: { type: "string", id: 3 },
                order_type: { type: "int32", id: 4 },
                price: { type: "double", id: 5 },
                sl: { type: "double", id: 6 },
                tp: { type: "double", id: 7 },
                timestamp: { type: "uint64", id: 8 }
              }
            }
          }
        }
      }
    }
  }
};

class ProtoService {
  private tradeSignalType: any = null;

  constructor() {
    try {
      const root = Root.fromJSON(protoJson);
      this.tradeSignalType = root.lookupType('griffin.hft.TradeSignal');
    } catch (error) {
      console.error("ProtoBuf Initialization Error:", error);
    }
  }

  encodeSignal(payload: any): Uint8Array {
    if (!this.tradeSignalType) throw new Error("Proto Type not loaded");
    
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
      timestamp: Date.now()
    });
    
    return this.tradeSignalType.encode(message).finish();
  }

  decodeSignal(buffer: Uint8Array): any {
    if (!this.tradeSignalType) throw new Error("Proto Type not loaded");
    const message = this.tradeSignalType.decode(buffer);
    return this.tradeSignalType.toObject(message, { enums: String, defaults: true });
  }
}

export const protoService = new ProtoService();