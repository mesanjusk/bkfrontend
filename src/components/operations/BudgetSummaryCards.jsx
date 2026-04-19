import AccountBalanceWalletRounded from '@mui/icons-material/AccountBalanceWalletRounded';
import AssignmentLateRounded from '@mui/icons-material/AssignmentLateRounded';
import CurrencyRupeeRounded from '@mui/icons-material/CurrencyRupeeRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded';
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import { Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function SummaryItem({ title, value, subtitle, icon, color = 'text.primary', progress }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            {icon}
          </Stack>
          <Typography variant="h5" sx={{ color, fontWeight: 700 }}>{value}</Typography>
          {typeof progress === 'number' ? <LinearProgress variant="determinate" value={Math.min(100, progress)} /> : null}
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function BudgetSummaryCards({ totals }) {
  const spendPercent = totals.allowed ? (totals.actual / totals.allowed) * 100 : 0;
  const remaining = totals.allowed - totals.actual;

  const cards = [
    { title: 'Total Allowed Budget', value: formatCurrency(totals.allowed), subtitle: 'Planned approved envelope', icon: <AccountBalanceWalletRounded color="primary" fontSize="small" /> },
    { title: 'Total Actual Expense', value: formatCurrency(totals.actual), subtitle: `${Math.round(spendPercent)}% of allowed spent`, icon: <ReceiptLongRounded color="warning" fontSize="small" />, progress: spendPercent, color: totals.actual > totals.allowed ? 'error.main' : 'text.primary' },
    { title: 'Remaining Budget', value: formatCurrency(remaining), subtitle: remaining < 0 ? 'Over budget' : 'Still available', icon: <CurrencyRupeeRounded color={remaining < 0 ? 'error' : 'success'} fontSize="small" />, color: remaining < 0 ? 'error.main' : 'success.main' },
    { title: 'Pending Vendor Dues', value: formatCurrency(totals.pendingDues), subtitle: 'Immediate payment follow-up', icon: <PendingActionsRounded color="warning" fontSize="small" />, color: totals.pendingDues > 0 ? 'warning.main' : 'success.main' },
    { title: 'Total Vendors', value: totals.vendorCount.toString(), subtitle: 'Active + onboarded partners', icon: <StorefrontRounded color="info" fontSize="small" /> },
    { title: 'Open Tasks', value: totals.openTasks.toString(), subtitle: 'Pending / in progress workload', icon: <AssignmentLateRounded color="info" fontSize="small" /> },
    { title: 'Overdue Tasks', value: totals.overdueTasks.toString(), subtitle: 'Needs immediate owner action', icon: <ErrorOutlineRounded color="error" fontSize="small" />, color: totals.overdueTasks > 0 ? 'error.main' : 'text.primary' },
    { title: 'Emergency Expenses', value: formatCurrency(totals.emergencyExpense), subtitle: 'Unplanned spend tracker', icon: <LocalHospitalRounded color="error" fontSize="small" />, color: totals.emergencyExpense > 0 ? 'error.main' : 'text.primary' },
  ];

  return (
    <Grid container spacing={1.5}>
      {cards.map((card) => (
        <Grid item xs={6} md={3} key={card.title}>
          <SummaryItem {...card} />
        </Grid>
      ))}
    </Grid>
  );
}
