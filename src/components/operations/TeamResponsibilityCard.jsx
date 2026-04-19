import GroupsRounded from '@mui/icons-material/GroupsRounded';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

export default function TeamResponsibilityCard({ team, stats, onOpen }) {
  return (
    <Card variant="outlined" onClick={() => onOpen?.(team)} sx={{ cursor: 'pointer' }}>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>{team.name}</Typography>
            <GroupsRounded color="primary" fontSize="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary">Lead: {team.leadUserId?.name || 'Not assigned'}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`${stats.memberCount} members`} />
            <Chip size="small" color={stats.openTasks > 0 ? 'warning' : 'default'} label={`${stats.openTasks} open tasks`} />
            <Chip size="small" color={stats.overdueTasks > 0 ? 'error' : 'default'} label={`${stats.overdueTasks} overdue`} />
            <Chip size="small" label={`${stats.vendors} vendors`} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
