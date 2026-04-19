import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import TaskCard, { taskStatusUi } from './TaskCard';

const statuses = ['PENDING', 'IN_PROGRESS', 'DELAYED', 'BLOCKED', 'COMPLETED'];

export default function TaskBoard({ tasks, onOpenTask }) {
  const grouped = statuses.map((status) => ({
    status,
    label: taskStatusUi[status]?.label || status,
    color: taskStatusUi[status]?.color || 'default',
    items: tasks.filter((task) => {
      const value = (task.status || 'PENDING').toUpperCase();
      if (status === 'COMPLETED') return ['DONE', 'COMPLETED'].includes(value);
      return value === status;
    }),
  }));

  return (
    <Grid container spacing={1.5} wrap="nowrap" sx={{ overflowX: 'auto', pb: 1 }}>
      {grouped.map((column) => (
        <Grid item key={column.status} sx={{ minWidth: { xs: 300, md: 260 }, maxWidth: 340 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight={700}>{column.label} ({column.items.length})</Typography>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {column.items.map((task) => <TaskCard key={task._id} task={task} onClick={onOpenTask} />)}
                  {column.items.length === 0 ? <Typography variant="caption" color="text.secondary">No tasks</Typography> : null}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
