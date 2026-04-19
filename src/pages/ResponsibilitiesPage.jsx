import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Grid2 as Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';

export default function ResponsibilitiesPage() {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [teamForm, setTeamForm] = useState({ name: '', code: '', purpose: '', leadUserId: '' });
  const [taskForm, setTaskForm] = useState({ title: '', teamId: '', assignedToUserId: '', backupUserId: '', linkedVendorId: '', priority: 'MEDIUM', status: 'PENDING', startTimeLabel: '', deadlineLabel: '', notes: '' });
  const load = async () => {
    const [t, tk, u, v] = await Promise.all([api.get('/teams'), api.get('/event-tasks'), api.get('/users'), api.get('/vendors')]);
    setTeams(t.data); setTasks(tk.data); setUsers(u.data); setVendors(v.data);
  };
  useEffect(() => { load(); }, []);
  const saveTeam = async (e) => { e.preventDefault(); await api.post('/teams', teamForm); setTeamForm({ name: '', code: '', purpose: '', leadUserId: '' }); load(); };
  const saveTask = async (e) => { e.preventDefault(); await api.post('/event-tasks', taskForm); setTaskForm({ title: '', teamId: '', assignedToUserId: '', backupUserId: '', linkedVendorId: '', priority: 'MEDIUM', status: 'PENDING', startTimeLabel: '', deadlineLabel: '', notes: '' }); load(); };

  return (
    <>
      <PageHeader title="Responsibilities & task board" subtitle="Team leads, task ownership, backup owner and vendor-linked event responsibilities." />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}><Card component="form" onSubmit={saveTeam}><CardContent><Stack spacing={2}><Typography variant="h6">Create team</Typography><TextField label="Team name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /><TextField label="Code" value={teamForm.code} onChange={(e) => setTeamForm({ ...teamForm, code: e.target.value })} /><TextField label="Purpose" value={teamForm.purpose} onChange={(e) => setTeamForm({ ...teamForm, purpose: e.target.value })} /><TextField select label="Lead" value={teamForm.leadUserId} onChange={(e) => setTeamForm({ ...teamForm, leadUserId: e.target.value })}>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField><Button type="submit" variant="contained">Save team</Button></Stack></CardContent></Card></Grid>
        <Grid size={{ xs: 12, lg: 8 }}><ResponsiveTable columns={[{ key:'name', label:'Team' },{ key:'purpose', label:'Purpose' },{ key:'lead', label:'Lead' }]} rows={teams.map((t)=>({ title:t.name, name:t.name, purpose:t.purpose||'-', lead:t.leadUserId?.name||'-' }))} mobileTitleKey="title" /></Grid>
        <Grid size={{ xs: 12, lg: 5 }}><Card component="form" onSubmit={saveTask}><CardContent><Stack spacing={2}><Typography variant="h6">Add task</Typography><TextField label="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /><TextField select label="Team" value={taskForm.teamId} onChange={(e) => setTaskForm({ ...taskForm, teamId: e.target.value })}>{teams.map((t) => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}</TextField><Grid container spacing={2}><Grid size={{ xs: 6 }}><TextField select label="Owner" value={taskForm.assignedToUserId} onChange={(e) => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })}>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid><Grid size={{ xs: 6 }}><TextField select label="Backup" value={taskForm.backupUserId} onChange={(e) => setTaskForm({ ...taskForm, backupUserId: e.target.value })}>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid></Grid><TextField select label="Linked vendor" value={taskForm.linkedVendorId} onChange={(e) => setTaskForm({ ...taskForm, linkedVendorId: e.target.value })}><MenuItem value="">No vendor</MenuItem>{vendors.map((v) => <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>)}</TextField><Grid container spacing={2}><Grid size={{ xs: 6 }}><TextField select label="Priority" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}><MenuItem value="LOW">Low</MenuItem><MenuItem value="MEDIUM">Medium</MenuItem><MenuItem value="HIGH">High</MenuItem></TextField></Grid><Grid size={{ xs: 6 }}><TextField select label="Status" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}><MenuItem value="PENDING">Pending</MenuItem><MenuItem value="IN_PROGRESS">In progress</MenuItem><MenuItem value="DONE">Done</MenuItem></TextField></Grid></Grid><TextField label="Deadline" value={taskForm.deadlineLabel} onChange={(e) => setTaskForm({ ...taskForm, deadlineLabel: e.target.value })} /><Button variant="contained" type="submit">Save task</Button></Stack></CardContent></Card></Grid>
        <Grid size={{ xs: 12, lg: 7 }}><ResponsiveTable columns={[{ key:'title', label:'Task' },{ key:'team', label:'Team' },{ key:'owner', label:'Owner' },{ key:'deadline', label:'Deadline' },{ key:'status', label:'Status' }]} rows={tasks.map((t)=>({ title:t.title, team:t.teamId?.name||'-', owner:t.assignedToUserId?.name||'-', deadline:t.deadlineLabel||'-', status:()=> <StatusChip label={t.status} /> }))} mobileTitleKey="title" /></Grid>
      </Grid>
    </>
  );
}
