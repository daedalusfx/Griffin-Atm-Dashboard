import * as z from 'zod';

export const atmSettingsSchema = z.object({
  triggerPercent: z.number().min(0),
  closePercent: z.number().min(0).max(100),
  moveToBE: z.boolean(),
  trailingEnabled: z.boolean(),
  trailingAtrMultiplier: z.number().min(0),
  trailingStepPercent: z.number().min(0),
});

export type AtmSettings = z.infer<typeof atmSettingsSchema>;

export const mainSettingsSchema = z.object({
  riskMode: z.enum(['PERCENT', 'MONEY']),
  riskValues: z.object({
    market: z.number().min(0),
    pending: z.number().min(0),
    stairway: z.number().min(0),
  }),
  tpMode: z.enum(['RR_RATIO', 'MANUAL']),
  tpRRValue: z.number().min(0),
});

export type MainSettingsType = z.infer<typeof mainSettingsSchema>;