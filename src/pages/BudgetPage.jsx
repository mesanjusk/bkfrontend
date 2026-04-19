import { useEffect, useMemo, useState } from 'react';
import AddRounded from '@mui/icons-material/AddRounded';
import AttachMoneyRounded from '@mui/icons-material/AttachMoneyRounded';
import PaidRounded from '@mui/icons-material/PaidRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import {
  Alert,
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
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from '../api';
import SectionTitle from '../components/SectionTitle';
import BudgetSummaryCards from '../components/operations/BudgetSummaryCards';
import BudgetHeadCard from '../components/operations/BudgetHeadCard';
import BudgetHeadTable from '../components/operations/BudgetHeadTable';
import VendorCard from '../components/operations/VendorCard';
import VendorTable from '../components/operations/VendorTable';
import ExpenseEntryDialog from '../components/operations/ExpenseEntryDialog';
import FinanceAlertPanel from '../components/operations/FinanceAlertPanel';
import ResponsiveOperationsList from '../components/operations/ResponsiveOperationsList';

const budgetInitial = { title: '', code: '', allowedBudget: 0, expectedCost: 0, responsibleTeamId: '', responsibleUserId: '' };
const vendorInitial = {
  name: '', vendorType: '', contactPerson: '', mobile: '', budgetHeadId: '', responsibleTeamId: '', responsibleUserId: '', quotedAmount: 0, finalAmount: 0, advancePaid: 0, dueAmount: 0, paymentStatus: 'PENDING',
};
const expenseInitial = {
  title: '', expenseType: 'DIRECT', amount: 0, paymentMode: 'CASH', budgetHeadId: '', vendorId: '', paidByUserId: '', approvedByUserId: '', status: 'PENDING', note: '', proofUrl: '',
};

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function BudgetPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [heads, setHeads] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  const [budgetForm, setBudgetForm] = useState(budgetInitial);
  const [vendorForm, setVendorForm] = useState(vendorInitial);
  const [expenseForm, setExpenseForm] = useState(expenseInitial);

  const [tab, setTab] = useState('budget');
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [search, setSearch] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuContext, setMenuContext] = useState(null);

  const load = async () => {
    const [h, v, e, t, k, u] = await Promise.all([
      api.get('/budget-heads'),
      api.get('/vendors'),
      api.get('/expenses'),
      api.get('/teams'),
      api.get('/event-tasks'),
      api.get('/users'),
    ]);
    setHeads(h.data);
    setVendors(v.data);
    setExpenses(e.data);
    setTeams(t.data);
    setTasks(k.data);
    setUsers(u.data);
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    const allowed = heads.reduce((a, x) => a + Number(x.allowedBudget || 0), 0);
    const actual = heads.reduce((a, x) => a + Number(x.actualExpense || 0), 0);
    const pendingDues = vendors.reduce((a, x) => a + Number(x.dueAmount || 0), 0);
    const openTasks = tasks.filter((x) => !['DONE', 'COMPLETED'].includes((x.status || '').toUpperCase())).length;
    const overdueTasks = tasks.filter((task) => {
      if (!task.deadlineLabel || ['DONE', 'COMPLETED'].includes((task.status || '').toUpperCase())) return false;
      const d = new Date(task.deadlineLabel);
      return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
    }).length;
    const emergencyExpense = expenses.filter((x) => (x.expenseType || '').toUpperCase() === 'EMERGENCY').reduce((a, x) => a + Number(x.amount || 0), 0);

    return {
      allowed,
      actual,
      pendingDues,
      vendorCount: vendors.length,
      openTasks,
      overdueTasks,
      emergencyExpense,
    };
  }, [heads, vendors, tasks, expenses]);

  const alerts = useMemo(() => {
    const overBudget = heads.filter((x) => Number(x.actualExpense || 0) > Number(x.allowedBudget || 0));
    const blockedTasks = tasks.filter((x) => (x.status || '').toUpperCase() === 'BLOCKED');
    const noOwners = tasks.filter((x) => !x.assignedToUserId).length;

    return [
      ...overBudget.slice(0, 3).map((x) => ({ severity: 'error', label: `${x.title} is over budget`, note: `Overshoot ${money(Number(x.actualExpense || 0) - Number(x.allowedBudget || 0))}` })),
      ...(totals.pendingDues > 0 ? [{ severity: 'warning', label: 'Pending vendor dues', note: `${money(totals.pendingDues)} awaiting payment clearance.` }] : []),
      ...(totals.overdueTasks > 0 ? [{ severity: 'error', label: 'Overdue tasks detected', note: `${totals.overdueTasks} tasks passed deadline.` }] : []),
      ...blockedTasks.slice(0, 2).map((task) => ({ severity: 'warning', label: `Blocked task: ${task.title}`, note: 'Requires escalation to proceed.' })),
      ...(noOwners > 0 ? [{ severity: 'warning', label: 'Tasks missing owners', note: `${noOwners} task(s) have no assigned owner.` }] : []),
      ...(totals.emergencyExpense > 0 ? [{ severity: 'warning', label: 'Emergency spend recorded', note: `${money(totals.emergencyExpense)} booked as emergency.` }] : []),
    ];
  }, [heads, tasks, totals]);

  const filteredHeads = useMemo(() => heads.filter((x) => `${x.title} ${x.code}`.toLowerCase().includes(search.toLowerCase())), [heads, search]);
  const filteredVendors = useMemo(() => vendors.filter((x) => {
    const matchText = `${x.name} ${x.vendorType} ${x.contactPerson}`.toLowerCase().includes(search.toLowerCase());
    const matchType = vendorTypeFilter === 'ALL' || (x.vendorType || '').toUpperCase() === vendorTypeFilter;
    const status = (x.paymentStatus || '').toUpperCase() || (Number(x.dueAmount || 0) > 0 ? 'PENDING' : 'PAID');
    const matchPayment = paymentFilter === 'ALL' || status === paymentFilter;
    return matchText && matchType && matchPayment;
  }), [vendors, search, vendorTypeFilter, paymentFilter]);

  const vendorTypes = useMemo(() => ['ALL', ...new Set(vendors.map((x) => (x.vendorType || '').toUpperCase()).filter(Boolean))], [vendors]);

  const createBudget = async (e) => {
    e.preventDefault();
    await api.post('/budget-heads', budgetForm);
    setBudgetForm(budgetInitial);
    setSnackbar('Budget head added.');
    load();
  };

  const createVendor = async (e) => {
    e.preventDefault();
    await api.post('/vendors', vendorForm);
    setVendorForm(vendorInitial);
    setSnackbar('Vendor added.');
    load();
  };

  const createExpense = async () => {
    await api.post('/expenses', expenseForm);
    setExpenseForm(expenseInitial);
    setExpenseOpen(false);
    setSnackbar('Expense recorded and totals refreshed.');
    load();
  };

  const quickFabAction = () => {
    if (tab === 'budget') return document.getElementById('budget-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (tab === 'vendor') return document.getElementById('vendor-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setExpenseOpen(true);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuContext(null);
  };

  return (
    <Box>
      <SectionTitle title="Finance Operations Control Center" subtitle="Budget clarity, vendor dues, emergency spend visibility, and operational alerts for event days." />
      <BudgetSummaryCards totals={totals} />

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={9}>
          <Paper variant="outlined" sx={{ p: 1, mb: 1.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
                <Tab value="budget" label="Budget Heads" />
                <Tab value="vendor" label="Vendors" />
                <Tab value="expense" label="Expenses" />
              </Tabs>
              <TextField
                size="small"
                placeholder="Search head/vendor"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }}
                sx={{ ml: { md: 'auto' }, minWidth: { md: 280 } }}
              />
            </Stack>
          </Paper>

          {tab === 'budget' ? (
            <Stack spacing={1.5}>
              <Card component="form" id="budget-form" onSubmit={createBudget} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">Add Budget Head</Typography>
                    <AttachMoneyRounded color="primary" />
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Head name" value={budgetForm.title} onChange={(e) => setBudgetForm({ ...budgetForm, title: e.target.value })} /></Grid>
                    <Grid item xs={12} sm={6} md={2}><TextField fullWidth label="Code" value={budgetForm.code} onChange={(e) => setBudgetForm({ ...budgetForm, code: e.target.value })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Allowed" value={budgetForm.allowedBudget} onChange={(e) => setBudgetForm({ ...budgetForm, allowedBudget: Number(e.target.value || 0) })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Expected" value={budgetForm.expectedCost} onChange={(e) => setBudgetForm({ ...budgetForm, expectedCost: Number(e.target.value || 0) })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth select label="Team" value={budgetForm.responsibleTeamId} onChange={(e) => setBudgetForm({ ...budgetForm, responsibleTeamId: e.target.value })}><MenuItem value="">None</MenuItem>{teams.map((x) => <MenuItem key={x._id} value={x._id}>{x.name}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={6} md={1}><TextField fullWidth select label="Owner" value={budgetForm.responsibleUserId} onChange={(e) => setBudgetForm({ ...budgetForm, responsibleUserId: e.target.value })}><MenuItem value="">None</MenuItem>{users.map((x) => <MenuItem key={x._id} value={x._id}>{x.name}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={12}><Button type="submit" variant="contained">Add budget head</Button></Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Budget Tracking</Typography>
                  {isMobile ? (
                    <ResponsiveOperationsList
                      items={filteredHeads}
                      mobileRender={(head) => <BudgetHeadCard key={head._id} head={head} onOpen={setSelectedBudget} onMenu={(e) => { setMenuAnchor(e.currentTarget); setMenuContext({ type: 'budget', value: head }); }} />}
                      desktopRender={() => null}
                    />
                  ) : (
                    <BudgetHeadTable heads={filteredHeads} onOpen={setSelectedBudget} onMenu={(e, head) => { setMenuAnchor(e.currentTarget); setMenuContext({ type: 'budget', value: head }); }} />
                  )}
                </CardContent>
              </Card>
            </Stack>
          ) : null}

          {tab === 'vendor' ? (
            <Stack spacing={1.5}>
              <Card component="form" id="vendor-form" onSubmit={createVendor} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">Add Vendor</Typography>
                    <PaidRounded color="primary" />
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={3}><TextField fullWidth label="Vendor name" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth label="Vendor type" value={vendorForm.vendorType} onChange={(e) => setVendorForm({ ...vendorForm, vendorType: e.target.value })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth label="Contact person" value={vendorForm.contactPerson} onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth label="Mobile" value={vendorForm.mobile} onChange={(e) => setVendorForm({ ...vendorForm, mobile: e.target.value })} /></Grid>
                    <Grid item xs={6} md={3}><TextField fullWidth select label="Budget head" value={vendorForm.budgetHeadId} onChange={(e) => setVendorForm({ ...vendorForm, budgetHeadId: e.target.value })}><MenuItem value="">None</MenuItem>{heads.map((x) => <MenuItem key={x._id} value={x._id}>{x.title}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Quoted" value={vendorForm.quotedAmount} onChange={(e) => setVendorForm({ ...vendorForm, quotedAmount: Number(e.target.value || 0) })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Final" value={vendorForm.finalAmount} onChange={(e) => setVendorForm({ ...vendorForm, finalAmount: Number(e.target.value || 0) })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Advance paid" value={vendorForm.advancePaid} onChange={(e) => setVendorForm({ ...vendorForm, advancePaid: Number(e.target.value || 0) })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth type="number" label="Due" value={vendorForm.dueAmount} onChange={(e) => setVendorForm({ ...vendorForm, dueAmount: Number(e.target.value || 0) })} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth select label="Payment status" value={vendorForm.paymentStatus} onChange={(e) => setVendorForm({ ...vendorForm, paymentStatus: e.target.value })}>{['PENDING', 'PARTIAL', 'PAID'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={6} md={1}><TextField fullWidth select label="Team" value={vendorForm.responsibleTeamId} onChange={(e) => setVendorForm({ ...vendorForm, responsibleTeamId: e.target.value })}><MenuItem value="">None</MenuItem>{teams.map((x) => <MenuItem key={x._id} value={x._id}>{x.name}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={6} md={1}><TextField fullWidth select label="Owner" value={vendorForm.responsibleUserId} onChange={(e) => setVendorForm({ ...vendorForm, responsibleUserId: e.target.value })}><MenuItem value="">None</MenuItem>{users.map((x) => <MenuItem key={x._id} value={x._id}>{x.name}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={12}><Button type="submit" variant="contained">Add vendor</Button></Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} mb={1}>
                    <TextField size="small" select label="Vendor type" value={vendorTypeFilter} onChange={(e) => setVendorTypeFilter(e.target.value)} sx={{ minWidth: { md: 160 } }}>{vendorTypes.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField>
                    <TextField size="small" select label="Payment" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} sx={{ minWidth: { md: 160 } }}>{['ALL', 'PENDING', 'PARTIAL', 'PAID'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField>
                  </Stack>
                  {isMobile ? (
                    <ResponsiveOperationsList items={filteredVendors} mobileRender={(v) => <VendorCard key={v._id} vendor={v} onOpen={setSelectedVendor} onMenu={(e) => { setMenuAnchor(e.currentTarget); setMenuContext({ type: 'vendor', value: v }); }} />} desktopRender={() => null} />
                  ) : (
                    <VendorTable vendors={filteredVendors} onOpen={setSelectedVendor} onMenu={(e, vendor) => { setMenuAnchor(e.currentTarget); setMenuContext({ type: 'vendor', value: vendor }); }} />
                  )}
                </CardContent>
              </Card>
            </Stack>
          ) : null}

          {tab === 'expense' ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Expense Register</Typography>
                <Stack spacing={1.25}>
                  {expenses.slice(0, 12).map((expense) => (
                    <Alert key={expense._id} severity={(expense.expenseType || '').toUpperCase() === 'EMERGENCY' ? 'error' : 'info'}>
                      <strong>{expense.title || 'Expense'}</strong> • {expense.expenseType} • {money(expense.amount)} • {expense.status || 'PENDING'}
                    </Alert>
                  ))}
                </Stack>
                <Button sx={{ mt: 1.5 }} variant="contained" onClick={() => setExpenseOpen(true)}>Add expense</Button>
              </CardContent>
            </Card>
          ) : null}
        </Grid>

        <Grid item xs={12} md={3}>
          <FinanceAlertPanel alerts={alerts} />
        </Grid>
      </Grid>

      {isMobile ? <Fab color="primary" onClick={quickFabAction} sx={{ position: 'fixed', right: 16, bottom: 16 }}><AddRounded /></Fab> : null}

      <ExpenseEntryDialog
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        form={expenseForm}
        onChange={(key, value) => setExpenseForm((prev) => ({ ...prev, [key]: value }))}
        onSubmit={createExpense}
        vendors={vendors}
        budgetHeads={heads}
        users={users}
      />

      <Dialog open={Boolean(selectedBudget)} onClose={() => setSelectedBudget(null)} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>{selectedBudget?.title}</DialogTitle>
        <DialogContent dividers>
          {selectedBudget ? (
            <Stack spacing={1}>
              <Typography>Allowed: {money(selectedBudget.allowedBudget)}</Typography>
              <Typography>Expected: {money(selectedBudget.expectedCost)}</Typography>
              <Typography>Actual: {money(selectedBudget.actualExpense)}</Typography>
              <Typography>Team: {selectedBudget.responsibleTeamId?.name || '-'}</Typography>
              <Typography>Owner: {selectedBudget.responsibleUserId?.name || '-'}</Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedBudget(null)}>Close</Button></DialogActions>
      </Dialog>

      <Drawer anchor="right" open={Boolean(selectedVendor)} onClose={() => setSelectedVendor(null)}>
        <Box sx={{ width: { xs: '100vw', sm: 420 }, maxWidth: '100vw', p: 2 }}>
          <Typography variant="h6">{selectedVendor?.name}</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2">Quotation: {money(selectedVendor?.quotedAmount)}</Typography>
            <Typography variant="body2">Final bill: {money(selectedVendor?.finalAmount)}</Typography>
            <Typography variant="body2">Advance paid: {money(selectedVendor?.advancePaid)}</Typography>
            <Typography variant="body2" color={Number(selectedVendor?.dueAmount || 0) > 0 ? 'warning.main' : 'success.main'}>Due amount: {money(selectedVendor?.dueAmount)}</Typography>
            <Typography variant="body2">Linked budget head: {selectedVendor?.budgetHeadId?.title || '-'}</Typography>
            <Typography variant="body2">Assigned owner: {selectedVendor?.responsibleUserId?.name || '-'}</Typography>
            <Typography variant="body2">Linked tasks: {tasks.filter((x) => x.linkedVendorId?._id === selectedVendor?._id || x.linkedVendorId === selectedVendor?._id).length}</Typography>
          </Stack>
        </Box>
      </Drawer>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={closeMenu}>Edit</MenuItem>
        <MenuItem onClick={() => {
          if (menuContext?.type === 'budget') setSelectedBudget(menuContext.value);
          if (menuContext?.type === 'vendor') setSelectedVendor(menuContext.value);
          closeMenu();
        }}
        >
          View details
        </MenuItem>
      </Menu>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={2400} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
