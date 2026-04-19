import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function StagePage() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ sequenceNo: 1, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' });

  const load = async () => {
    const [a, s, c, u] = await Promise.all([
      api.get('/stage-assignments'),
      api.get('/students'),
      api.get('/categories'),
      api.get('/users')
    ]);
    setAssignments(a.data);
    setStudents(s.data);
    setCategories(c.data);
    setUsers(u.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/stage-assignments', form);
    setForm({ sequenceNo: 1, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' });
    load();
  };

  const quickChangeGuest = async (assignmentId) => {
    const guest = users.find((u) => u.eventDutyType === 'GUEST');
    if (!guest) return;
    await api.post(`/stage-assignments/${assignmentId}/change-guest`, {
      actualGuestId: guest._id,
      changeReason: 'Manual test change'
    });
    load();
  };

  const rows = assignments.map((a) => [
    a.sequenceNo,
    a.studentId?.fullName || '-',
    a.categoryId?.title || '-',
    a.actualAnchorId?.name || a.plannedAnchorId?.name || '-',
    a.actualGuestId?.name || a.plannedGuestId?.name || '-',
    a.teamMemberId?.name || '-',
    a.volunteerId?.name || '-',
    a.status,
    <button onClick={() => quickChangeGuest(a._id)}>Change Guest</button>
  ]);

  return (
    <div className="page">
      <h2>Stage Assignments</h2>
      <form className="panel form-grid" onSubmit={submit}>
        <input type="number" value={form.sequenceNo} onChange={(e) => setForm({ ...form, sequenceNo: Number(e.target.value) })} placeholder="Sequence No" />
        <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
          <option value="">Select Student</option>
          {students.map((s) => <option key={s._id} value={s._id}>{s.fullName}</option>)}
        </select>
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">Select Category</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
        <select value={form.plannedGuestId} onChange={(e) => setForm({ ...form, plannedGuestId: e.target.value })}>
          <option value="">Planned Guest</option>
          {users.filter((u) => u.eventDutyType === 'GUEST').map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select value={form.teamMemberId} onChange={(e) => setForm({ ...form, teamMemberId: e.target.value })}>
          <option value="">Team Member</option>
          {users.filter((u) => ['TEAM_LEADER','ADMIN','SENIOR_TEAM'].includes(u.eventDutyType)).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select value={form.volunteerId} onChange={(e) => setForm({ ...form, volunteerId: e.target.value })}>
          <option value="">Volunteer</option>
          {users.filter((u) => u.eventDutyType === 'VOLUNTEER').map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <button type="submit">Create Assignment</button>
      </form>
      <DataTable headers={['Seq', 'Student', 'Category', 'Anchor', 'Guest', 'Team', 'Volunteer', 'Status', 'Action']} rows={rows} />
    </div>
  );
}
