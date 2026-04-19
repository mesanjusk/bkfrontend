import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import StatusChip from '../StatusChip';

export default function GuestChangeDialog({ open, assignment, guests, selectedGuestId, reason, onReasonChange, onSelectGuest, onClose, onConfirm }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>Change Guest Assignment</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.2}>
          <Alert severity="info">
            Planned: <strong>{assignment?.plannedGuestId?.name || '-'}</strong> · Current: <strong>{assignment?.actualGuestId?.name || assignment?.plannedGuestId?.name || '-'}</strong>
          </Alert>
          <Typography variant="subtitle2">Available Guests</Typography>
          <List dense sx={{ maxHeight: { xs: '45vh', md: 260 }, overflowY: 'auto', border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            {guests.map((g) => (
              <ListItemButton key={g._id} selected={selectedGuestId === g._id} onClick={() => onSelectGuest(g._id)}>
                <Avatar src={g.avatarUrl} sx={{ width: 28, height: 28, mr: 1 }}>{g.name?.[0]}</Avatar>
                <ListItemText primary={g.name} secondary={`${g.designation || 'Guest'} · Assignments ${g.stageCounts?.guestAwards || 0}`} />
                <StatusChip label={g.availabilityStatus || 'AVAILABLE'} />
              </ListItemButton>
            ))}
          </List>
          <TextField
            label="Reason (optional)"
            value={reason}
            multiline
            minRows={2}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Guest unavailable, VIP shift, urgent sequence change..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} fullWidth={fullScreen}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm} disabled={!selectedGuestId} fullWidth={fullScreen}>Confirm Guest Change</Button>
      </DialogActions>
    </Dialog>
  );
}
