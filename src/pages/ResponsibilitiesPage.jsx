import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

const teamInitial = { name: '', code: '', purpose: '', leadUserId: '', memberUserIds: [] };
const taskInitial = { title: '', teamId: '', assignedToUserId: '', backupUserId: '', linkedVendorId: '', priority: 'MEDIUM', status: 'PENDING', startTimeLabel: '', deadlineLabel: '' };

export default function ResponsibilitiesPage() {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [teamForm, setTeamForm] = useState(teamInitial);
  const [taskForm, setTaskForm] = useState(taskInitial);

  const load = async () => {
    const [t, k, u, v] = await Promise.all([api.get('/teams'), api.get('/event-tasks'), api.get('/users'), api.get('/vendors')]);
    setTeams(t.data); setTasks(k.data); setUsers(u.data); setVendors(v.data);
  };
  useEffect(() => { load(); }, []);

  const createTeam = async (e) => { e.preventDefault(); await api.post('/teams', teamForm); setTeamForm(teamInitial); load(); };
  const createTask = async (e) => { e.preventDefault(); await api.post('/event-tasks', taskForm); setTaskForm(taskInitial); load(); };
  const markDone = async (task) => { await api.put(`/event-tasks/${task._id}`, { ...task, status: 'DONE' }); load(); };

  return (
    <div className="page">
      <SectionTitle title="Team Responsibilities + Event Tasks" subtitle="Assign responsibility to teams and owners, keep backup owner, deadline and linked vendor visible." />
      <div className="grid two">
        <form className="panel stack gap12" onSubmit={createTeam}>
          <h3>Team</h3>
          <div className="form-grid">
            <input placeholder="Team name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} />
            <input placeholder="Code" value={teamForm.code} onChange={(e) => setTeamForm({ ...teamForm, code: e.target.value })} />
            <input placeholder="Purpose" value={teamForm.purpose} onChange={(e) => setTeamForm({ ...teamForm, purpose: e.target.value })} />
            <select value={teamForm.leadUserId} onChange={(e) => setTeamForm({ ...teamForm, leadUserId: e.target.value })}><option value="">Lead user</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select>
          </div>
          <button className="primary" type="submit">Add Team</button>
        </form>

        <form className="panel stack gap12" onSubmit={createTask}>
          <h3>Event Task</h3>
          <div className="form-grid">
            <input placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
            <select value={taskForm.teamId} onChange={(e) => setTaskForm({ ...taskForm, teamId: e.target.value })}><option value="">Team</option>{teams.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select>
            <select value={taskForm.assignedToUserId} onChange={(e) => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })}><option value="">Owner</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select>
            <select value={taskForm.backupUserId} onChange={(e) => setTaskForm({ ...taskForm, backupUserId: e.target.value })}><option value="">Backup</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select>
            <select value={taskForm.linkedVendorId} onChange={(e) => setTaskForm({ ...taskForm, linkedVendorId: e.target.value })}><option value="">Linked Vendor</option>{vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}</select>
            <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select>
            <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}><option>PENDING</option><option>IN_PROGRESS</option><option>DONE</option></select>
            <input placeholder="Start time" value={taskForm.startTimeLabel} onChange={(e) => setTaskForm({ ...taskForm, startTimeLabel: e.target.value })} />
            <input placeholder="Deadline" value={taskForm.deadlineLabel} onChange={(e) => setTaskForm({ ...taskForm, deadlineLabel: e.target.value })} />
          </div>
          <button className="primary" type="submit">Add Task</button>
        </form>
      </div>

      <div className="grid two mt16">
        <div className="panel">
          <h3>Teams</h3>
          <DataTable headers={['Team', 'Purpose', 'Lead']} rows={teams.map((x) => [x.name, x.purpose, x.leadUserId?.name || '-'])} />
        </div>
        <div className="panel">
          <h3>Tasks</h3>
          <DataTable headers={['Task', 'Team', 'Owner', 'Backup', 'Deadline', 'Status', 'Action']} rows={tasks.map((x) => [x.title, x.teamId?.name || '-', x.assignedToUserId?.name || '-', x.backupUserId?.name || '-', x.deadlineLabel || '-', x.status, <button onClick={() => markDone(x)}>Mark done</button>])} />
        </div>
      </div>
    </div>
  );
}
