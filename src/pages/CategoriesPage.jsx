import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

const initialForm = {
  title: '', board: '', className: '', minPercentage: 0, calculationMethod: 'DIRECT_PERCENTAGE', bestOfCount: 5,
  gender: 'Any', schoolType: 'Any', sequencePriority: 0, anchorId: '', preferredGuestIds: []
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    const [c, u] = await Promise.all([api.get('/categories'), api.get('/users')]);
    setCategories(c.data);
    setUsers(u.data);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, preferredGuestIds: form.preferredGuestIds.filter(Boolean) };
    if (selectedId) await api.put(`/categories/${selectedId}`, payload);
    else await api.post('/categories', payload);
    setForm(initialForm); setSelectedId(null); load();
  };
  const edit = (cat) => {
    setSelectedId(cat._id);
    setForm({ ...initialForm, ...cat, anchorId: cat.anchorId?._id || cat.anchorId || '', preferredGuestIds: (cat.preferredGuestIds || []).map((g) => g._id || g) });
  };

  const anchorOptions = users.filter((u) => u.eventDutyType === 'ANCHOR');
  const guestOptions = users.filter((u) => u.eventDutyType === 'GUEST');

  return (
    <div className="page">
      <SectionTitle title="Categories + Fixed Anchor Mapping" subtitle="Each category can define board/class filters, CBSE Best 5 rule, anchor and preferred guest." />
      <form className="panel stack gap12" onSubmit={submit}>
        <div className="form-grid">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} />
          <input placeholder="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
          <input type="number" placeholder="Minimum %" value={form.minPercentage} onChange={(e) => setForm({ ...form, minPercentage: Number(e.target.value) })} />
          <select value={form.calculationMethod} onChange={(e) => setForm({ ...form, calculationMethod: e.target.value })}>
            <option value="DIRECT_PERCENTAGE">Direct Percentage</option>
            <option value="BEST_5">CBSE Best 5</option>
          </select>
          <input type="number" placeholder="Best of count" value={form.bestOfCount} onChange={(e) => setForm({ ...form, bestOfCount: Number(e.target.value) })} />
          <input type="number" placeholder="Sequence Priority" value={form.sequencePriority} onChange={(e) => setForm({ ...form, sequencePriority: Number(e.target.value) })} />
          <select value={form.anchorId} onChange={(e) => setForm({ ...form, anchorId: e.target.value })}>
            <option value="">Select anchor</option>
            {anchorOptions.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        <div className="grid three">
          {guestOptions.map((guest) => (
            <label key={guest._id} className="checkrow">
              <input type="checkbox" checked={form.preferredGuestIds.includes(guest._id)} onChange={(e) => setForm({
                ...form,
                preferredGuestIds: e.target.checked ? [...form.preferredGuestIds, guest._id] : form.preferredGuestIds.filter((id) => id !== guest._id)
              })} />
              <span>{guest.name}</span>
            </label>
          ))}
        </div>
        <div className="action-row">
          <button className="primary" type="submit">{selectedId ? 'Update Category' : 'Create Category'}</button>
          <button type="button" onClick={() => { setForm(initialForm); setSelectedId(null); }}>Reset</button>
        </div>
      </form>

      <DataTable
        headers={['Title', 'Rule', 'Calc', 'Anchor', 'Preferred Guests', 'Priority', 'Actions']}
        rows={categories.map((cat) => [
          cat.title,
          `${cat.board || '-'} / ${cat.className || '-'} / min ${cat.minPercentage || 0}%`,
          cat.calculationMethod === 'BEST_5' ? `Best ${cat.bestOfCount}` : 'Direct %',
          cat.anchorId?.name || '-',
          (cat.preferredGuestIds || []).map((g) => g.name || g).join(', '),
          cat.sequencePriority || 0,
          <button onClick={() => edit(cat)}>Edit</button>
        ])}
      />
    </div>
  );
}
