import { Card, CardContent, Stack, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ title = 'No records yet', description = 'Add or sync records to view data here.' }) {
  return (
    <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
      <CardContent>
        <Stack spacing={1} alignItems="center" textAlign="center" py={2}>
          <InboxIcon color="disabled" />
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="body2">{description}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
