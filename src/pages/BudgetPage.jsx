import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function BudgetPage() {
  const [heads, setHeads] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/budget-heads'), api.get('/vendors'), api.get('/expenses')]).then(([h, v, e]) => {
      setHeads(h.data); setVendors(v.data); setExpenses(e.data);
    });
  }, []);

  const totals = useMemo(() => ({
    allowed: heads.reduce((a, x) => a + (x.allowedBudget || 0), 0),
    expected: heads.reduce((a, x) => a + (x.expectedCost || 0), 0),
    actual: expenses.reduce((a, x) => a + (x.amount || 0), 0)
  }), [heads, expenses]);

  return (
    <div className="page">
      <h2>Budget, Vendors and Expenses</h2>
      <div className="grid">
        <div className="card"><div className="muted">Allowed Budget</div><div className="big">₹{totals.allowed}</div></div>
        <div className="card"><div className="muted">Expected Cost</div><div className="big">₹{totals.expected}</div></div>
        <div className="card"><div className="muted">Actual Expense</div><div className="big">₹{totals.actual}</div></div>
        <div className="card"><div className="muted">Vendors</div><div className="big">{vendors.length}</div></div>
      </div>

      <div className="grid two">
        <div className="panel">
          <h3>Budget heads</h3>
          <DataTable
            headers={['Head', 'Allowed', 'Expected', 'Actual', 'Responsible Team']}
            rows={heads.map((x) => [x.title, `₹${x.allowedBudget || 0}`, `₹${x.expectedCost || 0}`, `₹${x.actualExpense || 0}`, x.responsibleTeamId?.name || '-'])}
          />
        </div>
        <div className="panel">
          <h3>Vendors</h3>
          <DataTable
            headers={['Vendor', 'Type', 'Quoted', 'Advance', 'Due', 'Status']}
            rows={vendors.map((x) => [x.name, x.vendorType, `₹${x.quotedAmount || 0}`, `₹${x.advancePaid || 0}`, `₹${x.dueAmount || 0}`, x.paymentStatus])}
          />
        </div>
      </div>

      <div className="panel">
        <h3>Expenses ledger</h3>
        <DataTable
          headers={['Title', 'Type', 'Amount', 'Budget Head', 'Vendor', 'Mode']}
          rows={expenses.map((x) => [x.title, x.expenseType, `₹${x.amount || 0}`, x.budgetHeadId?.title || '-', x.vendorId?.name || '-', x.paymentMode])}
        />
      </div>
    </div>
  );
}
