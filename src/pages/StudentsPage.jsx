import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    fullName: '', schoolName: '', board: '', className: '', percentage: 0, gender: 'Any'
  });

  const load = () => api.get('/students').then((r) => setStudents(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/students', form);
    setForm({ fullName: '', schoolName: '', board: '', className: '', percentage: 0, gender: 'Any' });
    load();
  };

  const evaluate = async (id) => {
    await api.post(`/students/${id}/evaluate`);
    load();
  };

  const rows = students.map((s) => [
    s.fullName,
    s.board,
    s.className,
    s.percentage,
    s.status,
    (s.matchedCategoryIds || []).map((c) => c.title).join(', '),
    <button onClick={() => evaluate(s._id)}>Evaluate</button>
  ]);

  return (
    <div className="page">
      <h2>Students</h2>
      <form className="panel form-grid" onSubmit={submit}>
        <input placeholder="Student name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input placeholder="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
        <input placeholder="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} />
        <input placeholder="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
        <input type="number" placeholder="Percentage" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} />
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option>Any</option><option>Male</option><option>Female</option>
        </select>
        <button type="submit">Add Student</button>
      </form>

      <DataTable headers={['Name', 'Board', 'Class', '%', 'Status', 'Matched Categories', 'Action']} rows={rows} />
    </div>
  );
}
