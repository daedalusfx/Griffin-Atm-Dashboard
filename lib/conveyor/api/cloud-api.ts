import { ConveyorApi } from '@/lib/preload/shared';

export class CloudApi extends ConveyorApi {
  connect = (licenseKey: string, hwid: string) => this.invoke('cloud-connect', licenseKey, hwid);
  disconnect = () => this.invoke('cloud-disconnect');
  broadcast = (signalData: any) => this.invoke('cloud-broadcast', signalData);
  getStatus = () => this.invoke('cloud-get-status');
}