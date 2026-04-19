import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import PriorityChip from './PriorityChip';

export const taskStatusUi = {
  PENDING: { color: 'default', label: 'Pending' },
  IN_PROGRESS: { color: 'info', label: 'In Progress' },
  COMPLETED: { color: 'success', label: 'Completed' },
  DONE: { color: 'success', label: 'Completed' },
  DELAYED: { color: 'warning', label: 'Delayed' },
  BLOCKED: { color: 'error', label: 'Blocked' },
};

export const isOverdueTask = (task) => {
  if (!task?.deadlineLabel) return false;
  if (['DONE', 'COMPLETED'].includes((task.status || '').toUpperCase())) return false;
  const parsed = new Date(task.deadlineLabel);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
};

export default function TaskCard({ task, onClick }) {
  const status = taskStatusUi[(task.status || 'PENDING').toUpperCase()] || taskStatusUi.PENDING;
  const overdue = isOverdueTask(task);

  return (
    <Card variant="outlined" sx={{ borderColor: overdue ? 'error.main' : undefined, cursor: 'pointer' }} onClick={() => onClick?.(task)}>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>{task.title || 'Untitled task'}</Typography>
            <PriorityChip priority={task.priority} />
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={status.label} color={status.color} />
            {overdue ? <Chip size="small" color="error" label="Overdue" /> : null}
            {task.teamId?.name ? <Chip size="small" label={task.teamId.name} /> : null}
          </Stack>
          <Typography variant="body2" color="text.secondary">{task.notes || task.description || 'No notes added.'}</Typography>
          <Typography variant="caption" color="text.secondary"><PersonRounded sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />Owner: {task.assignedToUserId?.name || 'Unassigned'} • Backup: {task.backupUserId?.name || 'None'}</Typography>
          <Typography variant="caption" color={overdue ? 'error.main' : 'text.secondary'}><CalendarMonthRounded sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />Deadline: {task.deadlineLabel || 'No deadline'}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
