import { Card, CardContent, Chip, Typography } from '@mui/material';

export default function SummaryCard({ title, value, subtitle, tone = 'default' }) {
  const color = tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'default';
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ mt: 0.7 }}>{value}</Typography>
        {subtitle ? <Typography variant="body2" sx={{ mt: 0.7 }}>{subtitle}</Typography> : null}
        {tone !== 'default' ? <Chip size="small" color={color} label={tone.toUpperCase()} sx={{ mt: 1 }} /> : null}
      </CardContent>
    </Card>
  );
}
