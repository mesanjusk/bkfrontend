import { useEffect, useMemo, useState } from 'react';
import AddTaskRounded from '@mui/icons-material/AddTaskRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Fab,
  Grid,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from '../api';
import SectionTitle from '../components/SectionTitle';
import FinanceAlertPanel from '../components/operations/FinanceAlertPanel';
import PriorityChip from '../components/operations/PriorityChip';
import ResponsiveOperationsList from '../components/operations/ResponsiveOperationsList';
import TaskBoard from '../components/operations/TaskBoard';
import TaskCard, { isOverdueTask, taskStatusUi } from '../components/operations/TaskCard';
import TeamResponsibilityCard from '../components/operations/TeamResponsibilityCard';

const teamInitial = { name: '', code: '', purpose: '', leadUserId: '', memberUserIds: [] };
const taskInitial = {
  title: '', teamId: '', assignedToUserId: '', backupUserId: '', linkedVendorId: '', priority: 'MEDIUM', status: 'PENDING', notes: '', startTimeLabel: '', deadlineLabel: '',
};

const taskStatusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DELAYED', label: 'Delayed' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'DONE', label: 'Completed' },
];

const normalizeStatusForApi = (status) => (status === 'COMPLETED' ? 'DONE' : status);

export default function ResponsibilitiesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [teamForm, setTeamForm] = useState(teamInitial);
  const [taskForm, setTaskForm] = useState(taskInitial);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [snackbar, setSnackbar] = useState('');

  const load = async () => {
    const [t, k, u, v] = await Promise.all([api.get('/teams'), api.get('/event-tasks'), api.get('/users'), api.get('/vendors')]);
    setTeams(t.data);
    setTasks(k.data);
    setUsers(u.data);
    setVendors(v.data);
  };

  useEffect(() => { load(); }, []);

  const createTeam = async (e) => {
    e.preventDefault();
    await api.post('/teams', teamForm);
    setTeamForm(teamInitial);
    setSnackbar('Team created.');
    load();
  };

  const createTask = async (e) => {
    e.preventDefault();
    await api.post('/event-tasks', { ...taskForm, status: normalizeStatusForApi(taskForm.status) });
    setTaskForm(taskInitial);
    setSnackbar('Task added to board.');
    load();
  };

  const updateTaskStatus = async (task, status) => {
    await api.put(`/event-tasks/${task._id}`, { ...task, status: normalizeStatusForApi(status) });
    setSnackbar('Task status updated.');
    load();
  };

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const text = `${task.title} ${task.notes || ''} ${task.teamId?.name || ''} ${task.assignedToUserId?.name || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const normalizedStatus = (task.status || 'PENDING').toUpperCase();
    const normalizedPriority = (task.priority || 'MEDIUM').toUpperCase();
    const matchStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter || (statusFilter === 'DONE' && ['DONE', 'COMPLETED'].includes(normalizedStatus));
    const matchPriority = priorityFilter === 'ALL' || normalizedPriority === priorityFilter;
    const matchTeam = teamFilter === 'ALL' || task.teamId?._id === teamFilter || task.teamId === teamFilter;
    const matchOverdue = overdueOnly === 'ALL' || (overdueOnly === 'YES' ? isOverdueTask(task) : !isOverdueTask(task));
    return matchesSearch && matchStatus && matchPriority && matchTeam && matchOverdue;
  }), [tasks, search, statusFilter, priorityFilter, teamFilter, overdueOnly]);

  const teamStats = useMemo(() => teams.map((team) => {
    const myTasks = tasks.filter((x) => x.teamId?._id === team._id || x.teamId === team._id);
    const myVendors = vendors.filter((x) => x.responsibleTeamId?._id === team._id || x.responsibleTeamId === team._id);
    return {
      team,
      stats: {
        memberCount: team.memberUserIds?.length || 0,
        openTasks: myTasks.filter((x) => !['DONE', 'COMPLETED'].includes((x.status || '').toUpperCase())).length,
        overdueTasks: myTasks.filter((x) => isOverdueTask(x)).length,
        vendors: myVendors.length,
      },
    };
  }), [teams, tasks, vendors]);

  const alerts = useMemo(() => {
    const overdue = filteredTasks.filter((x) => isOverdueTask(x)).length;
    const blocked = filteredTasks.filter((x) => (x.status || '').toUpperCase() === 'BLOCKED').length;
    const missingOwners = filteredTasks.filter((x) => !x.assignedToUserId).length;

    return [
      ...(overdue > 0 ? [{ severity: 'error', label: `${overdue} overdue tasks`, note: 'Review deadlines and owner updates.' }] : []),
      ...(blocked > 0 ? [{ severity: 'warning', label: `${blocked} blocked tasks`, note: 'Dependencies need escalation.' }] : []),
      ...(missingOwners > 0 ? [{ severity: 'warning', label: `${missingOwners} tasks without owner`, note: 'Assign responsible owner and backup.' }] : []),
    ];
  }, [filteredTasks]);

  return (
    <Box>
      <SectionTitle title="Responsibilities & Task Board" subtitle="Operations-first board with ownership, backup owners, deadlines, priorities, and accountability by team." />

      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Stack spacing={1.5}>
            <Card component="form" onSubmit={createTask} variant="outlined" id="task-form">
              <CardContent>
                <Typography variant="h6" gutterBottom>Create Event Task</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={3}><TextField fullWidth label="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></Grid>
                  <Grid item xs={6} md={2}><TextField fullWidth select label="Team" value={taskForm.teamId} onChange={(e) => setTaskForm({ ...taskForm, teamId: e.target.value })}><MenuItem value="">None</MenuItem>{teams.map((x) => <MenuItem key={x._id} value={x._id}>{x.name}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6} md={2}><TextField fullWidth select label="Owner" value={taskForm.assignedToUserId} onChange={(e) => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })}><MenuItem value="">None</MenuItem>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6} md={2}><TextField fullWidth select label="Backup owner" value={taskForm.backupUserId} onChange={(e) => setTaskForm({ ...taskForm, backupUserId: e.target.value })}><MenuItem value="">None</MenuItem>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6} md={3}><TextField fullWidth select label="Linked vendor" value={taskForm.linkedVendorId} onChange={(e) => setTaskForm({ ...taskForm, linkedVendorId: e.target.value })}><MenuItem value="">None</MenuItem>{vendors.map((v) => <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6} md={2}><TextField fullWidth select label="Priority" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6} md={2}><TextField fullWidth select label="Status" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>{taskStatusOptions.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6} md={2}><TextField fullWidth label="Start" value={taskForm.startTimeLabel} onChange={(e) => setTaskForm({ ...taskForm, startTimeLabel: e.target.value })} /></Grid>
                  <Grid item xs={6} md={2}><TextField fullWidth label="Deadline" value={taskForm.deadlineLabel} onChange={(e) => setTaskForm({ ...taskForm, deadlineLabel: e.target.value })} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Notes" value={taskForm.notes} onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })} /></Grid>
                  <Grid item xs={12}><Button type="submit" variant="contained">Add task</Button></Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card component="form" onSubmit={createTeam} variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Team Responsibility Setup</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={3}><TextField fullWidth label="Team name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></Grid>
                  <Grid item xs={6} md={2}><TextField fullWidth label="Code" value={teamForm.code} onChange={(e) => setTeamForm({ ...teamForm, code: e.target.value })} /></Grid>
                  <Grid item xs={6} md={4}><TextField fullWidth label="Purpose" value={teamForm.purpose} onChange={(e) => setTeamForm({ ...teamForm, purpose: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField fullWidth select label="Lead user" value={teamForm.leadUserId} onChange={(e) => setTeamForm({ ...teamForm, leadUserId: e.target.value })}><MenuItem value="">None</MenuItem>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12}><Button type="submit" variant="outlined">Add team</Button></Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} mb={1.5} useFlexGap flexWrap="wrap">
                  <TextField size="small" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} sx={{ minWidth: { md: 260 } }} />
                  <TextField size="small" select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: { md: 140 } }}>{['ALL', 'PENDING', 'IN_PROGRESS', 'DELAYED', 'BLOCKED', 'DONE'].map((x) => <MenuItem key={x} value={x}>{x === 'DONE' ? 'COMPLETED' : x}</MenuItem>)}</TextField>
                  <TextField size="small" select label="Priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} sx={{ minWidth: { md: 140 } }}>{['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField>
                  <TextField size="small" select label="Team" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} sx={{ minWidth: { md: 140 } }}><MenuItem value="ALL">All</MenuItem>{teams.map((x) => <MenuItem key={x._id} value={x._id}>{x.name}</MenuItem>)}</TextField>
                  <TextField size="small" select label="Overdue" value={overdueOnly} onChange={(e) => setOverdueOnly(e.target.value)} sx={{ minWidth: { md: 120 } }}><MenuItem value="ALL">All</MenuItem><MenuItem value="YES">Only overdue</MenuItem><MenuItem value="NO">Not overdue</MenuItem></TextField>
                </Stack>
                {isMobile ? (
                  <ResponsiveOperationsList items={filteredTasks} mobileRender={(task) => <TaskCard key={task._id} task={task} onClick={setSelectedTask} />} desktopRender={() => null} />
                ) : (
                  <TaskBoard tasks={filteredTasks} onOpenTask={setSelectedTask} />
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Team Accountability</Typography>
                <ResponsiveOperationsList
                  items={teamStats}
                  mobileRender={(item) => <TeamResponsibilityCard key={item.team._id} team={item.team} stats={item.stats} onOpen={setSelectedTeam} />}
                  desktopRender={(items) => items.map((item) => (
                    <Grid item xs={12} md={6} key={item.team._id}><TeamResponsibilityCard team={item.team} stats={item.stats} onOpen={setSelectedTeam} /></Grid>
                  ))}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} md={3}>
          <FinanceAlertPanel alerts={alerts} />
        </Grid>
      </Grid>

      {isMobile ? <Fab color="primary" sx={{ position: 'fixed', right: 16, bottom: 16 }} onClick={() => document.getElementById('task-form')?.scrollIntoView({ behavior: 'smooth' })}><AddTaskRounded /></Fab> : null}

      <Dialog open={Boolean(selectedTask)} onClose={() => setSelectedTask(null)} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>{selectedTask?.title}</DialogTitle>
        <DialogContent dividers>
          {selectedTask ? (
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <PriorityChip priority={selectedTask.priority} />
                <Button size="small" variant="outlined" onClick={() => updateTaskStatus(selectedTask, 'IN_PROGRESS')}>Mark In Progress</Button>
                <Button size="small" variant="contained" onClick={() => updateTaskStatus(selectedTask, 'DONE')}>Mark Completed</Button>
              </Stack>
              <Typography variant="body2">Team: {selectedTask.teamId?.name || '-'}</Typography>
              <Typography variant="body2">Owner: {selectedTask.assignedToUserId?.name || '-'}</Typography>
              <Typography variant="body2">Backup owner: {selectedTask.backupUserId?.name || '-'}</Typography>
              <Typography variant="body2">Vendor: {selectedTask.linkedVendorId?.name || '-'}</Typography>
              <Typography variant="body2">Deadline: {selectedTask.deadlineLabel || '-'}</Typography>
              <Typography variant="body2">Status: {taskStatusUi[(selectedTask.status || 'PENDING').toUpperCase()]?.label || selectedTask.status}</Typography>
              <Typography variant="body2">Notes: {selectedTask.notes || 'No notes.'}</Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="right" open={Boolean(selectedTeam)} onClose={() => setSelectedTeam(null)}>
        <Box sx={{ width: { xs: '100vw', sm: 420 }, maxWidth: '100vw', p: 2 }}>
          <Typography variant="h6">{selectedTeam?.name}</Typography>
          <Typography variant="body2" color="text.secondary">{selectedTeam?.purpose || 'No purpose added.'}</Typography>
          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            <Typography variant="body2">Lead: {selectedTeam?.leadUserId?.name || '-'}</Typography>
            <Typography variant="subtitle2">Members</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(selectedTeam?.memberUserIds || []).map((member) => (
                <Avatar key={member?._id || member} sx={{ width: 30, height: 30 }}>{member?.name?.[0] || 'U'}</Avatar>
              ))}
              {!(selectedTeam?.memberUserIds || []).length ? <Typography variant="caption">No members linked.</Typography> : null}
            </Stack>
            <Typography variant="subtitle2">Active tasks</Typography>
            <Stack spacing={1}>
              {tasks.filter((x) => (x.teamId?._id === selectedTeam?._id || x.teamId === selectedTeam?._id) && !['DONE', 'COMPLETED'].includes((x.status || '').toUpperCase())).slice(0, 6).map((task) => (
                <Card key={task._id} variant="outlined"><CardContent sx={{ py: 1 }}><Typography variant="body2">{task.title}</Typography></CardContent></Card>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Drawer>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={2400} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
