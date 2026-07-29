import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onConfirm: (() => void) | null;
  onClose: () => void;
}

export const ConfirmationDialog = ({ isOpen, title, description, onConfirm, onClose }: ConfirmationDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t('confirm')}</DialogTitle>
          <DialogDescription>
            {description || t('confirm_desc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            {t('no')}
          </Button>
          <Button variant="default" onClick={() => {
            if (onConfirm) onConfirm();
            onClose();
          }}>
            {t('yes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};