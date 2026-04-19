import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import { Card, CardContent, Chip, IconButton, LinearProgress, Stack, Typography } from '@mui/material';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export function getBudgetMeta(head) {
  const allowed = Number(head.allowedBudget || 0);
  const actual = Number(head.actualExpense || 0);
  const pct = allowed ? (actual / allowed) * 100 : 0;
  const difference = allowed - actual;
  let label = 'Under Budget';
  let color = 'success';
  if (pct >= 100) {
    label = 'Over Budget';
    color = 'error';
  } else if (pct >= 85) {
    label = 'Near Limit';
    color = 'warning';
  }
  return { pct, difference, label, color };
}

export default function BudgetHeadCard({ head, onOpen, onMenu }) {
  const meta = getBudgetMeta(head);
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>{head.title || 'Untitled head'}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip size="small" color={meta.color} label={meta.label} />
              <IconButton size="small" onClick={(e) => onMenu?.(e, head)}><MoreVertRounded fontSize="small" /></IconButton>
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary">{head.code || 'No code'} • {head.responsibleTeamId?.name || 'No team'} • {head.responsibleUserId?.name || 'No owner'}</Typography>
          <LinearProgress variant="determinate" color={meta.color === 'error' ? 'error' : meta.color === 'warning' ? 'warning' : 'success'} value={Math.min(100, Math.max(meta.pct, 0))} />
          <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Allowed: {money(head.allowedBudget)}</Typography><Typography variant="body2">Expected: {money(head.expectedCost)}</Typography></Stack>
          <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Actual: {money(head.actualExpense)}</Typography><Typography variant="body2" color={meta.difference < 0 ? 'error.main' : 'success.main'}>{meta.difference < 0 ? '-' : '+'}{money(Math.abs(meta.difference))}</Typography></Stack>
          <Typography variant="caption" color="primary" onClick={() => onOpen?.(head)} sx={{ cursor: 'pointer', fontWeight: 600 }}>View details</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
