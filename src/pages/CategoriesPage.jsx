import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

const initialForm = {
  title: '', board: '', className: '', minPercentage: 0, calculationMethod: 'DIRECT_PERCENTAGE', bestOfCount: 5,
  gender: 'Any', schoolType: 'Any', sequencePriority: 0, anchorId: '', preferredGuestIds: []
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    const [c, u] = await Promise.all([api.get('/categories'), api.get('/users')]);
    setCategories(c.data); setUsers(u.data);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, preferredGuestIds: form.preferredGuestIds.filter(Boolean) };
    if (selectedId) await api.put(`/categories/${selectedId}`, payload); else await api.post('/categories', payload);
    setForm(initialForm); setSelectedId(null); load();
  };
  const edit = (cat) => {
    setSelectedId(cat._id);
    setForm({ ...initialForm, ...cat, anchorId: cat.anchorId?._id || cat.anchorId || '', preferredGuestIds: (cat.preferredGuestIds || []).map((g) => g._id || g) });
  };

  const anchorOptions = users.filter((u) => u.eventDutyType === 'ANCHOR');
  const guestOptions = users.filter((u) => u.eventDutyType === 'GUEST');

  return (
    <Box>
      <SectionTitle title="Categories + Fixed Anchor Mapping" subtitle="Define board/class filters, min percentage, CBSE Best 5 logic, fixed anchor, and preferred guests." />
      <Card component="form" onSubmit={submit}><CardContent>
        <Grid container spacing={1.3}>
          {['title', 'board', 'className'].map((key) => <Grid item xs={12} sm={6} md={3} key={key}><TextField label={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></Grid>)}
          <Grid item xs={12} sm={6} md={3}><TextField type="number" label="Minimum %" value={form.minPercentage} onChange={(e) => setForm({ ...form, minPercentage: Number(e.target.value) })} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField select label="Calculation" value={form.calculationMethod} onChange={(e) => setForm({ ...form, calculationMethod: e.target.value })}><MenuItem value="DIRECT_PERCENTAGE">Direct Percentage</MenuItem><MenuItem value="BEST_5">CBSE Best 5</MenuItem></TextField></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField type="number" label="Best Of Count" value={form.bestOfCount} onChange={(e) => setForm({ ...form, bestOfCount: Number(e.target.value) })} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField type="number" label="Sequence Priority" value={form.sequencePriority} onChange={(e) => setForm({ ...form, sequencePriority: Number(e.target.value) })} /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField select label="Fixed Anchor" value={form.anchorId} onChange={(e) => setForm({ ...form, anchorId: e.target.value })}><MenuItem value="">Select anchor</MenuItem>{anchorOptions.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12}><Typography variant="subtitle2">Preferred Guests</Typography><Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>{guestOptions.map((g) => <Chip key={g._id} label={g.name} color={form.preferredGuestIds.includes(g._id) ? 'primary' : 'default'} onClick={() => setForm({ ...form, preferredGuestIds: form.preferredGuestIds.includes(g._id) ? form.preferredGuestIds.filter((id) => id !== g._id) : [...form.preferredGuestIds, g._id] })} sx={{ maxWidth: '100%' }} />)}</Stack></Grid>
          <Grid item xs={12}><Stack direction={{ xs: 'column', sm: 'row' }} gap={1}><Button variant="contained" type="submit" fullWidth>{selectedId ? 'Update Category' : 'Create Category'}</Button><Button variant="outlined" fullWidth onClick={() => { setForm(initialForm); setSelectedId(null); }}>Reset</Button></Stack></Grid>
        </Grid>
      </CardContent></Card>

      <Box sx={{ mt: 2 }}>
        <DataTable headers={['Title', 'Rule', 'Calculation', 'Anchor', 'Preferred Guests', 'Priority', 'Actions']} rows={categories.map((cat) => [cat.title, `${cat.board || '-'} / ${cat.className || '-'} / min ${cat.minPercentage || 0}%`, cat.calculationMethod === 'BEST_5' ? `Best ${cat.bestOfCount}` : 'Direct %', cat.anchorId?.name || '-', (cat.preferredGuestIds || []).map((g) => g.name || g).join(', '), cat.sequencePriority || 0, <Button size="small" onClick={() => edit(cat)}>Edit</Button>])} />
      </Box>
    </Box>
  );
}
