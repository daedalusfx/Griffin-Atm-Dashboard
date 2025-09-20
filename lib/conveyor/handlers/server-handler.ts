import { startServer, stopServer } from '@/lib/main/server';
import { handle } from '@/lib/main/shared';

let isServerRunning = false;
let serverPort: number | null = null;

export const registerServerHandlers = () => {
  handle('server-start', async () => {
    const result = await startServer(); // Port can be passed here
    isServerRunning = result.success;
    if(result.success) serverPort = result.port;
    return result;
  });

  handle('server-stop', async () => {
    await stopServer();
    isServerRunning = false;
    serverPort = null;
  });
  
  handle('server-get-status', () => {
    return { isRunning: isServerRunning, port: serverPort };
  });
}