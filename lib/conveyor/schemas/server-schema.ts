import { z } from 'zod'

export const serverIpcSchema = {
  'server-start': {
    args: z.tuple([]),
    return: z.object({ success: z.boolean(), port: z.number(), error: z.string().optional() }),
  },
  'server-stop': {
    args: z.tuple([]),
    return: z.void(),
  },
  'server-get-status': {
    args: z.tuple([]),
    return: z.object({ isRunning: z.boolean(), port: z.number().nullable() }),
  },
}