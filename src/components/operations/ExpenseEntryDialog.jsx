import { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Divider,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const typeOptions = ['VENDOR', 'DIRECT', 'EMERGENCY', 'TEAM_PURCHASE'];
const paymentModes = ['CASH', 'UPI', 'BANK', 'CHEQUE', 'OTHER'];
const statusOptions = ['PENDING', 'APPROVED', 'PAID'];

export default function ExpenseEntryDialog({ open, form, onChange, onClose, onSubmit, vendors, budgetHeads, users }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isVendorExpense = form.expenseType === 'VENDOR';
  const isEmergency = form.expenseType === 'EMERGENCY';

  const attachmentPreview = useMemo(() => {
    if (!form.proofUrl) return null;
    return form.proofUrl.length > 80 ? `${form.proofUrl.slice(0, 80)}...` : form.proofUrl;
  }, [form.proofUrl]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen}>
      <DialogTitle>Add Expense Entry</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {isEmergency ? <Alert severity="warning">Emergency expenses are highlighted in dashboard alerts.</Alert> : null}
          <Stack spacing={1}>
            <Typography variant="subtitle2">Expense Basics</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={4}><TextField fullWidth label="Title" value={form.title} onChange={(e) => onChange('title', e.target.value)} /></Grid>
              <Grid item xs={6} md={3}><TextField fullWidth select label="Expense Type" value={form.expenseType} onChange={(e) => onChange('expenseType', e.target.value)}>{typeOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Amount" value={form.amount} onChange={(e) => onChange('amount', Number(e.target.value || 0))} /></Grid>
              <Grid item xs={6} md={3}><TextField fullWidth select label="Status" value={form.status} onChange={(e) => onChange('status', e.target.value)}>{statusOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
            </Grid>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant="subtitle2">Payment + Approval</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6} md={3}><TextField fullWidth select label="Payment Mode" value={form.paymentMode} onChange={(e) => onChange('paymentMode', e.target.value)}>{paymentModes.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6} md={3}><TextField fullWidth select label="Paid By" value={form.paidByUserId} onChange={(e) => onChange('paidByUserId', e.target.value)}><MenuItem value="">None</MenuItem>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6} md={3}><TextField fullWidth select label="Approved By" value={form.approvedByUserId} onChange={(e) => onChange('approvedByUserId', e.target.value)}><MenuItem value="">None</MenuItem>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
              <Grid item xs={6} md={3}><TextField fullWidth select label="Budget Head" value={form.budgetHeadId} onChange={(e) => onChange('budgetHeadId', e.target.value)}><MenuItem value="">None</MenuItem>{budgetHeads.map((x) => <MenuItem key={x._id} value={x._id}>{x.title}</MenuItem>)}</TextField></Grid>
              {isVendorExpense ? <Grid item xs={12} md={6}><TextField fullWidth select label="Linked Vendor" value={form.vendorId} onChange={(e) => onChange('vendorId', e.target.value)}><MenuItem value="">None</MenuItem>{vendors.map((v) => <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>)}</TextField></Grid> : null}
              <Grid item xs={12} md={isVendorExpense ? 6 : 12}><TextField fullWidth label="Note" multiline minRows={2} value={form.note} onChange={(e) => onChange('note', e.target.value)} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Proof/Attachment URL (optional)" value={form.proofUrl} onChange={(e) => onChange('proofUrl', e.target.value)} /></Grid>
              {attachmentPreview ? <Grid item xs={12}><Alert severity="info">Attachment preview: {attachmentPreview}</Alert></Grid> : null}
            </Grid>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} fullWidth={fullScreen}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" fullWidth={fullScreen}>Save Expense</Button>
      </DialogActions>
    </Dialog>
  );
}
