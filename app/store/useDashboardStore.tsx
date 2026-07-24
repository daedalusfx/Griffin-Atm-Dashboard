// src/renderer/store/useDashboardStore.ts
import { create } from 'zustand';
import toast from 'react-hot-toast';
import React from 'react';
import { Trade, Settings, MainSettingsTypeInterface, CommandPayload } from '../components/types';

export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Connecting = 'connecting',
}

interface DashboardState {
  // State
  ws: WebSocket | null;
  trades: Trade[];
  totalPL: number;
  symbol: string;
  connectionStatus: ConnectionStatus;
  settings: Settings;
  mainSettings: MainSettingsTypeInterface;
  loadingStates: Record<string, boolean>;

  // Actions
  connect: () => void;
  disconnect: () => void;
  sendCommand: (command: CommandPayload, loadingKey: string) => void;
  setLoading: (key: string, isLoading: boolean) => void;
  updateSettings: (settings: Settings) => void;
  updateMainSettings: (settings: MainSettingsTypeInterface) => void;
}

let reconnectTimer: NodeJS.Timeout | null = null;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ws: null,
  trades: [],
  totalPL: 0,
  symbol: 'N/A',
  connectionStatus: ConnectionStatus.Connecting,
  settings: {},
  mainSettings: {},
  loadingStates: {},

  setLoading: (key, isLoading) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: isLoading },
    })),

  updateSettings: (settings) => set({ settings }),
  updateMainSettings: (mainSettings) => set({ mainSettings }),

  connect: () => {
    const { ws } = get();
    if (ws && ws.readyState !== WebSocket.CLOSED) return;

    set({ connectionStatus: ConnectionStatus.Connecting });
    const socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      set({ connectionStatus: ConnectionStatus.Connected, ws: socket });
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    socket.onclose = () => {
      set({ connectionStatus: ConnectionStatus.Disconnected, ws: null });
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          get().connect();
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      socket.close();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'trade_data':
            set({
              trades: message.data.trades || [],
              totalPL: message.data.total_pl || 0,
              symbol: message.data.symbol || 'N/A',
            });
            if (message.data.settings) set({ settings: message.data.settings });
            if (message.data.main_settings) set({ mainSettings: message.data.main_settings });
            break;

          case 'feedback':
            const feedback = message.data;
            if (feedback.status === 'success') toast.success(feedback.message);
            else if (feedback.status === 'error') toast.error(feedback.message);
            else toast(feedback.message, { icon: 'ℹ️' });
            break;

          case 'trade_signal':
            const signal = message.data;
            const ticket = signal.provider_ticket;
            let toastMessage = `Signal: ${signal.action} for ticket #${ticket}`;
            
            switch(signal.action) {
                case 'OPEN_POSITION': toastMessage = `New position #${ticket} opened on ${signal.symbol}`; break;
                case 'CLOSE_POSITION': toastMessage = `Position #${ticket} closed.`; break;
                case 'MODIFY_POSITION': toastMessage = `Position #${ticket} modified.`; break;
                case 'PLACE_PENDING': toastMessage = `Pending order #${ticket} placed for ${signal.symbol}`; break;
                case 'MODIFY_PENDING': toastMessage = `Pending order #${ticket} modified.`; break;
                case 'CANCEL_PENDING': toastMessage = `Pending order #${ticket} cancelled.`; break;
            }
            
            toast.custom((t) => (
              <div
                style={{
                  padding: '12px 20px',
                  background: '#2d3748',
                  color: '#e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
              >
                {toastMessage}
              </div>
            ));
            break;

          case 'settings':
            set({ settings: message.data || {} });
            break;
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };
  },

  disconnect: () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    const { ws } = get();
    if (ws) {
      ws.onclose = null;
      ws.close();
    }
    set({ ws: null, connectionStatus: ConnectionStatus.Disconnected });
  },

  sendCommand: (command, loadingKey) => {
    const { ws, setLoading } = get();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error('ارتباط قطع است!');
      return;
    }
    setLoading(loadingKey, true);
    try {
      ws.send(JSON.stringify(command));
    } catch (error) {
      console.error('Failed to send command:', error);
      toast.error('خطا در ارسال فرمان');
    } finally {
      setTimeout(() => {
        setLoading(loadingKey, false);
      }, 500);
    }
  },
}));