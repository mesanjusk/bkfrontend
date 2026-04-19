import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, useMediaQuery, useTheme } from '@mui/material';

export default function DonationQuickDialog({ open, form, users, onChange, onClose, onSave }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>Quick Donation Entry</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
          <Grid item xs={12} md={6}>
            <TextField select label="Donor guest" value={form.donorGuestId} onChange={(e) => onChange({ ...form, donorGuestId: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {users.filter((u) => u.eventDutyType === 'GUEST').map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}><TextField label="Amount" type="number" value={form.amount} onChange={(e) => onChange({ ...form, amount: Number(e.target.value) })} /></Grid>
          <Grid item xs={6} md={3}>
            <TextField select label="Mode" value={form.mode} onChange={(e) => onChange({ ...form, mode: e.target.value })}>
              {['cash', 'upi', 'card', 'bank'].map((m) => <MenuItem key={m} value={m}>{m.toUpperCase()}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}><TextField label="Note" value={form.note} onChange={(e) => onChange({ ...form, note: e.target.value })} /></Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Received by" value={form.receivedByUserId} onChange={(e) => onChange({ ...form, receivedByUserId: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave} disabled={!form.donorGuestId || !form.amount}>Save Donation</Button>
      </DialogActions>
    </Dialog>
  );
}
