import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, MenuItem, Snackbar, TextField, Typography } from '@mui/material';
import api from '../api';
import SectionTitle from '../components/SectionTitle';
import SummaryCard from '../components/SummaryCard';
import FormSectionCard from '../components/FormSectionCard';
import ResponsiveDataView from '../components/ResponsiveDataView';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StatusChip';
import { useLive } from '../context/LiveContext';

const donationInitial = { donorGuestId: '', amount: 0, mode: 'cash', note: '', receivedByUserId: '' };

export default function NotificationsPage() {
  const { events } = useLive();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [toast, setToast] = useState('');
  const [confirmDonation, setConfirmDonation] = useState(null);
  const [donationForm, setDonationForm] = useState(donationInitial);

  const load = async () => {
    const [n, u, d] = await Promise.all([api.get('/notifications'), api.get('/users'), api.get('/donations')]);
    setNotifications(n.data);
    setUsers(u.data);
    setDonations(d.data);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (events.length) load(); }, [events.length]);

  const createDonation = async (e) => {
    e.preventDefault();
    await api.post('/donations', donationForm);
    setDonationForm(donationInitial);
    setToast('Donation recorded');
    load();
  };

  const sendThanks = async () => {
    if (!confirmDonation) return;
    await api.put(`/donations/${confirmDonation._id}`, { ...confirmDonation, thankYouStatus: 'SENT' });
    await api.post('/notifications', {
      title: 'WhatsApp thank-you sent',
      message: `Donation thank-you marked sent for ₹${confirmDonation.amount}.`,
      type: 'WHATSAPP',
      targetRoles: ['SUPER_ADMIN', 'ADMIN', 'SENIOR_TEAM'],
      readStatus: false
    });
    setConfirmDonation(null);
    setToast('Thank-you marked sent');
    load();
  };

  const totals = useMemo(() => ({
    total: donations.reduce((a, d) => a + (d.amount || 0), 0),
    pending: donations.filter((d) => d.thankYouStatus !== 'SENT').length
  }), [donations]);

  const notificationRows = notifications.map((n) => [
    n.title,
    <StatusChip label={n.type} />,
    n.message
  ]);

  const donationRows = donations.map((d) => [
    d.donorGuestId?.name || '-',
    d.amount,
    d.mode,
    <StatusChip label={d.thankYouStatus || 'PENDING'} />,
    <Button size="small" variant="contained" onClick={() => setConfirmDonation(d)} disabled={d.thankYouStatus === 'SENT'}>
      Mark Sent
    </Button>
  ]);

  return (
    <Box>
      <SectionTitle title="Notifications Center + Donations" subtitle="Live alerts, donation quick entry, and thank-you workflow." />

      <Grid container spacing={2}>
        <Grid item xs={6} md={3}><SummaryCard title="Notifications" value={notifications.length} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Total Donations" value={`₹${totals.total}`} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Pending Thank-you" value={totals.pending} tone="warning" /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Live Feed Events" value={events.length} /></Grid>
      </Grid>

      <FormSectionCard
        title="Donation Quick Entry"
        component="form"
        onSubmit={createDonation}
        subtitle="Capture live guest contributions and keep thank-you status visible."
      >
        <Grid container spacing={1}>
          <Grid item xs={12} md={3}>
            <TextField select label="Donor guest" value={donationForm.donorGuestId} onChange={(e) => setDonationForm({ ...donationForm, donorGuestId: e.target.value })}>
              <MenuItem value="">Select donor</MenuItem>
              {users.filter((u) => u.eventDutyType === 'GUEST').map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}><TextField label="Amount" type="number" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: Number(e.target.value) })} /></Grid>
          <Grid item xs={6} md={2}>
            <TextField select label="Mode" value={donationForm.mode} onChange={(e) => setDonationForm({ ...donationForm, mode: e.target.value })}>
              {['cash', 'upi', 'cheque', 'promise'].map((m) => <MenuItem key={m} value={m}>{m.toUpperCase()}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}><TextField label="Note" value={donationForm.note} onChange={(e) => setDonationForm({ ...donationForm, note: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}>
            <TextField select label="Received by" value={donationForm.receivedByUserId} onChange={(e) => setDonationForm({ ...donationForm, receivedByUserId: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}><Button variant="contained" type="submit">Record Donation</Button></Grid>
        </Grid>
      </FormSectionCard>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Notifications</Typography>
          <ResponsiveDataView headers={['Title', 'Type', 'Message']} rows={notificationRows} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Donation Thank-you Queue</Typography>
          <ResponsiveDataView headers={['Guest', 'Amount', 'Mode', 'Thank-you', 'Action']} rows={donationRows} />
        </Grid>
      </Grid>

      <ConfirmDialog
        open={Boolean(confirmDonation)}
        onClose={() => setConfirmDonation(null)}
        onConfirm={sendThanks}
        title="Mark WhatsApp thank-you as sent?"
        description={`This will update donation status${confirmDonation ? ` for ₹${confirmDonation.amount}` : ''} and create a WHATSAPP notification.`}
        confirmText="Mark Sent"
      />

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} message={toast} onClose={() => setToast('')} />
    </Box>
  );
}
