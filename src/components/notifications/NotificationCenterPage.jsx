import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import SummaryCard from '../SummaryCard';
import SectionTitle from '../SectionTitle';
import NotificationCard from './NotificationCard';
import ReadStatusChip from './ReadStatusChip';
import HealthAlertPanel from '../admin/HealthAlertPanel';
import ConfirmDialog from '../ConfirmDialog';

const donationInitial = { donorGuestId: '', amount: 0, mode: 'cash', note: '', receivedByUserId: '' };

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState([]);
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL');
  const [donationForm, setDonationForm] = useState(donationInitial);
  const [confirmDonation, setConfirmDonation] = useState(null);
  const [toast, setToast] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const load = async () => {
    const [n, d, u] = await Promise.all([api.get('/notifications'), api.get('/donations'), api.get('/users')]);
    setNotifications(n.data || []);
    setDonations(d.data || []);
    setUsers(u.data || []);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (notification) => {
    await api.put(`/notifications/${notification._id}`, { ...notification, readStatus: true });
    await load();
    if (selected?._id === notification._id) setSelected({ ...notification, readStatus: true });
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.readStatus);
    await Promise.all(unread.map((n) => api.put(`/notifications/${n._id}`, { ...n, readStatus: true })));
    load();
  };

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

  const types = useMemo(() => ['ALL', ...new Set(notifications.map((n) => n.type).filter(Boolean))], [notifications]);
  const filtered = useMemo(() => notifications.filter((n) => {
    const byType = typeFilter === 'ALL' || n.type === typeFilter;
    const byRead = readFilter === 'ALL' || (readFilter === 'READ' ? n.readStatus : !n.readStatus);
    return byType && byRead;
  }), [notifications, typeFilter, readFilter]);

  const unreadCount = notifications.filter((n) => !n.readStatus).length;
  const criticalUnread = notifications.filter((n) => !n.readStatus && n.priority === 'CRITICAL').length;
  const pendingThanks = donations.filter((d) => d.thankYouStatus !== 'SENT').length;

  return (
    <Box>
      <SectionTitle title="Notification Center" subtitle="Monitor live alerts, manage read status, and run WhatsApp thank-you operations." />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={6} md={3}><SummaryCard title="Total Notifications" value={notifications.length} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Unread Alerts" value={unreadCount} tone={unreadCount ? 'warning' : 'success'} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Critical Unread" value={criticalUnread} tone={criticalUnread ? 'warning' : 'success'} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Pending Thank-you" value={pendingThanks} tone={pendingThanks ? 'warning' : 'success'} /></Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={1.3} sx={{ mb: 1.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
              <TextField select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: { sm: 160 } }}>
                {types.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField select label="Read status" value={readFilter} onChange={(e) => setReadFilter(e.target.value)} sx={{ minWidth: { sm: 160 } }}>
                <MenuItem value="ALL">All</MenuItem><MenuItem value="UNREAD">Unread</MenuItem><MenuItem value="READ">Read</MenuItem>
              </TextField>
              <Button startIcon={<DoneAllIcon />} variant="contained" onClick={markAllRead} disabled={!unreadCount} fullWidth={isMobile}>Mark all read</Button>
            </Stack>
            {criticalUnread > 0 ? <Alert severity="error">Critical notifications pending review: {criticalUnread}</Alert> : null}
          </Stack>

          <Stack spacing={1.2}>
            {filtered.map((n) => (
              <Box key={n._id} onClick={() => setSelected(n)} sx={{ cursor: 'pointer' }}>
                <NotificationCard notification={n} onMarkRead={markRead} onOpenRoute={(item) => item.routePath && navigate(item.routePath)} />
              </Box>
            ))}
            {!filtered.length ? <Alert severity="info">No notifications match current filters.</Alert> : null}
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={1.5}>
            <HealthAlertPanel
              items={[
                ...(criticalUnread ? [{ label: 'Unread critical notifications', value: criticalUnread, severity: 'error' }] : []),
                ...(unreadCount ? [{ label: 'Pending unread notifications', value: unreadCount, severity: 'warning' }] : []),
                ...(pendingThanks ? [{ label: 'Pending thank-you actions', value: pendingThanks, severity: 'warning' }] : [])
              ]}
            />
            <Box component="form" onSubmit={createDonation} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: (t) => `1px solid ${t.palette.divider}` }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Donation Quick Entry</Typography>
              <Stack spacing={1}>
                <TextField select label="Donor guest" value={donationForm.donorGuestId} onChange={(e) => setDonationForm({ ...donationForm, donorGuestId: e.target.value })}>
                  <MenuItem value="">Select donor</MenuItem>
                  {users.filter((u) => u.eventDutyType === 'GUEST').map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
                </TextField>
                <TextField label="Amount" type="number" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: Number(e.target.value) })} />
                <TextField select label="Mode" value={donationForm.mode} onChange={(e) => setDonationForm({ ...donationForm, mode: e.target.value })}>
                  {['cash', 'upi', 'cheque', 'promise'].map((m) => <MenuItem key={m} value={m}>{m.toUpperCase()}</MenuItem>)}
                </TextField>
                <TextField label="Note" value={donationForm.note} onChange={(e) => setDonationForm({ ...donationForm, note: e.target.value })} />
                <TextField select label="Received by" value={donationForm.receivedByUserId} onChange={(e) => setDonationForm({ ...donationForm, receivedByUserId: e.target.value })}>
                  <MenuItem value="">Select receiver</MenuItem>
                  {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
                </TextField>
                <Button type="submit" variant="contained">Record Donation</Button>
              </Stack>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: (t) => `1px solid ${t.palette.divider}` }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Thank-you Queue</Typography>
              <Stack spacing={1}>
                {donations.slice(0, 6).map((d) => (
                  <Stack key={d._id} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Box>
                      <Typography variant="body2">{d.donorGuestId?.name || 'Guest'}</Typography>
                      <Typography variant="caption">₹{d.amount} • {d.mode}</Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.6} alignItems={{ xs: 'stretch', sm: 'center' }}>
                      <ReadStatusChip read={d.thankYouStatus === 'SENT'} />
                      <Button size="small" disabled={d.thankYouStatus === 'SENT'} onClick={() => setConfirmDonation(d)}>Mark Sent</Button>
                    </Stack>
                  </Stack>
                ))}
                {!donations.length ? <Typography variant="body2">No donation records yet.</Typography> : null}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(null)}>
        <Box sx={{ width: isMobile ? '100vw' : 420, maxWidth: '100vw', p: 2 }}>
          {selected ? (
            <Stack spacing={1.2}>
              <Typography variant="h6">{selected.title}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={selected.type || 'GENERAL'} size="small" />
                <ReadStatusChip read={selected.readStatus} />
                {selected.priority ? <Chip size="small" color={selected.priority === 'CRITICAL' ? 'error' : 'warning'} label={selected.priority} /> : null}
              </Stack>
              <Typography variant="body2">{selected.message}</Typography>
              <Typography variant="caption">{new Date(selected.createdAt || Date.now()).toLocaleString()}</Typography>
              <Typography variant="caption">Target roles: {selected.targetRoles?.join(', ') || '-'}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button size="small" variant="contained" disabled={selected.readStatus} onClick={() => markRead(selected)}>Mark as read</Button>
                <Button size="small" disabled={!selected.routePath} onClick={() => selected.routePath && navigate(selected.routePath)}>Open module</Button>
              </Stack>
            </Stack>
          ) : null}
        </Box>
      </Drawer>

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
