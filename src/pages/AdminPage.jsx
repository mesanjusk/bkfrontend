import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';
import { APP_ROUTES } from '../utils/accessControl';

const permissionsList = APP_ROUTES.map((item) => ({ label: item.label, value: item.permission }));

function UsersTab({ roles, users, reload }) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', roleId: '', eventDutyType: 'ADMIN', isActive: true });

  const openAdd = () => { setEditing(null); setForm({ name: '', username: '', password: '', roleId: '', eventDutyType: 'ADMIN', isActive: true }); setOpen(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name || '', username: u.username || '', password: '', roleId: u.roleId?._id || u.roleId || '', eventDutyType: u.eventDutyType || 'ADMIN', isActive: u.isActive !== false }); setOpen(true); };
  const save = async () => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editing?._id) await api.put(`/users/${editing._id}`, payload); else await api.post('/users', payload);
    setOpen(false); reload();
  };

  const rows = users.map((u) => ({
    title: u.name,
    name: u.name,
    username: u.username,
    role: u.roleId?.name || '-',
    access: (u.roleId?.permissions || []).length ? `${u.roleId.permissions.length} modules` : 'All',
    status: () => <StatusChip label={u.isActive ? 'Active' : 'Inactive'} />,
    action: () => <Button size="small" variant="contained" onClick={() => openEdit(u)}>Edit</Button>
  }));

  return (
    <Stack spacing={2}>
      <Card><CardContent><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}><Box><Typography variant="h6" fontWeight={800}>Users</Typography><Typography color="text.secondary">Super admin can assign role-based access for each user.</Typography></Box><Stack direction="row" spacing={1}><ToggleButtonGroup exclusive size="small" value={viewMode} onChange={(_, v) => v && setViewMode(v)}><ToggleButton value="card"><ViewModuleIcon fontSize="small" /></ToggleButton><ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton></ToggleButtonGroup><Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add User</Button></Stack></Stack></CardContent></Card>
      {viewMode === 'card' ? <Grid container spacing={2}>{users.map((u) => <Grid key={u._id} size={{ xs: 12, md: 6, xl: 4 }}><Card><CardContent><Stack spacing={1.2}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="h6" fontWeight={800}>{u.name}</Typography><Typography color="text.secondary">{u.username}</Typography></Box><StatusChip label={u.isActive ? 'Active' : 'Inactive'} /></Stack><Typography variant="body2">Role: <strong>{u.roleId?.name || '-'}</strong></Typography><Typography variant="body2">Duty: <strong>{u.eventDutyType || '-'}</strong></Typography><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{(u.roleId?.permissions || []).length ? u.roleId.permissions.slice(0, 3).map((p) => <Chip key={p} label={p} size="small" />) : <Chip label="All modules" size="small" color="success" variant="outlined" />}</Stack><Stack direction="row" justifyContent="flex-end"><Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(u)}>Edit</Button></Stack></Stack></CardContent></Card></Grid>)}</Grid> : <ResponsiveTable columns={[{ key: 'name', label: 'Name' },{ key: 'username', label: 'Username' },{ key: 'role', label: 'Role' },{ key: 'access', label: 'Access' },{ key: 'status', label: 'Status' },{ key: 'action', label: 'Action' }]} rows={rows} mobileTitleKey="title" />}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{editing ? 'Edit user' : 'Add user'}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /><TextField label={editing ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><TextField select label="Role" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>{roles.map((r) => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}</TextField><TextField select label="Duty" value={form.eventDutyType} onChange={(e) => setForm({ ...form, eventDutyType: e.target.value })}>{['NONE','HOST','SUPER_ADMIN','ADMIN','SENIOR_TEAM','TEAM_LEADER','VOLUNTEER','ANCHOR','GUEST','STUDENT','CERTIFICATE_TEAM'].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField><TextField select label="Status" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}><MenuItem value="true">Active</MenuItem><MenuItem value="false">Inactive</MenuItem></TextField><Stack direction="row" justifyContent="flex-end" spacing={1}><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save}>{editing ? 'Update User' : 'Save User'}</Button></Stack></Stack></DialogContent></Dialog>
    </Stack>
  );
}

function RolesTab({ roles, reload }) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', dashboardKey: 'default', permissions: [], isActive: true });

  const openAdd = () => { setEditing(null); setForm({ name: '', code: '', description: '', dashboardKey: 'default', permissions: [], isActive: true }); setOpen(true); };
  const openEdit = (role) => { setEditing(role); setForm({ name: role.name || '', code: role.code || '', description: role.description || '', dashboardKey: role.dashboardKey || 'default', permissions: role.permissions || [], isActive: role.isActive !== false }); setOpen(true); };
  const save = async () => { if (editing?._id) await api.put(`/roles/${editing._id}`, form); else await api.post('/roles', form); setOpen(false); reload(); };
  const togglePermission = (permission) => setForm((prev) => ({ ...prev, permissions: prev.permissions.includes(permission) ? prev.permissions.filter((p) => p !== permission) : [...prev.permissions, permission] }));

  const rows = roles.map((r) => ({
    title: r.name,
    name: r.name,
    code: r.code,
    permissions: r.permissions?.length ? r.permissions.join(', ') : 'All modules',
    status: () => <StatusChip label={r.isActive ? 'Active' : 'Inactive'} />,
    action: () => <Button size="small" variant="contained" onClick={() => openEdit(r)}>Edit</Button>
  }));

  return (
    <Stack spacing={2}>
      <Card><CardContent><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}><Box><Typography variant="h6" fontWeight={800}>Roles & Access</Typography><Typography color="text.secondary">Choose which part of the app each role can open.</Typography></Box><Stack direction="row" spacing={1}><ToggleButtonGroup exclusive size="small" value={viewMode} onChange={(_, v) => v && setViewMode(v)}><ToggleButton value="card"><ViewModuleIcon fontSize="small" /></ToggleButton><ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton></ToggleButtonGroup><Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Role</Button></Stack></Stack></CardContent></Card>
      {viewMode === 'card' ? <Grid container spacing={2}>{roles.map((r) => <Grid key={r._id} size={{ xs: 12, md: 6, xl: 4 }}><Card><CardContent><Stack spacing={1.2}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="h6" fontWeight={800}>{r.name}</Typography><Typography color="text.secondary">{r.code}</Typography></Box><StatusChip label={r.isActive ? 'Active' : 'Inactive'} /></Stack><Typography variant="body2">{r.description || 'No description'}</Typography><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{(r.permissions || []).length ? r.permissions.map((p) => <Chip key={p} label={p} size="small" />) : <Chip label="All modules" color="success" size="small" variant="outlined" />}</Stack><Stack direction="row" justifyContent="flex-end"><Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(r)}>Edit</Button></Stack></Stack></CardContent></Card></Grid>)}</Grid> : <ResponsiveTable columns={[{ key: 'name', label: 'Role' },{ key: 'code', label: 'Code' },{ key: 'permissions', label: 'Access' },{ key: 'status', label: 'Status' },{ key: 'action', label: 'Action' }]} rows={rows} mobileTitleKey="title" />}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md"><DialogTitle>{editing ? 'Edit role' : 'Add role'}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><Grid container spacing={2}><Grid size={{ xs: 12, md: 6 }}><TextField label="Role name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid><Grid size={{ xs: 12, md: 6 }}><TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Grid><Grid size={{ xs: 12 }}><TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid></Grid><Box><Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Module Access</Typography><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{permissionsList.map((item) => <Chip key={item.value} clickable label={item.label} color={form.permissions.includes(item.value) ? 'primary' : 'default'} variant={form.permissions.includes(item.value) ? 'filled' : 'outlined'} onClick={() => togglePermission(item.value)} />)}<Chip clickable label="All Modules" color={form.permissions.includes('*') ? 'success' : 'default'} variant={form.permissions.includes('*') ? 'filled' : 'outlined'} onClick={() => setForm((prev) => ({ ...prev, permissions: prev.permissions.includes('*') ? [] : ['*'] }))} /></Stack></Box><TextField select label="Status" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}><MenuItem value="true">Active</MenuItem><MenuItem value="false">Inactive</MenuItem></TextField><Stack direction="row" justifyContent="flex-end" spacing={1}><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save}>{editing ? 'Update Role' : 'Save Role'}</Button></Stack></Stack></DialogContent></Dialog>
    </Stack>
  );
}

function SimpleCrudTab({ title, subtitle, items, fields, endpoint, reload }) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [editing, setEditing] = useState(null);
  const initial = useMemo(() => Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ''])), [fields]);
  const [form, setForm] = useState(initial);
  const openAdd = () => { setEditing(null); setForm(initial); setOpen(true); };
  const openEdit = (item) => { setEditing(item); const next = { ...initial }; fields.forEach((field) => { next[field.key] = item[field.key] ?? field.defaultValue ?? ''; }); setForm(next); setOpen(true); };
  const save = async () => { if (editing?._id) await api.put(`${endpoint}/${editing._id}`, form); else await api.post(endpoint, form); setOpen(false); reload(); };
  const rows = items.map((item) => { const row = { title: item[fields[0].key] || 'Record' }; fields.forEach((field) => { row[field.key] = item[field.key] ?? '-'; }); row.action = () => <Button size="small" variant="contained" onClick={() => openEdit(item)}>Edit</Button>; return row; });
  return <Stack spacing={2}><Card><CardContent><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}><Box><Typography variant="h6" fontWeight={800}>{title}</Typography><Typography color="text.secondary">{subtitle}</Typography></Box><Stack direction="row" spacing={1}><ToggleButtonGroup exclusive size="small" value={viewMode} onChange={(_, v) => v && setViewMode(v)}><ToggleButton value="card"><ViewModuleIcon fontSize="small" /></ToggleButton><ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton></ToggleButtonGroup><Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add</Button></Stack></Stack></CardContent></Card>{viewMode === 'card' ? <Grid container spacing={2}>{items.map((item) => <Grid key={item._id} size={{ xs: 12, md: 6, xl: 4 }}><Card><CardContent><Stack spacing={1.2}>{fields.map((field, index) => index === 0 ? <Typography key={field.key} variant="h6" fontWeight={800}>{item[field.key] || '-'}</Typography> : <Typography key={field.key} variant="body2"><strong>{field.label}:</strong> {item[field.key] || '-'}</Typography>)}<Stack direction="row" justifyContent="flex-end"><Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(item)}>Edit</Button></Stack></Stack></CardContent></Card></Grid>)}</Grid> : <ResponsiveTable columns={[...fields.map((field) => ({ key: field.key, label: field.label })), { key: 'action', label: 'Action' }]} rows={rows} mobileTitleKey="title" />}<Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{editing ? 'Edit' : 'Add'} {title}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>{fields.map((field) => field.type === 'select' ? <TextField key={field.key} select label={field.label} value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}>{(field.options || []).map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField> : <TextField key={field.key} label={field.label} type={field.type || 'text'} multiline={field.multiline} minRows={field.multiline ? 3 : undefined} value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />)}<Stack direction="row" justifyContent="flex-end" spacing={1}><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></Stack></Stack></DialogContent></Dialog></Stack>;
}

export default function AdminPage() {
  const [tab, setTab] = useState('users');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);

  const load = async () => {
    const [r, u, t, a] = await Promise.all([api.get('/roles'), api.get('/users'), api.get('/certificate-templates'), api.get('/automation-rules')]);
    setRoles(Array.isArray(r.data) ? r.data : []);
    setUsers(Array.isArray(u.data) ? u.data : []);
    setTemplates(Array.isArray(t.data) ? t.data : []);
    setRules(Array.isArray(a.data) ? a.data : []);
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader title="Admin & Access" subtitle="Super admin can control users, roles, automation and templates from one place." chips={[{ label: `${users.length} Users` }, { label: `${roles.length} Roles` }, { label: `${templates.length} Templates` }]} />
      <Card sx={{ mb: 2 }}><CardContent><Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"><Tab value="users" label="Users" /><Tab value="roles" label="Roles & Access" /><Tab value="automation" label="Automation" /><Tab value="templates" label="Templates" /></Tabs></CardContent></Card>
      {tab === 'users' && <UsersTab roles={roles} users={users} reload={load} />}
      {tab === 'roles' && <RolesTab roles={roles} reload={load} />}
      {tab === 'automation' && <SimpleCrudTab title="Automation Rules" subtitle="Create and edit automation rules." items={rules} endpoint="/automation-rules" reload={load} fields={[{ key: 'name', label: 'Rule Name' }, { key: 'triggerKey', label: 'Trigger Key' }, { key: 'templateName', label: 'Template Name' }, { key: 'recipientType', label: 'Recipient Type', defaultValue: 'Student' }, { key: 'conditionText', label: 'Condition', multiline: true }]} />}
      {tab === 'templates' && <SimpleCrudTab title="Certificate Templates" subtitle="Manage template records and type mapping." items={templates} endpoint="/certificate-templates" reload={load} fields={[{ key: 'name', label: 'Template Name' }, { key: 'type', label: 'Type', type: 'select', options: ['STUDENT_AWARD','GUEST_THANK_YOU','VOLUNTEER_APPRECIATION','TEAM_APPRECIATION'].map((v) => ({ value: v, label: v })) }, { key: 'backgroundUrl', label: 'Background URL' }]} />}
    </>
  );
}
