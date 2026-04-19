import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', board: '', className: '', minPercentage: 0, calculationMethod: 'DIRECT_PERCENTAGE', anchorId: '' });

  const load = async () => {
    const [c, u] = await Promise.all([api.get('/categories'), api.get('/users')]);
    setCategories(c.data);
    setUsers(u.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/categories', form);
    setForm({ title: '', board: '', className: '', minPercentage: 0, calculationMethod: 'DIRECT_PERCENTAGE', anchorId: '' });
    load();
  };

  const rows = categories.map((c) => [
    c.title,
    c.board,
    c.className,
    c.minPercentage,
    c.calculationMethod,
    c.anchorId?.name || '-'
  ]);

  const anchors = users.filter((u) => u.eventDutyType === 'ANCHOR');

  return (
    <div className="page">
      <h2>Categories</h2>
      <form className="panel form-grid" onSubmit={submit}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} />
        <input placeholder="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
        <input type="number" placeholder="Min %" value={form.minPercentage} onChange={(e) => setForm({ ...form, minPercentage: Number(e.target.value) })} />
        <select value={form.calculationMethod} onChange={(e) => setForm({ ...form, calculationMethod: e.target.value })}>
          <option value="DIRECT_PERCENTAGE">Direct Percentage</option>
          <option value="BEST_5">CBSE Best 5</option>
        </select>
        <select value={form.anchorId} onChange={(e) => setForm({ ...form, anchorId: e.target.value })}>
          <option value="">Select anchor</option>
          {anchors.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <button type="submit">Add Category</button>
      </form>

      <DataTable headers={['Title', 'Board', 'Class', 'Min %', 'Method', 'Anchor']} rows={rows} />
    </div>
  );
}
