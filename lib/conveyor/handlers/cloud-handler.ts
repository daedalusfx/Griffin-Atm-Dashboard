import { handle } from '@/lib/main/shared';
import { connectToCloud, disconnectFromCloud, broadcastToCloud, getCloudStatus } from '@/lib/main/cloudManager';

export const registerCloudHandlers = () => {
  handle('cloud-connect', (licenseKey: string, hwid: string) => connectToCloud(licenseKey, hwid));
  handle('cloud-disconnect', () => disconnectFromCloud());
  handle('cloud-broadcast', (signalData: any) => broadcastToCloud(signalData));
  handle('cloud-get-status', () => getCloudStatus());
};