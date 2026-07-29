import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { mainSettingsSchema, type MainSettingsType } from '@/app/schemas';

interface MainSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: MainSettingsType | null;
  onSave: (data: MainSettingsType) => void;
}

export const MainSettingsDialog = ({ open, onClose, settings, onSave }: MainSettingsDialogProps) => {
  const { t } = useTranslation();
  const form = useForm<MainSettingsType>({
    resolver: zodResolver(mainSettingsSchema),
    defaultValues: {
      riskMode: 'PERCENT',
      riskValues: { market: 1.0, pending: 1.0, stairway: 1.0 },
      tpMode: 'RR_RATIO',
      tpRRValue: 2.0,
    },
  });

  useEffect(() => {
    if (open && settings) form.reset(settings);
  }, [open, settings, form]);

  const isPercent = form.watch('riskMode') === 'PERCENT';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('risk_settings')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((d) => { onSave(d); onClose(); })} className="space-y-6 mt-4">
          <h3 className="font-medium text-sm text-primary">{t('risk_mode')}</h3>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" value="PERCENT" {...form.register('riskMode')} className="accent-primary" />
              {t('percent')}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" value="MONEY" {...form.register('riskMode')} className="accent-primary" />
              {t('money')}
            </label>
          </div>
          
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <label className="text-sm text-muted-foreground">
                {t('market_risk')} ({isPercent ? '%' : '$'})
              </label>
              <Input type="number" step="0.1" {...form.register('riskValues.market', { valueAsNumber: true })} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm text-muted-foreground">
                {t('pending_risk')} ({isPercent ? '%' : '$'})
              </label>
              <Input type="number" step="0.1" {...form.register('riskValues.pending', { valueAsNumber: true })} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm text-muted-foreground">
                {t('stairway_risk')} ({isPercent ? '%' : '$'})
              </label>
              <Input type="number" step="0.1" {...form.register('riskValues.stairway', { valueAsNumber: true })} />
            </div>
          </div>
          
          <div className="space-y-4 pb-2 border-t border-border pt-4">
            <h3 className="font-medium text-sm text-primary">{t('tp_mode')}</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" value="RR_RATIO" {...form.register('tpMode')} className="accent-primary" />
                {t('rr_ratio')}
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" value="MANUAL" {...form.register('tpMode')} className="accent-primary" />
                {t('manual')}
              </label>
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm text-muted-foreground">{t('rr_ratio')} (Default 2.0)</label>
              <Input
                type="number"
                step="0.1"
                disabled={form.watch('tpMode') !== 'RR_RATIO'}
                {...form.register('tpRRValue', { valueAsNumber: true })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit">{t('save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};