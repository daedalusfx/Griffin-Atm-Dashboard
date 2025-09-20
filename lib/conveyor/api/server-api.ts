import { ConveyorApi } from '@/lib/preload/shared'

export class ServerApi extends ConveyorApi {
  start = () => this.invoke('server-start')
  stop = () => this.invoke('server-stop')
  getStatus = () => this.invoke('server-get-status')
}