import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';

const severityMap = {
  guest_changed: 'warning',
  student_absent: 'error',
  urgent_sequence_change: 'warning',
  vip_guest_arrived: 'info',
  donation_thankyou_pending: 'info'
};

export default function LiveAlertCenter({ alerts }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1.3 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}><NotificationsActiveRoundedIcon color="error" /><Typography variant="subtitle1" fontWeight={700}>Live Alerts</Typography></Stack>
        <Stack spacing={0.8}>
          {alerts.length ? alerts.map((a) => (
            <Alert key={a.id} severity={severityMap[a.type] || 'info'}>
              <Typography variant="body2" fontWeight={600}>{a.title}</Typography>
              <Typography variant="caption">{a.message}</Typography>
            </Alert>
          )) : <Typography variant="body2" color="text.secondary">No critical alerts.</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}
