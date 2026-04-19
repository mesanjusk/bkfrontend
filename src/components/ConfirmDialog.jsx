import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

export default function ConfirmDialog({ open, title, description, confirmText = 'Confirm', tone = 'primary', onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color={tone} onClick={onConfirm}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
