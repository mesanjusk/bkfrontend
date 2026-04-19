import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';
import { useLive } from '../context/LiveContext';

export default function StagePage() {
  const { latestPopup, clearPopup } = useLive();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ sequenceNo: 1, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' });
  const [guestChanges, setGuestChanges] = useState({});

  const load = async () => {
    const [a, s, c, u] = await Promise.all([api.get('/stage-assignments'), api.get('/students'), api.get('/categories'), api.get('/users')]);
    setAssignments(a.data);
    setStudents(s.data);
    setCategories(c.data);
    setUsers(u.data);
    setForm((prev) => ({ ...prev, sequenceNo: a.data.length + 1 }));
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [latestPopup?.at]);

  const createAssignment = async (e) => {
    e.preventDefault();
    await api.post('/stage-assignments', form);
    setForm({ sequenceNo: assignments.length + 2, studentId: '', categoryId: '', plannedGuestId: '', teamMemberId: '', volunteerId: '' });
    load();
  };

  const generate = async () => { await api.post('/stage-assignments/generate-from-eligible'); load(); };
  const updateStatus = async (id, status) => { await api.post(`/stage-assignments/${id}/status`, { status }); load(); };
  const changeGuest = async (id) => {
    const actualGuestId = guestChanges[id];
    if (!actualGuestId) return;
    await api.post(`/stage-assignments/${id}/change-guest`, { actualGuestId, changeReason: 'Changed live by senior team because scheduled guest not available' });
    load();
  };

  return (
    <div className="page">
      <SectionTitle title="Live Stage Control" subtitle="Eligible students enter sequence, category anchor is fixed, guest can be changed live and anchor gets popup." />
      {latestPopup ? (
        <div className="panel warning-panel">
          <div className="row between"><strong>{latestPopup.payload?.title || 'Live popup'}</strong><button onClick={clearPopup}>Dismiss</button></div>
          <div>{latestPopup.payload?.message}</div>
        </div>
      ) : null}

      <div className="action-row mb12">
        <button className="primary" onClick={generate}>Generate from eligible students</button>
      </div>

      <form className="panel form-grid" onSubmit={createAssignment}>
        <input type="number" placeholder="Sequence" value={form.sequenceNo} onChange={(e) => setForm({ ...form, sequenceNo: Number(e.target.value) })} />
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
          {users.filter((u) => ['TEAM_LEADER', 'ADMIN', 'SENIOR_TEAM'].includes(u.eventDutyType)).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select value={form.volunteerId} onChange={(e) => setForm({ ...form, volunteerId: e.target.value })}>
          <option value="">Volunteer</option>
          {users.filter((u) => u.eventDutyType === 'VOLUNTEER').map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <button type="submit">Create Assignment</button>
      </form>

      <DataTable
        headers={['Seq', 'Student', 'Category', 'Anchor', 'Guest', 'Counts', 'Status', 'Live Action']}
        rows={assignments.map((a) => [
          a.sequenceNo,
          a.studentId?.fullName,
          a.categoryId?.title,
          a.actualAnchorId?.name || a.plannedAnchorId?.name || '-',
          <div key={`${a._id}-guest`} className="stack gap8">
            <div>Planned: {a.plannedGuestId?.name || '-'}</div>
            <div>Actual: {a.actualGuestId?.name || '-'}</div>
            <select value={guestChanges[a._id] || ''} onChange={(e) => setGuestChanges({ ...guestChanges, [a._id]: e.target.value })}>
              <option value="">Change guest</option>
              {users.filter((u) => u.eventDutyType === 'GUEST').map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <button onClick={() => changeGuest(a._id)}>Apply guest change</button>
          </div>,
          `Guest ${(a.actualGuestId?.stageCounts?.guestAwards) || 0} / Team ${(a.teamMemberId?.stageCounts?.teamAssignments) || 0} / Vol ${(a.volunteerId?.stageCounts?.volunteerAssignments) || 0}`,
          <span className="pill">{a.status}</span>,
          <div className="action-row" key={`${a._id}-status`}>
            <button onClick={() => updateStatus(a._id, 'CALLED')}>Called</button>
            <button onClick={() => updateStatus(a._id, 'ON_STAGE')}>On Stage</button>
            <button className="primary" onClick={() => updateStatus(a._id, 'COMPLETED')}>Complete</button>
          </div>
        ])}
      />
    </div>
  );
}
