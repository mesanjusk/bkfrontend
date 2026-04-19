import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', board: '', className: '', minPercentage: 0, calculationMethod: 'DIRECT_PERCENTAGE', anchorId: '', preferredGuestIds: [] });

  const load = async () => {
    const [c, u] = await Promise.all([api.get('/categories'), api.get('/users')]);
    setCategories(c.data);
    setUsers(u.data);
  };
  useEffect(() => { load(); }, []);
  const save = async (e) => { e.preventDefault(); await api.post('/categories', { ...form, preferredGuestIds: form.preferredGuestIds ? [form.preferredGuestIds].flat().filter(Boolean) : [] }); setForm({ title: '', board: '', className: '', minPercentage: 0, calculationMethod: 'DIRECT_PERCENTAGE', anchorId: '', preferredGuestIds: [] }); load(); };

  const anchors = users.filter((u) => u.eventDutyType === 'ANCHOR');
  const guests = users.filter((u) => u.eventDutyType === 'GUEST');
  const rows = categories.map((c) => ({
    title: c.title,
    board: c.board || '-',
    className: c.className || '-',
    minPercentage: c.minPercentage || 0,
    calculationMethod: c.calculationMethod,
    anchor: c.anchorId?.name || '-',
    guest: (c.preferredGuestIds || []).map((g) => g.name).join(', ') || '-',
    active: () => <StatusChip label={c.isActive ? 'Selected' : 'Pending'} />
  }));

  return (
    <>
      <PageHeader title="Award categories" subtitle="Database-driven rules with fixed anchor and preferred guest mapping." />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card component="form" onSubmit={save}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Create category</Typography>
                <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><TextField label="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} /></Grid>
                  <Grid size={{ xs: 6 }}><TextField label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} /></Grid>
                  <Grid size={{ xs: 6 }}><TextField type="number" label="Min %" value={form.minPercentage} onChange={(e) => setForm({ ...form, minPercentage: Number(e.target.value) })} /></Grid>
                  <Grid size={{ xs: 6 }}><TextField select label="Calculation" value={form.calculationMethod} onChange={(e) => setForm({ ...form, calculationMethod: e.target.value })}><MenuItem value="DIRECT_PERCENTAGE">Direct %</MenuItem><MenuItem value="BEST_5">Best 5</MenuItem></TextField></Grid>
                </Grid>
                <TextField select label="Fixed Anchor" value={form.anchorId} onChange={(e) => setForm({ ...form, anchorId: e.target.value })}>{anchors.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField>
                <TextField select label="Preferred Guest" value={form.preferredGuestIds[0] || ''} onChange={(e) => setForm({ ...form, preferredGuestIds: [e.target.value] })}>{guests.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField>
                <Button variant="contained" type="submit">Save category</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ResponsiveTable
            columns={[
              { key: 'title', label: 'Title' }, { key: 'board', label: 'Board' }, { key: 'className', label: 'Class' }, { key: 'minPercentage', label: 'Min %' }, { key: 'calculationMethod', label: 'Method' }, { key: 'anchor', label: 'Anchor' }, { key: 'guest', label: 'Preferred guest' }
            ]}
            rows={rows}
            mobileTitleKey="title"
          />
        </Grid>
      </Grid>
    </>
  );
}
