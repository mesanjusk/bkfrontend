import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import api from '../api';
import SectionTitle from '../components/SectionTitle';
import FormSectionCard from '../components/FormSectionCard';
import ResponsiveDataView from '../components/ResponsiveDataView';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StatusChip';
import { useLive } from '../context/LiveContext';

export default function StagePage() {
  const { latestPopup, clearPopup } = useLive();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [form, setForm] = useState({
    sequenceNo: 1,
    studentId: '',
    categoryId: '',
    plannedGuestId: '',
    teamMemberId: '',
    volunteerId: ''
  });
  const [guestChanges, setGuestChanges] = useState({});

  const load = async () => {
    const [a, s, c, u] = await Promise.all([
      api.get('/stage-assignments'),
      api.get('/students'),
      api.get('/categories'),
      api.get('/users')
    ]);
    setAssignments(a.data);
    setStudents(s.data);
    setCategories(c.data);
    setUsers(u.data);
    setForm((prev) => ({ ...prev, sequenceNo: a.data.length + 1 }));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [latestPopup?.at]);

  const createAssignment = async (e) => {
    e.preventDefault();
    await api.post('/stage-assignments', form);
    setForm({ sequenceNo: assignments.length + 2, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' });
    load();
  };

  const generate = async () => {
    await api.post('/stage-assignments/generate-from-eligible');
    load();
  };

  const updateStatus = async (id, status) => {
    await api.post(`/stage-assignments/${id}/status`, { status });
    load();
  };

  const changeGuest = async (id) => {
    const actualGuestId = guestChanges[id];
    if (!actualGuestId) return;
    await api.post(`/stage-assignments/${id}/change-guest`, {
      actualGuestId,
      changeReason: 'Changed live by senior team because scheduled guest not available'
    });
    load();
  };

  const guestOptions = users.filter((u) => u.eventDutyType === 'GUEST');

  const rows = assignments.map((a) => [
    a.sequenceNo,
    a.studentId?.fullName,
    a.categoryId?.title,
    a.actualAnchorId?.name || a.plannedAnchorId?.name || '-',
    <Stack gap={0.6}>
      <Typography variant="caption">Planned: {a.plannedGuestId?.name || '-'}</Typography>
      <Typography variant="caption">Actual: {a.actualGuestId?.name || '-'}</Typography>
      <TextField
        select
        size="small"
        value={guestChanges[a._id] || ''}
        onChange={(e) => setGuestChanges({ ...guestChanges, [a._id]: e.target.value })}
      >
        <MenuItem value="">Change guest</MenuItem>
        {guestOptions.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
      </TextField>
      <Button size="small" variant="outlined" onClick={() => changeGuest(a._id)}>Apply</Button>
    </Stack>,
    `Guest ${a.actualGuestId?.stageCounts?.guestAwards || 0} / Team ${a.teamMemberId?.stageCounts?.teamAssignments || 0} / Vol ${a.volunteerId?.stageCounts?.volunteerAssignments || 0}`,
    <StatusChip label={a.status} />,
    <Stack direction="row" gap={0.4} flexWrap="wrap">
      <Button size="small" onClick={() => updateStatus(a._id, 'CALLED')}>Called</Button>
      <Button size="small" onClick={() => updateStatus(a._id, 'ON_STAGE')}>On Stage</Button>
      <Button size="small" variant="contained" onClick={() => updateStatus(a._id, 'COMPLETED')}>Complete</Button>
    </Stack>
  ]);

  return (
    <Box>
      <SectionTitle
        title="Live Event Console"
        subtitle="Current queue, guest changes, anchor popup alerts, and rapid event-day actions."
        actions={(
          <Stack direction="row" gap={1}>
            <Button variant="contained" onClick={generate}>Generate from Eligible</Button>
            <Button color="error" variant="outlined" onClick={() => setOpenEmergency(true)}>Emergency Action</Button>
          </Stack>
        )}
      />

      {latestPopup ? (
        <Alert severity="warning" onClose={clearPopup} sx={{ mb: 2 }}>
          {latestPopup.payload?.title || 'Anchor popup'} - {latestPopup.payload?.message}
        </Alert>
      ) : null}

      <FormSectionCard title="Create Stage Assignment" component="form" onSubmit={createAssignment}>
        <Grid container spacing={1.2}>
          <Grid item xs={6} md={2}>
            <TextField type="number" label="Sequence" value={form.sequenceNo} onChange={(e) => setForm({ ...form, sequenceNo: Number(e.target.value) })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select label="Student" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {students.map((s) => <MenuItem key={s._id} value={s._id}>{s.fullName}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select label="Planned Guest" value={form.plannedGuestId} onChange={(e) => setForm({ ...form, plannedGuestId: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {guestOptions.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select label="Team Member" value={form.teamMemberId} onChange={(e) => setForm({ ...form, teamMemberId: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select label="Volunteer" value={form.volunteerId} onChange={(e) => setForm({ ...form, volunteerId: e.target.value })}>
              <MenuItem value="">Select</MenuItem>
              {users.filter((u) => u.eventDutyType === 'VOLUNTEER').map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}><Button variant="contained" type="submit">Create Assignment</Button></Grid>
        </Grid>
      </FormSectionCard>

      <Box sx={{ mt: 2 }}>
        <ResponsiveDataView
          headers={['Seq', 'Student', 'Category', 'Anchor', 'Guest', 'Counts', 'Status', 'Live Actions']}
          rows={rows}
        />
      </Box>

      <ConfirmDialog
        open={openEmergency}
        onClose={() => setOpenEmergency(false)}
        onConfirm={() => setOpenEmergency(false)}
        title="Emergency Stage Control"
        description="Use this in urgent event-day situations (mic issue, guest absence, stage halt). Alert relevant team immediately."
        confirmText="Acknowledge"
        tone="error"
      />
    </Box>
  );
}
