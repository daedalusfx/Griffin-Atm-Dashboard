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
import { MainSettingsTypeInterface } from './types';


interface MainSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: MainSettingsTypeInterface;
  onSave: (settings: MainSettingsTypeInterface) => void;
}

export function MainSettingsDialog({ open, onClose, settings, onSave }: MainSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<MainSettingsTypeInterface>(settings);

  useEffect(() => {
    if (open) {
      // مقادیر پیش‌فرض را برای جلوگیری از خطا تنظیم می‌کنیم
      setLocalSettings({
        ...settings,
        riskValues: settings.riskValues || { market: 1.0, pending: 1.0, stairway: 1.0 }
      });
    }
  }, [open]);

  const handleRiskValueChange = (panel: 'market' | 'pending' | 'stairway') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLocalSettings(prev => ({
      ...prev,
      riskValues: {
        ...(prev.riskValues!),
        [panel]: value,
      }
    }));
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
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
            <RadioGroup row name="riskMode" value={localSettings.riskMode || 'PERCENT'} onChange={handleGeneralChange}>
              <FormControlLabel value="PERCENT" control={<Radio />} label="درصدی از بالانس" />
              <FormControlLabel value="MONEY" control={<Radio />} label="مبلغ ثابت" />
            </RadioGroup>
            
            {/* +++ سه فیلد ورودی مجزا برای هر پنل +++ */}
            <TextField
              label={`ریسک Market (${localSettings.riskMode === 'PERCENT' ? '%' : '$'})`}
              type="number" fullWidth margin="normal"
              value={localSettings.riskValues?.market ?? ''}
              onChange={handleRiskValueChange('market')}
              inputProps={{ step: "0.1" }}
            />
            <TextField
              label={`ریسک Pending (${localSettings.riskMode === 'PERCENT' ? '%' : '$'})`}
              type="number" fullWidth margin="normal"
              value={localSettings.riskValues?.pending ?? ''}
              onChange={handleRiskValueChange('pending')}
              inputProps={{ step: "0.1" }}
            />
            <TextField
              label={`ریسک Stairway (${localSettings.riskMode === 'PERCENT' ? '%' : '$'})`}
              type="number" fullWidth margin="normal"
              value={localSettings.riskValues?.stairway ?? ''}
              onChange={handleRiskValueChange('stairway')}
              inputProps={{ step: "0.1" }}
            />
          </Box>
          
          <Divider />

          {/* بخش مدیریت حد سود */}
          <Box>
            <Typography variant="h6" gutterBottom>مدیریت حد سود</Typography>
            <RadioGroup row name="tpMode" value={localSettings.tpMode || 'RR_RATIO'} onChange={handleGeneralChange}>
              <FormControlLabel value="RR_RATIO" control={<Radio />} label="نسبت ریسک به ریوارد" />
              <FormControlLabel value="MANUAL" control={<Radio />} label="دستی" />
            </RadioGroup>
            <TextField
              name="tpRRValue" label="مقدار نسبت R:R (مثلا 2.0)"
              type="number" fullWidth margin="normal"
              value={localSettings.tpRRValue || ''}
              onChange={(e) => setLocalSettings(prev => ({...prev, tpRRValue: parseFloat(e.target.value) || 0}))}
              disabled={localSettings.tpMode !== 'RR_RATIO'}
              inputProps={{ step: "0.1" }}
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