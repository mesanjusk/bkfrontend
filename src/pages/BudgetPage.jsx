import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

const budgetInitial = { title: '', code: '', allowedBudget: 0, expectedCost: 0, responsibleTeamId: '', responsibleUserId: '' };
const vendorInitial = { name: '', vendorType: '', budgetHeadId: '', responsibleTeamId: '', responsibleUserId: '', quotedAmount: 0, finalAmount: 0, dueAmount: 0 };
const expenseInitial = { title: '', expenseType: 'DIRECT', amount: 0, paymentMode: 'CASH', budgetHeadId: '', vendorId: '', paidByUserId: '', approvedByUserId: '' };

export default function BudgetPage() {
  const [heads, setHeads] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [budgetForm, setBudgetForm] = useState(budgetInitial);
  const [vendorForm, setVendorForm] = useState(vendorInitial);
  const [expenseForm, setExpenseForm] = useState(expenseInitial);

  const load = async () => {
    const [h, v, e, t, u] = await Promise.all([api.get('/budget-heads'), api.get('/vendors'), api.get('/expenses'), api.get('/teams'), api.get('/users')]);
    setHeads(h.data); setVendors(v.data); setExpenses(e.data); setTeams(t.data); setUsers(u.data);
  };
  useEffect(() => { load(); }, []);

  const totals = useMemo(() => ({
    allowed: heads.reduce((a, x) => a + (x.allowedBudget || 0), 0),
    expected: heads.reduce((a, x) => a + (x.expectedCost || 0), 0),
    actual: heads.reduce((a, x) => a + (x.actualExpense || 0), 0),
    due: vendors.reduce((a, x) => a + (x.dueAmount || 0), 0)
  }), [heads, vendors]);

  const createBudget = async (e) => { e.preventDefault(); await api.post('/budget-heads', budgetForm); setBudgetForm(budgetInitial); load(); };
  const createVendor = async (e) => { e.preventDefault(); await api.post('/vendors', vendorForm); setVendorForm(vendorInitial); load(); };
  const createExpense = async (e) => { e.preventDefault(); await api.post('/expenses', expenseForm); setExpenseForm(expenseInitial); load(); };

  return (
    <div className="page">
      <SectionTitle title="Budget vs Actual + Vendors + Expense Tracking" subtitle="Allowed budget, actual expense, pending dues and vendor ownership stay visible through the event lifecycle." />
      <div className="grid">
        <div className="card"><div className="muted">Allowed Budget</div><div className="big">₹{totals.allowed}</div></div>
        <div className="card"><div className="muted">Expected Cost</div><div className="big">₹{totals.expected}</div></div>
        <div className="card"><div className="muted">Actual Expense</div><div className="big">₹{totals.actual}</div></div>
        <div className="card"><div className="muted">Pending Due</div><div className="big">₹{totals.due}</div></div>
      </div>

      <div className="grid two mt16">
        <form className="panel stack gap12" onSubmit={createBudget}>
          <h3>Budget Head</h3>
          <div className="form-grid">
            <input placeholder="Title" value={budgetForm.title} onChange={(e) => setBudgetForm({ ...budgetForm, title: e.target.value })} />
            <input placeholder="Code" value={budgetForm.code} onChange={(e) => setBudgetForm({ ...budgetForm, code: e.target.value })} />
            <input type="number" placeholder="Allowed" value={budgetForm.allowedBudget} onChange={(e) => setBudgetForm({ ...budgetForm, allowedBudget: Number(e.target.value) })} />
            <input type="number" placeholder="Expected" value={budgetForm.expectedCost} onChange={(e) => setBudgetForm({ ...budgetForm, expectedCost: Number(e.target.value) })} />
            <select value={budgetForm.responsibleTeamId} onChange={(e) => setBudgetForm({ ...budgetForm, responsibleTeamId: e.target.value })}><option value="">Team</option>{teams.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select>
            <select value={budgetForm.responsibleUserId} onChange={(e) => setBudgetForm({ ...budgetForm, responsibleUserId: e.target.value })}><option value="">User</option>{users.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select>
          </div>
          <button className="primary" type="submit">Add Budget Head</button>
        </form>

        <form className="panel stack gap12" onSubmit={createVendor}>
          <h3>Vendor</h3>
          <div className="form-grid">
            <input placeholder="Vendor name" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} />
            <input placeholder="Vendor type" value={vendorForm.vendorType} onChange={(e) => setVendorForm({ ...vendorForm, vendorType: e.target.value })} />
            <select value={vendorForm.budgetHeadId} onChange={(e) => setVendorForm({ ...vendorForm, budgetHeadId: e.target.value })}><option value="">Budget head</option>{heads.map((x) => <option key={x._id} value={x._id}>{x.title}</option>)}</select>
            <select value={vendorForm.responsibleTeamId} onChange={(e) => setVendorForm({ ...vendorForm, responsibleTeamId: e.target.value })}><option value="">Team</option>{teams.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select>
            <select value={vendorForm.responsibleUserId} onChange={(e) => setVendorForm({ ...vendorForm, responsibleUserId: e.target.value })}><option value="">User</option>{users.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select>
            <input type="number" placeholder="Quoted" value={vendorForm.quotedAmount} onChange={(e) => setVendorForm({ ...vendorForm, quotedAmount: Number(e.target.value) })} />
            <input type="number" placeholder="Final" value={vendorForm.finalAmount} onChange={(e) => setVendorForm({ ...vendorForm, finalAmount: Number(e.target.value) })} />
            <input type="number" placeholder="Due" value={vendorForm.dueAmount} onChange={(e) => setVendorForm({ ...vendorForm, dueAmount: Number(e.target.value) })} />
          </div>
          <button className="primary" type="submit">Add Vendor</button>
        </form>
      </div>

      <form className="panel stack gap12 mt16" onSubmit={createExpense}>
        <h3>Expense Entry</h3>
        <div className="form-grid">
          <input placeholder="Title" value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} />
          <select value={expenseForm.expenseType} onChange={(e) => setExpenseForm({ ...expenseForm, expenseType: e.target.value })}><option value="VENDOR">Vendor</option><option value="DIRECT">Direct</option><option value="EMERGENCY">Emergency</option><option value="TEAM_PURCHASE">Team Purchase</option></select>
          <input type="number" placeholder="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} />
          <select value={expenseForm.paymentMode} onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}><option>CASH</option><option>UPI</option><option>BANK</option><option>CHEQUE</option><option>OTHER</option></select>
          <select value={expenseForm.budgetHeadId} onChange={(e) => setExpenseForm({ ...expenseForm, budgetHeadId: e.target.value })}><option value="">Budget head</option>{heads.map((x) => <option key={x._id} value={x._id}>{x.title}</option>)}</select>
          <select value={expenseForm.vendorId} onChange={(e) => setExpenseForm({ ...expenseForm, vendorId: e.target.value })}><option value="">Vendor</option>{vendors.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select>
          <select value={expenseForm.paidByUserId} onChange={(e) => setExpenseForm({ ...expenseForm, paidByUserId: e.target.value })}><option value="">Paid by</option>{users.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select>
          <select value={expenseForm.approvedByUserId} onChange={(e) => setExpenseForm({ ...expenseForm, approvedByUserId: e.target.value })}><option value="">Approved by</option>{users.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select>
        </div>
        <button className="primary" type="submit">Record Expense</button>
      </form>

      <div className="grid two mt16">
        <div className="panel">
          <h3>Budget heads</h3>
          <DataTable headers={['Head', 'Allowed', 'Expected', 'Actual', 'Responsible']} rows={heads.map((x) => [x.title, x.allowedBudget, x.expectedCost, x.actualExpense || 0, x.responsibleUserId?.name || x.responsibleTeamId?.name || '-'])} />
        </div>
        <div className="panel">
          <h3>Vendors</h3>
          <DataTable headers={['Vendor', 'Type', 'Quoted', 'Advance', 'Due', 'Status']} rows={vendors.map((x) => [x.name, x.vendorType, x.quotedAmount || 0, x.advancePaid || 0, x.dueAmount || 0, x.paymentStatus])} />
        </div>
      </div>
    </div>
  );
}
