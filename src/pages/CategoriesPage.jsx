import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';
import ResponsiveDataView from '../components/ResponsiveDataView';

const initialForm = {
  title: '', board: '', className: '', minPercentage: 0, calculationMethod: 'DIRECT_PERCENTAGE', bestOfCount: 5,
  gender: 'Any', schoolType: 'Any', sequencePriority: 0, anchorId: '', preferredGuestIds: []
};

export default function CategoriesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const categoryRows = useMemo(() => categories.map((cat) => ({
    ...cat,
    rule: `${cat.board || '-'} / ${cat.className || '-'} / min ${cat.minPercentage || 0}%`,
    calculation: cat.calculationMethod === 'BEST_5' ? `Best ${cat.bestOfCount}` : 'Direct %',
    anchor: cat.anchorId?.name || '-',
    guests: (cat.preferredGuestIds || []).map((g) => g.name || g).join(', ') || '-',
    priority: cat.sequencePriority || 0
  })), [categories]);

  return (
    <Box>
      <SectionTitle title="Categories + Fixed Anchor Mapping" subtitle="Define board/class filters, min percentage, CBSE Best 5 logic, fixed anchor, and preferred guests." />
      <Card component="form" onSubmit={submit} variant="outlined"><CardContent>
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
        {isMobile ? (
          <ResponsiveDataView
            rows={categoryRows}
            mobileRender={(cat) => (
              <Stack spacing={0.8}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>{cat.title || 'Untitled category'}</Typography>
                <Typography variant="body2"><strong>Rule:</strong> {cat.rule}</Typography>
                <Typography variant="body2"><strong>Calc:</strong> {cat.calculation}</Typography>
                <Typography variant="body2"><strong>Anchor:</strong> {cat.anchor}</Typography>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}><strong>Guests:</strong> {cat.guests}</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2"><strong>Priority:</strong> {cat.priority}</Typography>
                  <Button size="small" variant="outlined" onClick={() => edit(cat)}>Edit</Button>
                </Stack>
              </Stack>
            )}
          />
        ) : (
          <DataTable headers={['Title', 'Rule', 'Calculation', 'Anchor', 'Preferred Guests', 'Priority', 'Actions']} rows={categoryRows.map((cat) => [cat.title, cat.rule, cat.calculation, cat.anchor, cat.guests, cat.priority, <Button size="small" onClick={() => edit(cat)}>Edit</Button>])} />
        )}
      </Box>
    </Box>
  );
}
