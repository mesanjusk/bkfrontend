import { Avatar, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import StatusChip from '../StatusChip';

export default function GuestAvailabilityPanel({ guests }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1.3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1}>Guest Availability</Typography>
        <Stack spacing={0.8}>
          {guests.map((g) => (
            <Stack key={g._id} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                <Avatar src={g.avatarUrl} sx={{ width: 28, height: 28 }}>{g.name?.[0]}</Avatar>
                <Stack minWidth={0}>
                  <Typography variant="body2" fontWeight={600} noWrap>{g.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{g.designation || 'Guest'}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <Chip size="small" variant="outlined" label={`#${g.stageCounts?.guestAwards || 0}`} />
                <StatusChip label={g.availabilityStatus || 'AVAILABLE'} />
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
