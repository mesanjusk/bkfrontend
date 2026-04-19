import { Chip, Stack, Typography } from '@mui/material';

export default function RoleDutyBadge({ role, duty }) {
  return (
    <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap justifyContent="flex-end">
      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'inline' } }}>Role</Typography>
      <Chip size="small" color="primary" label={role || 'Unknown'} sx={{ maxWidth: 180 }} />
      <Chip size="small" variant="outlined" label={duty || 'No duty'} sx={{ maxWidth: 180 }} />
    </Stack>
  );
}
