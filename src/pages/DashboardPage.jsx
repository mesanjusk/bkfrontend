import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import SectionTitle from '../components/SectionTitle';
import SummaryCard from '../components/SummaryCard';
import DataTable from '../components/DataTable';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLive } from '../context/LiveContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { events, latestPopup, clearPopup } = useLive();
  const [summary, setSummary] = useState(null);
  const [liveBoard, setLiveBoard] = useState({ assignments: [], guests: [], anchors: [], current: null });

  const load = async () => {
    const [s, b] = await Promise.all([api.get('/dashboard/summary'), api.get('/stage-assignments/live-board')]);
    setSummary(s.data);
    setLiveBoard(b.data);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (events.length) load(); }, [events.length]);

  const roleMessage = useMemo(() => {
    const code = user?.roleId?.code;
    if (code === 'ANCHOR') return 'Anchor dashboard focuses on category-wise flow and live guest changes.';
    if (code === 'SENIOR_TEAM') return 'Senior team controls guest replacement, donations, and rapid approvals.';
    return 'Planning mode for setup, live mode for event-day command center.';
  }, [user?.roleId?.code]);

  const taskRows = [
    ['Planning Mode Rule', 'Manual sync + local cache okay'],
    ['Event Day Rule', 'Server truth + sockets + auto refresh'],
    ['Current Event Mode', summary?.latestEvent?.mode || 'PLANNING'],
    ['Current User Role', `${summary?.currentUserRole || '-'} / ${summary?.currentUserDuty || '-'}`]
  ];

  return (
    <Box>
      <SectionTitle title="Master Dashboard" subtitle={roleMessage} />
      {latestPopup ? <Alert severity="warning" onClose={clearPopup} sx={{ mb: 2 }}>{latestPopup.payload?.title || 'Live popup'}: {latestPopup.payload?.message || 'Live event update received.'}</Alert> : null}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={4}><SummaryCard title="Students" value={summary?.students || 0} subtitle={`${summary?.eligibleStudents || 0} eligible / ${summary?.reviewStudents || 0} review`} /></Grid>
        <Grid item xs={12} sm={6} lg={4}><SummaryCard title="Stage Assignments" value={summary?.stageAssignments || 0} subtitle={`${summary?.liveAssignments || 0} currently live`} /></Grid>
        <Grid item xs={12} sm={6} lg={4}><SummaryCard title="Notifications" value={summary?.notifications || 0} subtitle={`${events.length} live events received`} /></Grid>
        <Grid item xs={12} sm={6} lg={4}><SummaryCard title="Vendors" value={summary?.vendors || 0} subtitle={`${summary?.pendingTasks || 0} pending tasks`} tone="warning" /></Grid>
        <Grid item xs={12} sm={6} lg={4}><SummaryCard title="Allowed Budget" value={`₹${summary?.totalAllowedBudget || 0}`} subtitle={`Actual ₹${summary?.totalActualExpense || 0}`} /></Grid>
        <Grid item xs={12} sm={6} lg={4}><SummaryCard title="Available Guests" value={summary?.availableGuests || 0} subtitle="Expected / available / arrived early" tone="success" /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Current Stage Sequence</Typography>
            {liveBoard.current ? (
              <Stack spacing={0.8}>
                <Typography><strong>Student:</strong> {liveBoard.current.studentId?.fullName}</Typography>
                <Typography><strong>Category:</strong> {liveBoard.current.categoryId?.title}</Typography>
                <Typography><strong>Anchor:</strong> {liveBoard.current.actualAnchorId?.name || liveBoard.current.plannedAnchorId?.name || '-'}</Typography>
                <Typography><strong>Guest:</strong> {liveBoard.current.actualGuestId?.name || liveBoard.current.plannedGuestId?.name || '-'}</Typography>
                <Chip size="small" label={liveBoard.current.status} sx={{ width: 'fit-content' }} color="primary" />
              </Stack>
            ) : <Typography variant="body2">No live assignment yet.</Typography>}
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Planning Checklist</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Operations readiness</Typography>
            <LinearProgress variant="determinate" value={Math.min(100, (summary?.stageAssignments || 0) * 10)} sx={{ mb: 2 }} />
            <DataTable headers={['Key', 'Value']} rows={taskRows} />
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Recent Activity Feed</Typography>
            <Stack spacing={1.2} sx={{ maxHeight: 420, overflow: 'auto' }}>
              {events.length ? events.map((item, idx) => (
                <Card key={idx} variant="outlined"><CardContent>
                  <Typography variant="subtitle2">{item.name}</Typography>
                  <Typography variant="caption">{new Date(item.at).toLocaleString()}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{JSON.stringify(item.payload)}</Typography>
                </CardContent></Card>
              )) : <Typography variant="body2">No live events received yet.</Typography>}
            </Stack>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Guest Readiness</Typography>
            <DataTable headers={['Guest', 'Status', 'Awards']} rows={(liveBoard.guests || []).map((g) => [g.name, g.availabilityStatus, g.stageCounts?.guestAwards || 0])} />
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
