import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  DialogActions,
  Button,
  Box,
} from '@mui/material'
import { CommandPayload, MainSettingsTypeInterface, Settings, Trade } from './types';

import { useState, useEffect } from 'react'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  settings: Settings
  onSave: (settings: Settings) => void
}

export function SettingsDialog({ open, onClose, settings, onSave }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings)

  useEffect(() => {
    // اگر دیالوگ باز شد، state محلی را با آخرین تنظیمات دریافت شده از اکسپرت همگام کن
    if (open) {
      setLocalSettings(settings)
    }
  }, [open]) // <-- به `open` وابسته است، نه `settings`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setLocalSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
    }))
  }

  function SaveAndCloseModal() {
    onSave(localSettings)
    onClose()
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #333', pb: 2 }}>تنظیمات مدیریت خودکار (ATM)</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* --- تنظیمات عمومی ATM --- */}
          <Box sx={{ p: 2, border: '1px solid #444', borderRadius: 2, position: 'relative' }}>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: -10,
                left: 10,
                bgcolor: 'background.paper',
                px: 0.5,
                color: 'text.secondary',
              }}
            >
              مدیریت سود و ریسک‌فری
            </Typography>
            <TextField
              name="triggerPercent"
              label="درصد حرکت برای فعال‌سازی (Trigger %)"
              type="number"
              fullWidth
              margin="normal"
              size="small"
              value={localSettings.triggerPercent || ''}
              onChange={handleChange}
              helperText="مثال: 1.5 درصد حرکت در جهت سود"
            />
            <TextField
              name="closePercent"
              label="درصد حجم برای بستن (Partial Close %)"
              type="number"
              fullWidth
              margin="normal"
              size="small"
              value={localSettings.closePercent || ''}
              onChange={handleChange}
            />
            <FormControlLabel
              control={<Switch name="moveToBE" checked={localSettings.moveToBE || false} onChange={handleChange} />}
              label="ریسک-فری کردن معامله (Move to Breakeven)"
              sx={{ mt: 1 }}
            />
          </Box>

          {/* --- تنظیمات جدید تریلینگ استاپ --- */}
          <Box sx={{ p: 2, border: '1px solid #444', borderRadius: 2, position: 'relative', mt: 1 }}>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: -10,
                left: 10,
                bgcolor: 'background.paper',
                px: 0.5,
                color: 'primary.main',
              }}
            >
              تریلینگ استاپ هوشمند (ATR)
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  name="trailingEnabled"
                  checked={localSettings.trailingEnabled || false}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="فعال‌سازی تریلینگ استاپ"
            />

            <TextField
              name="trailingAtrMultiplier"
              label="ضریب ATR (فاصله دینامیک)"
              type="number"
              fullWidth
              margin="normal"
              size="small"
              disabled={!localSettings.trailingEnabled} // غیرفعال شدن اگر سوییچ خاموش باشد
              value={localSettings.trailingAtrMultiplier || ''}
              onChange={handleChange}
              helperText="فاصله حد ضرر = ATR (14) × این ضریب"
            />

            <TextField
              name="trailingStepPercent"
              label="گام جابجایی (Trailing Step % ATR)"
              type="number"
              fullWidth
              margin="normal"
              size="small"
              disabled={!localSettings.trailingEnabled}
              value={localSettings.trailingStepPercent || ''}
              onChange={handleChange}
              helperText="حداقل جابجایی قیمت (بر اساس % از ATR) برای آپدیت کردن حد ضرر."
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
        <Button onClick={onClose} color="inherit">
          انصراف
        </Button>
        <Button onClick={() => SaveAndCloseModal()} variant="contained" color="primary">
          ذخیره و اعمال
        </Button>
      </DialogActions>
    </Dialog>
  )
}
