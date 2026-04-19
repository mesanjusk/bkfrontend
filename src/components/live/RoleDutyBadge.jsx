import { Chip, Stack, Typography } from '@mui/material';

export default function RoleDutyBadge({ role, duty }) {
  return (
    <Stack direction="row" spacing={0.8} alignItems="center">
      <Typography variant="caption" color="text.secondary">Role</Typography>
      <Chip size="small" color="primary" label={role || 'Unknown'} />
      <Chip size="small" variant="outlined" label={duty || 'No duty'} />
    </Stack>
  );
}
