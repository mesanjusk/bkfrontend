import { Card, CardContent, Stack, Typography } from '@mui/material';

export default function StatCard({ title, value, subtitle }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={0.75}>
          <Typography color="text.secondary" variant="body2">{title}</Typography>
          <Typography variant="h5">{value}</Typography>
          {subtitle ? <Typography color="text.secondary" variant="caption">{subtitle}</Typography> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
