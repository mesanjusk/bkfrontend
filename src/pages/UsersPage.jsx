import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, MenuItem, TextField } from '@mui/material';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: '', username: '', password: '', roleId: '' });
  const load = async () => { const [u, r] = await Promise.all([api.get('/users'), api.get('/roles')]); setUsers(u.data); setRoles(r.data); };
  useEffect(() => { load(); }, []);
  const submit = async (e) => { e.preventDefault(); await api.post('/users', form); setForm({ name: '', username: '', password: '', roleId: '' }); load(); };
  return <Box><SectionTitle title="Users" /><Card component="form" onSubmit={submit} sx={{ mb: 2 }}><CardContent><Grid container spacing={1}><Grid item xs={12} sm={6} md={3}><TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid><Grid item xs={12} sm={6} md={3}><TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Grid><Grid item xs={12} sm={6} md={3}><TextField type="password" label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Grid><Grid item xs={12} sm={6} md={3}><TextField select label="Role" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}><MenuItem value="">Select</MenuItem>{roles.map((r) => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}</TextField></Grid><Grid item xs={12}><Button variant="contained" type="submit">Add User</Button></Grid></Grid></CardContent></Card><DataTable headers={['Name', 'Username', 'Role']} rows={users.map((u) => [u.name, u.username, u.roleId?.name])} /></Box>;
}
