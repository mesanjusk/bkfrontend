import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, TextField } from '@mui/material';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: '', code: '' });
  const loadRoles = async () => { const { data } = await api.get('/roles'); setRoles(data); };
  useEffect(() => { loadRoles(); }, []);
  const submit = async (e) => { e.preventDefault(); await api.post('/roles', form); setForm({ name: '', code: '' }); loadRoles(); };
  return <Box><SectionTitle title="Roles" /><Card component="form" onSubmit={submit} sx={{ mb: 2 }}><CardContent><Grid container spacing={1}><Grid item xs={12} md={5}><TextField label="Role name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid><Grid item xs={12} md={5}><TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Grid><Grid item xs={12} md={2}><Button type="submit" variant="contained" fullWidth>Add</Button></Grid></Grid></CardContent></Card><DataTable headers={['Name', 'Code']} rows={roles.map((r) => [r.name, r.code])} /></Box>;
}
