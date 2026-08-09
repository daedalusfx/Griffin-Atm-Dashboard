import { z } from 'zod';

export const cloudIpcSchema = {
  'cloud-connect': {
    args: z.tuple([z.string(), z.string()]),
    return: z.void(),
  },
  'cloud-disconnect': {
    args: z.tuple([]),
    return: z.void(),
  },
  'cloud-broadcast': {
    args: z.tuple([z.any()]),
    return: z.void(),
  },
  'cloud-get-status': {
    args: z.tuple([]),
    return: z.string(), // برمی‌گرداند: 'connected' | 'disconnected' | ...
  },
};