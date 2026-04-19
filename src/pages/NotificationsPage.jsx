import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Chip, Grid2 as Grid, Stack, Typography } from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import { useLive } from '../context/LiveContext';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const { events } = useLive();
  useEffect(() => { api.get('/notifications').then((r) => setItems(r.data)); }, []);
  return (
    <>
      <PageHeader title="Notifications & live alerts" subtitle="In-app alerts, role-focused updates and socket events." chips={[{ label: `${items.length} stored` }, { label: `${events.length} live events`, color: 'secondary' }]} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}><Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Stored notifications</Typography><Stack spacing={1.5}>{items.length ? items.map((n) => <Alert key={n._id} severity="info"><Stack direction="row" justifyContent="space-between" spacing={1}><span><strong>{n.title || n.type || 'Notification'}</strong><br />{n.message || '—'}</span><Chip label={n.type || 'INFO'} size="small" /></Stack></Alert>) : <Typography color="text.secondary">No notification records yet.</Typography>}</Stack></CardContent></Card></Grid>
        <Grid size={{ xs: 12, lg: 6 }}><Card><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Live activity feed</Typography><Stack spacing={1.5}>{events.length ? events.map((n, idx) => <Alert key={idx} severity={n.name.includes('guest') ? 'warning' : 'success'}><strong>{n.name}</strong><br />{JSON.stringify(n.payload)}</Alert>) : <Typography color="text.secondary">No live socket events yet.</Typography>}</Stack></CardContent></Card></Grid>
      </Grid>
    </>
  );
}
