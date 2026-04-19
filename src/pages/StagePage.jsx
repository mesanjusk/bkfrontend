import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';
import { useLive } from '../context/LiveContext';

export default function StagePage() {
  const { events } = useLive();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [liveBoard, setLiveBoard] = useState({ current: null, queue: [] });
  const [dialog, setDialog] = useState({ open: false, assignment: null, actualGuestId: '', changeReason: '' });
  const [form, setForm] = useState({ sequenceNo: 1, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' });

  const load = async () => {
    const [a, s, c, u, lb] = await Promise.all([api.get('/stage-assignments'), api.get('/students'), api.get('/categories'), api.get('/users'), api.get('/stage-assignments/live-board')]);
    setAssignments(a.data); setStudents(s.data); setCategories(c.data); setUsers(u.data); setLiveBoard(lb.data);
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => { e.preventDefault(); await api.post('/stage-assignments', form); setForm({ sequenceNo: 1, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' }); load(); };
  const generate = async () => { await api.post('/stage-assignments/generate-from-eligible'); load(); };
  const statusUpdate = async (id, status) => { await api.post(`/stage-assignments/${id}/status`, { status }); load(); };
  const changeGuest = async () => { await api.post(`/stage-assignments/${dialog.assignment._id}/change-guest`, { actualGuestId: dialog.actualGuestId, changeReason: dialog.changeReason }); setDialog({ open: false, assignment: null, actualGuestId: '', changeReason: '' }); load(); };

  const guestOptions = users.filter((u) => u.eventDutyType === 'GUEST');
  const current = liveBoard.current;
  const rows = assignments.map((a) => ({
    title: `${a.sequenceNo}. ${a.studentId?.fullName || '-'}`,
    seq: a.sequenceNo,
    student: a.studentId?.fullName || '-',
    category: a.categoryId?.title || '-',
    anchor: a.actualAnchorId?.name || a.plannedAnchorId?.name || '-',
    guest: a.actualGuestId?.name || a.plannedGuestId?.name || '-',
    status: () => <StatusChip label={a.status} />,
    actions: () => <Stack direction="row" spacing={1} flexWrap="wrap"><Button size="small" onClick={() => statusUpdate(a._id, 'CALLED')}>Call</Button><Button size="small" onClick={() => statusUpdate(a._id, 'ON_STAGE')}>On stage</Button><Button size="small" onClick={() => statusUpdate(a._id, 'COMPLETED')}>Done</Button><Button size="small" variant="outlined" onClick={() => setDialog({ open: true, assignment: a, actualGuestId: a.actualGuestId?._id || '', changeReason: a.changeReason || '' })}>Change guest</Button></Stack>
  }));

  const guestChangedAlert = useMemo(() => events.find((e) => e.name === 'anchor_popup'), [events]);

  return (
    <>
      <PageHeader title="Live event console" subtitle="Category-wise anchor flow, guest replacement, stage status and live activity." action={<Button variant="contained" onClick={generate}>Generate from eligible</Button>} chips={[{ label: `${assignments.length} assignments` }]} />
      {guestChangedAlert ? <Alert severity="warning" sx={{ mb: 2 }}>{guestChangedAlert.payload?.title || 'Guest changed'} — {guestChangedAlert.payload?.message}</Alert> : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 4 }}>
          <Card><CardContent><Stack spacing={1}><Typography variant="h6">Current stage</Typography>{current ? <>
            <Typography variant="h5">{current.studentId?.fullName}</Typography>
            <Typography color="text.secondary">{current.categoryId?.title}</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap"><StatusChip label={current.status} /></Stack>
            <Typography>Anchor: {current.actualAnchorId?.name || current.plannedAnchorId?.name || '-'}</Typography>
            <Typography>Guest: {current.actualGuestId?.name || current.plannedGuestId?.name || '-'}</Typography>
            <Typography>Team: {current.teamMemberId?.name || '-'}</Typography>
            <Typography>Volunteer: {current.volunteerId?.name || '-'}</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap"><Button variant="contained" onClick={() => statusUpdate(current._id, 'CALLED')}>Mark called</Button><Button variant="outlined" onClick={() => setDialog({ open: true, assignment: current, actualGuestId: current.actualGuestId?._id || '', changeReason: current.changeReason || '' })}>Change guest</Button></Stack>
          </> : <Typography color="text.secondary">No active sequence yet.</Typography>}</Stack></CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, xl: 8 }}>
          <Card sx={{ mb: 2 }}><CardContent>
            <Stack component="form" onSubmit={save} spacing={2}>
              <Typography variant="h6">Quick assignment create</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2 }}><TextField type="number" label="Seq" value={form.sequenceNo} onChange={(e) => setForm({ ...form, sequenceNo: Number(e.target.value) })} /></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField select label="Student" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>{students.map((s) => <MenuItem key={s._id} value={s._id}>{s.fullName}</MenuItem>)}</TextField></Grid>
                <Grid size={{ xs: 12, md: 4 }}><TextField select label="Category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}</TextField></Grid>
                <Grid size={{ xs: 12, md: 2 }}><Button sx={{ height: '100%' }} fullWidth variant="contained" type="submit">Create</Button></Grid>
              </Grid>
            </Stack>
          </CardContent></Card>
          <ResponsiveTable columns={[{ key: 'seq', label: 'Seq' }, { key: 'student', label: 'Student' }, { key: 'category', label: 'Category' }, { key: 'anchor', label: 'Anchor' }, { key: 'guest', label: 'Guest' }, { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' }]} rows={rows} mobileTitleKey="title" />
        </Grid>
      </Grid>
      <Dialog fullWidth maxWidth="sm" open={dialog.open} onClose={() => setDialog({ open: false, assignment: null, actualGuestId: '', changeReason: '' })}>
        <DialogTitle>Change guest</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography color="text.secondary">Senior team can replace planned guest if someone arrives early or is unavailable.</Typography>
            <TextField select label="Available guest" value={dialog.actualGuestId} onChange={(e) => setDialog({ ...dialog, actualGuestId: e.target.value })}>{guestOptions.map((u) => <MenuItem key={u._id} value={u._id}>{u.name} · {u.availabilityStatus}</MenuItem>)}</TextField>
            <TextField label="Reason" value={dialog.changeReason} onChange={(e) => setDialog({ ...dialog, changeReason: e.target.value })} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setDialog({ open: false, assignment: null, actualGuestId: '', changeReason: '' })}>Cancel</Button><Button variant="contained" onClick={changeGuest}>Update</Button></DialogActions>
      </Dialog>
    </>
  );
}
