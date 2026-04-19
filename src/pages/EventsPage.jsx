import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, TextField } from '@mui/material';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ eventName: '', venue: '', organizerName: '' });
  const load = async () => { const { data } = await api.get('/events'); setEvents(data); };
  useEffect(() => { load(); }, []);
  const submit = async (e) => { e.preventDefault(); await api.post('/events', form); setForm({ eventName: '', venue: '', organizerName: '' }); load(); };

  return <Box>
    <SectionTitle title="Events" subtitle="Manage event setup metadata." />
    <Card component="form" onSubmit={submit} sx={{ mb: 2 }}><CardContent><Grid container spacing={1}><Grid item xs={12} md={4}><TextField label="Event name" value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} /></Grid><Grid item xs={12} md={4}><TextField label="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Grid><Grid item xs={12} md={4}><TextField label="Organizer" value={form.organizerName} onChange={(e) => setForm({ ...form, organizerName: e.target.value })} /></Grid><Grid item xs={12}><Button variant="contained" type="submit">Add Event</Button></Grid></Grid></CardContent></Card>
    <DataTable headers={['Event', 'Venue', 'Organizer']} rows={events.map((e) => [e.eventName, e.venue, e.organizerName])} />
  </Box>;
}
