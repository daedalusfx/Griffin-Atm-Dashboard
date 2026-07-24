import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button } from "@mui/material";

// --- HELPER COMPONENTS ---
interface ConfirmationDialogProps { isOpen: boolean; title: string; description: string; onConfirm: (() => void) | null; onClose: () => void; }
export function ConfirmationDialog({ isOpen, title, description, onConfirm, onClose }: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent><Typography>{description}</Typography></DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>انصراف</Button>
        <Button onClick={() => onConfirm && onConfirm()} variant="contained" color="primary" autoFocus>تایید</Button>
      </DialogActions>
    </Dialog>
  );
}
