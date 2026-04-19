import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Grid, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [userForm, setUserForm] = useState({ name: '', username: '', password: '', roleId: '', eventDutyType: 'ADMIN' });
  const [roleForm, setRoleForm] = useState({ name: '', code: '' });
  const [ruleForm, setRuleForm] = useState({ name: '', triggerKey: '', templateName: '', recipientType: 'Student', isActive: true });
  const load = async () => {
    const [r, u, t, a] = await Promise.all([api.get('/roles'), api.get('/users'), api.get('/certificate-templates'), api.get('/automation-rules')]);
    setRoles(r.data); setUsers(u.data); setTemplates(t.data); setRules(a.data);
  };
  useEffect(() => { load(); }, []);
  const saveRole = async (e) => { e.preventDefault(); await api.post('/roles', roleForm); setRoleForm({ name: '', code: '' }); load(); };
  const saveUser = async (e) => { e.preventDefault(); await api.post('/users', userForm); setUserForm({ name: '', username: '', password: '', roleId: '', eventDutyType: 'ADMIN' }); load(); };
  const saveRule = async (e) => { e.preventDefault(); await api.post('/automation-rules', ruleForm); setRuleForm({ name: '', triggerKey: '', templateName: '', recipientType: 'Student', isActive: true }); load(); };

  return (
    <>
      <PageHeader title="Admin & settings" subtitle="Users, roles, automation rules and certificate templates." />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ mb: 2 }}>
        <Tab label="Users" /><Tab label="Roles" /><Tab label="Automation" /><Tab label="Templates" />
      </Tabs>
      {tab === 0 && <Grid container spacing={2}><Grid size={{ xs: 12, lg: 4 }}><Card component="form" onSubmit={saveUser}><CardContent><Stack spacing={2}><Typography variant="h6">Add user</Typography><TextField label="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /><TextField label="Username" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} /><TextField label="Password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /><TextField select label="Role" value={userForm.roleId} onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}>{roles.map((r) => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}</TextField><TextField label="Duty" value={userForm.eventDutyType} onChange={(e) => setUserForm({ ...userForm, eventDutyType: e.target.value })} /><Button variant="contained" type="submit">Save user</Button></Stack></CardContent></Card></Grid><Grid size={{ xs: 12, lg: 8 }}><ResponsiveTable columns={[{ key:'name', label:'Name' },{ key:'username', label:'Username' },{ key:'role', label:'Role' },{ key:'duty', label:'Duty' },{ key:'status', label:'Status' }]} rows={users.map((u)=>({ title:u.name, name:u.name, username:u.username, role:u.roleId?.name||'-', duty:u.eventDutyType||'-', status:()=> <StatusChip label={u.isActive ? 'Selected' : 'Rejected'} /> }))} mobileTitleKey="title" /></Grid></Grid>}
      {tab === 1 && <Grid container spacing={2}><Grid size={{ xs: 12, lg: 4 }}><Card component="form" onSubmit={saveRole}><CardContent><Stack spacing={2}><Typography variant="h6">Add role</Typography><TextField label="Name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} /><TextField label="Code" value={roleForm.code} onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })} /><Button variant="contained" type="submit">Save role</Button></Stack></CardContent></Card></Grid><Grid size={{ xs: 12, lg: 8 }}><ResponsiveTable columns={[{ key:'name', label:'Role' },{ key:'code', label:'Code' },{ key:'dashboardKey', label:'Dashboard key' }]} rows={roles.map((r)=>({ title:r.name, name:r.name, code:r.code, dashboardKey:r.dashboardKey||'-' }))} mobileTitleKey="title" /></Grid></Grid>}
      {tab === 2 && <Grid container spacing={2}><Grid size={{ xs: 12, lg: 4 }}><Card component="form" onSubmit={saveRule}><CardContent><Stack spacing={2}><Typography variant="h6">Add automation rule</Typography><TextField label="Name" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} /><TextField label="Trigger key" value={ruleForm.triggerKey} onChange={(e) => setRuleForm({ ...ruleForm, triggerKey: e.target.value })} /><TextField label="Template name" value={ruleForm.templateName} onChange={(e) => setRuleForm({ ...ruleForm, templateName: e.target.value })} /><TextField label="Recipient type" value={ruleForm.recipientType} onChange={(e) => setRuleForm({ ...ruleForm, recipientType: e.target.value })} /><Button variant="contained" type="submit">Save rule</Button></Stack></CardContent></Card></Grid><Grid size={{ xs: 12, lg: 8 }}><ResponsiveTable columns={[{ key:'name', label:'Rule' },{ key:'trigger', label:'Trigger' },{ key:'template', label:'Template' },{ key:'recipient', label:'Recipient' }]} rows={rules.map((r)=>({ title:r.name, name:r.name, trigger:r.triggerKey, template:r.templateName, recipient:r.recipientType }))} mobileTitleKey="title" /></Grid></Grid>}
      {tab === 3 && <ResponsiveTable columns={[{ key:'name', label:'Template' },{ key:'type', label:'Type' }]} rows={templates.map((t)=>({ title:t.name, name:t.name, type:t.type }))} mobileTitleKey="title" />}
    </>
  );
}
