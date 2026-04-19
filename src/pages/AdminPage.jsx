import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, MenuItem, Tab, Tabs, TextField, Typography } from '@mui/material';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

const userInitial = { name: '', username: '', password: '', roleId: '', eventDutyType: 'NONE', availabilityStatus: 'AVAILABLE' };
const templateInitial = { name: '', type: 'STUDENT_AWARD' };
const ruleInitial = { name: '', triggerKey: '', templateName: '', recipientType: 'Student', isActive: true };

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]); const [roles, setRoles] = useState([]); const [templates, setTemplates] = useState([]); const [rules, setRules] = useState([]);
  const [userForm, setUserForm] = useState(userInitial); const [templateForm, setTemplateForm] = useState(templateInitial); const [ruleForm, setRuleForm] = useState(ruleInitial);
  const load = async () => { const [u, r, t, a] = await Promise.all([api.get('/users'), api.get('/roles'), api.get('/certificate-templates'), api.get('/automation-rules')]); setUsers(u.data); setRoles(r.data); setTemplates(t.data); setRules(a.data); };
  useEffect(() => { load(); }, []);
  const addUser = async (e) => { e.preventDefault(); await api.post('/users', userForm); setUserForm(userInitial); load(); };
  const addTemplate = async (e) => { e.preventDefault(); await api.post('/certificate-templates', templateForm); setTemplateForm(templateInitial); load(); };
  const addRule = async (e) => { e.preventDefault(); await api.post('/automation-rules', ruleForm); setRuleForm(ruleInitial); load(); };

  return <Box>
    <SectionTitle title="Admin & Settings" subtitle="Manage users, role metadata, certificate templates, and automation rules." />
    <Card sx={{ mb: 2 }}><CardContent><Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable"><Tab label="Users" /><Tab label="Roles" /><Tab label="Templates" /><Tab label="Automation Rules" /></Tabs></CardContent></Card>

    {tab === 0 && <Grid container spacing={2}><Grid item xs={12} md={5}><Card component="form" onSubmit={addUser}><CardContent><Typography variant="h6" gutterBottom>Create User</Typography><Grid container spacing={1}><Grid item xs={12}><TextField label="Name" value={userForm.name} onChange={(e)=>setUserForm({...userForm,name:e.target.value})} /></Grid><Grid item xs={12}><TextField label="Username" value={userForm.username} onChange={(e)=>setUserForm({...userForm,username:e.target.value})} /></Grid><Grid item xs={12}><TextField label="Password" type="password" value={userForm.password} onChange={(e)=>setUserForm({...userForm,password:e.target.value})} /></Grid><Grid item xs={12}><TextField select label="Role" value={userForm.roleId} onChange={(e)=>setUserForm({...userForm,roleId:e.target.value})}><MenuItem value="">Select</MenuItem>{roles.map((r)=><MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}</TextField></Grid><Grid item xs={6}><TextField label="Duty type" value={userForm.eventDutyType} onChange={(e)=>setUserForm({...userForm,eventDutyType:e.target.value})} /></Grid><Grid item xs={6}><TextField select label="Availability" value={userForm.availabilityStatus} onChange={(e)=>setUserForm({...userForm,availabilityStatus:e.target.value})}>{['AVAILABLE','BUSY','EXPECTED','ARRIVED_EARLY','LEFT_VENUE'].map((x)=><MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid><Grid item xs={12}><Button variant="contained" type="submit">Add User</Button></Grid></Grid></CardContent></Card></Grid><Grid item xs={12} md={7}><DataTable headers={['Name','Username','Role','Duty','Status']} rows={users.map((u)=>[u.name,u.username,u.roleId?.name||'-',u.eventDutyType,u.availabilityStatus])} /></Grid></Grid>}

    {tab === 1 && <DataTable headers={['Role','Code','Dashboard']} rows={roles.map((r)=>[r.name,r.code,r.dashboardKey])} />}

    {tab === 2 && <Grid container spacing={2}><Grid item xs={12} md={4}><Card component="form" onSubmit={addTemplate}><CardContent><Typography variant="h6" gutterBottom>Certificate Template</Typography><TextField label="Template name" value={templateForm.name} onChange={(e)=>setTemplateForm({...templateForm,name:e.target.value})} sx={{ mb: 1 }} /><TextField select label="Type" value={templateForm.type} onChange={(e)=>setTemplateForm({...templateForm,type:e.target.value})}>{['STUDENT_AWARD','GUEST_THANK_YOU','VOLUNTEER_APPRECIATION','TEAM_APPRECIATION'].map((x)=><MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField><Button variant="contained" type="submit" sx={{ mt: 1 }}>Add Template</Button></CardContent></Card></Grid><Grid item xs={12} md={8}><DataTable headers={['Template','Type']} rows={templates.map((t)=>[t.name,t.type])} /></Grid></Grid>}

    {tab === 3 && <Grid container spacing={2}><Grid item xs={12} md={5}><Card component="form" onSubmit={addRule}><CardContent><Typography variant="h6" gutterBottom>Automation Rule</Typography><Grid container spacing={1}><Grid item xs={12}><TextField label="Rule name" value={ruleForm.name} onChange={(e)=>setRuleForm({...ruleForm,name:e.target.value})} /></Grid><Grid item xs={12}><TextField label="Trigger key" value={ruleForm.triggerKey} onChange={(e)=>setRuleForm({...ruleForm,triggerKey:e.target.value})} /></Grid><Grid item xs={12}><TextField label="Template name" value={ruleForm.templateName} onChange={(e)=>setRuleForm({...ruleForm,templateName:e.target.value})} /></Grid><Grid item xs={12}><TextField label="Recipient type" value={ruleForm.recipientType} onChange={(e)=>setRuleForm({...ruleForm,recipientType:e.target.value})} /></Grid><Grid item xs={12}><Button variant="contained" type="submit">Add Rule</Button></Grid></Grid></CardContent></Card></Grid><Grid item xs={12} md={7}><DataTable headers={['Rule','Trigger','Template','Recipient']} rows={rules.map((r)=>[r.name,r.triggerKey,r.templateName,r.recipientType])} /></Grid></Grid>}
  </Box>;
}
