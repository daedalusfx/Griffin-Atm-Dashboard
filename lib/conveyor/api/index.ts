import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { ServerApi } from './server-api'
import { WindowApi } from './window-api'

export const conveyor = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  server: new ServerApi(electronAPI)
}

export type ConveyorApi = typeof conveyor
