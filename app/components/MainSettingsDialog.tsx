import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

// تعریف یک اینترفیس برای نوع داده تنظیمات اصلی
export interface MainSettings {
  riskMode?: 'PERCENT' | 'MONEY';
  riskPercent?: number;
  tpMode?: 'RR_RATIO' | 'MANUAL';
  tpRRValue?: number;
}

interface MainSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: MainSettings;
  onSave: (settings: MainSettings) => void;
}

export function MainSettingsDialog({ open, onClose, settings, onSave }: MainSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<MainSettings>(settings);

    // این effect فقط زمانی اجرا می‌شود که دیالوگ از حالت بسته به باز تغییر کند
    useEffect(() => {
      // اگر دیالوگ باز شد، state محلی را با آخرین تنظیمات دریافت شده از اکسپرت همگام کن
      if (open) {
        setLocalSettings(settings);
      }
    }, [open]); // <-- به `open` وابسته است، نه `settings`



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    // تبدیل مقادیر عددی به عدد و بقیه به صورت رشته
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;
    setLocalSettings(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  if (!open) return null;


   

    
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>تنظیمات اصلی اکسپرت</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* بخش مدیریت ریسک */}
          <Box>
            <Typography variant="h6" gutterBottom>مدیریت ریسک</Typography>
            <RadioGroup
              row
              name="riskMode"
              value={localSettings.riskMode || 'PERCENT'}
              onChange={handleChange}
            >
              <FormControlLabel value="PERCENT" control={<Radio />} label="درصدی از بالانس" />
              <FormControlLabel value="MONEY" control={<Radio />} label="مبلغ ثابت" />
            </RadioGroup>
            <TextField
              name="riskPercent"
              label={localSettings.riskMode === 'PERCENT' ? "درصد ریسک (مثلا 1.5)" : "مبلغ ریسک (مثلا 100$)"}
              type="number"
              fullWidth
              margin="normal"
              value={localSettings.riskPercent || ''}
              onChange={handleChange}
            />
          </Box>
          
          <Divider />

          {/* بخش مدیریت حد سود */}
          <Box>
            <Typography variant="h6" gutterBottom>مدیریت حد سود</Typography>
            <RadioGroup
              row
              name="tpMode"
              value={localSettings.tpMode || 'RR_RATIO'}
              onChange={handleChange}
            >
              <FormControlLabel value="RR_RATIO" control={<Radio />} label="نسبت ریسک به ریوارد" />
              <FormControlLabel value="MANUAL" control={<Radio />} label="دستی" />
            </RadioGroup>
            <TextField
              name="tpRRValue"
              label="مقدار نسبت R:R (مثلا 2.0)"
              type="number"
              fullWidth
              margin="normal"
              value={localSettings.tpRRValue || ''}
              onChange={handleChange}
              // اگر حالت دستی بود، این فیلد را غیرفعال کن
              disabled={localSettings.tpMode !== 'RR_RATIO'}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>انصراف</Button>
        <Button onClick={handleSave} variant="contained">ذخیره تنظیمات</Button>
      </DialogActions>
    </Dialog>
  );
}