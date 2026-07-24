import { createTheme, Tooltip, ThemeProvider, CssBaseline, keyframes } from '@mui/material'
import { Wifi, Box, Container } from 'lucide-react'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import { useDashboardStore, ConnectionStatus } from '../store/useDashboardStore'
import { ActionBar } from './ActionBar'
import { ConfirmationDialog } from './ConfirmationDialog'
import { DashboardHeader } from './DashboardHeader'
import { MainSettingsDialog } from './MainSettingsDialog'
import { SettingsDialog } from './SettingsDialog'
import { TradeList } from './TradeList'

const blinkAnimation = keyframes`
  50% { opacity: 0.3; }
`

export function Dashboard() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark')
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [isMainSettingsOpen, setMainSettingsOpen] = useState<boolean>(false)
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: (() => void) | null
  }>({ isOpen: false, title: '', description: '', onConfirm: null })

  // دسترسی به Zustand Store
  const connect = useDashboardStore((state) => state.connect)
  const disconnect = useDashboardStore((state) => state.disconnect)
  const symbol = useDashboardStore((state) => state.symbol)
  const connectionStatus = useDashboardStore((state) => state.connectionStatus)
  const settings = useDashboardStore((state) => state.settings)
  const mainSettings = useDashboardStore((state) => state.mainSettings)
  const sendCommand = useDashboardStore((state) => state.sendCommand)

  const theme = useMemo(
    () =>
      createTheme({
        direction: 'rtl',
        palette: {
          mode: themeMode,
          primary: { main: '#818cf8' },
          success: { main: '#4ade80' },
          error: { main: '#f87171' },
          info: { main: '#60a5fa' },
          warning: { main: '#facc15' },
          background: {
            paper: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            default: themeMode === 'dark' ? '#0f172a' : '#f1f5f9',
          },
        },
        typography: { fontFamily: 'Vazirmatn, Arial' },
        components: {
          MuiButton: { styleOverrides: { root: { borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' } } },
        },
      }),
    [themeMode]
  )

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const openConfirmation = useCallback(
    (title: string, description: string, action: string, loadingKey: string) => {
      setConfirmState({
        isOpen: true,
        title,
        description,
        onConfirm: () => {
          sendCommand({ action }, loadingKey)
          setConfirmState({ isOpen: false, title: '', description: '', onConfirm: null })
        },
      })
    },
    [sendCommand]
  )

  const getConnectionIcon = () => {
    let color: 'success' | 'error' | 'warning' = 'warning'
    let animation = {}
    if (connectionStatus === ConnectionStatus.Connected) color = 'success'
    if (connectionStatus === ConnectionStatus.Disconnected) color = 'error'
    if (connectionStatus === ConnectionStatus.Connecting) {
      color = 'warning'
      animation = { animation: `${blinkAnimation} 2s infinite` }
    }
    return (
      <Tooltip title={connectionStatus}>
        <Wifi sx={{ color: `${color}.main`, ...animation }} />
      </Tooltip>
    )
  }

  // تعریف توابع با رفرنس ثابت
  const handleToggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true)
  }, [])

  const handleOpenMainSettings = useCallback(() => {
    setMainSettingsOpen(true)
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#334155', color: '#e2e8f0' } }} />
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        <DashboardHeader
          symbol={symbol}
          connectionIcon={getConnectionIcon()}
          themeMode={themeMode}
          // پاس دادن توابعی که حالا رفرنسشون ثابته
          onToggleTheme={handleToggleTheme}
          onOpenSettings={handleOpenSettings}
          onOpenMainSettings={handleOpenMainSettings}
        />

        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column' }}>
          <TradeList />
        </Container>

        <ActionBar onOpenConfirmation={openConfirmation} />

        <SettingsDialog
          open={isSettingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          onSave={(newSettings) => sendCommand({ action: 'update_settings', settings: newSettings }, 'save_settings')}
        />

        <MainSettingsDialog
          open={isMainSettingsOpen}
          onClose={() => setMainSettingsOpen(false)}
          settings={mainSettings}
          onSave={(newSettings) => {
            const payload = {
              action: 'update_main_settings',
              riskMode: newSettings.riskMode,
              risk_market: newSettings.riskValues?.market,
              risk_pending: newSettings.riskValues?.pending,
              risk_stairway: newSettings.riskValues?.stairway,
              tpMode: newSettings.tpMode,
              tpRRValue: newSettings.tpRRValue,
            }
            sendCommand(payload, 'save_main_settings')
          }}
        />

        <ConfirmationDialog {...confirmState} onClose={() => setConfirmState({ ...confirmState, isOpen: false })} />
      </Box>
    </ThemeProvider>
  )
}
