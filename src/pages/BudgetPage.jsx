import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, CardContent, Grid, LinearProgress, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';
import StatCard from '../components/StatCard';

export default function BudgetPage() {
  const [tab, setTab] = useState(0);
  const [heads, setHeads] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [headForm, setHeadForm] = useState({ title: '', code: '', allowedBudget: 0, expectedCost: 0, responsibleTeamId: '', responsibleUserId: '' });
  const [vendorForm, setVendorForm] = useState({ name: '', vendorType: '', quotedAmount: 0, advancePaid: 0, dueAmount: 0, paymentStatus: 'UNPAID', budgetHeadId: '', responsibleTeamId: '', responsibleUserId: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', expenseType: 'DIRECT', amount: 0, paymentMode: 'CASH', budgetHeadId: '', vendorId: '', paidByUserId: '', approvedByUserId: '' });

  const load = async () => {
    const [b, v, e, t, u] = await Promise.all([api.get('/budget-heads'), api.get('/vendors'), api.get('/expenses'), api.get('/teams'), api.get('/users')]);
    setHeads(b.data); setVendors(v.data); setExpenses(e.data); setTeams(t.data); setUsers(u.data);
  };
  useEffect(() => { load(); }, []);
  const saveHead = async (e) => { e.preventDefault(); await api.post('/budget-heads', headForm); setHeadForm({ title: '', code: '', allowedBudget: 0, expectedCost: 0, responsibleTeamId: '', responsibleUserId: '' }); load(); };
  const saveVendor = async (e) => { e.preventDefault(); await api.post('/vendors', vendorForm); setVendorForm({ name: '', vendorType: '', quotedAmount: 0, advancePaid: 0, dueAmount: 0, paymentStatus: 'UNPAID', budgetHeadId: '', responsibleTeamId: '', responsibleUserId: '' }); load(); };
  const saveExpense = async (e) => { e.preventDefault(); await api.post('/expenses', expenseForm); setExpenseForm({ title: '', expenseType: 'DIRECT', amount: 0, paymentMode: 'CASH', budgetHeadId: '', vendorId: '', paidByUserId: '', approvedByUserId: '' }); load(); };

  const totals = useMemo(() => ({ allowed: heads.reduce((a, b) => a + (b.allowedBudget || 0), 0), actual: expenses.reduce((a, b) => a + (b.amount || 0), 0), due: vendors.reduce((a, b) => a + (b.dueAmount || 0), 0) }), [heads, expenses, vendors]);

  return (
    <>
      <PageHeader title="Budget, vendors & expenses" subtitle="Allowed budget vs actual expense, vendor dues and event finance visibility." chips={[{ label: `${heads.length} heads` }, { label: `${vendors.length} vendors` }, { label: `${expenses.length} expenses` }]} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard title="Allowed budget" value={`₹${totals.allowed}`} /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard title="Actual expense" value={`₹${totals.actual}`} /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard title="Pending dues" value={`₹${totals.due}`} /></Grid>
      </Grid>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ mb: 2 }}>
        <Tab label="Budget heads" /><Tab label="Vendors" /><Tab label="Expenses" />
      </Tabs>
      {tab === 0 && <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}><Card component="form" onSubmit={saveHead}><CardContent><Stack spacing={2}><Typography variant="h6">Add budget head</Typography><TextField label="Title" value={headForm.title} onChange={(e) => setHeadForm({ ...headForm, title: e.target.value })} /><Grid container spacing={2}><Grid size={{ xs: 6 }}><TextField label="Code" value={headForm.code} onChange={(e) => setHeadForm({ ...headForm, code: e.target.value })} /></Grid><Grid size={{ xs: 6 }}><TextField type="number" label="Allowed" value={headForm.allowedBudget} onChange={(e) => setHeadForm({ ...headForm, allowedBudget: Number(e.target.value) })} /></Grid><Grid size={{ xs: 12 }}><TextField type="number" label="Expected cost" value={headForm.expectedCost} onChange={(e) => setHeadForm({ ...headForm, expectedCost: Number(e.target.value) })} /></Grid></Grid><TextField select label="Responsible team" value={headForm.responsibleTeamId} onChange={(e) => setHeadForm({ ...headForm, responsibleTeamId: e.target.value })}>{teams.map((t) => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}</TextField><TextField select label="Responsible user" value={headForm.responsibleUserId} onChange={(e) => setHeadForm({ ...headForm, responsibleUserId: e.target.value })}>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField><Button variant="contained" type="submit">Save head</Button></Stack></CardContent></Card></Grid>
        <Grid size={{ xs: 12, lg: 7 }}><Stack spacing={1.5}>{heads.map((h) => { const spent = expenses.filter((e) => e.budgetHeadId?._id === h._id).reduce((a,b)=>a+(b.amount||0),0); const pct = h.allowedBudget ? Math.min(100, (spent / h.allowedBudget) * 100) : 0; return <Card key={h._id}><CardContent><Stack spacing={1}><Stack direction={{ xs:'column', sm:'row' }} justifyContent="space-between"><Typography variant="subtitle1">{h.title}</Typography><StatusChip label={spent > h.allowedBudget ? 'UNPAID' : 'PAID'} /></Stack><Typography color="text.secondary">Allowed ₹{h.allowedBudget} · Expected ₹{h.expectedCost} · Actual ₹{spent}</Typography><LinearProgress variant="determinate" value={pct} /><Alert severity={spent > h.allowedBudget ? 'error' : 'success'}>{spent > h.allowedBudget ? 'Over budget' : 'Within budget'}</Alert></Stack></CardContent></Card>; })}</Stack></Grid>
      </Grid>}
      {tab === 1 && <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}><Card component="form" onSubmit={saveVendor}><CardContent><Stack spacing={2}><Typography variant="h6">Add vendor</Typography><TextField label="Vendor name" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} /><TextField label="Type" value={vendorForm.vendorType} onChange={(e) => setVendorForm({ ...vendorForm, vendorType: e.target.value })} /><Grid container spacing={2}><Grid size={{ xs: 6 }}><TextField type="number" label="Quoted" value={vendorForm.quotedAmount} onChange={(e) => setVendorForm({ ...vendorForm, quotedAmount: Number(e.target.value) })} /></Grid><Grid size={{ xs: 6 }}><TextField type="number" label="Advance" value={vendorForm.advancePaid} onChange={(e) => setVendorForm({ ...vendorForm, advancePaid: Number(e.target.value) })} /></Grid><Grid size={{ xs: 12 }}><TextField type="number" label="Due" value={vendorForm.dueAmount} onChange={(e) => setVendorForm({ ...vendorForm, dueAmount: Number(e.target.value) })} /></Grid></Grid><TextField select label="Payment status" value={vendorForm.paymentStatus} onChange={(e) => setVendorForm({ ...vendorForm, paymentStatus: e.target.value })}><MenuItem value="UNPAID">Unpaid</MenuItem><MenuItem value="PARTIAL">Partial</MenuItem><MenuItem value="PAID">Paid</MenuItem></TextField><TextField select label="Budget head" value={vendorForm.budgetHeadId} onChange={(e) => setVendorForm({ ...vendorForm, budgetHeadId: e.target.value })}>{heads.map((h) => <MenuItem key={h._id} value={h._id}>{h.title}</MenuItem>)}</TextField><Button variant="contained" type="submit">Save vendor</Button></Stack></CardContent></Card></Grid>
        <Grid size={{ xs: 12, lg: 7 }}><ResponsiveTable columns={[{ key:'name', label:'Vendor' },{ key:'type', label:'Type' },{ key:'quoted', label:'Quoted' },{ key:'due', label:'Due' },{ key:'status', label:'Status' }]} rows={vendors.map((v)=>({ title:v.name, name:v.name, type:v.vendorType||'-', quoted:`₹${v.quotedAmount||0}`, due:`₹${v.dueAmount||0}`, status:()=> <StatusChip label={v.paymentStatus} /> }))} mobileTitleKey="title" /></Grid>
      </Grid>}
      {tab === 2 && <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}><Card component="form" onSubmit={saveExpense}><CardContent><Stack spacing={2}><Typography variant="h6">Add expense</Typography><TextField label="Title" value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} /><TextField select label="Type" value={expenseForm.expenseType} onChange={(e) => setExpenseForm({ ...expenseForm, expenseType: e.target.value })}><MenuItem value="VENDOR">Vendor</MenuItem><MenuItem value="DIRECT">Direct</MenuItem><MenuItem value="EMERGENCY">Emergency</MenuItem><MenuItem value="TEAM_PURCHASE">Team purchase</MenuItem></TextField><Grid container spacing={2}><Grid size={{ xs: 6 }}><TextField type="number" label="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} /></Grid><Grid size={{ xs: 6 }}><TextField select label="Payment" value={expenseForm.paymentMode} onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}><MenuItem value="CASH">Cash</MenuItem><MenuItem value="UPI">UPI</MenuItem><MenuItem value="BANK">Bank</MenuItem></TextField></Grid></Grid><TextField select label="Budget head" value={expenseForm.budgetHeadId} onChange={(e) => setExpenseForm({ ...expenseForm, budgetHeadId: e.target.value })}>{heads.map((h) => <MenuItem key={h._id} value={h._id}>{h.title}</MenuItem>)}</TextField><TextField select label="Vendor" value={expenseForm.vendorId} onChange={(e) => setExpenseForm({ ...expenseForm, vendorId: e.target.value })}><MenuItem value="">No vendor</MenuItem>{vendors.map((v) => <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>)}</TextField><Button variant="contained" type="submit">Save expense</Button></Stack></CardContent></Card></Grid>
        <Grid size={{ xs: 12, lg: 7 }}><ResponsiveTable columns={[{ key:'title', label:'Title' },{ key:'type', label:'Type' },{ key:'amount', label:'Amount' },{ key:'head', label:'Budget head' }]} rows={expenses.map((e)=>({ title:e.title, type:e.expenseType, amount:`₹${e.amount||0}`, head:e.budgetHeadId?.title||'-' }))} mobileTitleKey="title" /></Grid>
      </Grid>}
    </>
  );
}
