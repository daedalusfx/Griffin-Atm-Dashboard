import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { atmSettingsSchema, type AtmSettings } from '@/app/schemas';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: AtmSettings | null;
  onSave: (data: AtmSettings) => void;
}

export const SettingsDialog = ({ open, onClose, settings, onSave }: SettingsDialogProps) => {
  const { t } = useTranslation();
  const form = useForm<AtmSettings>({
    resolver: zodResolver(atmSettingsSchema),
    defaultValues: {
      triggerPercent: 1.5,
      closePercent: 50,
      moveToBE: false,
      trailingEnabled: false,
      trailingAtrMultiplier: 2,
      trailingStepPercent: 10,
    },
  });

  useEffect(() => {
    if (open && settings) form.reset(settings);
  }, [open, settings, form]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('atm_settings')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((d) => { onSave(d); onClose(); })} className="space-y-6 mt-4">
          <h3 className="font-medium text-sm text-primary">{t('profit_rules')}</h3>
          
          <div className="grid gap-1.5">
            <label className="text-sm text-muted-foreground">{t('trigger_percent')}</label>
            <Input type="number" step="0.1" {...form.register('triggerPercent', { valueAsNumber: true })} />
          </div>
          
          <div className="grid gap-1.5">
            <label className="text-sm text-muted-foreground">{t('close_percent')}</label>
            <Input type="number" step="1" {...form.register('closePercent', { valueAsNumber: true })} />
          </div>
          
          {/* چیدمان اصلاح شده برای سویچ اول */}
          <div className="flex items-center gap-3 mt-2">
            <Switch 
              id="moveToBE"
              checked={form.watch('moveToBE')} 
              onCheckedChange={(v) => form.setValue('moveToBE', v)} 
            />
            <label htmlFor="moveToBE" className="text-sm cursor-pointer select-none">
              {t('move_to_be')}
            </label>
          </div>
          
          <div className="p-4 border border-border rounded-lg relative space-y-4 mt-6">
            <span className="absolute -top-3 px-2 bg-background text-xs text-primary font-medium">
              Trailing Stop
            </span>
            
            {/* چیدمان اصلاح شده برای سویچ دوم */}
            <div className="flex items-center gap-3">
              <Switch
                id="trailingEnabled"
                checked={form.watch('trailingEnabled')}
                onCheckedChange={(v) => form.setValue('trailingEnabled', v)}
              />
              <label htmlFor="trailingEnabled" className="text-sm cursor-pointer select-none">
                {t('trailing_enabled')}
              </label>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm">{t('trailing_atr')}</label>
              <Input
                type="number"
                step="0.1"
                disabled={!form.watch('trailingEnabled')}
                {...form.register('trailingAtrMultiplier', { valueAsNumber: true })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">{t('trailing_step')}</label>
              <Input
                type="number"
                step="1"
                disabled={!form.watch('trailingEnabled')}
                {...form.register('trailingStepPercent', { valueAsNumber: true })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit">{t('save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};