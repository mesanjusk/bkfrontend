import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';

export default function HealthAlertPanel({ items = [] }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>Operational Health</Typography>
        <Stack spacing={1}>
          {items.map((item) => <Alert key={item.label} severity={item.severity || 'info'}>{item.label}: {item.value}</Alert>)}
          {!items.length ? <Alert severity="success">All systems look healthy.</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
