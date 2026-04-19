import { useEffect, useMemo, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Fab,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import api from '../api';
import FormSectionCard from '../components/FormSectionCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { useLive } from '../context/LiveContext';
import { useAuth } from '../context/AuthContext';
import CurrentStageCard from '../components/live/CurrentStageCard';
import DonationQuickDialog from '../components/live/DonationQuickDialog';
import GuestAvailabilityPanel from '../components/live/GuestAvailabilityPanel';
import GuestChangeDialog from '../components/live/GuestChangeDialog';
import LiveActivityFeed from '../components/live/LiveActivityFeed';
import LiveAlertCenter from '../components/live/LiveAlertCenter';
import LiveEventHeader from '../components/live/LiveEventHeader';
import QueueList from '../components/live/QueueList';

const donationInitial = { donorGuestId: '', amount: 0, mode: 'cash', note: '', receivedByUserId: '' };

export default function StagePage() {
  const { user } = useAuth();
  const { latestPopup, clearPopup, events, connectionStatus } = useLive();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [openGuestDialog, setOpenGuestDialog] = useState(false);
  const [openDonationDialog, setOpenDonationDialog] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [guestReason, setGuestReason] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', tone: 'success' });
  const [queueFilter, setQueueFilter] = useState('ALL');
  const [mobileTab, setMobileTab] = useState('CURRENT');
  const [form, setForm] = useState({ sequenceNo: 1, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' });
  const [donationForm, setDonationForm] = useState(donationInitial);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [nowLabel, setNowLabel] = useState(new Date().toLocaleString());

  const load = async () => {
    const [a, s, c, u, d] = await Promise.all([
      api.get('/stage-assignments'),
      api.get('/students'),
      api.get('/categories'),
      api.get('/users'),
      api.get('/donations')
    ]);
    setAssignments(a.data || []);
    setStudents(s.data || []);
    setCategories(c.data || []);
    setUsers(u.data || []);
    setDonations(d.data || []);
    setForm((prev) => ({ ...prev, sequenceNo: (a.data?.length || 0) + 1 }));
    if (!selectedAssignmentId && a.data?.length) {
      const focus = (a.data || []).find((x) => ['ON_STAGE', 'CALLED', 'PENDING'].includes(x.status)) || a.data[0];
      setSelectedAssignmentId(focus._id);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (latestPopup?.at) load(); }, [latestPopup?.at]);
  useEffect(() => {
    const timer = setInterval(() => setNowLabel(new Date().toLocaleString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const createAssignment = async (e) => {
    e.preventDefault();
    await api.post('/stage-assignments', form);
    setForm({ sequenceNo: assignments.length + 2, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' });
    setSnack({ open: true, msg: 'Stage assignment created.', tone: 'success' });
    load();
  };

  const updateStatus = async (id, status) => {
    await api.post(`/stage-assignments/${id}/status`, { status });
    setSnack({ open: true, msg: `Status updated to ${status.replace('_', ' ')}.`, tone: status === 'ABSENT' || status === 'SKIPPED' ? 'warning' : 'success' });
    load();
  };

  const generate = async () => {
    await api.post('/stage-assignments/generate-from-eligible');
    setSnack({ open: true, msg: 'Queue regenerated from eligible students.', tone: 'success' });
    load();
  };

  const confirmChangeGuest = async () => {
    if (!selectedAssignment || !selectedGuestId) return;
    await api.post(`/stage-assignments/${selectedAssignment._id}/change-guest`, {
      actualGuestId: selectedGuestId,
      changeReason: guestReason || 'Changed live by senior team because scheduled guest not available'
    });
    setOpenGuestDialog(false);
    setSelectedGuestId('');
    setGuestReason('');
    setSnack({ open: true, msg: 'Guest changed successfully. Live alert pushed.', tone: 'success' });
    load();
  };

  const saveDonation = async () => {
    await api.post('/donations', donationForm);
    setOpenDonationDialog(false);
    setDonationForm(donationInitial);
    setSnack({ open: true, msg: 'Donation saved. Thank-you pending.', tone: 'success' });
    load();
  };

  const sendThanks = async () => {
    const pending = donations.find((x) => x.thankYouStatus !== 'SENT');
    if (!pending) {
      setSnack({ open: true, msg: 'No pending thank-you items.', tone: 'info' });
      return;
    }
    await api.put(`/donations/${pending._id}`, { ...pending, thankYouStatus: 'SENT' });
    setSnack({ open: true, msg: 'Thank-you marked as sent.', tone: 'success' });
    load();
  };

  const filteredQueue = useMemo(() => assignments
    .filter((a) => {
      if (queueFilter === 'ALL') return true;
      if (queueFilter === 'ISSUES') return ['ABSENT', 'SKIPPED'].includes(a.status);
      if (queueFilter === 'PENDING') return !a.status || a.status === 'PENDING';
      return a.status === queueFilter;
    })
    .sort((x, y) => (x.sequenceNo || 0) - (y.sequenceNo || 0)), [assignments, queueFilter]);

  const selectedAssignment = assignments.find((x) => x._id === selectedAssignmentId)
    || assignments.find((x) => ['ON_STAGE', 'CALLED', 'PENDING'].includes(x.status))
    || filteredQueue[0]
    || assignments[0]
    || null;

  const operationalAlerts = useMemo(() => {
    const fromEvents = (events || []).slice(0, 12).map((e, idx) => ({
      id: `${e.name}-${e.at}-${idx}`,
      type: e.name,
      title: e.payload?.title || e.name.replaceAll('_', ' '),
      message: e.payload?.message || e.payload?.description || 'Live update received.'
    }));

    const absents = assignments
      .filter((a) => a.status === 'ABSENT')
      .slice(0, 4)
      .map((a) => ({ id: `abs-${a._id}`, type: 'student_absent', title: 'Student absent', message: `${a.studentId?.fullName || 'Student'} marked absent.` }));

    const pendingThankYou = donations
      .filter((d) => d.thankYouStatus !== 'SENT')
      .slice(0, 4)
      .map((d) => ({ id: `d-${d._id}`, type: 'donation_thankyou_pending', title: 'Donation thank-you pending', message: `₹${d.amount || 0} from ${d.donorGuestId?.name || 'Guest'} pending.` }));

    return [...absents, ...pendingThankYou, ...fromEvents].slice(0, 15);
  }, [events, assignments, donations]);

  const activityItems = useMemo(() => (events || []).slice(0, 16).map((e, idx) => ({
    id: `${e.name}-${idx}-${e.at}`,
    title: e.payload?.title || e.payload?.message || e.name.replaceAll('_', ' '),
    timeLabel: new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })), [events]);

  const guestUsers = users.filter((u) => u.eventDutyType === 'GUEST');
  const volunteerUsers = users.filter((u) => u.eventDutyType === 'VOLUNTEER');
  const teamUsers = users.filter((u) => ['TEAM_MEMBER', 'TEAM'].includes(u.eventDutyType));
  const pendingThankYouCount = donations.filter((d) => d.thankYouStatus !== 'SENT').length;
  const mobileCurrentStrip = selectedAssignment ? (
    <Alert
      severity={selectedAssignment.status === 'ON_STAGE' ? 'warning' : 'info'}
      action={<Button size="small" onClick={() => setMobileTab('CURRENT')}>Open</Button>}
      sx={{ mb: 1 }}
    >
      <strong>Now:</strong> #{selectedAssignment.sequenceNo} {selectedAssignment.studentId?.fullName || 'Student TBD'}
    </Alert>
  ) : null;

  const queueSection = (
    <QueueList
      items={filteredQueue}
      selectedId={selectedAssignment?._id}
      onSelect={(a) => setSelectedAssignmentId(a._id)}
      filter={queueFilter}
      onFilterChange={setQueueFilter}
      mobile={isMobile}
    />
  );

  const currentSection = (
    <Stack spacing={1.1}>
      <CurrentStageCard
        assignment={selectedAssignment}
        compact={isMobile}
        onStatus={(status) => selectedAssignment && updateStatus(selectedAssignment._id, status)}
        onChangeGuest={() => setOpenGuestDialog(true)}
        onAddDonation={() => setOpenDonationDialog(true)}
        onTriggerThanks={sendThanks}
      />

      <Alert severity={pendingThankYouCount ? 'warning' : 'success'} icon={<CelebrationRoundedIcon />}>
        {pendingThankYouCount ? `${pendingThankYouCount} thank-you items pending.` : 'All thank-you actions are done.'}
        {pendingThankYouCount ? <Button sx={{ ml: 1 }} size="small" onClick={sendThanks}>Send now</Button> : null}
      </Alert>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Manual Stage Assignment Entry</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormSectionCard title="Create Stage Assignment" component="form" onSubmit={createAssignment}>
            <Grid container spacing={1.1}>
              <Grid item xs={6} md={2}><TextField type="number" label="Sequence" value={form.sequenceNo} onChange={(e) => setForm({ ...form, sequenceNo: Number(e.target.value) })} /></Grid>
              <Grid item xs={12} md={2}><TextField select label="Student" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}><MenuItem value="">Select</MenuItem>{students.map((s) => <MenuItem key={s._id} value={s._id}>{s.fullName}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><MenuItem value="">Select</MenuItem>{categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select label="Planned Guest" value={form.plannedGuestId} onChange={(e) => setForm({ ...form, plannedGuestId: e.target.value })}><MenuItem value="">Select</MenuItem>{guestUsers.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select label="Team Member" value={form.teamMemberId} onChange={(e) => setForm({ ...form, teamMemberId: e.target.value })}><MenuItem value="">Select</MenuItem>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select label="Volunteer" value={form.volunteerId} onChange={(e) => setForm({ ...form, volunteerId: e.target.value })}><MenuItem value="">Select</MenuItem>{volunteerUsers.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12}><Button variant="contained" type="submit">Create Assignment</Button></Grid>
            </Grid>
          </FormSectionCard>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );

  const rightSection = (
    <Stack spacing={1.1}>
      <LiveAlertCenter alerts={operationalAlerts} />
      <GuestAvailabilityPanel guests={guestUsers} />
      <Alert severity="info" icon={<WarningAmberRoundedIcon />}>Team ready: {teamUsers.filter((u) => u.availabilityStatus === 'AVAILABLE').length}/{teamUsers.length} · Volunteers ready: {volunteerUsers.filter((u) => u.availabilityStatus === 'AVAILABLE').length}/{volunteerUsers.length}</Alert>
      <LiveActivityFeed items={activityItems} />
      <Button color="error" variant="outlined" onClick={() => setOpenEmergency(true)}>Emergency Action</Button>
    </Stack>
  );

  const consoleBody = (
    <Grid container spacing={1.2} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={3}>{queueSection}</Grid>
      <Grid item xs={12} md={5}>{currentSection}</Grid>
      <Grid item xs={12} md={4}>{rightSection}</Grid>
    </Grid>
  );

  return (
    <Box>
      <LiveEventHeader
        nowLabel={nowLabel}
        connectionStatus={connectionStatus}
        unreadAlerts={operationalAlerts.length}
        role={user?.roleId?.name || user?.roleId?.code}
        duty={user?.eventDutyType}
        onRefresh={load}
      />

      <Box sx={{ p: { xs: 1.1, md: 1.8 }, pb: { xs: 9, md: 2 } }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1.1, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={generate}>Generate from Eligible</Button>
          <Button variant="outlined" color="error" onClick={() => setOpenEmergency(true)}>Emergency Action</Button>
        </Stack>
        {latestPopup ? (
          <Alert severity="warning" onClose={clearPopup} sx={{ mb: 1.2 }}>
            {latestPopup.payload?.title || 'Anchor popup'} - {latestPopup.payload?.message}
          </Alert>
        ) : null}

        {isMobile ? (
          <>
            {mobileCurrentStrip}
            <Tabs
              value={mobileTab}
              variant="scrollable"
              scrollButtons="auto"
              onChange={(_, value) => setMobileTab(value)}
              sx={{ position: 'sticky', top: 74, zIndex: 5, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
            >
              {['CURRENT', 'QUEUE', 'GUESTS', 'ALERTS', 'ACTIVITY', 'DONATIONS'].map((x) => <Tab key={x} value={x} label={x} />)}
            </Tabs>
            <Box sx={{ mt: 1.1 }}>
              {mobileTab === 'CURRENT' && currentSection}
              {mobileTab === 'QUEUE' && queueSection}
              {mobileTab === 'GUESTS' && <GuestAvailabilityPanel guests={guestUsers} />}
              {mobileTab === 'ALERTS' && <LiveAlertCenter alerts={operationalAlerts} />}
              {mobileTab === 'ACTIVITY' && <LiveActivityFeed items={activityItems} />}
              {mobileTab === 'DONATIONS' && (
                <Alert severity="info" action={<Button size="small" onClick={() => setOpenDonationDialog(true)}>Quick Add</Button>}>
                  Pending thank-you: {pendingThankYouCount}
                </Alert>
              )}
            </Box>
          </>
        ) : consoleBody}
      </Box>

      {isMobile ? (
        <Fab color="primary" sx={{ position: 'fixed', bottom: 18, right: 18 }} onClick={() => setOpenDonationDialog(true)}>
          <AddRoundedIcon />
        </Fab>
      ) : null}

      <GuestChangeDialog
        open={openGuestDialog}
        assignment={selectedAssignment}
        guests={guestUsers}
        selectedGuestId={selectedGuestId}
        reason={guestReason}
        onReasonChange={setGuestReason}
        onSelectGuest={setSelectedGuestId}
        onClose={() => setOpenGuestDialog(false)}
        onConfirm={confirmChangeGuest}
      />

      <DonationQuickDialog
        open={openDonationDialog}
        form={donationForm}
        users={users}
        onChange={setDonationForm}
        onClose={() => setOpenDonationDialog(false)}
        onSave={saveDonation}
      />

      <ConfirmDialog
        open={openEmergency}
        onClose={() => setOpenEmergency(false)}
        onConfirm={() => setOpenEmergency(false)}
        title="Emergency Stage Control"
        description="Use this in urgent event-day situations (mic issue, guest absence, stage halt). Alert relevant team immediately."
        confirmText="Acknowledge"
        tone="error"
      />

      <Snackbar
        open={snack.open}
        onClose={() => setSnack({ ...snack, open: false })}
        autoHideDuration={2500}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.tone} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
