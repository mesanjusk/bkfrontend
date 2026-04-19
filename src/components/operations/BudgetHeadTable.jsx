import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import { IconButton, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography } from '@mui/material';
import { getBudgetMeta } from './BudgetHeadCard';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function BudgetHeadTable({ heads, onOpen, onMenu }) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Budget Head</TableCell>
            <TableCell>Allowed / Actual</TableCell>
            <TableCell>Expected</TableCell>
            <TableCell>Difference</TableCell>
            <TableCell>Responsible</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {heads.map((head) => {
            const meta = getBudgetMeta(head);
            return (
              <TableRow key={head._id} hover onClick={() => onOpen?.(head)} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Typography fontWeight={600}>{head.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{head.code || 'No code'}</Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{money(head.allowedBudget)} / {money(head.actualExpense)}</Typography>
                    <LinearProgress value={Math.min(100, meta.pct)} variant="determinate" color={meta.color === 'error' ? 'error' : meta.color === 'warning' ? 'warning' : 'success'} />
                  </Stack>
                </TableCell>
                <TableCell>{money(head.expectedCost)}</TableCell>
                <TableCell sx={{ color: meta.difference < 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>{meta.difference < 0 ? '-' : '+'}{money(Math.abs(meta.difference))}</TableCell>
                <TableCell>{head.responsibleTeamId?.name || '-'} / {head.responsibleUserId?.name || '-'}</TableCell>
                <TableCell><Chip size="small" color={meta.color} label={meta.label} /></TableCell>
                <TableCell align="right"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onMenu?.(e, head); }}><MoreVertRounded fontSize="small" /></IconButton></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
