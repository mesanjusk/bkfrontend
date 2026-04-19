import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

export default function RoleSummaryCard({ role }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={0.8}>
          <Typography variant="subtitle1">{role.name}</Typography>
          <Stack direction="row" spacing={0.8}>
            <Chip size="small" label={role.code || '-'} />
            {role.dashboardKey ? <Chip size="small" variant="outlined" label={role.dashboardKey} /> : null}
          </Stack>
          <Typography variant="body2">{role.permissionSummary || role.permissions?.join(', ') || 'Permission summary unavailable.'}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
